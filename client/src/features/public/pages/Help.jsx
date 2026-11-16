import React, { useState } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import '../../user/styles/userDesignTokens.css';

export const Help = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How do I report an item I lost on campus?',
      a: 'Sign in to your FINDIT account, navigate to "Report Lost", and fill out the details including item name, category, distinctive markings, last seen location, and date. Uploading clear photos or specifying unique stickers significantly increases your match score.'
    },
    {
      q: 'What should I do if I find someone else’s property?',
      a: 'Log the item using "Report Found" so it appears in the institutional directory, then hand over the physical property to one of the 4 campus security intake desks (Central Library, Engineering Hall, Student Union, or Gym).'
    },
    {
      q: 'How does ownership claim verification work?',
      a: 'When you spot an item in the directory that belongs to you, click "Claim Item" and describe proof that only the real owner would know (such as an engraving, lock-screen wallpaper, or receipt). A campus security custodian inspects the dossier and physical item before issuing a pickup authorization.'
    },
    {
      q: 'Does an AI Match prove that an item is mine?',
      a: 'No. FINDIT AI Smart Match is an algorithmic recommendation tool that calculates visual and textual similarity between reports. It does NOT constitute legal ownership or automatically approve claims.'
    },
    {
      q: 'Can anyone see my personal phone number or email?',
      a: 'No. The FINDIT platform enforces an Anonymization Protocol. Public listings show item descriptions and general discovery zones, but personal contact information is never exposed to public visitors.'
    },
    {
      q: 'What happens if I edit an item report after it has been approved?',
      a: 'Per platform business rules, any material edits (such as changing the title, description, category, or location) on an already approved item will automatically reset its status to PENDING for administrative re-review to prevent deceptive edits.'
    }
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="w-full pt-20 flex-1 px-margin max-w-4xl mx-auto py-space-xl">
        <div className="text-center max-w-2xl mx-auto mb-space-xl">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
            Support Center
          </span>
          <h1 className="font-display text-display text-on-surface font-extrabold tracking-tight mt-1">
            Frequently Asked Questions
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            Everything you need to know about reporting, claiming, and recovering belongings with FINDIT.
          </p>
        </div>

        {/* Accordions */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <span className="font-title-md text-title-md font-bold text-on-surface">
                    {faq.q}
                  </span>
                  <span
                    className={`material-symbols-outlined text-primary text-[22px] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-on-surface-variant leading-relaxed border-t border-surface-container-high/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Help Banner */}
        <div className="mt-space-2xl p-6 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="font-title-md font-bold text-on-surface">Still have questions?</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Our campus security operations desk is available 24/7.
            </p>
          </div>
          <a
            href="/contact"
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-container transition-all"
          >
            Contact Support Desk
          </a>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Help;
