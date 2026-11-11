import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building, Clock, ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Avatar, Badge, Button, Card } from '../../components/ui';
import { formatDate } from '../../utils/format';
import { ROUTES } from '../../utils/constants';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Link to={ROUTES.LOGIN}><Button>Sign in</Button></Link>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your personal information</p>
        </div>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm text-gray-500">{user.username}</p>
                </div>
              </div>
              <Badge variant="gray" size="sm">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 px-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><User className="w-5 h-5" /></div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
              </div>
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
              <div className="flex items-center gap-4 px-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><Building className="w-5 h-5" /></div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</p>
                  <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><Clock className="w-5 h-5" /></div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</p>
                  <p className="text-sm text-gray-900">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Account Security</h3>
              <p className="text-xs text-gray-500 mt-1">Two-factor authentication is {user.otpEnabled ? 'enabled' : 'disabled'}.</p>
            </div>
            <div className="p-6">
              <Button size="sm" leftIcon={<CreditCard className="w-4 h-4" />} className="w-full">Manage Security Settings</Button>
            </div>
          </Card>

          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Documents</h3>
              <p className="text-xs text-gray-500 mt-1">View and download your transaction receipts.</p>
            </div>
            <div className="p-6">
              <Link to={ROUTES.TRANSACTIONS}><Button variant="outline" size="sm" leftIcon={<CreditCard className="w-4 h-4" />} className="w-full">Go to Transactions</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
