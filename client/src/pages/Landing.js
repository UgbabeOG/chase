import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Smartphone, CreditCard, Users, Lock, Globe, Building2, Award, TrendingUp, ChevronRight } from 'lucide-react';
import { ROUTES } from '../utils/constants';
const features = [
    {
        icon: Shield,
        title: 'Advanced Security',
        description: 'Bank-grade encryption, two-factor authentication, and real-time fraud monitoring protect your accounts 24/7.',
    },
    {
        icon: Smartphone,
        title: 'Mobile Banking',
        description: 'Manage your finances anywhere with our award-winning mobile app. Deposit checks, pay bills, and track spending on the go.',
    },
    {
        icon: CreditCard,
        title: 'Credit Cards',
        description: 'Earn rewards on every purchase with our suite of credit cards. Cash back, travel points, and premium benefits.',
    },
    {
        icon: Users,
        title: 'Customer Support',
        description: '24/7 dedicated support via phone, chat, or secure messaging. We\'re here when you need us.',
    },
    {
        icon: Lock,
        title: 'Identity Protection',
        description: 'Comprehensive identity theft protection with credit monitoring, alerts, and restoration services.',
    },
    {
        icon: Globe,
        title: 'Global Access',
        description: 'Access your accounts from anywhere in the world with our international banking network and fee-free ATMs.',
    },
];
const stats = [
    { value: '80M+', label: 'Active Customers' },
    { value: '$4T+', label: 'Assets Under Management' },
    { value: '4,700+', label: 'Branches Nationwide' },
    { value: '16,000+', label: 'Fee-Free ATMs' },
];
const products = [
    {
        icon: Building2,
        title: 'Checking Accounts',
        description: 'Everyday banking with no monthly fees, direct deposit, and instant transfers.',
        cta: 'Open Account',
        image: '/images/banner-img-paragon-cs-1440px.jpg',
    },
    {
        icon: Award,
        title: 'Savings Accounts',
        description: 'Competitive APY with automatic savings tools and no minimum balance.',
        cta: 'Start Saving',
        image: '/images/cb-banner-img-stay-connected-800x800px-square.jpg',
    },
    {
        icon: TrendingUp,
        title: 'Investments',
        description: 'Self-directed and managed portfolios with commission-free trades.',
        cta: 'Invest Now',
        image: '/images/guide-to-alternative-investments-what-they-are-and-how-they-work-jpma-hero.jpg',
    },
    {
        icon: CreditCard,
        title: 'Credit Cards',
        description: 'Earn cash back, travel rewards, or premium perks on every purchase.',
        cta: 'Compare Cards',
        image: '/images/banner-on-lok-1440x810px.jpg',
    },
    {
        icon: Smartphone,
        title: 'Mobile App',
        description: 'Bank on the go with mobile deposit, bill pay, and spending insights.',
        cta: 'Download',
        image: '/images/cb-banner-img-connect-lp-800px-square.jpg',
    },
    {
        icon: Users,
        title: 'Small Business',
        description: 'Business checking, lending, and merchant services to help you grow.',
        cta: 'Learn More',
        image: '/images/cb-img-quick-links-cb-lp-490x870px-vertical.jpg',
    },
];
const solutions = [
    {
        title: 'Cash Flow Management',
        description: 'Optimize working capital with integrated receivables, payables, and liquidity solutions.',
        icon: TrendingUp,
        image: '/images/banner-img-paragon-cs-1440px.jpg',
    },
    {
        title: 'Global Trade & Receivables',
        description: 'Navigate international markets with letters of credit, documentary collections, and trade financing.',
        icon: Globe,
        image: '/images/cb-img-quick-links-cb-lp-490x870px-vertical.jpg',
    },
    {
        title: 'Digital Banking Platform',
        description: 'Unified dashboard for payments, reporting, and account management across all your entities.',
        icon: Smartphone,
        image: '/images/cb-banner-img-connect-lp-800px-square.jpg',
    },
    {
        title: 'Strategic Advisory',
        description: 'Dedicated relationship managers and industry specialists for capital markets and M&A guidance.',
        icon: Users,
        image: '/images/banner-on-lok-1440x810px.jpg',
    },
];
export const Landing = () => {
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("section", { className: "relative overflow-hidden bg-gradient-to-b from-chase-50 to-white", children: [_jsx("div", { className: "absolute inset-0 opacity-10", "aria-hidden": "true", children: _jsx("img", { src: "/images/banner-img-paragon-cs-1440px.jpg", alt: "", className: "w-full h-full object-cover" }) }), _jsx("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32", children: _jsxs("div", { className: "text-center max-w-3xl mx-auto", children: [_jsxs(Link, { to: ROUTES.LOGIN, className: "inline-flex items-center gap-2 mb-8", "aria-label": "Chase Bank Home", children: [_jsxs("svg", { className: "w-12 h-12 text-chase-600", viewBox: "0 0 32 32", fill: "none", children: [_jsx("rect", { width: "32", height: "32", rx: "8", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: "Chase" })] }), _jsxs("h1", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6", children: ["Banking that", ' ', _jsx("span", { className: "chase-gradient gradient-text", children: "works for you" })] }), _jsx("p", { className: "text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed", children: "From everyday banking to long-term wealth building, Chase provides the tools, expertise, and security to help you achieve your financial goals." }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [_jsx(Link, { to: ROUTES.LOGIN, className: "btn-primary btn-lg w-full sm:w-auto px-8 py-3.5", children: "Sign In" }), _jsx(Link, { to: "#open-account", className: "btn-secondary btn-lg w-full sm:w-auto px-8 py-3.5", children: "Open an Account" })] })] }) }), _jsx("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20", children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 text-center", children: stats.map((stat, index) => (_jsxs("div", { className: "py-6 relative", children: [_jsx("div", { className: "text-3xl sm:text-4xl font-bold text-chase-900 mb-1", children: stat.value }), _jsx("div", { className: "text-sm text-gray-600", children: stat.label }), index < 3 && (_jsx("div", { className: "absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-chase-200 to-transparent", "aria-hidden": "true" }))] }, index))) }) })] }), _jsx("section", { className: "py-20 sm:py-28 bg-white", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center max-w-2xl mx-auto mb-16", children: [_jsx("span", { className: "inline-block px-4 py-1.5 rounded-full bg-chase-50 text-chase-700 text-sm font-medium mb-4", children: "Commercial Banking Solutions" }), _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 mb-4", children: "Expertise that scales with your business" }), _jsx("p", { className: "text-lg text-gray-600", children: "Tailored financial solutions for middle-market companies, large corporations, and institutions" })] }), _jsx("div", { className: "space-y-16", children: solutions.map((solution, index) => (_jsxs("article", { className: `flex flex-col lg:flex-row gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`, children: [_jsx("div", { className: "relative w-full lg:w-1/2", children: _jsx("div", { className: "aspect-video bg-chase-50 rounded-2xl overflow-hidden", children: _jsx("img", { src: solution.image, alt: solution.title, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500", loading: "lazy" }) }) }), _jsxs("div", { className: "w-full lg:w-1/2 text-center lg:text-left", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-chase-50 flex items-center justify-center mb-6 text-chase-600 mx-auto lg:mx-0", children: _jsx(solution.icon, { className: "w-7 h-7", "aria-hidden": "true" }) }), _jsx("h3", { className: "text-2xl sm:text-3xl font-bold text-gray-900 mb-4", children: solution.title }), _jsx("p", { className: "text-gray-600 mb-6 leading-relaxed text-lg", children: solution.description }), _jsxs(Link, { to: "#", className: "inline-flex items-center gap-2 font-medium text-chase-600 hover:text-chase-700 transition-colors", children: ["Learn more", _jsx(ChevronRight, { className: "w-4 h-4" })] })] })] }, index))) })] }) }), _jsx("section", { id: "open-account", className: "py-20 sm:py-28 bg-gray-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center max-w-2xl mx-auto mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 mb-4", children: "Products built for your goals" }), _jsx("p", { className: "text-lg text-gray-600", children: "Choose the right financial tools for every stage of life" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: products.map((product, index) => (_jsxs("article", { className: "card-hover bg-white overflow-hidden transition-all duration-300", children: [_jsxs("div", { className: "aspect-video relative overflow-hidden", children: [_jsx("img", { src: product.image, alt: product.title, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-chase-900/80 via-transparent to-transparent", "aria-hidden": "true" })] }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-chase-50 flex items-center justify-center mb-4 text-chase-600", children: _jsx(product.icon, { className: "w-6 h-6", "aria-hidden": "true" }) }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: product.title }), _jsx("p", { className: "text-gray-600 mb-4 leading-relaxed", children: product.description }), _jsxs("a", { href: "#", className: "inline-flex items-center gap-2 font-medium text-chase-600 hover:text-chase-700 transition-colors", children: [product.cta, _jsx(ArrowRight, { className: "w-4 h-4" })] })] })] }, index))) })] }) }), _jsx("section", { className: "py-20 sm:py-28 bg-white", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center max-w-2xl mx-auto mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-gray-900 mb-4", children: "Why choose Chase?" }), _jsx("p", { className: "text-lg text-gray-600", children: "A legacy of stability, innovation, and client-first service" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: [
                                { icon: Shield, title: 'Unmatched Security', desc: 'Multi-layered protection with 24/7 monitoring and zero-liability guarantee' },
                                { icon: Building2, title: 'Financial Strength', desc: 'Backed by $4T+ in assets and 200+ years of banking heritage' },
                                { icon: Smartphone, title: 'Digital Innovation', desc: 'Industry-leading mobile and online platforms with AI-powered insights' },
                                { icon: Users, title: 'Dedicated Support', desc: 'Personal bankers and relationship managers for every client segment' },
                            ].map((item, index) => (_jsxs("div", { className: "card-hover p-8 h-full text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-chase-50 flex items-center justify-center mx-auto mb-6 text-chase-600", children: _jsx(item.icon, { className: "w-8 h-8", "aria-hidden": "true" }) }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-3", children: item.title }), _jsx("p", { className: "text-gray-600 leading-relaxed", children: item.desc })] }, index))) })] }) }), _jsxs("section", { className: "py-20 sm:py-28 bg-chase-900 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 opacity-5", "aria-hidden": "true", children: _jsx("img", { src: "/images/gecko-thumbnail_1440x810px.jpg", alt: "", className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-white mb-6", children: "Ready to get started?" }), _jsx("p", { className: "text-lg text-chase-200 mb-10 max-w-2xl mx-auto", children: "Join millions of customers who trust Chase for their banking needs. Open an account online in minutes." }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [_jsx(Link, { to: ROUTES.LOGIN, className: "btn-primary btn-lg w-full sm:w-auto px-8 py-3.5 bg-white text-chase-600 hover:bg-chase-50", children: "Sign In to Your Account" }), _jsx("a", { href: "#", className: "btn-lg w-full sm:w-auto px-8 py-3.5 border-2 border-white text-white hover:bg-white/10 transition-colors", children: "Open New Account" })] })] })] }), _jsx("footer", { className: "bg-chase-950 text-white py-16", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-12 mb-12", children: [_jsxs("div", { children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 mb-6", "aria-label": "Chase Bank Home", children: [_jsxs("svg", { className: "w-10 h-10", viewBox: "0 0 32 32", fill: "none", children: [_jsx("rect", { width: "32", height: "32", rx: "8", fill: "#002147" }), _jsx("path", { d: "M16 6L24 14H8L16 6Z", fill: "#FFFFFF" }), _jsx("path", { d: "M16 18L8 26H24L16 18Z", fill: "#FFFFFF", opacity: "0.6" })] }), _jsx("span", { className: "text-xl font-bold", children: "Chase" })] }), _jsx("p", { className: "text-chase-300 text-sm leading-relaxed", children: "JPMorgan Chase & Co. is a leading global financial services firm with assets of $4 trillion and operations worldwide." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-4", children: "Personal Banking" }), _jsxs("ul", { className: "space-y-3 text-chase-300 text-sm", children: [_jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Checking & Savings" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Credit Cards" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Mortgages" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Auto Loans" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Investing" }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-4", children: "Business Banking" }), _jsxs("ul", { className: "space-y-3 text-chase-300 text-sm", children: [_jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Business Checking" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Business Loans" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Merchant Services" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Commercial Banking" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Asset Management" }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-4", children: "Support" }), _jsxs("ul", { className: "space-y-3 text-chase-300 text-sm", children: [_jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Customer Service" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Find a Branch" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Security Center" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Accessibility" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Contact Us" }) })] })] })] }), _jsxs("div", { className: "border-t border-chase-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4", children: [_jsxs("p", { className: "text-chase-400 text-sm", children: ["\u00A9 ", new Date().getFullYear(), " JPMorgan Chase & Co. All rights reserved."] }), _jsxs("div", { className: "flex items-center gap-6 text-chase-400 text-sm", children: [_jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Privacy Policy" }), _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Terms of Service" }), _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Cookie Policy" }), _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Ad Choices" })] })] })] }) })] }));
};
