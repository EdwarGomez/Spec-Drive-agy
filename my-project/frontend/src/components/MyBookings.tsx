import { useCallback, useEffect, useState } from 'react';
import { cancelBooking, getMyBookings, type HttpFailure } from '../api';
import type { BookingSummary } from '../types';

interface MyBookingsProps {
  refreshVersion: number;
  onBookingCancelled: () => void;
}

export function MyBookings({ refreshVersion, onBookingCancelled }: MyBookingsProps) {
  const [activeBookings, setActiveBookings] = useState<BookingSummary[]>([]);
  const [pastBookings, setPastBookings] = useState<BookingSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyBookings();
      setActiveBookings(data.activeBookings);
      setPastBookings(data.pastBookings);
    } catch (err) {
      const failure = err as HttpFailure;
      setFeedback({
        type: 'error',
        text: failure?.message || 'No fue posible cargar tus reservas.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings, refreshVersion]);

  const handleCancel = async (bookingId: number) => {
    setCancellingId(bookingId);
    setFeedback(null);
    try {
      const result = await cancelBooking(bookingId);
      setFeedback({
        type: 'success',
        text: result.message,
      });
      await loadBookings();
      onBookingCancelled();
    } catch (err) {
      const failure = err as HttpFailure;
      setFeedback({
        type: 'error',
        text: failure?.message || 'No se pudo cancelar la reserva.',
      });
      await loadBookings();
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3.5 text-sm flex items-center justify-between gap-4 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Sección 1: Reservas Futuras Activas */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Reservas Futuras Activas</h2>
          <p className="text-xs text-slate-500">
            Puedes cancelar tu reserva activa hasta con 1 hora (60 minutos) de anticipación antes
            de la hora de inicio.
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Cargando tus reservas activas...
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-sm text-slate-600">
            No tienes reservas futuras activas en este momento.
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                      Activa
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {booking.courtName}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-700">
                    Fecha: <strong>{booking.bookingDate}</strong> • Horario (24h):{' '}
                    <strong>{booking.timeRangeLabel}</strong>
                  </p>
                  {!booking.canCancel && (
                    <p className="text-xs text-amber-800 font-medium">
                      Cancelación deshabilitada: falta menos de 1 hora para el inicio o el turno
                      está en curso.
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={!booking.canCancel || cancellingId === booking.id}
                    onClick={() => handleCancel(booking.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      booking.canCancel
                        ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {cancellingId === booking.id ? 'Cancelando...' : 'Cancelar reserva'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sección 2: Historial de Reservas Pasadas Completadas (excluye canceladas) */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Historial de Reservas Pasadas Completadas
          </h2>
          <p className="text-xs text-slate-500">
            Turnos finalizados anteriormente (las reservas canceladas no se listan en este panel).
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Cargando historial...
          </div>
        ) : pastBookings.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-sm text-slate-600">
            Aún no tienes reservas pasadas completadas en tu historial.
          </div>
        ) : (
          <div className="space-y-3">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-600 text-white">
                      Completada
                    </span>
                    <h3 className="text-base font-bold text-slate-800">
                      {booking.courtName}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Fecha: <strong>{booking.bookingDate}</strong> • Horario (24h):{' '}
                    <strong>{booking.timeRangeLabel}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
