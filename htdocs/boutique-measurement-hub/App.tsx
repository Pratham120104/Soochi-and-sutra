
import React from 'react';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { Role } from './types';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === Role.EMPLOYEE) {
    return <EmployeeDashboard />;
  }

  if (user.role === Role.ADMIN) {
    return <AdminDashboard />;
  }

  return <LoginPage />;
};

export default App;