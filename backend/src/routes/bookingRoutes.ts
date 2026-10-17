import { Router } from 'express';
import { db } from '../../../db/client';
import {
  canCancelWithinWindow,
  formatHourRangeLabel,
  getNow,
  isBookingStillActive,
  isDateInPast,
  isSlotInPast,
  isValidDateFormat,
} from '../time';
import type { BookingSummary, Court } from '../types';

export const bookingRouter = Router();

interface BookingQueryRow {
  id: number;
  user_id: number;
  court_id: number;
  court_name: string;
  booking_date: string;
  start_hour: number;
  end_hour: number;
  created_at: string;
}

type CreateBookingResult =
  | { ok: true; booking: BookingSummary }
  | { ok: false; status: number; error: string; code?: string };

const executeCreateBookingTransaction = db.transaction(
  (
    userId: number,
    courtId: number,
    bookingDate: string,
    startHour: number,
    now: Date
  ): CreateBookingResult => {
    const court = db
      .prepare('SELECT id, name FROM courts WHERE id = ?')
      .get(courtId) as Court | undefined;

    if (!court) {
      return {
        ok: false,
        status: 404,
        error: 'La cancha solicitada no existe en el catálogo.',
      };
    }

    if (isDateInPast(bookingDate, now) || isSlotInPast(bookingDate, startHour, now)) {
      return {
        ok: false,
        status: 400,
        error: 'No es posible reservar en una fecha u horario que ya transcurrió.',
        code: 'PAST_TIME_SLOT',
      };
    }

    const existingSlotBooking = db
      .prepare(
        'SELECT id, user_id FROM bookings WHERE court_id = ? AND booking_date = ? AND start_hour = ? AND status = \'ACTIVE\''
      )
      .get(courtId, bookingDate, startHour) as { id: number; user_id: number } | undefined;

    if (existingSlotBooking && existingSlotBooking.user_id !== userId) {
      return {
        ok: false,
        status: 409,
        error: 'La cancha ya fue reservada en este horario. Por favor selecciona otro bloque disponible.',
        code: 'SLOT_ALREADY_BOOKED',
      };
    }

    const userActiveCandidates = db
      .prepare(
        'SELECT id, booking_date, end_hour FROM bookings WHERE user_id = ? AND status = \'ACTIVE\''
      )
      .all(userId) as Array<{ id: number; booking_date: string; end_hour: number }>;

    const hasActiveBooking = userActiveCandidates.some((row) =>
      isBookingStillActive(row.booking_date, row.end_hour, now)
    );

    if (hasActiveBooking) {
      return {
        ok: false,
        status: 409,
        error:
          'Ya tienes una reserva activa vigente. Debes esperar a que finalice o cancelarla antes de agendar un nuevo turno.',
        code: 'USER_ALREADY_HAS_ACTIVE_BOOKING',
      };
    }

    if (existingSlotBooking) {
      return {
        ok: false,
        status: 409,
        error: 'La cancha ya fue reservada en este horario. Por favor selecciona otro bloque disponible.',
        code: 'SLOT_ALREADY_BOOKED',
      };
    }

    const endHour = startHour + 1;
    const createdAt = now.toISOString();

    const insertResult = db
      .prepare(
        `INSERT INTO bookings (user_id, court_id, booking_date, start_hour, end_hour, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)`
      )
      .run(userId, courtId, bookingDate, startHour, endHour, createdAt);

    const bookingId = Number(insertResult.lastInsertRowid);

    return {
      ok: true,
      booking: {
        id: bookingId,
        userId,
        courtId: court.id,
        courtName: court.name,
        bookingDate,
        startHour,
        endHour,
        timeRangeLabel: formatHourRangeLabel(startHour, endHour),
        canCancel: canCancelWithinWindow(bookingDate, startHour, now),
        createdAt,
      },
    };
  }
);

