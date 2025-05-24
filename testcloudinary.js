require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const testCloudinary = async () => {
  try {
    // Test the connection by getting account details
    const result = await cloudinary.api.usage();
    console.log('Successfully connected to Cloudinary!');
    console.log('Account usage:', result);
  } catch (error) {
    console.error('Cloudinary connection error:', error.message);
  }
};

testCloudinary();
