import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import RiskBadge from '../components/RiskBadge';
import StatCard from '../components/StatCard';
import ScheduleModal from '../components/ScheduleModal';
import MentorNoteModal from '../components/MentorNoteModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  FilePlus, 
  Bell, 
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

export default function MentorDashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [semester, setSemester] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');

  // Modals state
  const [selectedStudentForSchedule, setSelectedStudentForSchedule] = useState(null);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, studRes] = await Promise.all([
        mentorAPI.getDashboard(),
        mentorAPI.getStudents({ search, department, semester, riskLevel })
      ]);

      setMetrics(dashRes.data);
      setStudents(studRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, department, semester, riskLevel]);

  const handleResolveAlert = async (alertId) => {
    try {
      await mentorAPI.resolveAlert(alertId);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Faculty Mentor Workspace" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top KPI Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Assigned Mentees"
                value={metrics.totalStudents}
                icon={Users}
                color="blue"
                subtitle="Active mentees count"
              />
              <StatCard
                title="High Risk Students"
                value={metrics.highRisk}
                icon={ShieldAlert}
                color="rose"
                subtitle="Requires immediate intervention"
              />
              <StatCard
                title="Medium Risk Students"
                value={metrics.mediumRisk}
                icon={AlertTriangle}
                color="amber"
                subtitle="Needs academic guidance"
              />
              <StatCard
                title="Upcoming Sessions"
                value={metrics.upcomingMeetings}
                icon={Clock}
                color="emerald"
                subtitle="Scheduled mentoring reviews"
              />
            </div>
          )}

          {/* Active Risk Escalation Alerts Banner */}
          {metrics && metrics.alerts && metrics.alerts.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/10 space-y-3">
              <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Automated High-Risk Escalations ({metrics.alerts.length})</span>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {metrics.alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-3 rounded-xl bg-dark-card border border-rose-500/20 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                      <div>
                        <span className="font-bold text-white">
                          {alert.studentId?.userId?.name || 'Student'} ({alert.studentId?.usn})
                        </span>
                        <p className="text-slate-300 text-[11px] mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResolveAlert(alert._id)}
                      className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/30 transition-all text-[11px] shrink-0"
                    >
                      Dismiss Alert
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Controls */}
          <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-dark-border">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search USN, Student Name, Dept..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              <Filter className="w-4 h-4 text-slate-400 mr-1" />
              
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Information Science & Engineering">ISE</option>
                <option value="Electronics & Communication Engineering">ECE</option>
                <option value="Mechanical Engineering">MECH</option>
              </select>

              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Semesters</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
              </select>

              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk Only</option>
                <option value="MEDIUM">Medium Risk Only</option>
                <option value="LOW">Low Risk Only</option>
              </select>
            </div>
          </div>

          {/* Student Table List (Row Format) */}
          <div className="glass-card rounded-2xl p-5 border border-dark-border space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <span>Assigned Mentees Academic Directory ({students.length})</span>
              </h3>
              <span className="text-xs text-slate-400">
                Sorted by USN | Click View Profile for Detailed Analytics
              </span>
            </div>

            {loading ? (
              <LoadingSkeleton count={6} />
            ) : students.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-dark-border text-slate-400 uppercase font-semibold">
                      <th className="py-3.5 px-4">USN & Student Name</th>
                      <th className="py-3.5 px-4">Department & Sem</th>
                      <th className="py-3.5 px-4 text-center">Risk Standing</th>
                      <th className="py-3.5 px-4 text-center">Attendance %</th>
                      <th className="py-3.5 px-4 text-center">Avg CIE (/50)</th>
                      <th className="py-3.5 px-4 text-center">Assignments</th>
                      <th className="py-3.5 px-4">Last Mentoring Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/50 text-slate-200">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-dark-surface/60 transition-colors">
                        {/* Student Name & USN */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{student.userId?.name}</div>
                          <div className="font-mono text-xs text-blue-400 font-bold mt-0.5">{student.usn}</div>
                        </td>

                        {/* Dept & Sem */}
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          <div>{student.department.split(' ')[0]}</div>
                          <div className="text-[11px] text-slate-400">Sem {student.semester} ({student.section || 'A'})</div>
                        </td>

                        {/* Risk Standing */}
                        <td className="py-3.5 px-4 text-center">
                          <RiskBadge level={student.riskLevel} />
                        </td>

                        {/* Attendance */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-bold text-xs ${
                            student.overallAttendance < 60 ? 'text-rose-400' : student.overallAttendance <= 75 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {student.overallAttendance}%
                          </span>
                        </td>

                        {/* Avg CIE */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-bold text-xs ${
                            student.avgCieMarks < 25 ? 'text-rose-400' : 'text-blue-300'
                          }`}>
                            {student.avgCieMarks} / 50
                          </span>
                        </td>

                        {/* Assignments */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-semibold text-xs ${
                            student.assignmentCompletionRate < 50 ? 'text-rose-400' : 'text-purple-300'
                          }`}>
                            {student.assignmentCompletionRate}%
                          </span>
                        </td>

                        {/* Last Mentoring Date */}
                        <td className="py-3.5 px-4 text-slate-400 text-xs">
                          {student.lastMeetingDate
                            ? new Date(student.lastMeetingDate).toLocaleDateString()
                            : 'No session recorded'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/students/${student._id}`)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Profile</span>
                            </button>

                            <button
                              onClick={() => setSelectedStudentForSchedule(student)}
                              className="px-2.5 py-1.5 rounded-lg bg-dark-bg hover:bg-dark-border border border-dark-border text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
                              title="Schedule Session"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Schedule</span>
                            </button>

                            <button
                              onClick={() => setSelectedStudentForNote(student)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all"
                              title="Add Note"
                            >
                              <FilePlus className="w-3.5 h-3.5" />
                              <span>Add Note</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedStudentForSchedule && (
        <ScheduleModal
          student={selectedStudentForSchedule}
          onClose={() => setSelectedStudentForSchedule(null)}
          onSuccess={fetchData}
        />
      )}

      {selectedStudentForNote && (
        <MentorNoteModal
          student={selectedStudentForNote}
          onClose={() => setSelectedStudentForNote(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
