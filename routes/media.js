const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Media = require('../models/Media');
const { protect, authorize } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Get all media
router.get('/', async (req, res) => {
  try {
    const media = await Media.find().sort('-createdAt');
    res.json(media);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload media (admin only)
router.post('/', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Convert buffer to base64
    const fileStr = req.file.buffer.toString('base64');
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileStr}`,
      {
        resource_type: fileType,
        folder: 'travel-consult'
      }
    );

    // Create media record
    const media = await Media.create({
      title: req.body.title || req.file.originalname,
      type: fileType,
      url: uploadResponse.secure_url,
      cloudinaryId: uploadResponse.public_id,
      uploadedBy: req.user.id,
      description: req.body.description
    });

    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete media (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.cloudinaryId, {
      resource_type: media.type
    });

    // Delete from database
    await media.remove();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
