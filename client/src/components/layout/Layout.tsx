import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2" aria-label="Chase Bank Home">
              <svg className="w-8 h-8 text-chase-600" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#002147" />
                <path d="M16 6L24 14H8L16 6Z" fill="#FFFFFF" />
                <path d="M16 18L8 26H24L16 18Z" fill="#FFFFFF" opacity="0.6" />
              </svg>
              <span className="text-xl font-bold text-gray-900">Chase</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Chase Bank. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex">
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1" aria-label="Admin navigation">
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </NavLink>
            <NavLink
              to="/admin/transactions"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transactions
            </NavLink>
          </nav>
        </aside>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};