require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas!');
    
    // Create a test document
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await TestModel.create({ name: 'test' });
    console.log('Successfully created a test document!');
    
    // Clean up
    await mongoose.connection.dropDatabase();
    console.log('Test database cleaned up!');
    
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testConnection();
