import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { X, LayoutDashboard, CreditCard, History, ArrowUpRight, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Avatar, Badge } from '../ui';
import { ROUTES } from '../../utils/constants';

interface MobileSidebarProps {
  onSignOut: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
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

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="fixed inset-0 bg-black/50"
            onClick={closeSidebar}
            aria-label="Close navigation menu"
          />
          <div id="mobile-navigation" className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link to={homeRoute} onClick={closeSidebar} className="flex items-center gap-2" aria-label="Chase Bank Home">
                <svg className="w-8 h-8 text-chase-600" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <rect width="32" height="32" rx="8" fill="#002147" />
                  <path d="M16 6L24 14H8L16 6Z" fill="#FFFFFF" />
                  <path d="M16 18L8 26H24L16 18Z" fill="#FFFFFF" opacity="0.6" />
                </svg>
                <span className="text-xl font-bold text-gray-900">Chase</span>
              </Link>
              <button
                type="button"
                onClick={closeSidebar}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4 space-y-1" aria-label={isAdmin ? 'Admin navigation' : 'Main navigation'}>
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? isAdmin ? 'bg-purple-50 text-purple-700' : 'bg-chase-50 text-chase-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {isAuthenticated && user && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Badge variant="gray">{user.role}</Badge>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeSidebar();
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
