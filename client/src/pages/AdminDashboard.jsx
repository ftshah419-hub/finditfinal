import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC]">
      {/* Navigation bar */}
      <nav className="bg-[#101C36] text-white px-6 py-4 border-b border-[#2457E8]/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-[#4D8DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth="2.2" strokeDasharray="3 2" />
                <circle cx="11" cy="11" r="3" fill="#4D8DFF" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 16l4 4" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              FIND<span className="text-[#4D8DFF]">IT</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-[#2457E8] rounded-md uppercase tracking-wider text-white">
                Admin Console
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user?.name}</div>
              <div className="text-[11px] text-[#DCE4F0]">{user?.email}</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200 border border-purple-400/30">
              {user?.role || 'ADMIN'}
            </span>
            <button
              onClick={handleLogout}
              className="py-1.5 px-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white rounded-xl transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main content placeholder */}
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="bg-white rounded-2xl border border-[#DCE4F0] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#101C36]">Admin Authorization Verified</h2>
              <p className="text-xs text-[#64748B]">You have verified administrator privileges on FINDIT.</p>
            </div>
          </div>

          <div className="border-t border-[#DCE4F0] pt-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DCE4F0]">
              <div className="text-xs text-[#64748B] uppercase font-semibold">Administrator</div>
              <div className="text-sm font-medium text-[#101C36] mt-1">{user?.name}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DCE4F0]">
              <div className="text-xs text-[#64748B] uppercase font-semibold">Admin Email</div>
              <div className="text-sm font-medium text-[#101C36] mt-1">{user?.email}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DCE4F0]">
              <div className="text-xs text-[#64748B] uppercase font-semibold">Authorization</div>
              <div className="text-sm font-medium text-purple-700 mt-1">Full Administrative Access</div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
            <strong>Module Handoff Note:</strong> This admin dashboard shell is reserved for Person 3 (Admin module) to build out item moderation, claim approval, category management, and audit logs.
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
