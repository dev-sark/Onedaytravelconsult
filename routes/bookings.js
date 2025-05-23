const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// Get all bookings (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new booking
router.post('/', protect, async (req, res) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete booking (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
