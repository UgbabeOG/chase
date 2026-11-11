import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Loader2, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';
import { Button, Input, Card, Badge } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../utils/constants';
import { useToast } from '../../store/ToastContext';

const verify2FASchema = zod.object({
  token: zod.string().length(6, 'Code must be 6 digits'),
});

type Verify2FAFormData = zod.infer<typeof verify2FASchema>;

export const Setup2FA: React.FC = () => {
  const { user, setup2FA, verify2FA, refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string; backupCodes: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  if (!isAuthenticated) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  if (user?.otpEnabled) {
    navigate(ROUTES.DASHBOARD);
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Verify2FAFormData>({
    resolver: zodResolver(verify2FASchema),
  });

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const data = await setup2FA();
      setSetupData(data);
      setStep('verify');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to set up 2FA';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (data: Verify2FAFormData) => {
    setIsLoading(true);
    try {
      await verify2FA(data.token);
      await refreshUser();
      showToast({ type: 'success', title: '2FA Enabled', message: 'Two-factor authentication has been enabled successfully' });
      navigate(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code. Please try again.';
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (setupData) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      showToast({ type: 'success', title: 'Copied', message: 'Backup codes copied to clipboard' });
    }
  };

  if (step === 'setup') {
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
          <h1 className="text-2xl font-bold text-gray-900">Set Up Two-Factor Authentication</h1>
          <p className="mt-2 text-sm text-gray-600">Add an extra layer of security to your account</p>
        </div>

        <div className="card p-8">
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h3 className="font-medium text-blue-800">What is 2FA?</h3>
                  <p className="text-sm text-blue-700">Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app in addition to your password.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">1. Install an authenticator app</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Google Authenticator</li>
                <li>Authy</li>
                <li>Microsoft Authenticator</li>
                <li>1Password</li>
              </ul>

              <Button className="w-full" size="lg" onClick={handleSetup} isLoading={isLoading}>
                Continue to QR Code
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
        <p className="mt-2 text-sm text-gray-600">Open your authenticator app and scan the code below</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit(handleVerify)} className="space-y-6" noValidate>
          <div className="text-center">
            {setupData && (
              <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                <img
                  src={setupData.qrCodeUrl}
                  alt="QR Code for 2FA setup"
                  className="w-48 h-48"
                />
              </div>
            )}
            <p className="mt-4 text-sm text-gray-500">Can't scan? Enter this key manually:</p>
            {setupData && (
              <div className="mt-2 flex items-center gap-2 justify-center">
                <code className="px-3 py-1.5 bg-gray-100 rounded font-mono text-sm text-gray-900 tracking-wider">
                  {setupData.secret}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(setupData.secret)}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                  aria-label="Copy secret key"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-800">Save your backup codes</h3>
                <p className="text-sm text-yellow-700 mt-1">Store these codes in a safe place. Each code can be used once if you lose access to your authenticator app.</p>
              </div>
            </div>
            {setupData && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="text-sm text-yellow-700 hover:text-yellow-800 font-medium flex items-center gap-1"
                >
                  {showBackupCodes ? 'Hide' : 'Show'} backup codes
                  <svg className={`w-4 h-4 transition-transform ${showBackupCodes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showBackupCodes && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {setupData.backupCodes.map((code, index) => (
                      <code key={index} className="px-2 py-1 bg-white border border-gray-200 rounded font-mono text-sm text-gray-900">
                        {code}
                      </code>
                    ))}
                  </div>
                )}
                {showBackupCodes && (
                  <button
                    type="button"
                    onClick={copyBackupCodes}
                    className="mt-3 text-sm text-chase-600 hover:text-chase-700 font-medium flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Copy all codes
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <Input
              {...register('token')}
              label="Enter 6-digit code from your app"
              placeholder="000000"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              error={errors.token?.message}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 mr-2" /> : null}
            Enable 2FA
          </Button>
        </form>
      </div>
    </div>
  );
};