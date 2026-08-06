import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import NotificationDrawer from './NotificationDrawer';
import { Bell } from 'lucide-react';

export default function Header({ title = 'Dashboard' }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

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

  return (
    <header className="h-16 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
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
    </header>
  );
}
