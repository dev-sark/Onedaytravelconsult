const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/auth');

// Admin Access Code (store this securely in environment variables)
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || 'admin123'; // Change this in production

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  }
);

// Regular user login/signup routes
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login route
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password, accessCode } = req.body;
    
    // First check the admin access code
    if (accessCode !== ADMIN_ACCESS_CODE) {
      return res.status(401).json({ message: 'Invalid access code' });
    }
    
    const user = await User.findOne({ email, role: 'admin' });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or not an admin' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create initial admin user
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, adminSecret } = req.body;
    
    // Check if the admin secret matches
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = new User({
      email,
      password: hashedPassword,
      role: 'admin',
      name: 'Admin'
    });
    
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.logout();
  res.json({ success: true });
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

module.exports = router;
