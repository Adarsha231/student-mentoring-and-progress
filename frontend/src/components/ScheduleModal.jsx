import React, { useState } from 'react';
import { meetingAPI } from '../services/api';
import { Calendar as CalendarIcon, Clock, Video, MapPin, X, CheckCircle2 } from 'lucide-react';

export default function ScheduleModal({ student, mentorId, onClose, onSuccess }) {
  const [title, setTitle] = useState(`Mentoring Session - ${student ? student.usn : 'Academic Review'}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [duration, setDuration] = useState('30');
  const [mode, setMode] = useState('Offline');
  const [meetingLink, setMeetingLink] = useState('');
  const [agenda, setAgenda] = useState('Academic progress review, CIE marks analysis, and attendance strategy.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await meetingAPI.scheduleMeeting({
        studentId: student._id,
        mentorId,
        title,
        date,
        time,
        durationMinutes: Number(duration),
        mode,
        meetingLink: mode === 'Offline' ? '' : (meetingLink || 'https://meet.google.com/abc-defg-hij'),
        agenda
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-dark-surface">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Schedule Mentoring Session</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {student && (
            <div className="p-3 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between text-xs">
              <span className="text-slate-400">Student:</span>
              <span className="font-semibold text-white">{student.userId?.name} ({student.usn})</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Meeting Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Offline', 'Google Meet', 'Microsoft Teams'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    mode === m
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-dark-bg border-dark-border text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'Offline' ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  <span>{m}</span>
                </button>
              ))}
            </div>
          </div>

          {mode !== 'Offline' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-400" />
                {mode} Link / Meeting Code (Optional)
              </label>
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder={mode === 'Google Meet' ? 'e.g. https://meet.google.com/abc-defg-hij' : 'Meeting URL'}
                className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                💡 Leave blank to auto-generate a valid {mode} link.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Agenda / Key Topics
            </label>
            <textarea
              rows="3"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="What will be discussed during this session?"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-dark-surface border border-dark-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Scheduling...' : 'Confirm & Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
