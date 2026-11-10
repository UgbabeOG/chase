import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  shape?: 'circle' | 'square';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  shape = 'circle',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || '?';
    return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '').toUpperCase();
  };

  const getColor = (name: string) => {
    const colors = [
      'bg-chase-600',
      'bg-green-600',
      'bg-purple-600',
      'bg-orange-600',
      'bg-pink-600',
      'bg-teal-600',
      'bg-indigo-600',
      'bg-red-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`${sizeClasses[size]} ${shapeClass} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${shapeClass} flex items-center justify-center text-white font-medium ${getColor(name || '')} ${className}`}
      aria-label={name || 'User avatar'}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
};

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 5,
  className = '',
  size = 'md',
}) => {
  const kids = React.Children.toArray(children);
  const visible = kids.slice(0, max);
  const remaining = kids.length - max;

  const sizeClasses = {
    xs: '-ml-1',
    sm: '-ml-2',
    md: '-ml-2',
    lg: '-ml-3',
    xl: '-ml-4',
  };

  return (
    <div className={`flex ${className}`} aria-label={`${kids.length} people`}>
      {visible.map((child, index) =>
        React.cloneElement(child as React.ReactElement, {
          key: (child as React.ReactElement).key || index,
          className: `${index > 0 ? sizeClasses[size] : ''} border-2 border-white`,
        })
      )}
      {remaining > 0 && (
        <div
          className={`${sizeClasses[size]} ${sizeClasses[size]} border-2 border-white bg-gray-100 text-gray-600 font-medium flex items-center justify-center`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};