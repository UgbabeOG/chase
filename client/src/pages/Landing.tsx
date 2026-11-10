import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Smartphone, CreditCard, Users, Lock, Globe, Building2, Award, TrendingUp, ChevronRight, Check } from 'lucide-react';
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

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-chase-50 to-white">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <img 
            src="/images/banner-img-paragon-cs-1440px.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 mb-8" aria-label="Chase Bank Home">
              <svg className="w-12 h-12 text-chase-600" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#002147" />
                <path d="M16 6L24 14H8L16 6Z" fill="#FFFFFF" />
                <path d="M16 18L8 26H24L16 18Z" fill="#FFFFFF" opacity="0.6" />
              </svg>
              <span className="text-3xl font-bold text-gray-900">Chase</span>
            </Link>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Banking that{' '}
              <span className="chase-gradient gradient-text">works for you</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              From everyday banking to long-term wealth building, Chase provides the tools, expertise, and security
              to help you achieve your financial goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={ROUTES.LOGIN}
                className="btn-primary btn-lg w-full sm:w-auto px-8 py-3.5"
              >
                Sign In
              </Link>
              <Link
                to="#open-account"
                className="btn-secondary btn-lg w-full sm:w-auto px-8 py-3.5"
              >
                Open an Account
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="py-6 relative">
                <div className="text-3xl sm:text-4xl font-bold text-chase-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                {index < 3 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-chase-200 to-transparent" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section - Commercial Banking Focus */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-chase-50 text-chase-700 text-sm font-medium mb-4">
              Commercial Banking Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Expertise that scales with your business
            </h2>
            <p className="text-lg text-gray-600">
              Tailored financial solutions for middle-market companies, large corporations, and institutions
            </p>
          </div>

          <div className="space-y-16">
            {solutions.map((solution, index) => (
              <article
                key={index}
                className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="relative w-full lg:w-1/2">
                  <div className="aspect-video bg-chase-50 rounded-2xl overflow-hidden">
                    <img
                      src={solution.image}
                      alt={solution.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <div className="w-14 h-14 rounded-xl bg-chase-50 flex items-center justify-center mb-6 text-chase-600 mx-auto lg:mx-0">
                    <solution.icon className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">{solution.description}</p>
<Link
                      to="#"
                      className="inline-flex items-center gap-2 font-medium text-chase-600 hover:text-chase-700 transition-colors"
                    >
                    Learn more
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="open-account" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Products built for your goals
            </h2>
            <p className="text-lg text-gray-600">
              Choose the right financial tools for every stage of life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <article
                key={index}
                className="card-hover bg-white overflow-hidden transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chase-900/80 via-transparent to-transparent" aria-hidden="true" />
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-chase-50 flex items-center justify-center mb-4 text-chase-600">
                    <product.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 font-medium text-chase-600 hover:text-chase-700 transition-colors"
                  >
                    {product.cta}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Chase Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why choose Chase?
            </h2>
            <p className="text-lg text-gray-600">
              A legacy of stability, innovation, and client-first service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Unmatched Security', desc: 'Multi-layered protection with 24/7 monitoring and zero-liability guarantee' },
              { icon: Building2, title: 'Financial Strength', desc: 'Backed by $4T+ in assets and 200+ years of banking heritage' },
              { icon: Smartphone, title: 'Digital Innovation', desc: 'Industry-leading mobile and online platforms with AI-powered insights' },
              { icon: Users, title: 'Dedicated Support', desc: 'Personal bankers and relationship managers for every client segment' },
            ].map((item, index) => (
              <div key={index} className="card-hover p-8 h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-chase-50 flex items-center justify-center mx-auto mb-6 text-chase-600">
                  <item.icon className="w-8 h-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-chase-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <img 
            src="/images/gecko-thumbnail_1440x810px.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-chase-200 mb-10 max-w-2xl mx-auto">
            Join millions of customers who trust Chase for their banking needs.
            Open an account online in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ROUTES.LOGIN}
              className="btn-primary btn-lg w-full sm:w-auto px-8 py-3.5 bg-white text-chase-600 hover:bg-chase-50"
            >
              Sign In to Your Account
            </Link>
            <a
              href="#"
              className="btn-lg w-full sm:w-auto px-8 py-3.5 border-2 border-white text-white hover:bg-white/10 transition-colors"
            >
              Open New Account
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-chase-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 mb-6" aria-label="Chase Bank Home">
                <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#002147" />
                  <path d="M16 6L24 14H8L16 6Z" fill="#FFFFFF" />
                  <path d="M16 18L8 26H24L16 18Z" fill="#FFFFFF" opacity="0.6" />
                </svg>
                <span className="text-xl font-bold">Chase</span>
              </Link>
              <p className="text-chase-300 text-sm leading-relaxed">
                JPMorgan Chase & Co. is a leading global financial services firm with assets of $4 trillion
                and operations worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Personal Banking</h4>
              <ul className="space-y-3 text-chase-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Checking & Savings</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Credit Cards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mortgages</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Auto Loans</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Business Banking</h4>
              <ul className="space-y-3 text-chase-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Business Checking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Loans</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Merchant Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Commercial Banking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Asset Management</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-chase-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Customer Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Find a Branch</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-chase-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-chase-400 text-sm">
              &copy; {new Date().getFullYear()} JPMorgan Chase & Co. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-chase-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Ad Choices</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};