import React, { useState, useEffect } from 'react';
import { mentorAPI } from '../services/api';
import { 
  X, 
  Send, 
  MessageSquare, 
  Phone, 
  Copy, 
  Check, 
  Sparkles, 
  FileText,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function WhatsappReportModal({ student, onClose }) {
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '+91 9876543210');
  const [semester, setSemester] = useState(student?.semester || 5);
  const [remarks, setRemarks] = useState('Student is requested to maintain regular attendance and focus on upcoming examinations.');
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    if (!student) return;
    setLoading(true);
    try {
      const res = await mentorAPI.generateWhatsappReport(student._id, {
        customPhone: parentPhone,
        mentorRemarks: remarks,
        semester
      });
      setReportData(res.data);
    } catch (e) {
      console.error('WhatsApp Report Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [semester]);

  const handleSendWhatsapp = () => {
    if (reportData && reportData.whatsappUrl) {
      window.open(reportData.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyText = () => {
    if (reportData && reportData.reportText) {
      navigator.clipboard.writeText(reportData.reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-emerald-500/30 bg-dark-card/95 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">Generate WhatsApp Progress Report</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-[10px] font-bold">
                  DIRECT PARENT DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Send official CIE marks & attendance report for <span className="font-bold text-white">{student.userId?.name}</span> ({student.usn})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-bg/60 border border-dark-border text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Controls: Phone, Semester & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-dark-bg border border-dark-border">
            {/* Parent WhatsApp Number */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Parent WhatsApp Number:</span>
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Semester Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Semester:</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-white text-xs font-bold focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                {[5, 4, 3, 2, 1].map((s) => (
                  <option key={s} value={s}>
                    Semester {s} {Number(s) === Number(student.semester) ? '(Current Ongoing)' : '(Completed)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Mentor Remarks */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mentor Advisory / Custom Remarks:</span>
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter specific advice for the parent..."
                className="w-full px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={generateReport}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Generating Report...' : 'Re-generate Report Text'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Report Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Message Preview (Formatted Text)</span>
              </h4>

              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-lg bg-dark-bg hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-dark-border"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-dark-bg border border-emerald-500/20 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
              {loading ? (
                <div className="text-slate-500 text-center py-8">Generating formatted report...</div>
              ) : reportData?.reportText ? (
                reportData.reportText
              ) : (
                <div className="text-slate-500 text-center py-8">No report data generated.</div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-dark-bg border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-slate-400">
            Target WhatsApp: <span className="font-mono text-emerald-400 font-bold">{reportData?.parentPhone || parentPhone}</span>
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-400 hover:text-white text-xs font-semibold transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSendWhatsapp}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp Web / App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
