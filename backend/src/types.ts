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
  startHour: number; // 0..23
  endHour: number;   // 1..24
  label: string;     // ej. "14:00 - 15:00"
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
  startHour: number;      // 0..23
  endHour: number;        // 1..24
  timeRangeLabel: string; // "14:00 - 15:00"
  canCancel: boolean;     // true si faltan >= 60 min para startHour
  createdAt: string;
}

export interface AuthTokenPayload {
  id: number;
  fullName: string;
  email: string;
}
