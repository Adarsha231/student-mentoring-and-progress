import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import ScheduleModal from '../components/ScheduleModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

import { 
  BookOpen, 
  Award, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Video, 
  MapPin, 
  Plus, 
  ShieldCheck,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const fetchStudentData = async () => {
    try {
      const res = await studentAPI.getMyDashboard();
      setData(res.data);
      if (res.data.availableSemesters && res.data.availableSemesters.length > 0) {
        setSelectedSemester(res.data.availableSemesters[0]); // Default to latest semester
      } else {
        setSelectedSemester(res.data.student?.semester || 5);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-dark-bg">
        <Sidebar />
        <div className="flex-1 p-8">
          <LoadingSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { student, attendance, marks, assignments, availableSemesters, upcomingMeetings, notes } = data;

  // Filter marks & attendance by selected semester
  const selectedSemesterMarks = marks.filter(m => Number(m.semester) === Number(selectedSemester));
  const selectedSemesterAttendance = attendance.filter(a => Number(a.semester) === Number(selectedSemester));

  // Prepare Chart Data comparing CIE Avg (scaled to 100%) vs SEE Exam Score (/100)
  const semesterChartData = selectedSemesterMarks.map(m => ({
    subject: m.subjectCode,
    subjectName: m.subjectName,
    cieAverage: m.averageMarks, // Out of 50
    ciePercentage: m.averagePercentage,
    seeScore: m.seeMarks, // Out of 100
    finalPercentage: m.finalPercentage
  }));

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Student Academic & Mentoring Portal" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="glass-panel rounded-2xl p-6 border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Welcome back, {student.userId?.name}! 👋
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                USN: <span className="font-mono text-blue-400 font-bold">{student.usn}</span> | {student.department} | Current Semester {student.semester}
              </p>
              {student.mentorId && (
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Assigned Mentor: {student.mentorId.userId?.name} ({student.mentorId.department})</span>
                </p>
              )}
            </div>

            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Request Mentoring Session</span>
            </button>
          </div>

          {/* Academic Overview Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              title="Overall Attendance"
              value={`${student.overallAttendance}%`}
              icon={BookOpen}
              color={student.overallAttendance < 60 ? 'rose' : 'emerald'}
              subtitle="Synced with College ERP"
            />
            <StatCard
              title="Average CIE Score"
              value={`${student.avgCieMarks} / 50`}
              icon={Award}
              color="blue"
              subtitle="Current Semester CIE Average"
            />
            <StatCard
              title="Assignment Completion"
              value={`${student.assignmentCompletionRate}%`}
              icon={CheckSquare}
              color="purple"
              subtitle="Lab & Subject Submissions"
            />
          </div>

          {/* SEMESTER MARKS & SEE EXAM SCORE SECTION */}
          <div className="glass-card rounded-2xl p-6 border border-dark-border space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border/60 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span>Semester Academic Performance & SEE Exam Scores</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a semester to view your CIE internal marks, SEE end-term exam scores, and final grades.
                </p>
              </div>

              {/* Semester Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Layers className="w-3.5 h-3.5" />
                  Semester:
                </span>
                {availableSemesters.map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      Number(selectedSemester) === Number(sem)
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400'
                        : 'bg-dark-bg text-slate-400 hover:text-white border border-dark-border hover:border-slate-500'
                    }`}
                  >
                    Sem {sem} {Number(sem) === Number(student.semester) ? '(Current)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Recharts Bar Chart comparing CIE vs SEE Scores */}
            {semesterChartData.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Semester {selectedSemester} Performance Comparison (CIE Avg /50 vs SEE Exam Score /100)
                </h4>
                <div className="h-64 w-full bg-dark-bg/40 rounded-xl p-4 border border-dark-border/50">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={semesterChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="subject" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="cieAverage" name="CIE Average (/50)" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={22} />
                      <Bar dataKey="seeScore" name="SEE Exam Score (/100)" fill="#10b981" radius={[6, 6, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Semester Marks & SEE Score Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-dark-border text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4 text-center">CIE 1 (/50)</th>
                    <th className="py-3 px-4 text-center">CIE 2 (/50)</th>
                    <th className="py-3 px-4 text-center">CIE 3 (/50)</th>
                    <th className="py-3 px-4 text-center">Avg CIE (/50)</th>
                    <th className="py-3 px-4 text-center text-emerald-400">SEE Exam Score (/100)</th>
                    <th className="py-3 px-4 text-center">Final Grade</th>
                    <th className="py-3 px-4 text-right">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50 text-slate-200">
                  {selectedSemesterMarks.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-6 text-center text-slate-500">
                        No examination records found for Semester {selectedSemester}.
                      </td>
                    </tr>
                  ) : (
                    selectedSemesterMarks.map((m) => {
                      const attDoc = selectedSemesterAttendance.find(a => a.subjectCode === m.subjectCode);
                      const attPct = attDoc ? attDoc.percentage : null;
                      const isOngoing = Number(selectedSemester) === Number(student.semester);

                      return (
                        <tr key={m._id} className="hover:bg-dark-surface/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{m.subjectCode}</td>
                          <td className="py-3.5 px-4 font-semibold text-white">{m.subjectName}</td>
                          <td className="py-3.5 px-4 text-slate-400">{m.credits || 4}</td>
                          <td className="py-3.5 px-4 text-center font-medium">{m.cie1}</td>
                          <td className="py-3.5 px-4 text-center font-medium">{m.cie2}</td>
                          <td className="py-3.5 px-4 text-center font-medium">
                            {isOngoing && m.cie3 === 0 ? <span className="text-slate-500 text-[11px]">TBD</span> : m.cie3}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-blue-300">{m.averageMarks} / 50</td>
                          <td className="py-3.5 px-4 text-center">
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
                          <td className="py-3.5 px-4 text-center">
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
                          <td className="py-3.5 px-4 text-right">
                            {attPct !== null ? (
                              <span className={`font-bold ${attPct < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {attPct}%
                              </span>
                            ) : (
                              <span className="text-slate-500">N/A</span>
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

          {/* Main Grid: Meetings & Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Mentoring Meetings */}
            <div className="glass-card rounded-2xl p-5 border border-dark-border">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Upcoming Mentoring Sessions</span>
              </h3>

              <div className="space-y-3">
                {upcomingMeetings.length === 0 ? (
                  <p className="text-xs text-slate-400">No upcoming meetings scheduled.</p>
                ) : (
                  upcomingMeetings.map((m) => {
                    const meetUrl = m.meetingLink || (m.mode === 'Google Meet' ? 'https://meet.google.com/new' : '');
                    const isOnline = m.mode !== 'Offline' || meetUrl;

                    return (
                      <div key={m._id} className="p-4 rounded-xl bg-dark-bg border border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-white text-sm">{m.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {m.date} at {m.time} ({m.durationMinutes} mins)
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-semibold">
                              {m.mode === 'Offline' ? <MapPin className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                              {m.mode}
                            </span>

                            {meetUrl && (
                              <a
                                href={meetUrl.startsWith('http') ? meetUrl : `https://${meetUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all"
                              >
                                <Video className="w-3 h-3 text-emerald-400" />
                                <span>Join {m.mode === 'Microsoft Teams' ? 'Teams' : 'Google Meet'} 🔗</span>
                              </a>
                            )}
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold self-start sm:self-auto">
                          Upcoming
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Mentor Feedback & Notes */}
            <div className="glass-card rounded-2xl p-5 border border-dark-border">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Mentor Feedback & Recommendations</span>
              </h3>

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400">No mentor feedback recorded yet.</p>
                ) : (
                  notes.map((n) => (
                    <div key={n._id} className="p-4 rounded-xl bg-dark-bg border border-dark-border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{n.mentorId?.userId?.name}</span>
                        <span className="text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-200">{n.discussion}</p>
                      {n.recommendations && (
                        <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                          <strong>Mentor Advice:</strong> {n.recommendations}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Request Session Modal */}
      {showRequestModal && (
        <ScheduleModal
          student={student}
          mentorId={student.mentorId?._id}
          onClose={() => setShowRequestModal(false)}
          onSuccess={fetchStudentData}
        />
      )}
    </div>
  );
}
