import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export const Footer = () => {
    const currentYear = new Date().getFullYear();
    const footerLinks = {
        'Personal Banking': [
            { label: 'Checking Accounts', href: '#' },
            { label: 'Savings Accounts', href: '#' },
            { label: 'Credit Cards', href: '#' },
            { label: 'Loans', href: '#' },
            { label: 'Investments', href: '#' },
        ],
        'Business Banking': [
            { label: 'Business Checking', href: '#' },
            { label: 'Business Savings', href: '#' },
            { label: 'Business Credit Cards', href: '#' },
            { label: 'Business Loans', href: '#' },
            { label: 'Merchant Services', href: '#' },
        ],
        'Support': [
            { label: 'Contact Us', href: '#' },
            { label: 'FAQs', href: '#' },
            { label: 'Security Center', href: '#' },
            { label: 'Accessibility', href: '#' },
            { label: 'Branch Locator', href: '#' },
        ],
        'Legal': [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
            { label: 'Legal Notices', href: '#' },
        ],
    };
    const socialLinks = [
        { name: 'Facebook', href: '#', icon: (_jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" }) })) },
        { name: 'Twitter', href: '#', icon: (_jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" }) })) },
        { name: 'LinkedIn', href: '#', icon: (_jsxs("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" }), _jsx("rect", { x: "2", y: "9", width: "4", height: "12" }), _jsx("circle", { cx: "4", cy: "4", r: "2" })] })) },
        { name: 'Instagram', href: '#', icon: (_jsxs("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: [_jsx("rect", { x: "2", y: "2", width: "20", height: "20", rx: "5", ry: "5" }), _jsx("path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }), _jsx("circle", { cx: "17.5", cy: "6.5", r: ".5" })] })) },
    ];
    return (_jsx("footer", { className: "bg-gray-50 border-t border-gray-200", role: "contentinfo", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8", children: Object.entries(footerLinks).map(([category, links]) => (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4", children: category }), _jsx("ul", { className: "space-y-3", role: "list", children: links.map((link) => (_jsx("li", { children: _jsx(Link, { to: link.href, className: "text-sm text-gray-600 hover:text-chase-600 transition-colors", children: link.label }) }, link.label))) })] }, category))) }), _jsx("div", { className: "mt-12 pt-8 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("svg", { className: "w-8 h-8 text-chase-600", viewBox: "0 0 32 32", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { width: "32", height: "32", rx: "8", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: "Chase" })] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\u00A9 ", currentYear, " Chase Bank. All rights reserved."] }), _jsx("div", { className: "flex items-center gap-6", children: socialLinks.map((social) => (_jsx("a", { href: social.href, className: "text-gray-400 hover:text-gray-600 transition-colors", "aria-label": social.name, target: "_blank", rel: "noopener noreferrer", children: social.icon }, social.name))) })] }) })] }) }));
};
