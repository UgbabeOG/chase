import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Avatar = ({ src, alt, name, size = 'md', className = '', shape = 'circle', }) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
    };
    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
    const getInitials = (name) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1)
            return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };
    const getColor = (name) => {
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
        return (_jsx("img", { src: src, alt: alt || name || 'Avatar', className: `${sizeClasses[size]} ${shapeClass} object-cover ${className}` }));
    }
    return (_jsx("div", { className: `${sizeClasses[size]} ${shapeClass} flex items-center justify-center text-white font-medium ${getColor(name || '')} ${className}`, "aria-label": name || 'User avatar', children: name ? getInitials(name) : '?' }));
};
export const AvatarGroup = ({ children, max = 5, className = '', size = 'md', }) => {
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
    return (_jsxs("div", { className: `flex ${className}`, "aria-label": `${kids.length} people`, children: [visible.map((child, index) => React.cloneElement(child, {
                key: child.key || index,
                className: `${index > 0 ? sizeClasses[size] : ''} border-2 border-white`,
            })), remaining > 0 && (_jsxs("div", { className: `${sizeClasses[size]} ${sizeClasses[size]} border-2 border-white bg-gray-100 text-gray-600 font-medium flex items-center justify-center`, children: ["+", remaining] }))] }));
};
