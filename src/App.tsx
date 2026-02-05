<<<<<<< HEAD
import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider } from './hooks/useData';
import { MainLayout } from './components/MainLayout';
import { Login } from './sections/Login';
import { Dashboard } from './sections/Dashboard';
import { Clients } from './sections/Clients';
import { Services } from './sections/Services';
import { Appointments } from './sections/Appointments';
import { Finance } from './sections/Finance';
import { Reports } from './sections/Reports';
import { Users } from './sections/Users';
import { Staff } from './sections/Staff';

type ViewType = 'dashboard' | 'clients' | 'appointments' | 'services' | 'finance' | 'reports' | 'users' | 'staff';

function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'appointments':
        return <Appointments />;
      case 'services':
        return <Services />;
      case 'finance':
        return <Finance />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <Users />;
      case 'staff':
        return <Staff />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <MainLayout currentView={currentView} onNavigate={(view) => setCurrentView(view as ViewType)}>
        {renderView()}
      </MainLayout>
    </DataProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MainApp /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
=======
import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { router } from './routes';

function App() {
  return (
    <>
      <Toaster richColors closeButton />
      <AuthProvider>
        <DataProvider>
          <RouterProvider router={router} />
        </DataProvider>
      </AuthProvider>
    </>
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
  );
}

export default App;
