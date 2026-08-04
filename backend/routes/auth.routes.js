const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const { protect, JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (Supports login via Email or Student USN)
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const rawIdentifier = (email || username || '').trim();

    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: 'Please enter USN or Email and Password' });
    }

    let user = null;

    // 1. Try finding User by exact email
    user = await User.findOne({ email: rawIdentifier.toLowerCase() });

    // 2. Try finding Student by USN (case-insensitive)
    if (!user) {
      const student = await Student.findOne({ usn: new RegExp(`^${rawIdentifier}$`, 'i') });
      if (student && student.userId) {
        user = await User.findById(student.userId);
      }
    }

    // 3. Fallback: Check if USN format email matches
    if (!user && !rawIdentifier.includes('@')) {
      user = await User.findOne({ email: `${rawIdentifier.toLowerCase()}@mentoring.edu` });
    }

    if (user && (await user.matchPassword(password.trim()))) {
      let roleProfile = null;
      if (user.role === 'STUDENT') {
        roleProfile = await Student.findOne({ userId: user._id }).populate('mentorId');
      } else if (user.role === 'MENTOR') {
        roleProfile = await Mentor.findOne({ userId: user._id });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        phone: user.phone,
        roleProfile,
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ 
        message: 'Invalid USN/Email or Password. (Note: For students, default password is your USN in uppercase).' 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let roleProfile = null;
    if (user.role === 'STUDENT') {
      roleProfile = await Student.findOne({ userId: user._id }).populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      });
    } else if (user.role === 'MENTOR') {
      roleProfile = await Mentor.findOne({ userId: user._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      phone: user.phone,
      roleProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/demo-accounts
// @desc    Get sample demo accounts for quick role switcher in frontend UI
router.get('/demo-accounts', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'ADMIN' }).select('email role name');
    const mentorUser = await User.findOne({ role: 'MENTOR' }).select('email role name');
    const studentDoc = await Student.findOne().populate('userId', 'email name');

    res.json({
      admin: admin ? { email: admin.email, name: admin.name } : null,
      mentor: mentorUser ? { email: mentorUser.email, name: mentorUser.name } : null,
      student: studentDoc ? { usn: studentDoc.usn, name: studentDoc.userId?.name } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile & password (for Student, Mentor, and Admin)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, currentPassword, newPassword } = req.body;

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    // Password Update logic
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }

      const isMatch = await user.matchPassword(currentPassword.trim());
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' });
      }

      if (newPassword.trim().length < 4) {
        return res.status(400).json({ message: 'New password must be at least 4 characters long.' });
      }

      user.password = newPassword.trim();
    }

    await user.save();

    let roleProfile = null;
    if (user.role === 'STUDENT') {
      roleProfile = await Student.findOne({ userId: user._id }).populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      });
    } else if (user.role === 'MENTOR') {
      roleProfile = await Mentor.findOne({ userId: user._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      phone: user.phone,
      roleProfile,
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
