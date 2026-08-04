import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Shield, UserCheck, BookOpen, ArrowRight, Sparkles, CheckCircle2, User, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('ADMIN'); // 'ADMIN' | 'MENTOR' | 'STUDENT'

  const [ripples, setRipples] = useState([]);
  const [fieldFlash, setFieldFlash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin-dashboard');
      else if (user.role === 'MENTOR') navigate('/mentor-dashboard');
      else if (user.role === 'STUDENT') navigate('/student-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleKey, e) => {
    setActiveRole(roleKey);
    setEmail('');
    setPassword('');

    // Create ripple effect at click coordinates
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x, y, roleKey }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    // Trigger input highlight flash effect
    setFieldFlash(true);
    setTimeout(() => setFieldFlash(false), 500);
  };

  // Theme settings per role
  const roleThemes = {
    STUDENT: {
      name: 'Student',
      label: 'Student Portal',
      bgGlow: 'bg-emerald-600/15 shadow-emerald-500/20',
      cardBorder: 'border-emerald-500/30 shadow-emerald-950/30',
      activeTab: 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20 scale-[1.03]',
      inactiveTab: 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 hover:border-slate-600',
      btnGradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/30',
      accentText: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rippleBg: 'bg-emerald-400/40',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    },
    MENTOR: {
      name: 'Mentor',
      label: 'Mentor Portal',
      bgGlow: 'bg-blue-600/15 shadow-blue-500/20',
      cardBorder: 'border-blue-500/30 shadow-blue-950/30',
      activeTab: 'bg-blue-500/20 border-blue-500/80 text-blue-300 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20 scale-[1.03]',
      inactiveTab: 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 hover:border-slate-600',
      btnGradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/30',
      accentText: 'text-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      rippleBg: 'bg-blue-400/40',
      badgeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    },
    ADMIN: {
      name: 'Admin',
      label: 'Administrator Portal',
      bgGlow: 'bg-purple-600/15 shadow-purple-500/20',
      cardBorder: 'border-purple-500/30 shadow-purple-950/30',
      activeTab: 'bg-purple-500/20 border-purple-500/80 text-purple-300 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20 scale-[1.03]',
      inactiveTab: 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 hover:border-slate-600',
      btnGradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-purple-500/30',
      accentText: 'text-purple-400',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      rippleBg: 'bg-purple-400/40',
      badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    },
  };

  const currentTheme = roleThemes[activeRole] || roleThemes.STUDENT;

  const roles = [
    {
      key: 'ADMIN',
      name: 'Admin',
      icon: Shield,
      email: 'admin@mentoring.edu',
    },
    {
      key: 'MENTOR',
      name: 'Mentor',
      icon: UserCheck,
      email: 'mentor1@mentoring.edu',
    },
    {
      key: 'STUDENT',
      name: 'Student',
      icon: BookOpen,
      email: '1MS22CS001',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-700">
      {/* Dynamic Background Glow Orbs */}
      <div
        className={`absolute top-1/4 left-1/4 w-96 h-96 ${currentTheme.bgGlow} rounded-full blur-3xl pointer-events-none transition-all duration-700`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${currentTheme.bgGlow} rounded-full blur-3xl pointer-events-none transition-all duration-700`}
      />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-blue-500/20 transform transition-transform duration-300 hover:scale-110">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentoring System</h1>
          <p className={`text-xs uppercase font-bold tracking-widest ${currentTheme.accentText} mt-1 transition-colors duration-500`}>
            Student Mentoring & Progress Tracking System
          </p>
        </div>

        {/* Login Form Card */}
        <div className={`glass-panel rounded-2xl p-6 md:p-8 border ${currentTheme.cardBorder} shadow-2xl transition-all duration-500 relative overflow-hidden`}>
          {/* Header & Selected Role Badge */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Sign in to your account</h2>
              <p className="text-xs text-slate-400">Select your portal role and enter your credentials</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${currentTheme.badgeBg} flex items-center gap-1 transition-all duration-300 animate-pulse-subtle`}>
              <Sparkles className="w-3 h-3" />
              {currentTheme.name}
            </span>
          </div>

          {/* Interactive Role Selection Cards with Click Ripple Effect */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Select Role:
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Click to change theme & preset</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = activeRole === r.key;
                const theme = roleThemes[r.key];

                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={(e) => handleRoleSelect(r.key, e)}
                    className={`relative overflow-hidden p-3 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-center group active:scale-95 ${
                      isSelected ? theme.activeTab : theme.inactiveTab
                    }`}
                  >
                    {/* Active Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 text-emerald-400 animate-in fade-in zoom-in duration-200">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${theme.accentText}`} />
                      </div>
                    )}

                    {/* Click Ripple Elements */}
                    {ripples
                      .filter((rp) => rp.roleKey === r.key)
                      .map((rp) => (
                        <span
                          key={rp.id}
                          style={{ left: rp.x, top: rp.y }}
                          className={`role-ripple-effect ${theme.rippleBg}`}
                        />
                      ))}

                    <div className={`p-2 rounded-lg mb-1.5 transition-transform duration-300 group-hover:scale-110 ${
                      isSelected ? 'bg-white/10 text-white shadow-inner' : 'bg-slate-800/80 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <span className="text-xs font-bold tracking-tight block">{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium mb-4 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400" />
                Email Address or Student USN
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className={`w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 transition-all uppercase ${
                  fieldFlash ? 'animate-field-pulse border-blue-400 ring-2 ring-blue-400/30' : ''
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className={`w-full pl-4 pr-11 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 transition-all ${
                    fieldFlash ? 'animate-field-pulse border-blue-400 ring-2 ring-blue-400/30' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-lg focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl ${currentTheme.btnGradient} text-white font-semibold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98] mt-2`}
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${currentTheme.name}`}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Role Status Note */}
          <div className="mt-6 pt-4 border-t border-dark-border/60 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <span>Selected mode:</span>
              <span className={`font-semibold ${currentTheme.accentText}`}>{currentTheme.label}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
