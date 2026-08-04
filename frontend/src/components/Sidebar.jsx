import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from './EditProfileModal';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  BarChart3, 
  LogOut, 
  GraduationCap, 
  Shield, 
  BookOpen,
  Award,
  Bell,
  KeyRound
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const role = user.role;

  return (
    <aside className="w-64 bg-dark-surface border-r border-dark-border flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-dark-border/60 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-base">Mentoring System</h1>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-blue-400">Academic Progress Portal</p>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="px-6 py-3 border-b border-dark-border/40 bg-dark-bg/40 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${role === 'ADMIN' ? 'bg-purple-500' : role === 'MENTOR' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {role === 'ADMIN' ? 'HOD / System Admin' : role === 'MENTOR' ? 'Faculty Mentor' : 'Student Portal'}
          </span>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1">
          {/* Shared / Mentor Routes */}
          {role === 'MENTOR' && (
            <>
              <NavLink
                to="/mentor-dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-dark-card'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Mentor Dashboard</span>
              </NavLink>

              <NavLink
                to="/meetings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-dark-card'
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                <span>Session Scheduler</span>
              </NavLink>

              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-dark-card'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics & Trends</span>
              </NavLink>
            </>
          )}

          {/* Admin Routes */}
          {role === 'ADMIN' && (
            <>
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-purple-600/15 text-purple-400 font-semibold border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-dark-card'
                  }`
                }
              >
                <Shield className="w-4 h-4" />
                <span>HOD Allocation Matrix</span>
              </NavLink>

              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-purple-600/15 text-purple-400 font-semibold border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-dark-card'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4" />
                <span>Institutional Analytics</span>
              </NavLink>
            </>
          )}

          {/* Student Routes */}
          {role === 'STUDENT' && (
            <>
              <NavLink
                to="/student-dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-emerald-600/15 text-emerald-400 font-semibold border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-dark-card'
                  }`
                }
              >
                <BookOpen className="w-4 h-4" />
                <span>Academic Dashboard</span>
              </NavLink>

              <NavLink
                to="/meetings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-emerald-600/15 text-emerald-400 font-semibold border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-dark-card'
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                <span>Mentoring Meetings</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-dark-border/60">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-bg/60 border border-dark-border mb-3">
          <div className="h-9 w-9 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-sm">
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowEditProfile(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
            title="Edit Profile & Password"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </aside>
  );
}
