import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import '../../user/styles/userDesignTokens.css';

export const About = () => {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="w-full pt-20 flex-1 px-margin max-w-5xl mx-auto py-space-xl">
        {/* Header */}
        <div className="mb-space-xl text-center max-w-3xl mx-auto">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
            About The Platform
          </span>
          <h1 className="font-display text-display text-on-surface font-extrabold tracking-tight mt-1">
            Engineered for Campus Recovery & Institutional Trust
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 leading-relaxed">
            FINDIT bridges the gap between chaotic lost property reports and fragmented security desks, providing an intelligent, anonymized, and auditable retrieval infrastructure.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-space-xl">
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[22px]">troubleshoot</span>
            </div>
            <h2 className="font-title-md text-title-md font-bold text-on-surface">The Problem We Solve</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Traditional lost-and-found operations across universities and transit terminals rely on physical bulletin boards, scattered spreadsheets, or informal social media posts. This causes high friction, security risks, duplicate claims, and unclaimed property pile-ups.
            </p>
          </div>

          <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[22px]">lock_reset</span>
            </div>
            <h2 className="font-title-md text-title-md font-bold text-on-surface">Anonymized Protection</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              We separate public discovery from personal claimant identification. Item listings showcase essential descriptive cues while keeping serial numbers, contact info, and internal custodian notes strictly encrypted and confidential.
            </p>
          </div>
        </div>

        {/* System Architecture Section */}
        <div className="p-space-xl rounded-2xl bg-surface-container-low border border-surface-container-high mb-space-xl flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Core Technology & Standards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-2">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
              <h3 className="font-label-lg font-bold text-primary">Neural Match Radar</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Multi-factor cosine similarity ranking combining category taxonomies, keyword tokens, and geo-temporal proximity.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
              <h3 className="font-label-lg font-bold text-secondary">Physical Custody Logs</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Every turned-in property item receives an immutable custody docket verified across 4 campus depot reception points.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
              <h3 className="font-label-lg font-bold text-tertiary">Cryptographic Audit</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                JWT stateless authentication, bcrypt encryption, and role-enforced access preventing unauthorized data disclosure.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default About;
