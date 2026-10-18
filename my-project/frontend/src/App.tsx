import { useEffect, useState } from 'react';
import { getCurrentUser, logoutUser, setOnUnauthorizedHandler } from './api';
import { AuthForm } from './components/AuthForm';
import { CourtGrid } from './components/CourtGrid';
import { MyBookings } from './components/MyBookings';
import { Navbar, type ActiveTab } from './components/Navbar';
import type { User } from './types';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('availability');
  const [refreshVersion, setRefreshVersion] = useState<number>(0);

  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      setUser(null);
      setActiveTab('availability');
    });

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .finally(() => {
        setIsCheckingSession(false);
      });

    return () => {
      setOnUnauthorizedHandler(null);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setActiveTab('availability');
  };

  const triggerRefresh = () => {
    setRefreshVersion((prev) => prev + 1);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 text-sm">
        Verificando sesión activa...
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthenticated={(loggedUser) => setUser(loggedUser)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar
        user={user}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          triggerRefresh();
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'availability' ? (
          <CourtGrid
            refreshVersion={refreshVersion}
            onBookingCreated={triggerRefresh}
            onNavigateToMyBookings={() => {
              setActiveTab('my-bookings');
              triggerRefresh();
            }}
          />
        ) : (
          <MyBookings
            refreshVersion={refreshVersion}
            onBookingCancelled={triggerRefresh}
          />
        )}
      </main>
    </div>
  );
}
