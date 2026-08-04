import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Phone, Lock, X, Check, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';

export default function EditProfileModal({ onClose }) {
  const { user, updateUserState } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isStudent = user?.role === 'STUDENT';

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 4) {
        setError('New password must be at least 4 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        phone,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await authAPI.updateProfile(payload);
      
      if (updateUserState) {
        updateUserState({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone
        });
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header Orb */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-dark-border/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Account Settings</h3>
              <p className="text-xs text-slate-400">Update your profile & password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-surface transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Section 1: Profile Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Gmail Address (For Session Notifications)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
              required
            />
            <p className="text-[11px] text-blue-400 mt-1">
              📩 Mentor session notifications will be dispatched to this Gmail address.
            </p>
          </div>

          {/* Divider */}
          <div className="pt-2 border-t border-dark-border/60">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Change Password</span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">(leave blank to keep current)</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-dark-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 bg-dark-surface border border-dark-border font-semibold text-xs hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
