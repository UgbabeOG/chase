import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../utils/constants';

const twoFactorSchema = zod.object({
  otp: zod.string().length(6, 'Code must be 6 digits'),
});

type TwoFactorFormData = zod.infer<typeof twoFactorSchema>;

export const TwoFactor: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get username and password from location state
  const state = location.state as { username?: string; password?: string } | undefined;
  const username = state?.username;
  const password = state?.password;

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD} replace />;
  }

  if (!username || !password) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = async (data: TwoFactorFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(username, password, data.otp);
      navigate(user?.role === 'admin' ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
        <p className="mt-2 text-sm text-gray-600">Enter the 6-digit code from your authenticator app</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm" role="alert">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <Input
              {...register('otp')}
              label="Authentication Code"
              placeholder="000000"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              error={errors.otp?.message}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 mr-2" /> : null}
            Verify Code
          </Button>

          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate(ROUTES.LOGIN)}>
            Back to Login
          </Button>
        </form>
      </div>
    </div>
  );
};