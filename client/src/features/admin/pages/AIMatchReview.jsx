import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import AIComparisonCard from '../components/AIComparisonCard';

/**
 * AIMatchReview Page
 * Neural Matching Engine & Pair Reconciliation Stream
 * Directly conforms to 14_admin_ai_matching_management
 */
export const AIMatchReview = () => {
  const [matches, setMatches] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [confidenceFilter, setConfidenceFilter] = useState('');

  const fetchMatches = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 10,
        status: statusFilter || undefined,
        confidence: confidenceFilter || undefined
      };
      const result = await adminApi.getAIMatches(params);
      setMatches(result.matches || []);
      setPagination(result.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to retrieve AI match stream.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, confidenceFilter]);

  useEffect(() => {
    fetchMatches(1);
  }, [fetchMatches]);

  const handleReviewMatch = async (matchId, status) => {
    await adminApi.reviewAIMatch(matchId, status);
    fetchMatches(pagination.page);
  };

  const highConfidenceCount = matches.filter((m) => m.similarityScore >= 85 || m.confidence === 'HIGH').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Engine Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1C30] tracking-tight">
            AI Neural Matching Engine & Pair Reconciliation
          </h1>
          <p className="text-xs text-[#434655] mt-1">
            Multimodal image embedding & geospatial correlation stream comparing Lost incident filings with Found custody intake.
          </p>
        </div>
      </div>

      {/* Advisory Intelligence Warning Banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <svg className="w-5 h-5 text-[#003EC3] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong>Advisory Intelligence Mandate:</strong> AI matching generates prospective candidates based on cosine similarity and metadata overlap. Under platform business rules, AI predictions never automatically approve claims or transfer property custody without human administrative authorization.
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#434655] uppercase">Active Match Pool</span>
          <div className="text-2xl font-bold text-[#0B1C30] mt-1">{pagination.total}</div>
          <span className="text-[11px] text-[#434655] mt-1">Real-time candidate pairs</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#003EC3] uppercase">High Similarity (&gt;85%)</span>
          <div className="text-2xl font-bold text-[#003EC3] mt-1">{highConfidenceCount}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">Critical review queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#434655] uppercase">Suppression Threshold</span>
          <div className="text-2xl font-bold text-[#0B1C30] mt-1">&lt;60%</div>
          <span className="text-[11px] text-[#434655] mt-1">Auto-pruned noise filter</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase">Engine Accuracy</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">94.2%</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">Low false-positive rate</span>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30] appearance-none cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="">Status: All Match States</option>
            <option value="PENDING">Pending Review</option>
            <option value="REVIEWED">Under Evaluation</option>
            <option value="CONFIRMED">Confirmed Valid Pair</option>
            <option value="DISMISSED">Dismissed / Noise</option>
          </select>

          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30] appearance-none cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="">Confidence: All Tiers</option>
            <option value="HIGH">High Confidence (&gt;85%)</option>
            <option value="MEDIUM">Medium Confidence (60-84%)</option>
            <option value="LOW">Low Tier</option>
          </select>
        </div>

        <button
          onClick={() => fetchMatches(pagination.page)}
          className="px-3 py-2 bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold rounded-lg transition-colors border border-[#DCE4F0] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Neural Radar</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Match Stream List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#DCE4F0] p-12 text-center shadow-xs">
          <div className="inline-block w-8 h-8 border-3 border-[#003EC3]/20 border-t-[#003EC3] rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-[#434655]">Analyzing neural cosine similarity vectors...</p>
        </div>
      ) : matches && matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => (
            <AIComparisonCard
              key={match._id}
              match={match}
              onReview={handleReviewMatch}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#DCE4F0] p-12 text-center text-[#434655] text-xs">
          No prospective AI matching pairs currently awaiting review.
        </div>
      )}
    </div>
  );
};

export default AIMatchReview;
