import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const PublicNavbar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/60">
      <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md max-w-7xl mx-auto">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-space-sm focus:outline-none">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[20px]">explore</span>
          </div>
          <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary">
            FIND<span className="text-secondary-container">IT</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-space-sm">
          <Link
            to="/"
            className="px-space-sm py-1.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            Home
          </Link>
          <Link
            to="/browse"
            className="px-space-sm py-1.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            Browse Registry
          </Link>
          <Link
            to="/about"
            className="px-space-sm py-1.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            About
          </Link>
          <Link
            to="/help"
            className="px-space-sm py-1.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            Help & FAQ
          </Link>
          <Link
            to="/contact"
            className="px-space-sm py-1.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-space-sm">
          {isAuthenticated ? (
            <button
              onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')}
              className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>Go to Dashboard</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-space-md py-2 rounded-lg text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container transition-all"
              >
                <span>Register</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-surface-container-high px-margin py-4 flex flex-col gap-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-on-surface"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-on-surface"
          >
            Browse Registry
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-on-surface"
          >
            About
          </Link>
          <Link
            to="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-on-surface"
          >
            Help & FAQ
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-on-surface"
          >
            Contact
          </Link>
          <div className="border-t border-surface-container-high my-1 pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 rounded-lg text-center text-sm font-medium bg-surface-container text-on-surface"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 rounded-lg text-center text-sm font-semibold bg-primary text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
