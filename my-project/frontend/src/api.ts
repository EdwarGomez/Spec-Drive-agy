import type {
  BookingSummary,
  Court,
  CourtAvailabilityResponse,
  MyBookingsResponse,
  User,
} from './types';

const TOKEN_STORAGE_KEY = 'padel_auth_token';

export interface HttpFailure {
  status: number;
  message: string;
  code?: string;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted browser environments
  }
}

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorizedCallback = handler;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  skipUnauthorizedRedirect = false
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch {
    const networkFailure: HttpFailure = {
      status: 0,
      message: 'No fue posible conectarse con el servidor. Verifica tu conexión e intenta nuevamente.',
    };
    throw networkFailure;
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorizedRedirect && onUnauthorizedCallback) {
      setStoredToken(null);
      onUnauthorizedCallback();
    }

    const friendlyMessage =
      typeof payload.error === 'string' && payload.error.trim().length > 0
        ? payload.error
        : 'No se pudo completar la operación solicitada. Por favor intenta nuevamente.';

    const failure: HttpFailure = {
      status: response.status,
      message: friendlyMessage,
      code: typeof payload.code === 'string' ? payload.code : undefined,
    };
    throw failure;
  }

  return payload as T;
}

// Phase 3 (US2): Authentication client functions
export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const result = await apiRequest<{ user: User; token: string }>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    true
  );
  setStoredToken(result.token);
  return result;
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const result = await apiRequest<{ user: User; token: string }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    true
  );
  setStoredToken(result.token);
  return result;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest<{ message: string }>(
      '/api/auth/logout',
      {
        method: 'POST',
      },
      true
    );
  } finally {
    setStoredToken(null);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const result = await apiRequest<{ user: User }>(
      '/api/auth/me',
      {
        method: 'GET',
      },
      true
    );
    return result.user;
  } catch {
    setStoredToken(null);
    return null;
  }
}

// Phase 4 (US1): Court catalog, availability, and booking creation methods
export async function getCourts(): Promise<Court[]> {
  const result = await apiRequest<{ courts: Court[] }>('/api/courts', {
    method: 'GET',
  });
  return result.courts;
}

export async function getCourtAvailability(
  courtId: number,
  date: string
): Promise<CourtAvailabilityResponse> {
  const query = encodeURIComponent(date);
  return apiRequest<CourtAvailabilityResponse>(
    `/api/courts/${courtId}/availability?date=${query}`,
    {
      method: 'GET',
    }
  );
}

export async function createBooking(input: {
  courtId: number;
  bookingDate: string;
  startHour: number;
}): Promise<{ message: string; booking: BookingSummary }> {
  return apiRequest<{ message: string; booking: BookingSummary }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// Phase 6 (US4): My bookings and cancellation methods
export async function getMyBookings(): Promise<MyBookingsResponse> {
  return apiRequest<MyBookingsResponse>('/api/bookings/my', {
    method: 'GET',
  });
}

export async function cancelBooking(bookingId: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/bookings/${bookingId}`, {
    method: 'DELETE',
  });
}
