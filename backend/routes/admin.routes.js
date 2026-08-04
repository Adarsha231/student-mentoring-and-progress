const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('ADMIN'));

const SUBJECTS_BY_DEPT = {
  'Computer Science & Engineering': [
    { code: 'CS501', name: 'Database Management Systems' },
    { code: 'CS502', name: 'Computer Networks' },
    { code: 'CS503', name: 'Theory of Computation' },
    { code: 'CS504', name: 'Web Technology' }
  ],
  'Information Science & Engineering': [
    { code: 'IS501', name: 'Software Engineering' },
    { code: 'IS502', name: 'Data Mining' },
    { code: 'IS503', name: 'Operating Systems' },
    { code: 'IS504', name: 'Cloud Computing' }
  ],
  'Electronics & Communication Engineering': [
    { code: 'EC501', name: 'Digital Signal Processing' },
    { code: 'EC502', name: 'Microcontrollers' },
    { code: 'EC503', name: 'VLSI Design' },
    { code: 'EC504', name: 'Control Systems' }
  ],
  'Mechanical Engineering': [
    { code: 'ME501', name: 'Thermodynamics' },
    { code: 'ME502', name: 'Fluid Mechanics' },
    { code: 'ME503', name: 'Kinematics of Machines' },
    { code: 'ME504', name: 'Manufacturing Process' }
  ]
};

// Helper to get HOD's department
const getAdminDept = (req) => {
  return req.user.department || 'Computer Science & Engineering';
};

