import type { User } from '../types';

export type ActiveTab = 'availability' | 'my-bookings';

interface NavbarProps {
  user: User;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export function Navbar({ user, activeTab, onSelectTab, onLogout }: NavbarProps) {
  return (
    <header className="bg-emerald-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold tracking-tight">Pádel Medellín</span>
            <p className="text-xs text-emerald-200">
              Canchas Oficiales • Horario 24 Horas
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('availability')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'availability'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            Disponibilidad de Canchas
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('my-bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'my-bookings'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            Mis Reservas
          </button>
        </nav>

        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-emerald-700 pt-3 sm:pt-0">
          <div className="text-sm">
            <span className="text-emerald-200">Jugador: </span>
            <span className="font-semibold">{user.fullName}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-950 text-emerald-100 text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
