const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000; // UTC-5 (America/Bogota)
const ONE_HOUR_SECONDS = 3600;

export const OPERATING_START_HOUR = 7;       // 07:00 (7 AM)
export const OPERATING_LAST_START_HOUR = 21; // 21:00 (último turno: 21:00 - 22:00)
export const OPERATING_END_HOUR = 22;        // 22:00 (10 PM cierre)

export function isWithinOperatingHours(startHour: number): boolean {
  return (
    Number.isInteger(startHour) &&
    startHour >= OPERATING_START_HOUR &&
    startHour <= OPERATING_LAST_START_HOUR
  );
}

let customNowProvider: (() => Date) | null = null;

export function setNowProviderForTests(provider: (() => Date) | null): void {
  customNowProvider = provider;
}

export function getNow(): Date {
  return customNowProvider ? customNowProvider() : new Date();
}

export function getBogotaCurrentDate(now: Date = getNow()): string {
  const bogotaTime = new Date(now.getTime() + BOGOTA_OFFSET_MS);
  return bogotaTime.toISOString().slice(0, 10);
}

export function isValidDateFormat(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const checkDate = new Date(Date.UTC(year, month - 1, day));
  return (
    checkDate.getUTCFullYear() === year &&
    checkDate.getUTCMonth() === month - 1 &&
    checkDate.getUTCDate() === day
  );
}

export function getBogotaTimestampMs(bookingDate: string, hour: number): number {
  const [yearStr, monthStr, dayStr] = bookingDate.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  // 00:00 in America/Bogota (UTC-5) is 05:00 UTC
  return Date.UTC(year, month - 1, day, hour + 5, 0, 0, 0);
}

export function isDateInPast(bookingDate: string, now: Date = getNow()): boolean {
  const currentBogotaDate = getBogotaCurrentDate(now);
  return bookingDate < currentBogotaDate;
}

export function isSlotInPast(bookingDate: string, startHour: number, now: Date = getNow()): boolean {
  const slotStartMs = getBogotaTimestampMs(bookingDate, startHour);
  return slotStartMs <= now.getTime();
}

export function isBookingStillActive(bookingDate: string, endHour: number, now: Date = getNow()): boolean {
  const slotEndMs = getBogotaTimestampMs(bookingDate, endHour);
  return slotEndMs > now.getTime();
}

export function canCancelWithinWindow(bookingDate: string, startHour: number, now: Date = getNow()): boolean {
  const slotStartMs = getBogotaTimestampMs(bookingDate, startHour);
  const diffSeconds = (slotStartMs - now.getTime()) / 1000;
  return diffSeconds >= ONE_HOUR_SECONDS;
}

export function formatHourRangeLabel(startHour: number, endHour: number): string {
  const startLabel = String(startHour).padStart(2, '0');
  const endLabel = String(endHour).padStart(2, '0');
  return `${startLabel}:00 - ${endLabel}:00`;
}
