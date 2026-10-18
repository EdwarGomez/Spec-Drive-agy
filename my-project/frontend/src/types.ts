export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt?: string;
}

export type CourtName =
  | 'Cancha Laureles'
  | 'Cancha El Poblado'
  | 'Cancha Belén'
  | 'Cancha Robledo'
  | 'Cancha Envigado';

export interface Court {
  id: number;
  name: CourtName;
}

export interface TimeSlot {
  startHour: number; // 7..21 (07:00 a 21:00)
  endHour: number;   // 8..22 (08:00 a 22:00)
  label: string;     // ej. "07:00 - 08:00", "14:00 - 15:00", "21:00 - 22:00"
  status: 'AVAILABLE' | 'BOOKED';
  isPast: boolean;
  bookedByCurrentUser: boolean;
}

export interface BookingSummary {
  id: number;
  userId: number;
  courtId: number;
  courtName: string;
  bookingDate: string;    // "YYYY-MM-DD"
  startHour: number;      // 7..21
  endHour: number;        // 8..22
  timeRangeLabel: string; // "14:00 - 15:00"
  canCancel: boolean;     // true si faltan >= 60 min para startHour
  createdAt: string;
}

export interface CourtAvailabilityResponse {
  court: Court;
  date: string;
  userHasActiveBooking: boolean;
  slots: TimeSlot[];
}

export interface MyBookingsResponse {
  activeBookings: BookingSummary[];
  pastBookings: BookingSummary[];
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}