bookingRouter.post('/', (req, res) => {
  try {
    const rawCourtId = Number(req.body?.courtId);
    const rawBookingDate =
      typeof req.body?.bookingDate === 'string' ? req.body.bookingDate.trim() : '';
    const rawStartHour = Number(req.body?.startHour);

    if (!Number.isInteger(rawCourtId) || rawCourtId < 1 || rawCourtId > 5) {
      res.status(404).json({
        error: 'La cancha solicitada no existe en el catálogo.',
      });
      return;
    }

    if (
      !isValidDateFormat(rawBookingDate) ||
      !Number.isInteger(rawStartHour) ||
      rawStartHour < 0 ||
      rawStartHour > 23
    ) {
      res.status(400).json({
        error: 'No es posible reservar en una fecha u horario que ya transcurrió.',
        code: 'PAST_TIME_SLOT',
      });
      return;
    }

    const now = getNow();
    const result = executeCreateBookingTransaction.immediate(
      req.user!.id,
      rawCourtId,
      rawBookingDate,
      rawStartHour,
      now
    );

    if (!result.ok) {
      res.status(result.status).json({
        error: result.error,
        ...(result.code ? { code: result.code } : {}),
      });
      return;
    }

    res.status(201).json({
      message: 'Reserva confirmada exitosamente.',
      booking: result.booking,
    });
  } catch (err: unknown) {
    const sqliteErr = err as { code?: string };
    if (sqliteErr && typeof sqliteErr.code === 'string' && sqliteErr.code.startsWith('SQLITE_CONSTRAINT')) {
      res.status(409).json({
        error: 'La cancha ya fue reservada en este horario. Por favor selecciona otro bloque disponible.',
        code: 'SLOT_ALREADY_BOOKED',
      });
      return;
    }
    res.status(500).json({
      error: 'No se pudo procesar tu reserva en este momento. Por favor intenta nuevamente.',
    });
  }
});

bookingRouter.get('/my', (req, res) => {
  const userId = req.user!.id;
  const now = getNow();

  const rows = db
    .prepare(
      `SELECT
         b.id,
         b.user_id,
         b.court_id,
         c.name AS court_name,
         b.booking_date,
         b.start_hour,
         b.end_hour,
         b.created_at
       FROM bookings b
       JOIN courts c ON c.id = b.court_id
       WHERE b.user_id = ? AND b.status = 'ACTIVE'
       ORDER BY b.booking_date ASC, b.start_hour ASC`
    )
    .all(userId) as BookingQueryRow[];

  const activeBookings: BookingSummary[] = [];
  const pastBookings: BookingSummary[] = [];

  for (const row of rows) {
    const stillActive = isBookingStillActive(row.booking_date, row.end_hour, now);
    const summary: BookingSummary = {
      id: row.id,
      userId: row.user_id,
      courtId: row.court_id,
      courtName: row.court_name,
      bookingDate: row.booking_date,
      startHour: row.start_hour,
      endHour: row.end_hour,
      timeRangeLabel: formatHourRangeLabel(row.start_hour, row.end_hour),
      canCancel: stillActive ? canCancelWithinWindow(row.booking_date, row.start_hour, now) : false,
      createdAt: row.created_at,
    };

    if (stillActive) {
      activeBookings.push(summary);
    } else {
      pastBookings.push(summary);
    }
  }

  // Sort past completed bookings from most recent to oldest
  pastBookings.sort((a, b) => {
    if (a.bookingDate !== b.bookingDate) {
      return b.bookingDate.localeCompare(a.bookingDate);
    }
    return b.startHour - a.startHour;
  });

  res.status(200).json({
    activeBookings,
    pastBookings,
  });
});

bookingRouter.delete('/:bookingId', (req, res) => {
  const bookingId = Number(req.params.bookingId);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    res.status(404).json({
      error: 'La reserva solicitada no existe o ya fue cancelada.',
    });
    return;
  }

  const booking = db
    .prepare(
      'SELECT id, user_id, booking_date, start_hour, end_hour, status FROM bookings WHERE id = ?'
    )
    .get(bookingId) as
    | {
        id: number;
        user_id: number;
        booking_date: string;
        start_hour: number;
        end_hour: number;
        status: string;
      }
    | undefined;

  if (!booking || booking.status !== 'ACTIVE') {
    res.status(404).json({
      error: 'La reserva solicitada no existe o ya fue cancelada.',
    });
    return;
  }

  if (booking.user_id !== req.user!.id) {
    res.status(403).json({
      error: 'No tienes permiso para cancelar esta reserva.',
      code: 'FORBIDDEN_BOOKING_ACCESS',
    });
    return;
  }

  const now = getNow();
  if (!canCancelWithinWindow(booking.booking_date, booking.start_hour, now)) {
    res.status(400).json({
      error:
        'Solo puedes cancelar una reserva con al menos 1 hora de anticipación antes del inicio del turno.',
      code: 'CANCELLATION_WINDOW_EXPIRED',
    });
    return;
  }

  db.prepare('UPDATE bookings SET status = \'CANCELLED\' WHERE id = ?').run(bookingId);

  res.status(200).json({
    message: 'Tu reserva ha sido cancelada y el horario ha quedado libre.',
  });
});
