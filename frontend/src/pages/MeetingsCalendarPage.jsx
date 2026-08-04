import React, { useState, useEffect } from 'react';
import { meetingAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ScheduleModal from '../components/ScheduleModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

export default function MeetingsCalendarPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchMeetings = async () => {
    try {
      const res = await meetingAPI.getMeetings();
      setMeetings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await meetingAPI.updateStatus(id, status);
      fetchMeetings();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMeetings = meetings.filter(m => {
    if (filterStatus === 'ALL') return true;
    return m.status === filterStatus;
  });

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Mentoring Session Scheduler & History" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-dark-border">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <span>Mentoring Schedule ({meetings.length} Total Sessions)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage offline cabin meetings, Google Meet & Microsoft Teams sessions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="Upcoming">Upcoming Only</option>
                <option value="Completed">Completed</option>
                <option value="Missed">Missed</option>
              </select>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Session</span>
              </button>
            </div>
          </div>

          {/* Meetings List */}
          {loading ? (
            <LoadingSkeleton count={4} />
          ) : filteredMeetings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No mentoring sessions found for this status.</div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((m) => (
                <div
                  key={m._id}
                  className="glass-card rounded-2xl p-5 border border-dark-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white text-base">{m.title}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        m.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {m.date} at {m.time} ({m.durationMinutes} mins)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        {m.mode === 'Offline' ? <MapPin className="w-3.5 h-3.5 text-amber-400" /> : <Video className="w-3.5 h-3.5 text-emerald-400" />}
                        {m.mode}
                      </span>
                      {m.meetingLink && (
                        <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono text-[11px]">
                          Join Link
                        </a>
                      )}
                    </div>

                    {m.agenda && (
                      <p className="text-xs text-slate-300 pt-1 font-sans">
                        <strong className="text-slate-400">Agenda:</strong> {m.agenda}
                      </p>
                    )}
                  </div>

                  {m.status === 'Upcoming' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(m._id, 'Completed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(m._id, 'Cancelled')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 text-xs font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={fetchMeetings}
        />
      )}
    </div>
  );
}
