import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, KeyRound, User, Star } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const roleConfigs = {
    ADMIN: { label: 'Admin', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' },
    STORE_OWNER: { label: 'Store Owner', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
    NORMAL_USER: { label: 'Customer', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  };

  const roleInfo = roleConfigs[user?.role] || {
    label: user?.role,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Star size={20} className="fill-amber-300 text-amber-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  TrustPulse
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Reviews
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-normal -mt-0.5">
                Verified Local Store Ratings
              </p>
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                <User size={13} />
              </div>
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                {user?.name}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleInfo.badgeClass}`}>
                {roleInfo.label}
              </span>
            </div>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              <KeyRound size={13} className="text-slate-500" />
              <span className="hidden md:inline">Change Password</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 border border-red-200/60 rounded-lg transition-colors"
            >
              <LogOut size={13} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}
