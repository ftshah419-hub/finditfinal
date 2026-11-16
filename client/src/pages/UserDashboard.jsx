import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC]">
      {/* Navigation bar */}
      <nav className="bg-white border-b border-[#DCE4F0] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#101C36] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-[#4D8DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth="2.2" strokeDasharray="3 2" />
                <circle cx="11" cy="11" r="3" fill="#4D8DFF" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 16l4 4" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#101C36]">
              FIND<span className="text-[#2457E8]">IT</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[#101C36]">{user?.name}</div>
              <div className="text-[11px] text-[#64748B]">{user?.email}</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#2457E8] border border-blue-200">
              {user?.role || 'USER'}
            </span>
            <button
              onClick={handleLogout}
              className="py-1.5 px-3.5 bg-white border border-[#DCE4F0] hover:bg-gray-50 text-xs font-medium text-[#101C36] rounded-xl transition-colors cursor-pointer"
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2457E8]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#101C36]">User Authentication Successful</h2>
              <p className="text-xs text-[#64748B]">You are logged in as a verified FINDIT member.</p>
            </div>
          </div>

          <div className="border-t border-[#DCE4F0] pt-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DCE4F0]">
              <div className="text-xs text-[#64748B] uppercase font-semibold">Account Name</div>
              <div className="text-sm font-medium text-[#101C36] mt-1">{user?.name}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DCE4F0]">
              <div className="text-xs text-[#64748B] uppercase font-semibold">Email</div>
              <div className="text-sm font-medium text-[#101C36] mt-1">{user?.email}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DCE4F0]">
              <div className="text-xs text-[#64748B] uppercase font-semibold">Assigned Role</div>
              <div className="text-sm font-medium text-[#2457E8] mt-1">{user?.role}</div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <strong>Module Handoff Note:</strong> This user dashboard shell is reserved for Person 2 (User & Public Website module) to build out item reporting, claims, notifications, and search views.
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
