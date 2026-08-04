import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, noteAPI, mentorAPI } from '../services/api';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import RiskBadge from '../components/RiskBadge';
import ScheduleModal from '../components/ScheduleModal';
import MentorNoteModal from '../components/MentorNoteModal';
import AiCopilotModal from '../components/AiCopilotModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { 
  Calendar, 
  CheckSquare, 
  FileText, 
  ArrowLeft, 
  BookOpen, 
  Award,
  AlertCircle,
  Plus,
  Layers,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'mentoring'
  const [selectedSemester, setSelectedSemester] = useState(5);

  // Modal triggers
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // AI Copilot state
  const [aiReport, setAiReport] = useState(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await studentAPI.getProfile(id);
      setData(res.data);
      if (res.data.student && res.data.student.semester) {
        setSelectedSemester(res.data.student.semester);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleToggleActionItem = async (noteId, actionItemId, currentStatus) => {
    const nextStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
    try {
      await noteAPI.updateActionItem(noteId, actionItemId, nextStatus);
      fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateAiDiagnostic = async () => {
    if (!data || !data.student) return;
    setGeneratingAi(true);
    try {
      const res = await mentorAPI.generateAiDiagnostic(data.student._id);
      setAiReport(res.data.report);
    } catch (e) {
      console.error('AI Diagnostic Error:', e);
      alert('Could not generate AI Diagnostic. Please try again.');
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-dark-bg">
        <Sidebar />
        <div className="flex-1 p-8">
          <LoadingSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="flex h-screen bg-dark-bg">
        <Sidebar />
        <div className="flex-1 p-8 text-center text-slate-400">
          Student profile not found.
        </div>
      </div>
    );
  }

  const { student, attendance, marks, meetings, notes, actionItems, availableSemesters, charts } = data;

  // Filter marks & attendance by selected semester dropdown
  const filteredMarks = marks.filter(m => Number(m.semester) === Number(selectedSemester));
  const filteredAttendance = attendance.filter(a => Number(a.semester) === Number(selectedSemester));
  const filteredCieCharts = (charts?.cie || []).filter(c => Number(c.semester) === Number(selectedSemester));
  const filteredAttCharts = (charts?.attendance || []).filter(c => Number(c.semester) === Number(selectedSemester));

  const semestersList = availableSemesters || [5, 4, 3, 2, 1];

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title={`Student Profile — ${student.userId?.name || 'Student'}`} />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Bar Navigation & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Students List</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              {/* AI Mentor Copilot Action Button */}
              <button
                onClick={handleGenerateAiDiagnostic}
                disabled={generatingAi}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all border border-purple-400/30"
              >
                <Sparkles className={`w-4 h-4 text-amber-300 ${generatingAi ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{generatingAi ? 'Analyzing with AI...' : '✨ AI Mentor Copilot'}</span>
              </button>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Session</span>
              </button>
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <FileText className="w-4 h-4" />
                <span>Record Note</span>
              </button>
            </div>
          </div>

          {/* Student Banner Header */}
          <div className="glass-panel rounded-2xl p-6 border border-dark-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                {student.userId?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white tracking-tight">{student.userId?.name}</h2>
                  <RiskBadge level={student.riskLevel} size="lg" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="px-2 py-0.5 rounded bg-dark-card border border-dark-border font-mono font-bold text-blue-300">
                    {student.usn}
                  </span>
                  <span>•</span>
                  <span>{student.department}</span>
                  <span>•</span>
                  <span>Semester {student.semester} ({student.section})</span>
                </div>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-dark-border/60 pt-4 md:pt-0 md:pl-6">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Attendance</p>
                <p className={`text-lg font-bold ${student.overallAttendance < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {student.overallAttendance}%
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Avg CIE</p>
                <p className="text-lg font-bold text-blue-400">{student.avgCieMarks} / 50</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Assignments</p>
                <p className="text-lg font-bold text-purple-400">{student.assignmentCompletionRate}%</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-dark-border">
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'academic'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Academic Data (Read Only)</span>
            </button>
            <button
              onClick={() => setActiveTab('mentoring')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'mentoring'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Mentoring & Progress Timeline</span>
            </button>
          </div>

          {/* Tab 1: Academic Data */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CIE Marks Bar Chart */}
                <div className="glass-card rounded-2xl p-5 border border-dark-border">
                  <h3 className="font-bold text-white text-sm mb-4">
                    Subject CIE Scores (Sem {selectedSemester})
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredCieCharts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A364F" />
                        <XAxis dataKey="subject" stroke="#8A99B5" fontSize={11} />
                        <YAxis stroke="#8A99B5" fontSize={11} domain={[0, 50]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#141A26', borderColor: '#2A364F', borderRadius: '8px' }}
                        />
                        <Bar dataKey="cie1" fill="#3B82F6" name="CIE 1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cie2" fill="#8B5CF6" name="CIE 2" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="averageCie" fill="#10B981" name="Avg CIE" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Attendance Chart */}
                <div className="glass-card rounded-2xl p-5 border border-dark-border">
                  <h3 className="font-bold text-white text-sm mb-4">
                    Subject Attendance Breakdown (%) (Sem {selectedSemester})
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredAttCharts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A364F" />
                        <XAxis dataKey="subject" stroke="#8A99B5" fontSize={11} />
                        <YAxis stroke="#8A99B5" fontSize={11} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#141A26', borderColor: '#2A364F', borderRadius: '8px' }}
                        />
                        <Bar dataKey="percentage" fill="#10B981" name="Attendance %" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Subject Tables */}
              <div className="glass-card rounded-2xl p-5 border border-dark-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border/60 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                      <span>Detailed Academic Transcript & SEE Exam Scores</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Showing performance metrics for Semester {selectedSemester}.
                    </p>
                  </div>

                  {/* Dropdown Semesterwise */}
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <label className="text-xs text-slate-300 font-semibold">Semester Filter:</label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="px-3.5 py-1.5 rounded-xl bg-dark-bg border border-blue-500/40 text-blue-300 font-bold text-xs focus:outline-none focus:border-blue-400 transition-all cursor-pointer shadow-sm"
                    >
                      {semestersList.map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem} {Number(sem) === Number(student.semester) ? '(Current Ongoing)' : '(Completed)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-dark-border text-slate-400 uppercase font-semibold">
                        <th className="py-3 px-4">Semester</th>
                        <th className="py-3 px-4">Subject Code</th>
                        <th className="py-3 px-4">Subject Name</th>
                        <th className="py-3 px-4">Attendance</th>
                        <th className="py-3 px-4 text-center">CIE 1</th>
                        <th className="py-3 px-4 text-center">CIE 2</th>
                        <th className="py-3 px-4 text-center">CIE 3</th>
                        <th className="py-3 px-4 text-center">Avg CIE (/50)</th>
                        <th className="py-3 px-4 text-center text-emerald-400">SEE Exam Score (/100)</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/50 text-slate-200">
                      {filteredMarks.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="py-6 text-center text-slate-500">
                            No records found for Semester {selectedSemester}.
                          </td>
                        </tr>
                      ) : (
                        filteredMarks.map((m) => {
                          const att = filteredAttendance.find(a => a.subjectCode === m.subjectCode && Number(a.semester) === Number(m.semester));
                          const isOngoing = Number(m.semester) === Number(student.semester);

                          return (
                            <tr key={m._id} className="hover:bg-dark-surface/50">
                              <td className="py-3 px-4 text-slate-400 font-bold">Sem {m.semester || 5}</td>
                              <td className="py-3 px-4 font-mono font-bold text-blue-400">{m.subjectCode}</td>
                              <td className="py-3 px-4 font-semibold text-white">{m.subjectName}</td>
                              <td className="py-3 px-4">
                                <span className={`font-bold ${att?.percentage < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {att ? `${att.attendedClasses}/${att.totalClasses} (${att.percentage}%)` : 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">{m.cie1}</td>
                              <td className="py-3 px-4 text-center">{m.cie2}</td>
                              <td className="py-3 px-4 text-center">
                                {isOngoing && m.cie3 === 0 ? <span className="text-slate-500 text-[11px]">TBD</span> : m.cie3}
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-blue-300">{m.averageMarks} / 50</td>
                              <td className="py-3 px-4 text-center">
                                {isOngoing || m.seeMarks === null ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium text-xs">
                                    ⏳ Pending / Ongoing
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs">
                                    {m.seeMarks} / 100
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isOngoing ? (
                                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[11px]">
                                    In Progress
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
                                    {m.seeGrade || 'A'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Mentoring History & Timeline */}
          {activeTab === 'mentoring' && (
            <div className="space-y-6">
              {/* Action Items List */}
              <div className="glass-card rounded-2xl p-5 border border-dark-border">
                <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Action Items & Follow-up Checklist ({actionItems.length})</span>
                </h3>
                <div className="space-y-2">
                  {actionItems.length === 0 ? (
                    <p className="text-xs text-slate-400">No active action items assigned.</p>
                  ) : (
                    actionItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleToggleActionItem(item.noteId, item._id, item.status)}
                        className="flex items-center justify-between p-3 rounded-xl bg-dark-bg border border-dark-border hover:border-slate-600 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.status === 'Done'}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-dark-border text-emerald-500 focus:ring-emerald-500 bg-dark-card"
                          />
                          <span className={`text-xs ${item.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}`}>
                            {item.item}
                          </span>
                        </div>

                        {item.dueDate && (
                          <span className="text-[10px] text-slate-400">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mentoring Timeline & Notes */}
              <div className="glass-card rounded-2xl p-5 border border-dark-border space-y-4">
                <h3 className="font-bold text-white text-sm">Mentoring Sessions & Detailed Notes ({notes.length})</h3>

                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400">No mentoring notes recorded for this student yet.</p>
                ) : (
                  notes.map((note) => (
                    <div key={note._id} className="p-4 rounded-xl bg-dark-bg border border-dark-border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                            {note.mentorId?.userId?.name?.charAt(0) || 'M'}
                          </div>
                          <span className="text-xs font-bold text-white">{note.mentorId?.userId?.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs space-y-2 text-slate-300">
                        <p><strong>Discussion:</strong> {note.discussion}</p>
                        {note.problemsIdentified && (
                          <p className="text-rose-300"><strong>Identified Issues:</strong> {note.problemsIdentified}</p>
                        )}
                        {note.recommendations && (
                          <p className="text-emerald-300"><strong>Recommendations:</strong> {note.recommendations}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <ScheduleModal
          student={student}
          mentorId={student.mentorId?._id}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={fetchProfile}
        />
      )}

      {/* Note Recorder Modal */}
      {showNoteModal && (
        <MentorNoteModal
          student={student}
          onClose={() => setShowNoteModal(false)}
          onSuccess={fetchProfile}
        />
      )}

      {/* AI Copilot Modal */}
      {aiReport && (
        <AiCopilotModal
          student={student}
          report={aiReport}
          onClose={() => setAiReport(null)}
        />
      )}
    </div>
  );
}
