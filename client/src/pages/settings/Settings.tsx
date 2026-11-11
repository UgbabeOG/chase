import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Bell, User, Mail, Phone, Lock, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Button, Card, Badge } from '../../components/ui';
import { ROUTES } from '../../utils/constants';

export const Settings: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      // errors surfaced via toasts in Header
    }
  };

  if (!user) {
    return <Link to={ROUTES.LOGIN}><Button>Sign in</Button></Link>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <User className="w-5 h-5 text-chase-600" />
            <h2 className="text-lg font-bold text-gray-900">Account</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 px-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><Mail className="w-5 h-5" /></div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</p>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><Phone className="w-5 h-5" /></div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</p>
                <p className="text-sm text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full">Update Account Information</Button>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <Shield className="w-5 h-5 text-chase-600" />
            <h2 className="text-lg font-bold text-gray-900">Security</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of protection to your account</p>
              </div>
              <Badge variant={user.otpEnabled ? 'success' : 'gray'} size="sm">{user.otpEnabled ? 'Enabled' : 'Disabled'}</Badge>
            </div>
            <Button size="sm" variant={user.otpEnabled ? 'outline' : 'primary'} onClick={() => navigate(ROUTES.SETUP_2FA)} className="w-full">{user.otpEnabled ? 'Manage 2FA' : 'Set up 2FA'}</Button>
            <div className="flex items-center gap-4 px-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><Lock className="w-5 h-5" /></div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</p>
                <p className="text-sm text-gray-900">Last changed • {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full">Change Password</Button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <Bell className="w-5 h-5 text-chase-600" />
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">Transaction Alerts</p>
              <p className="text-xs text-gray-500">Receive notifications for account activity</p>
            </div>
            <button role="switch" aria-checked="true" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-chase-500 focus:ring-offset-2" aria-label="Transaction alerts"><span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 transform translate-x-6"></span></button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">Marketing Emails</p>
              <p className="text-xs text-gray-500">Offers, product updates, and news</p>
            </div>
            <button role="switch" aria-checked="false" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-gray-300 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-chase-500 focus:ring-offset-2" aria-label="Marketing emails"><span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 transform translate-x-1"></span></button>
          </div>
        </div>
      </Card>

      <Card className="border-red-50">
        <div className="p-6 border-b border-red-100 flex items-center gap-3">
          <LogOut className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Danger Zone</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="danger" size="sm" disabled={isLoggingOut} onClick={handleSignOut} className="w-full">{isLoggingOut ? 'Signing out...' : 'Sign Out'}</Button>
        </div>
      </Card>
    </div>
  );
};
