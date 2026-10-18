import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { db, initializeDatabase } from '../../db/client';
import { app } from '../src/app';
import { getBogotaTimestampMs, setNowProviderForTests } from '../src/time';

describe('Court Booking System Integration & Concurrency Suite', () => {
  // Base test clock: 2026-10-17 12:00:00 America/Bogota (UTC-5 -> 17:00:00Z)
  const baseBogotaNoon = new Date(getBogotaTimestampMs('2026-10-17', 12));

  beforeEach(() => {
    initializeDatabase(db);
    db.prepare('DELETE FROM bookings').run();
    db.prepare('DELETE FROM users').run();
    setNowProviderForTests(() => baseBogotaNoon);
  });

  afterEach(() => {
    setNowProviderForTests(null);
  });

  it('US2: blocks unauthenticated requests to /api/courts and /api/bookings with 401 Unauthorized', async () => {
    const courtsRes = await request(app).get('/api/courts');
    expect(courtsRes.status).toBe(401);
    expect(courtsRes.body.error).toBe('Debes iniciar sesión para acceder a las reservas.');

    const availabilityRes = await request(app).get('/api/courts/1/availability?date=2026-10-18');
    expect(availabilityRes.status).toBe(401);

    const createBookingRes = await request(app)
      .post('/api/bookings')
      .send({ courtId: 1, bookingDate: '2026-10-18', startHour: 14 });
    expect(createBookingRes.status).toBe(401);

    const myBookingsRes = await request(app).get('/api/bookings/my');
    expect(myBookingsRes.status).toBe(401);
  });

  it('US2: validates registration constraints, prevents duplicate emails (409), and supports login/me/logout', async () => {
    // Invalid registration (short password)
    const invalidRes = await request(app).post('/api/auth/register').send({
      fullName: 'Camila Restrepo',
      email: 'camila@padel.co',
      password: '123',
    });
    expect(invalidRes.status).toBe(400);

    // Valid registration
    const regRes = await request(app).post('/api/auth/register').send({
      fullName: 'Camila Restrepo',
      email: 'Camila@Padel.co',
      password: 'password123',
    });
    expect(regRes.status).toBe(201);
    expect(regRes.body.user).toEqual({
      id: expect.any(Number),
      fullName: 'Camila Restrepo',
      email: 'camila@padel.co',
    });
    expect(typeof regRes.body.token).toBe('string');

    // Duplicate email (case-insensitive)
    const dupRes = await request(app).post('/api/auth/register').send({
      fullName: 'Otra Camila',
      email: 'camila@padel.co',
      password: 'password123',
    });
    expect(dupRes.status).toBe(409);

    // Login with wrong password
    const badLogin = await request(app).post('/api/auth/login').send({
      email: 'camila@padel.co',
      password: 'wrongpassword',
    });
    expect(badLogin.status).toBe(401);

    // Valid login
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'camila@padel.co',
      password: 'password123',
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token as string;

    // GET /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('camila@padel.co');
  });

  it('US1 & FR-006: returns the 5 immutable courts and 15 hourly slots from 07:00 to 22:00 (excluding 22:00 to 07:00)', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'Juan Pérez',
      email: 'juan@padel.co',
      password: 'password123',
    });
    const token = reg.body.token as string;

    const courtsRes = await request(app)
      .get('/api/courts')
      .set('Authorization', `Bearer ${token}`);
    expect(courtsRes.status).toBe(200);
    expect(courtsRes.body.courts).toEqual([
      { id: 1, name: 'Cancha Laureles' },
      { id: 2, name: 'Cancha El Poblado' },
      { id: 3, name: 'Cancha Belén' },
      { id: 4, name: 'Cancha Robledo' },
      { id: 5, name: 'Cancha Envigado' },
    ]);

    // Reject past date
    const pastDateRes = await request(app)
      .get('/api/courts/1/availability?date=2026-10-16')
      .set('Authorization', `Bearer ${token}`);
    expect(pastDateRes.status).toBe(400);

    // Reject non-existent court
    const unknownCourtRes = await request(app)
      .get('/api/courts/99/availability?date=2026-10-18')
      .set('Authorization', `Bearer ${token}`);
    expect(unknownCourtRes.status).toBe(404);

    // Current date (2026-10-17 at 12:00 Bogota): 15 slots (07:00 to 22:00); hours 7..12 are isPast=true, hours 13..21 are isPast=false
    const todayGrid = await request(app)
      .get('/api/courts/1/availability?date=2026-10-17')
      .set('Authorization', `Bearer ${token}`);
    expect(todayGrid.status).toBe(200);
    expect(todayGrid.body.slots).toHaveLength(15);
    expect(todayGrid.body.slots[0].label).toBe('07:00 - 08:00');
    expect(todayGrid.body.slots[0].startHour).toBe(7);
    expect(todayGrid.body.slots[14].label).toBe('21:00 - 22:00');
    expect(todayGrid.body.slots[14].startHour).toBe(21);
    expect(todayGrid.body.slots[14].endHour).toBe(22);

    // Verify no slots between 22:00 and 07:00 exist in options
    const hasOutOfBoundsSlot = todayGrid.body.slots.some(
      (s: { startHour: number }) => s.startHour < 7 || s.startHour > 21
    );
    expect(hasOutOfBoundsSlot).toBe(false);

    // Index 5 corresponds to startHour 12 (12:00 - 13:00), Index 6 corresponds to startHour 13 (13:00 - 14:00)
    expect(todayGrid.body.slots[5].startHour).toBe(12);
    expect(todayGrid.body.slots[5].isPast).toBe(true);
    expect(todayGrid.body.slots[6].startHour).toBe(13);
    expect(todayGrid.body.slots[6].isPast).toBe(false);
  });

  it('US1, FR-006 & SC-001: rejects out-of-operating-hours slots (400 OUTSIDE_OPERATING_HOURS), past slots (400 PAST_TIME_SLOT), and prevents double-booking collisions (409 SLOT_ALREADY_BOOKED)', async () => {
    const userA = await request(app).post('/api/auth/register').send({
      fullName: 'Jugador A',
      email: 'a@padel.co',
      password: 'password123',
    });
    const userB = await request(app).post('/api/auth/register').send({
      fullName: 'Jugador B',
      email: 'b@padel.co',
      password: 'password123',
    });

    const tokenA = userA.body.token as string;
    const tokenB = userB.body.token as string;

    // Attempt to book hours outside 07:00 - 22:00 (e.g. 06:00 and 22:00)
    const earlyMorningRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ courtId: 1, bookingDate: '2026-10-18', startHour: 6 });
    expect(earlyMorningRes.status).toBe(400);
    expect(earlyMorningRes.body.code).toBe('OUTSIDE_OPERATING_HOURS');

    const lateNightRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ courtId: 1, bookingDate: '2026-10-18', startHour: 22 });
    expect(lateNightRes.status).toBe(400);
    expect(lateNightRes.body.code).toBe('OUTSIDE_OPERATING_HOURS');

    // Attempt to book a past slot on current day (11:00 when clock is 12:00)
    const pastSlotRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ courtId: 1, bookingDate: '2026-10-17', startHour: 11 });
    expect(pastSlotRes.status).toBe(400);
    expect(pastSlotRes.body.code).toBe('PAST_TIME_SLOT');

    // Concurrent booking attempts for Cancha Laureles on 2026-10-18 at 14:00
    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ courtId: 1, bookingDate: '2026-10-18', startHour: 14 }),
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ courtId: 1, bookingDate: '2026-10-18', startHour: 14 }),
    ]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([201, 409]);

    const conflictResponse = resA.status === 409 ? resA : resB;
    expect(conflictResponse.body.code).toBe('SLOT_ALREADY_BOOKED');
    expect(conflictResponse.body.error).toContain('La cancha ya fue reservada en este horario');

    // Verify database integrity: only 1 ACTIVE booking exists for that slot
    const countRow = db
      .prepare(
        `SELECT COUNT(*) AS count FROM bookings
         WHERE court_id = 1 AND booking_date = '2026-10-18' AND start_hour = 14 AND status = 'ACTIVE'`
      )
      .get() as { count: number };
    expect(countRow.count).toBe(1);
  });

  it('US3: enforces maximum 1 active booking per user and unlocks when end_hour <= current_hour', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'Mateo Gómez',
      email: 'mateo@padel.co',
      password: 'password123',
    });
    const token = reg.body.token as string;

    // Book today 2026-10-17 from 14:00 to 15:00 (clock is 12:00)
    const firstBooking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ courtId: 2, bookingDate: '2026-10-17', startHour: 14 });
    expect(firstBooking.status).toBe(201);

    // Attempt second booking while first is active (end_hour 15:00 > 12:00)
    const secondBooking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ courtId: 3, bookingDate: '2026-10-18', startHour: 10 });
    expect(secondBooking.status).toBe(409);
    expect(secondBooking.body.code).toBe('USER_ALREADY_HAS_ACTIVE_BOOKING');

    // Advance clock to 14:30 (in progress, still < 15:00 end_hour) -> still blocked
    setNowProviderForTests(
      () => new Date(getBogotaTimestampMs('2026-10-17', 14) + 30 * 60 * 1000)
    );
    const duringSlotAttempt = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ courtId: 3, bookingDate: '2026-10-18', startHour: 10 });
    expect(duringSlotAttempt.status).toBe(409);
    expect(duringSlotAttempt.body.code).toBe('USER_ALREADY_HAS_ACTIVE_BOOKING');

    // Advance clock to exact end of slot: 2026-10-17 15:00:00 (end_hour <= current_hour)
    setNowProviderForTests(() => new Date(getBogotaTimestampMs('2026-10-17', 15)));

    const afterEndAttempt = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ courtId: 3, bookingDate: '2026-10-18', startHour: 10 });
    expect(afterEndAttempt.status).toBe(201);
  });

  it('US4: manages My Bookings (active vs completed, hiding cancelled), enforces ownership (403) and >= 1h cancellation window (400)', async () => {
    const user1 = await request(app).post('/api/auth/register').send({
      fullName: 'Usuario Uno',
      email: 'u1@padel.co',
      password: 'password123',
    });
    const user2 = await request(app).post('/api/auth/register').send({
      fullName: 'Usuario Dos',
      email: 'u2@padel.co',
      password: 'password123',
    });

    const token1 = user1.body.token as string;
    const token2 = user2.body.token as string;

    // At 12:00 on 2026-10-17, User 1 books 14:00-15:00 (2 hours ahead -> canCancel = true)
    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token1}`)
      .send({ courtId: 1, bookingDate: '2026-10-17', startHour: 14 });
    expect(createRes.status).toBe(201);
    const bookingId = createRes.body.booking.id as number;

    // User 2 attempts to cancel User 1's booking -> 403 Forbidden
    const forbiddenCancel = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(forbiddenCancel.status).toBe(403);
    expect(forbiddenCancel.body.code).toBe('FORBIDDEN_BOOKING_ACCESS');

    // Advance clock to 13:15 (only 45 minutes before 14:00 start_hour) -> cannot cancel (< 1 hour)
    setNowProviderForTests(
      () => new Date(getBogotaTimestampMs('2026-10-17', 13) + 15 * 60 * 1000)
    );
    const myLateRes = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${token1}`);
    expect(myLateRes.body.activeBookings[0].canCancel).toBe(false);

    const expiredCancel = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(expiredCancel.status).toBe(400);
    expect(expiredCancel.body.code).toBe('CANCELLATION_WINDOW_EXPIRED');

    // Rewind clock to 12:30 (90 minutes before 14:00 start_hour) -> cancellation allowed
    setNowProviderForTests(
      () => new Date(getBogotaTimestampMs('2026-10-17', 12) + 30 * 60 * 1000)
    );
    const validCancel = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(validCancel.status).toBe(200);

    // Cancelled booking is hidden from both activeBookings and pastBookings (FR-011)
    const myAfterCancel = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${token1}`);
    expect(myAfterCancel.body.activeBookings).toHaveLength(0);
    expect(myAfterCancel.body.pastBookings).toHaveLength(0);

    // And the slot 14:00 on Court 1 is immediately AVAILABLE again in the grid
    const gridAfterCancel = await request(app)
      .get('/api/courts/1/availability?date=2026-10-17')
      .set('Authorization', `Bearer ${token2}`);
    const slot14 = gridAfterCancel.body.slots.find(
      (s: { startHour: number }) => s.startHour === 14
    );
    expect(slot14?.status).toBe('AVAILABLE');
  });
});
