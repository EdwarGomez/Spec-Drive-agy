import { useCallback, useEffect, useState } from 'react';
import {
  createBooking,
  getCourtAvailability,
  getCourts,
  type HttpFailure,
} from '../api';
import type { Court, TimeSlot } from '../types';

interface CourtGridProps {
  refreshVersion: number;
  onBookingCreated: () => void;
  onNavigateToMyBookings: () => void;
}

function getBogotaTodayString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export function CourtGrid({
  refreshVersion,
  onBookingCreated,
  onNavigateToMyBookings,
}: CourtGridProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(() => getBogotaTodayString());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [userHasActiveBooking, setUserHasActiveBooking] = useState<boolean>(false);
  const [pendingSlot, setPendingSlot] = useState<TimeSlot | null>(null);
  const [isLoadingCourts, setIsLoadingCourts] = useState<boolean>(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(true);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const minDate = getBogotaTodayString();

  useEffect(() => {
    let active = true;
    setIsLoadingCourts(true);
    getCourts()
      .then((courtList) => {
        if (!active) return;
        setCourts(courtList);
        if (courtList.length > 0) {
          setSelectedCourtId((prev) =>
            courtList.some((c) => c.id === prev) ? prev : courtList[0].id
          );
        }
      })
      .catch((err: HttpFailure) => {
        if (!active) return;
        setFeedback({
          type: 'error',
          text: err?.message || 'No fue posible cargar el catálogo de canchas.',
        });
      })
      .finally(() => {
        if (active) setIsLoadingCourts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchAvailability = useCallback(async () => {
    if (!selectedCourtId || !selectedDate) return;
    setIsLoadingSlots(true);
    try {
      const response = await getCourtAvailability(selectedCourtId, selectedDate);
      setSlots(response.slots);
      setUserHasActiveBooking(response.userHasActiveBooking);
    } catch (err) {
      const failure = err as HttpFailure;
      setFeedback({
        type: 'error',
        text:
          failure?.message ||
          'No se pudo consultar la disponibilidad para la fecha seleccionada.',
      });
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedCourtId, selectedDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability, refreshVersion]);

  const handleConfirmBooking = async () => {
    if (!pendingSlot) return;
    setIsBooking(true);
    setFeedback(null);

    try {
      const response = await createBooking({
        courtId: selectedCourtId,
        bookingDate: selectedDate,
        startHour: pendingSlot.startHour,
      });

      setPendingSlot(null);
      setFeedback({
        type: 'success',
        text: `${response.message} (${response.booking.courtName} • ${response.booking.bookingDate} • ${response.booking.timeRangeLabel})`,
      });
      await fetchAvailability();
      onBookingCreated();
    } catch (err) {
      const failure = err as HttpFailure;
      setPendingSlot(null);
      setFeedback({
        type: 'error',
        text:
          failure?.message ||
          'No fue posible confirmar la reserva. Por favor intenta nuevamente.',
      });
      // Immediately refresh grid if a collision or state change occurred
      await fetchAvailability();
    } finally {
      setIsBooking(false);
    }
  };

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);

  return (
    <div className="space-y-6">
      {/* Banner informativo de restricción de Reserva Activa Única (US3) */}
      {userHasActiveBooking && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Tienes una reserva activa vigente</p>
            <p className="text-amber-800 mt-0.5">
              Recuerda que solo puedes mantener 1 reserva activa a la vez. Podrás reservar un
              nuevo turno cuando finalice tu horario actual o si lo cancelas con al menos 1 hora
              de anticipación.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToMyBookings}
            className="self-start sm:self-center shrink-0 rounded-lg bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            Ver Mis Reservas
          </button>
        </div>
      )}

      {/* Controles de Cancha (5 fijas) y Selector de Fecha sin límite futuro */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              1. Selecciona una Cancha (Catálogo Oficial Medellín)
            </label>
            {isLoadingCourts ? (
              <div className="text-sm text-slate-500">Cargando canchas...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {courts.map((court) => {
                  const isSelected = court.id === selectedCourtId;
                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourtId(court.id);
                        setPendingSlot(null);
                        setFeedback(null);
                      }}
                      className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-white'
                      }`}
                    >
                      {court.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-full md:w-56">
            <label
              htmlFor="bookingDateInput"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
            >
              2. Fecha de Reserva
            </label>
            <input
              id="bookingDateInput"
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setPendingSlot(null);
                  setFeedback(null);
                }
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>
      </div>

      {/* Mensajes de confirmación o error amigable */}
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

      {/* Modal/Panel de confirmación antes de guardar la reserva */}
      {pendingSlot && selectedCourt && (
        <div className="rounded-2xl bg-emerald-900 text-white p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Confirmar Reserva de 1 Hora</h3>
            <p className="text-sm text-emerald-100 mt-1">
              Cancha: <strong className="text-white">{selectedCourt.name}</strong> • Fecha:{' '}
              <strong className="text-white">{selectedDate}</strong> • Horario:{' '}
              <strong className="text-white">{pendingSlot.label}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isBooking}
              onClick={() => setPendingSlot(null)}
              className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isBooking}
              onClick={handleConfirmBooking}
              className="px-4 py-2 rounded-lg bg-white hover:bg-emerald-50 text-emerald-950 text-sm font-bold transition-colors cursor-pointer"
            >
              {isBooking ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      )}

      {/* Grilla Operativa en Formato 24 Horas (15 bloques enteros de 1 hora: 07:00 - 08:00 a 21:00 - 22:00) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Horarios Disponibles (07:00 a 22:00) —{' '}
              {selectedCourt ? selectedCourt.name : 'Cancha'} ({selectedDate})
            </h2>
            <p className="text-xs text-slate-500">
              15 bloques de 1 hora exacta en formato 24h (07:00 a 22:00 • Zona horaria America/Bogota)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-400 inline-block" />
              Disponible
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-red-100 border border-red-300 inline-block" />
              Reservado
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-slate-100 border border-slate-300 inline-block" />
              Horario transcurrido
            </span>
          </div>
        </div>

        {isLoadingSlots ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Consultando disponibilidad en tiempo real...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {slots
              .filter((slot) => slot.startHour >= 7 && slot.startHour <= 21)
              .map((slot) => {
              const isBooked = slot.status === 'BOOKED';
              const isDisabled = isBooked || slot.isPast;
              const isSelectedPending = pendingSlot?.startHour === slot.startHour;

              let cardClasses =
                'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/80 hover:border-emerald-500 text-slate-900 cursor-pointer';
              let badgeClasses = 'bg-emerald-600 text-white';
              let statusText = 'Disponible';

              if (isBooked) {
                cardClasses =
                  'bg-red-50 border-red-200 text-slate-600 cursor-not-allowed opacity-90';
                badgeClasses = slot.bookedByCurrentUser
                  ? 'bg-emerald-800 text-white'
                  : 'bg-red-600 text-white';
                statusText = slot.bookedByCurrentUser ? 'Reservado (Tú)' : 'Reservado';
              } else if (slot.isPast) {
                cardClasses =
                  'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed';
                badgeClasses = 'bg-slate-300 text-slate-700';
                statusText = 'No disponible';
              } else if (isSelectedPending) {
                cardClasses =
                  'bg-emerald-600 border-emerald-700 text-white ring-2 ring-emerald-400 cursor-pointer';
                badgeClasses = 'bg-white text-emerald-900';
                statusText = 'Seleccionado';
              }

              return (
                <button
                  key={slot.startHour}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    setFeedback(null);
                    setPendingSlot(slot);
                  }}
                  className={`rounded-xl border p-3.5 text-left transition-all flex flex-col justify-between gap-2 ${cardClasses}`}
                >
                  <div className="text-sm font-bold tracking-tight">{slot.label}</div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${badgeClasses}`}
                    >
                      {statusText}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
