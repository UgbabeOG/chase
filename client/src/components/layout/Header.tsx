import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, CreditCard, History, ArrowUpRight, LayoutDashboard, Loader2 } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Avatar, ConfirmModal, Dropdown } from '../ui';
import { useToast } from '../../store/ToastContext';
import { ROUTES } from '../../utils/constants';
import { MobileSidebar } from './MobileSidebar';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated, isLoggingOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const isAdmin = user?.role === 'admin';
  const homeRoute = isAdmin ? ROUTES.ADMIN_USERS : ROUTES.DASHBOARD;
  const navigation = isAdmin
    ? [
        { name: 'Users', href: ROUTES.ADMIN_USERS, icon: User },
        { name: 'Transactions', href: ROUTES.ADMIN_TRANSACTIONS, icon: History },
      ]
    : [
        { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
        { name: 'Accounts', href: ROUTES.ACCOUNTS, icon: CreditCard },
        { name: 'Transactions', href: ROUTES.TRANSACTIONS, icon: History },
        { name: 'Transfer', href: ROUTES.TRANSFER, icon: ArrowUpRight },
      ];

  const handleSignOut = async () => {
    try {
      await logout();
      setConfirmSignOut(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out. Please try again.';
      showToast({ type: 'error', title: 'Sign out failed', message });
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to={homeRoute} className="flex items-center gap-2" aria-label="Chase Bank Home">
                <svg className="w-8 h-8 text-chase-600" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <rect width="32" height="32" rx="8" fill="#002147" />
                  <path d="M16 6L24 14H8L16 6Z" fill="#FFFFFF" />
                  <path d="M16 18L8 26H24L16 18Z" fill="#FFFFFF" opacity="0.6" />
                </svg>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">Chase</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1" aria-label={isAdmin ? 'Admin navigation' : 'Main navigation'}>
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? isAdmin ? 'bg-purple-50 text-purple-700' : 'bg-chase-50 text-chase-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && <MobileSidebar onSignOut={() => setConfirmSignOut(true)} />}
              {isAuthenticated && user && (
                <Dropdown
                  trigger={
                    <div className="flex items-center gap-2">
                      <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                      <span className="hidden sm:block text-sm font-medium text-gray-700">{user.firstName}</span>
                    </div>
                  }
                  items={[
                    { label: 'Profile', value: 'profile', icon: <User className="w-4 h-4" /> },
                    { label: 'Settings', value: 'settings', icon: <Settings className="w-4 h-4" /> },
                    { label: 'Sign out', value: 'logout', icon: <LogOut className="w-4 h-4" />, danger: true },
                  ]}
                  onSelect={(value) => {
                    if (value === 'profile') navigate(ROUTES.PROFILE);
                    else if (value === 'settings') navigate(ROUTES.SETTINGS);
                    else if (value === 'logout') setConfirmSignOut(true);
                  }}
                  disabled={isLoggingOut}
                />
              )}
              {isLoggingOut && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin text-chase-600" />
                  <span className="hidden sm:inline">Signing out...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
        title="Sign out?"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign out"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
};
