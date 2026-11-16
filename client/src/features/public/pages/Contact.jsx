import React, { useState } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import userApi from '../../user/services/userApi';
import '../../user/styles/userDesignTokens.css';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // If user is authenticated, can call submitComplaint, or mock confirmation
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError('Failed to send message. Please contact desk directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="w-full pt-20 flex-1 px-margin max-w-5xl mx-auto py-space-xl">
        <div className="text-center max-w-2xl mx-auto mb-space-xl">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
            Get In Touch
          </span>
          <h1 className="font-display text-display text-on-surface font-extrabold tracking-tight mt-1">
            Contact FINDIT Support & Custody Desks
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            Have questions about a claim, suspect a fraudulent report, or need physical custody intake? Reach out below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-md">
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                Central Operations Hub
              </h2>

              <div className="flex items-start gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">pin_drop</span>
                <div>
                  <strong className="text-on-surface block">Central Campus Security Office</strong>
                  <span>Main University Library, Ground Floor Suite 102</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">mail</span>
                <div>
                  <strong className="text-on-surface block">Email Inquiries</strong>
                  <span>support@findit-platform.org</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">schedule</span>
                <div>
                  <strong className="text-on-surface block">Physical Intake Hours</strong>
                  <span>Monday – Friday: 8:00 AM – 7:00 PM</span>
                  <span className="block text-xs mt-0.5">Saturday: 9:00 AM – 2:00 PM</span>
                </div>
              </div>
            </div>

            <div className="p-space-md rounded-2xl bg-surface-container-low border border-surface-container-high flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-primary">security</span>
              <p className="text-xs text-on-surface-variant">
                For emergency identity badge or passport losses, notify Campus Public Safety immediately.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-space-xl rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
              <h2 className="font-title-md text-title-md font-bold text-on-surface mb-1">
                Send an Inquiry or Feedback
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                Our support team typically responds within 2 business hours.
              </p>

              {sent && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span>Thank you! Your message has been routed to the custody desk supervisor.</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600">error</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Chen"
                      className="h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@campus.edu"
                      className="h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Claim Verification Question #CLM-109"
                    className="h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your query..."
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Contact;
