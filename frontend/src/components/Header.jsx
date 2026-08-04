import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import NotificationDrawer from './NotificationDrawer';
import EditProfileModal from './EditProfileModal';
import { Bell, Sparkles, KeyRound } from 'lucide-react';

export default function Header({ title = 'Dashboard' }) {
  const { user, quickSwitchRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      // quiet catch
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnread();
    }
  }, [user]);

  const handleRoleSwitch = async (email) => {
    setShowRoleMenu(false);
    await quickSwitchRole(email);
  };

  return (
    <header className="h-16 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Persona Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Switch Role Demo</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-dark-card border border-dark-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-dark-border text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Instant Demo Persona Switcher
              </div>
              <button
                onClick={() => handleRoleSwitch('admin@mentoring.edu')}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-purple-500/10 text-xs text-purple-300 font-medium flex items-center justify-between transition-colors"
              >
                <span>Admin View</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20">System Admin</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('mentor1@mentoring.edu')}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-blue-500/10 text-xs text-blue-300 font-medium flex items-center justify-between transition-colors"
              >
                <span>Mentor View (Dr. Rajesh)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20">Faculty</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('1MS22CS001')}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-500/10 text-xs text-emerald-300 font-medium flex items-center justify-between transition-colors"
              >
                <span>Student View (1MS22CS001)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">Mentee (USN)</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => setShowEditProfile(true)}
          className="p-2 rounded-xl bg-dark-card border border-dark-border text-slate-300 hover:text-blue-400 hover:border-blue-500/50 transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Edit Profile & Password"
        >
          <KeyRound className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Profile Settings</span>
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-dark-card border border-dark-border text-slate-300 hover:text-white hover:border-slate-500 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDrawer
              onClose={() => setShowNotifications(false)}
              onRefresh={fetchUnread}
            />
          )}
        </div>
      </div>

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </header>
  );
}
