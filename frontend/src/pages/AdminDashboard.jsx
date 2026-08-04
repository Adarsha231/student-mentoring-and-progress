import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

import { 
  Users, 
  UserPlus, 
  Shield, 
  CheckCircle2, 
  UserCheck, 
  Trash2, 
  Plus, 
  Search,
  Zap,
  Filter,
  Sparkles,
  Building
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Active view tab: 'mapping' | 'mentors' | 'students'
  const [activeTab, setActiveTab] = useState('mapping');

  // Search & Filter state for mapping matrix
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'UNASSIGNED' | 'ASSIGNED'

  // Modals for user creation
  const [showCreateMentor, setShowCreateMentor] = useState(false);
  const [showCreateStudent, setShowCreateStudent] = useState(false);

  // New Mentor Form State
  const [mentorForm, setMentorForm] = useState({
    name: '',
    email: '',
    designation: 'Assistant Professor',
    maxMentees: 15
  });

  // New Student Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    usn: '',
    semester: 5,
    mentorId: ''
  });

  const fetchData = async () => {
    try {
      const [statsRes, mentorsRes, studentsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getMentors(),
        adminAPI.getStudents()
      ]);
      setStats(statsRes.data);
      setMentors(mentorsRes.data);
      setStudents(studentsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignMentor = async (studentId, mentorId) => {
    try {
      await adminAPI.assignMentor({ studentId, mentorId });
      fetchData();
      triggerToast('Department mentor assigned successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign mentor');
    }
  };

  const handleUnassignMentor = async (studentId) => {
    try {
      await adminAPI.unassignMentor(studentId);
      fetchData();
      triggerToast('Mentor assignment removed.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      const res = await adminAPI.autoAssign();
      fetchData();
      triggerToast(res.data.message || 'Auto-assignment completed successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Auto-assignment failed');
    } finally {
      setAutoAssigning(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createMentor(mentorForm);
      setShowCreateMentor(false);
      fetchData();
      triggerToast(`New department mentor account created!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create mentor');
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createStudent(studentForm);
      setShowCreateStudent(false);
      fetchData();
      triggerToast(`New department student account created!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student');
    }
  };

  // Filter department students for mapping matrix
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.usn.toLowerCase().includes(search.toLowerCase()) ||
      (student.userId?.name || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'UNASSIGNED') return !student.mentorId;
    if (filterMode === 'ASSIGNED') return !!student.mentorId;
    return true;
  });

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

  const departmentName = stats?.department || 'Computer Science & Engineering';

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title={`HOD Portal — ${departmentName}`} />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-4 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Department Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-blue-900/20 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">{departmentName} Department</h2>
                <p className="text-xs text-purple-300">
                  Departmental HOD Portal — Assign students to department faculty mentors
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
              Department Scoped View
            </span>
          </div>

          {/* Summary Stat Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Department Faculty Mentors"
                value={stats.totalMentors}
                icon={UserCheck}
                color="purple"
              />
              <StatCard
                title="Department Enrolled Students"
                value={stats.totalStudents}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Assigned Mentees"
                value={stats.assignedStudents}
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                title="Unassigned Students"
                value={stats.unassignedStudents}
                icon={Shield}
                color={stats.unassignedStudents > 0 ? "rose" : "emerald"}
              />
            </div>
          )}

          {/* Primary Action Toolbar */}
          <div className="glass-panel rounded-2xl p-5 border border-dark-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Mentee Allocation Hub</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically or manually map {departmentName} students to department faculty mentors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleAutoAssign}
                disabled={autoAssigning || stats?.unassignedStudents === 0}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                  stats?.unassignedStudents === 0
                    ? 'bg-dark-surface border border-dark-border text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/20'
                }`}
                title="Automatically assign unassigned department students to department mentors"
              >
                <Zap className={`w-4 h-4 ${autoAssigning ? 'animate-spin' : ''}`} />
                <span>{autoAssigning ? 'Allocating...' : '⚡ Auto-Assign Mentees'}</span>
              </button>

              <button
                onClick={() => setShowCreateMentor(true)}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Mentor</span>
              </button>

              <button
                onClick={() => setShowCreateStudent(true)}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-dark-border">
            <button
              onClick={() => setActiveTab('mapping')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'mapping'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Mentee Allocation Matrix ({filteredStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('mentors')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'mentors'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Department Mentors ({mentors.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'students'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Department Students ({students.length})
            </button>
          </div>

          {/* Tab 1: Mentor-Mentee Allocation Matrix */}
          {activeTab === 'mapping' && (
            <div className="glass-card rounded-2xl p-5 border border-dark-border space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search USN, Student Name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <button
                    onClick={() => setFilterMode('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      filterMode === 'ALL'
                        ? 'bg-purple-600 text-white'
                        : 'bg-dark-bg text-slate-400 hover:text-white border border-dark-border'
                    }`}
                  >
                    All ({students.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('UNASSIGNED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      filterMode === 'UNASSIGNED'
                        ? 'bg-rose-600 text-white'
                        : 'bg-dark-bg text-slate-400 hover:text-white border border-dark-border'
                    }`}
                  >
                    Unassigned ({stats?.unassignedStudents || 0})
                  </button>
                  <button
                    onClick={() => setFilterMode('ASSIGNED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      filterMode === 'ASSIGNED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-dark-bg text-slate-400 hover:text-white border border-dark-border'
                    }`}
                  >
                    Assigned ({stats?.assignedStudents || 0})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-dark-border text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">USN</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Department Faculty Mentor</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/50 text-slate-200">
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-dark-surface/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">{student.usn}</td>
                        <td className="py-3 px-4 font-semibold text-white">{student.userId?.name}</td>
                        <td className="py-3 px-4">Semester {student.semester}</td>
                        <td className="py-3 px-4">
                          <select
                            value={student.mentorId?._id || ''}
                            onChange={(e) => handleAssignMentor(student._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none border transition-all ${
                              student.mentorId
                                ? 'bg-dark-bg border-dark-border text-white focus:border-purple-500'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-bold'
                            }`}
                          >
                            <option value="">-- Assign Department Mentor --</option>
                            {mentors.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.userId?.name} ({m.designation})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {student.mentorId ? (
                            <button
                              onClick={() => handleUnassignMentor(student._id)}
                              className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                              title="Remove Mentor Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Unassign</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Unmapped</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Department Mentors Directory */}
          {activeTab === 'mentors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {mentors.map((m) => {
                const percentage = Math.round((m.menteeCount / (m.maxMentees || 15)) * 100);
                return (
                  <div key={m._id} className="glass-card rounded-2xl p-5 border border-dark-border space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center text-sm">
                        {m.userId?.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{m.userId?.name}</h4>
                        <p className="text-xs text-slate-400">{m.designation}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-dark-bg border border-dark-border text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Department:</span>
                        <span className="font-semibold text-white">{m.department}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Mentee Load:</span>
                        <span className="font-bold text-purple-400">{m.menteeCount} / {m.maxMentees || 15}</span>
                      </div>
                      {/* Capacity Bar */}
                      <div className="w-full bg-dark-border rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: Department Students Directory */}
          {activeTab === 'students' && (
            <div className="glass-card rounded-2xl p-5 border border-dark-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-dark-border text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">USN</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Sem</th>
                      <th className="py-3 px-4">Mentor Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/50 text-slate-200">
                    {students.map((s) => (
                      <tr key={s._id}>
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">{s.usn}</td>
                        <td className="py-3 px-4 font-semibold text-white">{s.userId?.name}</td>
                        <td className="py-3 px-4 text-slate-400">{s.userId?.email}</td>
                        <td className="py-3 px-4">Sem {s.semester}</td>
                        <td className="py-3 px-4">
                          {s.mentorId ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                              Assigned ({s.mentorId.userId?.name})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                              Unassigned
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Create Mentor */}
      {showCreateMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-1">Create New Department Mentor</h3>
            <p className="text-xs text-slate-400 mb-3">Adding mentor to {departmentName}</p>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-3">
              💡 The mentor's <strong>Email address</strong> will be set as both their username and default password.
            </div>
            <form onSubmit={handleCreateMentor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={mentorForm.name}
                  onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={mentorForm.email}
                  onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={mentorForm.designation}
                  onChange={(e) => setMentorForm({ ...mentorForm, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateMentor(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 bg-dark-surface border border-dark-border font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-500/20">
                  Create Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Student */}
      {showCreateStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-1">Create New Department Student</h3>
            <p className="text-xs text-slate-400 mb-4">Adding student to {departmentName}</p>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student USN</label>
                <input
                  type="text"
                  value={studentForm.usn}
                  onChange={(e) => setStudentForm({ ...studentForm, usn: e.target.value })}
                  placeholder="e.g. 1MS22CS105"
                  className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white uppercase font-mono text-sm focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                  🔑 Student password is automatically set to their USN.
                </p>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Semester</label>
                <select
                  value={studentForm.semester}
                  onChange={(e) => setStudentForm({ ...studentForm, semester: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="Optional (Defaults to USN@mentoring.edu)"
                  className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateStudent(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 bg-dark-surface border border-dark-border font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20">
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
