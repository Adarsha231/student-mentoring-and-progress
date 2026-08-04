import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  BrainCircuit, 
  Copy, 
  Check, 
  ChevronRight, 
  Send,
  ShieldAlert
} from 'lucide-react';

export default function AiCopilotModal({ student, report, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleCopyParentDraft = () => {
    if (report.parentDraft) {
      navigator.clipboard.writeText(report.parentDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-blue-500/30 bg-dark-card/95 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950/80 via-slate-900 to-purple-950/80 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">AI Mentor Copilot</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-[10px] font-bold">
                  GEMINI AI POWERED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Academic Health Diagnostic & Intervention Plan for <span className="font-bold text-white">{student.userId?.name}</span> ({student.usn})
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

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Executive Summary Card */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-blue-400" />
              <span>AI Executive Diagnostic Summary</span>
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {report.summary}
            </p>
          </div>

          {/* Root Causes & Key Strengths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Root Causes */}
            <div className="p-4 rounded-2xl bg-rose-950/15 border border-rose-500/20 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Identified Bottlenecks & Root Causes</span>
              </h4>
              <ul className="space-y-2">
                {report.rootCauses?.map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/20 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Observed Academic Strengths</span>
              </h4>
              <ul className="space-y-2">
                {report.keyStrengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mentor Intervention Plan */}
          <div className="p-5 rounded-2xl bg-dark-bg border border-dark-border space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400" />
              <span>Recommended Mentor Intervention Strategies</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.interventionPlan?.map((plan, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-start gap-3">
                  <span className="h-6 w-6 rounded-lg bg-blue-600/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </span>
                  <p className="text-xs text-slate-200 leading-snug">{plan}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Action Checklist */}
          <div className="p-5 rounded-2xl bg-dark-bg border border-dark-border space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>14-Day Student Action Plan Checklist</span>
            </h4>
            <div className="space-y-2">
              {report.actionItems?.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center gap-3">
                  <input type="checkbox" readOnly checked={false} className="rounded border-slate-700 bg-dark-bg text-purple-500" />
                  <span className="text-xs text-slate-200 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Draft Communication for Parents / Guardian */}
          {report.parentDraft && (
            <div className="p-5 rounded-2xl bg-dark-bg border border-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Draft Progress Update for Parent / Guardian</span>
                </h4>

                <button
                  onClick={handleCopyParentDraft}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-500/30"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Email Draft'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-dark-card border border-dark-border font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {report.parentDraft}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-dark-bg border-t border-dark-border flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Powered by Google Gemini AI Model
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            Close AI Diagnostic
          </button>
        </div>

      </div>
    </div>
  );
}
