import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Input = React.forwardRef(({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700 mb-1.5", children: label })), _jsxs("div", { className: "relative", children: [leftIcon && (_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400", children: leftIcon })), _jsx("input", { ref: ref, id: inputId, className: `
              w-full px-4 py-2.5 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-chase-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
              ${className}
            `, "aria-invalid": error ? 'true' : 'false', "aria-describedby": error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined, ...props }), rightIcon && (_jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400", children: rightIcon }))] }), error && (_jsx("p", { id: `${inputId}-error`, className: "mt-1.5 text-sm text-red-600", role: "alert", children: error })), helperText && !error && (_jsx("p", { id: `${inputId}-helper`, className: "mt-1.5 text-sm text-gray-500", children: helperText }))] }));
});
Input.displayName = 'Input';
