const axios = require('axios');

// Test endpoints
const API_URL = 'http://localhost:5000/api';

const testAuth = async () => {
  try {
    // Test registration
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Registration successful:', registerResponse.data);

    // Test login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login successful:', loginResponse.data);

    return loginResponse.data.token;
  } catch (error) {
    console.error('Auth test failed:', error.response?.data || error.message);
  }
};

const testBooking = async (token) => {
  try {
    // Create a booking
    const bookingResponse = await axios.post(
      `${API_URL}/bookings`,
      {
        service: 'Travel Consultation',
        date: new Date(),
        description: 'Test booking',
        contactNumber: '1234567890'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('Booking created:', bookingResponse.data);
  } catch (error) {
    console.error('Booking test failed:', error.response?.data || error.message);
  }
};

// Run tests
(async () => {
  const token = await testAuth();
  if (token) {
    await testBooking(token);
  }
})();
