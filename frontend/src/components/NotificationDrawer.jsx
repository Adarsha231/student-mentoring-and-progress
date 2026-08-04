import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, CheckCheck, X, AlertTriangle, Calendar, MessageSquare, ShieldAlert } from 'lucide-react';

export default function NotificationDrawer({ onClose, onRefresh }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'HIGH_RISK_ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'MEETING_SCHEDULED':
      case 'MEETING_REMINDER':
      case 'MEETING_REQUESTED':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'FEEDBACK_ADDED':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl bg-dark-card border border-dark-border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-surface">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <h4 className="font-bold text-sm text-white">Notifications</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-dark-border/50">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 transition-colors ${n.read ? 'bg-transparent' : 'bg-blue-950/20'}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-dark-surface border border-dark-border shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
