import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Spinner = ({ size = 'md', className = '', color = 'primary' }) => {
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
    return (_jsxs("svg", { className: `${sizeClasses[size]} ${colorClasses[color]} animate-spin ${className}`, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }));
};
export const LoadingOverlay = ({ isLoading, children, message }) => {
    return (_jsxs("div", { className: "relative", children: [children, isLoading && (_jsx("div", { className: "absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl", children: _jsxs("div", { className: "flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg", children: [_jsx(Spinner, { size: "lg" }), message && _jsx("p", { className: "text-sm text-gray-600", children: message })] }) }))] }));
};
export const Skeleton = ({ className = '' }) => (_jsx("div", { className: `animate-pulse bg-gray-200 rounded ${className}` }));
export const SkeletonText = ({ lines = 3, className = '' }) => (_jsx("div", { className: className, children: Array.from({ length: lines }).map((_, i) => (_jsx("div", { className: "h-4 bg-gray-200 rounded animate-pulse mb-2", style: { width: i === lines - 1 ? '60%' : '100%' } }, i))) }));
export const SkeletonCard = ({ className = '' }) => (_jsxs("div", { className: `card p-6 animate-pulse ${className}`, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Skeleton, { className: "w-12 h-12 rounded-full" }), _jsxs("div", { className: "flex-1", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-3 w-1/2 mt-2" })] })] }), _jsxs("div", { className: "mt-6 grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Skeleton, { className: "h-3 w-full" }), _jsx(Skeleton, { className: "h-8 w-full mt-1" })] }), _jsxs("div", { children: [_jsx(Skeleton, { className: "h-3 w-full" }), _jsx(Skeleton, { className: "h-8 w-full mt-1" })] })] })] }));
