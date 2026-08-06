const Alert = require('../models/Alert');
const Notification = require('../models/Notification');

/**
 * Calculates student risk level according to strict rules:
 * Attendance:
 *   > 75%: LOW
 *   60-75%: MEDIUM
 *   < 60%: HIGH
 * Marks:
 *   > 70: LOW
 *   40-70: MEDIUM
 *   < 40: HIGH
 * Assignment Completion < 50%: Increases risk tier by 1 level
 */
function calculateRiskLevel(attendancePct, avgMarks, assignmentCompletionPct) {
  // Attendance risk tier
  let attendanceRisk = 'LOW';
  if (attendancePct < 60) attendanceRisk = 'HIGH';
  else if (attendancePct <= 75) attendanceRisk = 'MEDIUM';

  // Marks risk tier (normalize marks if provided out of 50)
  const marksPct = (avgMarks != null && avgMarks <= 50) ? (avgMarks / 50) * 100 : (avgMarks || 0);

  let marksRisk = 'LOW';
  if (marksPct < 40) marksRisk = 'HIGH';
  else if (marksPct <= 70) marksRisk = 'MEDIUM';

  // Determine base risk as worst of the two
  const severityRank = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  let baseRank = Math.max(severityRank[attendanceRisk], severityRank[marksRisk]);

  // Escalating condition for low assignment completion
  if (assignmentCompletionPct < 50) {
    baseRank = Math.min(3, baseRank + 1);
  }

  const rankToLevel = { 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH' };
  return rankToLevel[baseRank];
}

/**
 * Evaluates student performance metrics and creates alerts if thresholds are breached
 */
async function checkAndGenerateAlerts(student, mentor, attendancePct, marksData, assignmentsData) {
  if (!mentor || !mentor._id) return;

  const currentRisk = calculateRiskLevel(
    student.overallAttendance,
    student.avgCieMarks,
    student.assignmentCompletionRate
  );

  // 1. High Risk Alert
  if (currentRisk === 'HIGH') {
    const existingAlert = await Alert.findOne({
      studentId: student._id,
      type: 'HIGH_RISK_ESCALATION',
      resolved: false
    });

    if (!existingAlert) {
      const alert = await Alert.create({
        studentId: student._id,
        mentorId: mentor._id,
        type: 'HIGH_RISK_ESCALATION',
        title: 'High Risk Escalation Alert',
        message: `Student ${student.usn} has breached high risk threshold (Attendance: ${attendancePct.toFixed(1)}%, Marks Avg: ${student.avgCieMarks.toFixed(1)}%).`,
        severity: 'High'
      });

      // Send notification to mentor user
      if (mentor.userId) {
        await Notification.create({
          userId: mentor.userId,
          title: '🚨 High Risk Student Alert',
          message: `Mentee ${student.usn} requires immediate attention due to declining performance.`,
          type: 'HIGH_RISK_ALERT',
          link: `/students/${student._id}`
        });
      }
    }
  }

  // 2. Attendance Drop Alert (<60%)
  if (attendancePct < 60) {
    const existing = await Alert.findOne({ studentId: student._id, type: 'ATTENDANCE_DROP', resolved: false });
    if (!existing) {
      await Alert.create({
        studentId: student._id,
        mentorId: mentor._id,
        type: 'ATTENDANCE_DROP',
        title: 'Critical Attendance Drop',
        message: `Attendance is dangerously low at ${attendancePct.toFixed(1)}% (below required 75%).`,
        severity: 'High'
      });
    }
  }

  // 3. Assignment Completion Drop Alert (<50%)
  if (student.assignmentCompletionRate < 50) {
    const existing = await Alert.findOne({ studentId: student._id, type: 'ASSIGNMENT_DROP', resolved: false });
    if (!existing) {
      await Alert.create({
        studentId: student._id,
        mentorId: mentor._id,
        type: 'ASSIGNMENT_DROP',
        title: 'Assignment Non-Completion Warning',
        message: `Assignment completion rate dropped to ${student.assignmentCompletionRate.toFixed(1)}%.`,
        severity: 'Medium'
      });
    }
  }
}

/**
 * Synchronizes a student's avgCieMarks and riskLevel from their actual Marks, Attendance, & Assignment collections
 */
async function syncStudentAcademicMetrics(studentId) {
  const Student = require('../models/Student');
  const Marks = require('../models/Marks');
  const Attendance = require('../models/Attendance');
  const Assignment = require('../models/Assignment');

  const student = typeof studentId === 'object' ? studentId : await Student.findById(studentId);
  if (!student) return null;

  // 1. Calculate actual average CIE marks for current semester
  const currentMarks = await Marks.find({ studentId: student._id, semester: student.semester });
  let avgCieMarks = student.avgCieMarks || 0;
  if (currentMarks && currentMarks.length > 0) {
    const sumCie = currentMarks.reduce((sum, m) => sum + (m.averageMarks || 0), 0);
    avgCieMarks = Math.round(sumCie / currentMarks.length);
  } else if (avgCieMarks > 50) {
    avgCieMarks = Math.round((avgCieMarks / 100) * 50);
  }

  // Cap at 50 max
  avgCieMarks = Math.min(50, Math.max(0, avgCieMarks));

  // 2. Attendance
  const attendanceRecords = await Attendance.find({ studentId: student._id });
  let overallAttPct = student.overallAttendance || 0;
  if (attendanceRecords && attendanceRecords.length > 0) {
    const totalAttended = attendanceRecords.reduce((sum, a) => sum + (a.attendedClasses || 0), 0);
    const totalClasses = attendanceRecords.reduce((sum, a) => sum + (a.totalClasses || 0), 0);
    if (totalClasses > 0) {
      overallAttPct = Math.round((totalAttended / totalClasses) * 100);
    }
  }

  // 3. Assignment Completion
  const assignmentRecords = await Assignment.find({ studentId: student._id });
  let assignCompPct = student.assignmentCompletionRate || 0;
  if (assignmentRecords && assignmentRecords.length > 0) {
    const completed = assignmentRecords.filter(a => a.status === 'Submitted' || a.status === 'Graded').length;
    assignCompPct = Math.round((completed / assignmentRecords.length) * 100);
  }

  // 4. Calculate Risk Level based on actual metrics
  const newRiskLevel = calculateRiskLevel(overallAttPct, avgCieMarks, assignCompPct);

  // 5. Update Student Document
  student.avgCieMarks = avgCieMarks;
  student.riskLevel = newRiskLevel;
  student.overallAttendance = overallAttPct;
  student.assignmentCompletionRate = assignCompPct;
  await student.save();

  return student;
}

module.exports = {
  calculateRiskLevel,
  checkAndGenerateAlerts,
  syncStudentAcademicMetrics
};
