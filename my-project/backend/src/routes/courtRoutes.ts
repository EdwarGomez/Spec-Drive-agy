import { Router } from 'express';
import { db } from '../../../db/client';
import {
  OPERATING_LAST_START_HOUR,
  OPERATING_START_HOUR,
  formatHourRangeLabel,
  getNow,
  isBookingStillActive,
  isDateInPast,
  isSlotInPast,
  isValidDateFormat,
} from '../time';
import type { Court, TimeSlot } from '../types';

export const courtRouter = Router();

courtRouter.get('/', (_req, res) => {
  const courts = db
    .prepare('SELECT id, name FROM courts ORDER BY id ASC')
    .all() as Court[];

  res.status(200).json({ courts });
});

courtRouter.get('/:courtId/availability', (req, res) => {
  const courtId = Number(req.params.courtId);
  if (!Number.isInteger(courtId) || courtId < 1 || courtId > 5) {
    res.status(404).json({
      error: 'La cancha solicitada no existe en el catálogo.',
    });
    return;
  }

  const court = db
    .prepare('SELECT id, name FROM courts WHERE id = ?')
    .get(courtId) as Court | undefined;

  if (!court) {
    res.status(404).json({
      error: 'La cancha solicitada no existe en el catálogo.',
    });
    return;
  }

  const dateParam = typeof req.query.date === 'string' ? req.query.date.trim() : '';
  const now = getNow();

  if (!isValidDateFormat(dateParam) || isDateInPast(dateParam, now)) {
    res.status(400).json({
      error: 'La fecha seleccionada no es válida o pertenece al pasado.',
    });
    return;
  }

  const currentUserId = req.user!.id;

  const userActiveRows = db
    .prepare('SELECT booking_date, end_hour FROM bookings WHERE user_id = ? AND status = \'ACTIVE\'')
    .all(currentUserId) as Array<{ booking_date: string; end_hour: number }>;

  const userHasActiveBooking = userActiveRows.some((row) =>
    isBookingStillActive(row.booking_date, row.end_hour, now)
  );

  const bookedRows = db
    .prepare(
      'SELECT start_hour, user_id FROM bookings WHERE court_id = ? AND booking_date = ? AND status = \'ACTIVE\''
    )
    .all(courtId, dateParam) as Array<{ start_hour: number; user_id: number }>;

  const bookedByHour = new Map<number, number>();
  for (const row of bookedRows) {
    bookedByHour.set(row.start_hour, row.user_id);
  }

  const slots: TimeSlot[] = [];
  for (let startHour = OPERATING_START_HOUR; startHour <= OPERATING_LAST_START_HOUR; startHour++) {
    const endHour = startHour + 1;
    const bookedUserId = bookedByHour.get(startHour);
    const isBooked = bookedUserId !== undefined;

    slots.push({
      startHour,
      endHour,
      label: formatHourRangeLabel(startHour, endHour),
      status: isBooked ? 'BOOKED' : 'AVAILABLE',
      isPast: isSlotInPast(dateParam, startHour, now),
      bookedByCurrentUser: isBooked && bookedUserId === currentUserId,
    });
  }

  res.status(200).json({
    court,
    date: dateParam,
    userHasActiveBooking,
    slots,
  });
});
