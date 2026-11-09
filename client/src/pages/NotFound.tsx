import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui';
import { ROUTES } from '../utils/constants';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={ROUTES.DASHBOARD}>
            <Button leftIcon={<Home className="w-4 h-4" />}>
              Go to Dashboard
            </Button>
          </Link>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="secondary" leftIcon={<Search className="w-4 h-4" />}>
              Browse Accounts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};