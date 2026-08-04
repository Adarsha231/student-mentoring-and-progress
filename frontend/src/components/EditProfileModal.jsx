import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Phone, Lock, X, Check, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';

export default function EditProfileModal({ onClose }) {
  const { user, updateUserState } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Password validation if attempting to change password
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setError('Please enter your current password to set a new password.');
        return;
      }
      if (!newPassword) {
        setError('Please enter a new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match!');
        return;
      }
      if (newPassword.length < 4) {
        setError('New password must be at least 4 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name,
        phone,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await authAPI.updateProfile(payload);
      
      // Update global context user state
      if (updateUserState) {
        updateUserState(res.data);
      } else {
        // Fallback reload if needed
        window.location.reload();
      }

      setSuccess('Profile & Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = user?.role === 'STUDENT';
  const isMentor = user?.role === 'MENTOR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-2xl pointer-events-none ${
          isStudent ? 'bg-emerald-500/15' : isMentor ? 'bg-blue-500/15' : 'bg-purple-500/15'
        }`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-dark-border/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isStudent 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : isMentor 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            }`}>
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Edit Profile Settings</h3>
              <p className="text-xs text-slate-400">Update personal information & password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
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

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {isStudent ? 'USN / Student ID' : 'Email Address'}
              </label>
              <input
                type="text"
                value={isStudent ? (user?.roleProfile?.usn || user?.email) : user?.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-dark-border/60 text-slate-400 text-sm cursor-not-allowed font-mono"
              />
            </div>
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
                <label className="block text-[11px] text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3.5 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 bg-dark-surface border border-dark-border text-xs font-semibold hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2 ${
                isStudent
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                  : isMentor
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
