import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export const Card = React.forwardRef(({ children, className = '', hover = false, padding = 'md', ...props }, ref) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };
    return (_jsx("div", { ref: ref, className: `
          bg-white rounded-xl border border-gray-200 shadow-sm
          ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
          ${paddingClasses[padding]}
          ${className}
        `, ...props, children: children }));
});
Card.displayName = 'Card';
export const CardHeader = React.forwardRef(({ children, className = '', ...props }, ref) => (_jsx("div", { ref: ref, className: `mb-4 ${className}`, ...props, children: children })));
CardHeader.displayName = 'CardHeader';
export const CardTitle = React.forwardRef(({ children, className = '', ...props }, ref) => (_jsx("h3", { ref: ref, className: `text-lg font-semibold text-gray-900 ${className}`, ...props, children: children })));
CardTitle.displayName = 'CardTitle';
export const CardDescription = React.forwardRef(({ children, className = '', ...props }, ref) => (_jsx("p", { ref: ref, className: `mt-1 text-sm text-gray-500 ${className}`, ...props, children: children })));
CardDescription.displayName = 'CardDescription';
export const CardContent = React.forwardRef(({ children, className = '', ...props }, ref) => (_jsx("div", { ref: ref, className: className, ...props, children: children })));
CardContent.displayName = 'CardContent';
export const CardFooter = React.forwardRef(({ children, className = '', ...props }, ref) => (_jsx("div", { ref: ref, className: `mt-4 pt-4 border-t border-gray-100 ${className}`, ...props, children: children })));
CardFooter.displayName = 'CardFooter';
