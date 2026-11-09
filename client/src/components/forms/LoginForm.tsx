import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button, Input } from '../ui';
import { loginSchema, type LoginFormData } from '../../utils/validation';
import { useAuth } from '../../store/AuthContext';
import { useState } from 'react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchTo2FA?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchTo2FA }) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate loading for 1.5 seconds to show the spinner
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const result = await login(data.username, data.password);
      if (result.requires2FA && onSwitchTo2FA) {
        onSwitchTo2FA();
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <div>
        <Input
          {...register('username')}
          label="Username"
          placeholder="Enter your username"
          type="text"
          autoComplete="username"
          error={errors.username?.message}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="label">Password</label>
        <div className="relative">
          <input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
            disabled={isLoading}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account? Contact your administrator.
      </p>
    </form>
  );
};

interface TwoFactorFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ onSuccess, onBack }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ otp: string }>({
    resolver: zodResolver(zod.object({ otp: zod.string().length(6, 'Code must be 6 digits') })),
  });

  const onSubmit = async (data: { otp: string }) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate loading for 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      await login('', '', data.otp);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-chase-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-chase-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
        <p className="mt-2 text-sm text-gray-600">Enter the 6-digit code from your authenticator app</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
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
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </Button>

      {onBack && (
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          Back to Login
        </Button>
      )}
    </form>
  );
};