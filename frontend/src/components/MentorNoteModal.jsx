import React, { useState } from 'react';
import { noteAPI } from '../services/api';
import { FileText, Plus, Trash2, Calendar, CheckCircle2, X } from 'lucide-react';

export default function MentorNoteModal({ student, meetingId, onClose, onSuccess }) {
  const [discussion, setDiscussion] = useState('');
  const [problemsIdentified, setProblemsIdentified] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [meetingStatus, setMeetingStatus] = useState('Completed');
  const [actionItems, setActionItems] = useState([
    { item: 'Submit pending CIE assignment', dueDate: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddActionItem = () => {
    setActionItems([...actionItems, { item: '', dueDate: '' }]);
  };

  const handleRemoveActionItem = (index) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleActionItemChange = (index, field, value) => {
    const updated = [...actionItems];
    updated[index][field] = value;
    setActionItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!discussion.trim()) {
      setError('Please provide discussion notes.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const validActionItems = actionItems
        .filter(a => a.item.trim() !== '')
        .map(a => ({
          item: a.item,
          status: 'Pending',
          dueDate: a.dueDate ? new Date(a.dueDate) : null
        }));

      await noteAPI.createNote({
        meetingId: meetingId || null,
        studentId: student._id,
        discussion,
        problemsIdentified,
        recommendations,
        actionItems: validActionItems,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        meetingStatus
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save mentor notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-dark-surface shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Record Mentor Note & Action Items</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {student && (
            <div className="p-3 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between text-xs">
              <span className="text-slate-400">Mentee:</span>
              <span className="font-semibold text-white">{student.userId?.name} ({student.usn})</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Meeting Status
              </label>
              <select
                value={meetingStatus}
                onChange={(e) => setMeetingStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending Follow-up</option>
                <option value="Missed">Student Missed Session</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Discussion Overview
            </label>
            <textarea
              rows="3"
              value={discussion}
              onChange={(e) => setDiscussion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Summary of student interaction, feedback, and academic standing..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Problems Identified
              </label>
              <textarea
                rows="2"
                value={problemsIdentified}
                onChange={(e) => setProblemsIdentified(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Low attendance in DBMS, difficulty with lab concepts..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Mentor Recommendations
              </label>
              <textarea
                rows="2"
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Attend Saturday remedial class, form study group..."
              />
            </div>
          </div>

          {/* Action Items List */}
          <div className="border-t border-dark-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Assigned Action Items & Deadlines
              </label>
              <button
                type="button"
                onClick={handleAddActionItem}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Action Item
              </button>
            </div>

            <div className="space-y-2">
              {actionItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Action item description..."
                    value={item.item}
                    onChange={(e) => handleActionItemChange(idx, 'item', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) => handleActionItemChange(idx, 'dueDate', e.target.value)}
                    className="w-36 px-2 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveActionItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border shrink-0">
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
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Mentor Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
