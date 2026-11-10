import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-chase-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, children, message }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
          <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg">
            <Spinner size="lg" />
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card p-6 animate-pulse ${className}`}>
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </div>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-4">
      <div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-8 w-full mt-1" />
      </div>
      <div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-8 w-full mt-1" />
      </div>
    </div>
  </div>
);