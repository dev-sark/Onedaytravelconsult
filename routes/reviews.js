const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new review (authenticated users only)
router.post('/', protect, async (req, res) => {
  try {
    const review = await Review.create({
      ...req.body,
      user: req.user.id
    });
    
    await review.populate('user', 'name');
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update review (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Make sure user owns review
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this review' });
    }
    
    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name');
    
    res.json(review);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete review (owner or admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Make sure user owns review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this review' });
    }
    
    await review.remove();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