// @route   GET /api/admin/stats
// @desc    Get system overview statistics scoped strictly to HOD's department
router.get('/stats', async (req, res) => {
  try {
    const dept = getAdminDept(req);

    const totalMentors = await Mentor.countDocuments({ department: dept });
    const totalStudents = await Student.countDocuments({ department: dept });
    const assignedStudents = await Student.countDocuments({ department: dept, mentorId: { $ne: null } });
    const unassignedStudents = totalStudents - assignedStudents;

    res.json({
      department: dept,
      totalMentors,
      totalStudents,
      assignedStudents,
      unassignedStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/mentors
// @desc    Get mentors belonging strictly to HOD's department with assigned mentee counts
router.get('/mentors', async (req, res) => {
  try {
    const dept = getAdminDept(req);
    const mentors = await Mentor.find({ department: dept }).populate('userId', 'name email department phone avatar');
    
    const mentorsWithCount = await Promise.all(
      mentors.map(async (m) => {
        const menteeCount = await Student.countDocuments({ mentorId: m._id });
        return {
          ...m.toObject(),
          menteeCount
        };
      })
    );

    res.json(mentorsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/mentors
// @desc    Create new Mentor account in HOD's department
router.post('/mentors', async (req, res) => {
  try {
    const dept = getAdminDept(req);
    const mentorEmail = email ? email.trim().toLowerCase() : '';
    if (!mentorEmail) {
      return res.status(400).json({ message: 'Mentor email is required' });
    }

    const userExists = await User.findOne({ email: mentorEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Default password automatically set to mentor's Email address!
    const mentorPassword = (password && password.trim()) ? password.trim() : mentorEmail;

    const user = await User.create({
      name,
      email: mentorEmail,
      password: mentorPassword,
      role: 'MENTOR',
      department: dept,
      phone: phone || ''
    });

    const mentor = await Mentor.create({
      userId: user._id,
      employeeId: employeeId || `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      department: dept,
      designation: designation || 'Assistant Professor',
      maxMentees: maxMentees || 15
    });

    const populated = await Mentor.findById(mentor._id).populate('userId', 'name email department phone avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/students
// @desc    Get all students belonging strictly to HOD's department
router.get('/students', async (req, res) => {
  try {
    const dept = getAdminDept(req);
    const students = await Student.find({ department: dept })
      .populate('userId', 'name email phone avatar')
      .populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ usn: 1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/students
// @desc    Create new Student account in HOD's department (Default password is USN)
router.post('/students', async (req, res) => {
  try {
    const dept = getAdminDept(req);
    const { name, email, password, usn, semester, section, mentorId, phone } = req.body;

    const formattedUsn = usn ? usn.trim().toUpperCase() : '';
    if (!formattedUsn) {
      return res.status(400).json({ message: 'Student USN is required' });
    }

    const usnExists = await Student.findOne({ usn: formattedUsn });
    if (usnExists) {
      return res.status(400).json({ message: `Student with USN ${formattedUsn} already exists` });
    }

    const studentEmail = (email && email.trim()) ? email.trim().toLowerCase() : `${formattedUsn.toLowerCase()}@mentoring.edu`;
    const userExists = await User.findOne({ email: studentEmail });
    if (userExists) {
      return res.status(400).json({ message: `User with email ${studentEmail} already exists` });
    }

    // Default password automatically set to USN!
    const studentPassword = (password && password.trim()) ? password.trim() : formattedUsn;

    const user = await User.create({
      name: name ? name.trim() : `Student ${formattedUsn}`,
      email: studentEmail,
      password: studentPassword,
      role: 'STUDENT',
      department: dept,
      phone: phone || ''
    });

    const student = await Student.create({
      userId: user._id,
      usn: formattedUsn,
      department: dept,
      semester: Number(semester) || 5,
      section: section || 'A',
      mentorId: mentorId || null,
      overallAttendance: 85,
      avgCieMarks: 40,
      assignmentCompletionRate: 90
    });

    // Initialize academic records for newly created student
    const subjects = SUBJECTS_BY_DEPT[dept] || SUBJECTS_BY_DEPT['Computer Science & Engineering'];
    if (subjects) {
      for (const sub of subjects) {
        await Attendance.create({
          studentId: student._id,
          subjectCode: sub.code,
          subjectName: sub.name,
          totalClasses: 40,
          attendedClasses: 34,
          percentage: 85
        });

        await Marks.create({
          studentId: student._id,
          subjectCode: sub.code,
          subjectName: sub.name,
          cie1: 40,
          cie2: 40,
          cie3: 40,
          averageMarks: 40,
          averagePercentage: 80
        });

        await Assignment.create({
          studentId: student._id,
          subjectCode: sub.code,
          subjectName: sub.name,
          title: `Assignment 1: ${sub.name} Fundamentals`,
          dueDate: new Date(Date.now() + 7 * 86400000),
          status: 'Submitted',
          score: 45,
          maxScore: 50
        });
      }
    }

    const populated = await Student.findById(student._id)
      .populate('userId', 'name email phone avatar')
      .populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'name email' }
      });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/assign-mentor
// @desc    Manual Assign or Reassign Mentor to Student (within department)
router.post('/assign-mentor', async (req, res) => {
  try {
    const { studentId, mentorId } = req.body;
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (mentorId) {
      const mentor = await Mentor.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ message: 'Faculty mentor not found' });
      }
      if (mentor.department !== student.department) {
        return res.status(400).json({ message: 'Cannot assign student to a mentor outside their department.' });
      }
    }

    student.mentorId = mentorId || null;
    await student.save();

    const updated = await Student.findById(studentId)
      .populate('userId', 'name email phone avatar')
      .populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'name email' }
      });

    res.json({ message: 'Mentor assigned successfully', student: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/auto-assign
// @desc    Automated Smart Mentee Allocation for HOD's Department
router.post('/auto-assign', async (req, res) => {
  try {
    const dept = getAdminDept(req);

    const unassignedStudents = await Student.find({ department: dept, mentorId: null });
    if (unassignedStudents.length === 0) {
      return res.json({ message: `All ${dept} students are already assigned to faculty mentors!`, assignedCount: 0 });
    }

    const mentors = await Mentor.find({ department: dept });
    if (mentors.length === 0) {
      return res.status(400).json({ message: `No faculty mentors found in ${dept} for allocation.` });
    }

    const mentorCapacities = await Promise.all(
      mentors.map(async (m) => {
        const count = await Student.countDocuments({ mentorId: m._id });
        return {
          mentor: m,
          currentCount: count,
          capacityLeft: Math.max(0, (m.maxMentees || 15) - count)
        };
      })
    );

    let assignedCount = 0;

    for (const student of unassignedStudents) {
      const eligible = mentorCapacities.filter(mc => mc.capacityLeft > 0);

      if (eligible.length > 0) {
        eligible.sort((a, b) => a.currentCount - b.currentCount);
        const selected = eligible[0];

        student.mentorId = selected.mentor._id;
        await student.save();

        selected.currentCount += 1;
        selected.capacityLeft -= 1;
        assignedCount++;
      }
    }

    res.json({
      message: `Automated assignment complete! Allocated ${assignedCount} student(s) to ${dept} faculty mentors.`,
      assignedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/unassign-mentor/:studentId
// @desc    Remove mentor assignment from student
router.delete('/unassign-mentor/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.mentorId = null;
    await student.save();

    res.json({ message: 'Mentor assignment removed successfully', studentId: req.params.studentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
