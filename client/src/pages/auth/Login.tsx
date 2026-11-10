import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm, TwoFactorForm } from '../../components/forms';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../utils/constants';

export const Login: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [show2FA, setShow2FA] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD} replace />;
  }

  const handleLoginSuccess = () => {
    navigate(user?.role === 'admin' ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD);
  };

  const handleSwitchTo2FA = () => {
    setShow2FA(true);
  };

  const handleBackToLogin = () => {
    setShow2FA(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6" aria-label="Chase Bank Home">
          <svg className="w-10 h-10 text-chase-600" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#002147" />
            <path d="M16 6L24 14H8L16 6Z" fill="#FFFFFF" />
            <path d="M16 18L8 26H24L16 18Z" fill="#FFFFFF" opacity="0.6" />
          </svg>
          <span className="text-2xl font-bold text-gray-900">Chase</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
        <p className="mt-2 text-sm text-gray-600">Access your banking dashboard securely</p>
      </div>

      <div className="card p-8">
        {show2FA ? (
          <TwoFactorForm onSuccess={handleLoginSuccess} onBack={handleBackToLogin} />
        ) : (
          <LoginForm onSuccess={handleLoginSuccess} onSwitchTo2FA={handleSwitchTo2FA} />
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Demo credentials:</p>
        <p className="font-mono mt-1">johndoe / password123</p>
        <p className="font-mono">admin / admin123</p>
      </div>
    </div>
  );
};