import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high py-space-xl px-margin mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-lg">
          {/* Col 1: Brand & Bio */}
          <div className="flex flex-col gap-space-sm md:col-span-1">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs">
                <span className="material-symbols-outlined text-[18px]">explore</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary">
                FIND<span className="text-secondary-container">IT</span>
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Modern lost-and-found management platform engineered for university campuses, municipal transit, and enterprise facilities.
            </p>
          </div>

          {/* Col 2: Directory & Discovery */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
              Registry & Search
            </span>
            <Link to="/browse" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Browse All Items
            </Link>
            <Link to="/login" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Report Lost Property
            </Link>
            <Link to="/login" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Turn In Found Property
            </Link>
          </div>

          {/* Col 3: Platform Information */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
              Organization
            </span>
            <Link to="/about" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              About FINDIT
            </Link>
            <Link to="/help" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Help & FAQ
            </Link>
            <Link to="/contact" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Support & Contact
            </Link>
          </div>

          {/* Col 4: Trust & Verification */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
              Security & Trust
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every found item is indexed in physical custody vaults. Claims are audited against serial numbers and distinctive cosmetic markings.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-1 font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Anonymized Custody Protocol</span>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-surface-container pt-4 text-xs text-on-surface-variant gap-2">
          <span>© {new Date().getFullYear()} FINDIT Platform. All rights reserved.</span>
          <span className="font-code-tabular">Neural Match Engine v4.2 • Built with React & Node</span>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
