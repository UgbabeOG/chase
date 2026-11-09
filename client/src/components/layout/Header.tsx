import React from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Menu, LogOut, User, Settings, ChevronDown, CreditCard, History, ArrowUpRight, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Button, Avatar, Dropdown, Badge } from '../ui';
import { formatCurrency } from '../../utils';
import { ROUTES } from '../../utils/constants';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Accounts', href: ROUTES.ACCOUNTS, icon: CreditCard },
    { name: 'Transactions', href: ROUTES.TRANSACTIONS, icon: History },
    { name: 'Transfer', href: ROUTES.TRANSFER, icon: ArrowUpRight },
  ];

  const adminNavigation = [
    { name: 'Users', href: ROUTES.ADMIN_USERS, icon: User },
    { name: 'Transactions', href: ROUTES.ADMIN_TRANSACTIONS, icon: History },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2" aria-label="Chase Bank Home">
              <svg className="w-8 h-8 text-chase-600" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#002147" />
                <path d="M16 6L24 14H8L16 6Z" fill="#FFFFFF" />
                <path d="M16 18L8 26H24L16 18Z" fill="#FFFFFF" opacity="0.6" />
              </svg>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Chase</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-chase-50 text-chase-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
              {isAdmin && (
                <>
                  <div className="w-px h-6 bg-gray-200 mx-1" />
                  <NavLink
                    to={ROUTES.ADMIN_USERS}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Shield className="w-4 h-4" aria-hidden="true" />
                    Admin
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2">
                    <Avatar name={user.firstName + ' ' + user.lastName} size="sm" />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user.firstName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                }
                items={[
                  { label: 'Profile', value: 'profile', icon: <User className="w-4 h-4" /> },
                  { label: 'Settings', value: 'settings', icon: <Settings className="w-4 h-4" /> },
                  { label: 'Security', value: 'security', icon: <Shield className="w-4 h-4" /> },
                  { label: 'Sign out', value: 'logout', icon: <LogOut className="w-4 h-4" />, danger: true },
                ]}
                onSelect={(value) => {
                  if (value === 'logout') {
                    logout();
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};