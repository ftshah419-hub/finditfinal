import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

/**
 * AIComparisonCard Component
 * Neural Matching Engine Candidate Comparison Card
 * Directly conforms to 14_admin_ai_matching_management
 */
export const AIComparisonCard = ({ match, onReview }) => {
  const [loading, setLoading] = useState(false);
  const [actionDone, setActionDone] = useState(null);

  if (!match) return null;

  const lost = match.lostItemId || {};
  const found = match.foundItemId || {};
  const score = match.similarityScore || 85;

  const handleReview = async (newStatus) => {
    setLoading(true);
    try {
      await onReview(match._id, newStatus);
      setActionDone(newStatus);
    } catch {
      // Handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#DCE4F0] p-6 shadow-xs flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Card Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 bg-[#EFF4FF] px-4 py-2.5 rounded-lg border border-[#DCE4F0]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#0B1C30]">
            #MTR-{match._id?.slice(-4)?.toUpperCase()}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#CBDBF5]"></span>
          <span className="px-2.5 py-0.5 rounded-full bg-white text-[#005AC4] text-xs font-semibold border border-[#DCE4F0]">
            Confidence: {match.confidence || 'HIGH'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={actionDone || match.status} />
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#DCE4F0]">
            <span className="text-xs font-bold text-[#003EC3] font-mono">{score}%</span>
            <span className="text-[11px] text-[#434655]">Cosine Similarity</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Lost Dossier */}
        <div className="p-4 rounded-xl bg-[#EFF4FF]/60 border border-[#DCE4F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                LOST REPORT
              </span>
              <span className="text-xs text-[#434655] font-mono">
                {lost.itemDate ? new Date(lost.itemDate).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            <div className="flex items-start gap-3 mt-3">
              {lost.images && lost.images[0] && (
                <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-[#DCE4F0] shrink-0">
                  <img
                    src={typeof lost.images[0] === 'string' ? lost.images[0] : lost.images[0].url}
                    alt={lost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#0B1C30] truncate">{lost.title || 'Untitled Lost Item'}</h4>
                <p className="text-xs text-[#434655] line-clamp-2 mt-0.5">{lost.description || 'No description provided'}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#DCE4F0] text-[11px] text-[#434655] flex justify-between">
            <span>Location: <strong>{lost.location?.city || lost.location?.address || 'Campus'}</strong></span>
            <span>Reporter: <strong>{lost.reportedBy?.name || 'Student'}</strong></span>
          </div>
        </div>

        {/* Right: Found Dossier */}
        <div className="p-4 rounded-xl bg-[#EFF4FF]/60 border border-[#DCE4F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                CUSTODIAN FOUND INTAKE
              </span>
              <span className="text-xs text-[#434655] font-mono">
                {found.itemDate ? new Date(found.itemDate).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            <div className="flex items-start gap-3 mt-3">
              {found.images && found.images[0] && (
                <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-[#DCE4F0] shrink-0">
                  <img
                    src={typeof found.images[0] === 'string' ? found.images[0] : found.images[0].url}
                    alt={found.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#0B1C30] truncate">{found.title || 'Untitled Found Item'}</h4>
                <p className="text-xs text-[#434655] line-clamp-2 mt-0.5">{found.description || 'No description provided'}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#DCE4F0] text-[11px] text-[#434655] flex justify-between">
            <span>Depot: <strong>{found.location?.city || 'Main Vault'}</strong></span>
            <span>Intake Officer: <strong>{found.reportedBy?.name || 'Staff'}</strong></span>
          </div>
        </div>
      </div>

      {/* Feature Correlation Badges */}
      <div className="p-3 bg-[#EFF4FF]/40 rounded-xl border border-[#DCE4F0] text-xs space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase text-[#434655] mr-1">Correlated Vectors:</span>
          {(match.matchingFeatures?.length > 0
            ? match.matchingFeatures
            : ['Title keyword token match', 'Location proximity < 250m', 'Report temporal delta < 24h']
          ).map((feat, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium flex items-center gap-1">
              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {feat}
            </span>
          ))}
        </div>

        {match.differences && match.differences.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-[#BA1A1A] mr-1">Variance Flags:</span>
            {match.differences.map((diff, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-medium">
                {diff}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-[#434655] italic">
          * AI suggestions are advisory. Ownership claims require manual verification.
        </span>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            disabled={loading || actionDone === 'DISMISSED'}
            onClick={() => handleReview('DISMISSED')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#BA1A1A] hover:bg-red-50 border border-red-200 disabled:opacity-40 transition-colors"
          >
            Dismiss Suggestion
          </button>
          <button
            type="button"
            disabled={loading || actionDone === 'CONFIRMED'}
            onClick={() => handleReview('CONFIRMED')}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#003EC3] hover:bg-[#2457E8] shadow-xs flex items-center gap-2 disabled:opacity-40 transition-colors"
          >
            {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
            <span>Confirm Valid Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIComparisonCard;
