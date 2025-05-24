// Admin Dashboard JavaScript

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check if admin is logged in
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
    }
}

// Initialize DataTables
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeTables();
    loadStatistics();
    setupEventListeners();
});

// Initialize all DataTables
function initializeTables() {
    $('#bookingsTable').DataTable();
    $('#usersTable').DataTable();
    $('#reviewsTable').DataTable();
    loadTableData();
}

// Load data for all tables
async function loadTableData() {
    await Promise.all([
        loadBookings(),
        loadUsers(),
        loadReviews()
    ]);
}

// Load Bookings
async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const bookings = await response.json();
        
        const tbody = document.getElementById('bookingsTableBody');
        tbody.innerHTML = '';
        
        bookings.forEach(booking => {
            tbody.innerHTML += `
                <tr>
                    <td>${booking._id}</td>
                    <td>${booking.name}</td>
                    <td>${booking.email}</td>
                    <td>${booking.phone}</td>
                    <td>${booking.destination}</td>
                    <td>${new Date(booking.date).toLocaleDateString()}</td>
                    <td>
                        <span class="badge bg-${getStatusColor(booking.status)}">
                            ${booking.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewBooking('${booking._id}')">
                            View
                        </button>
                        <button class="btn btn-sm btn-success" onclick="updateStatus('${booking._id}')">
                            Update
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        showAlert('Error loading bookings', 'danger');
    }
}

// Load Users
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/auth/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const users = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user._id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editUser('${user._id}')">
                            Edit
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Error loading users', 'danger');
    }
}

// Load Reviews
async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/reviews`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const reviews = await response.json();
        
        const tbody = document.getElementById('reviewsTableBody');
        tbody.innerHTML = '';
        
        reviews.forEach(review => {
            tbody.innerHTML += `
                <tr>
                    <td>${review._id}</td>
                    <td>${review.user.name}</td>
                    <td>${'⭐'.repeat(review.rating)}</td>
                    <td>${review.content}</td>
                    <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteReview('${review._id}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        showAlert('Error loading reviews', 'danger');
    }
}

// Load Statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const stats = await response.json();
        
        // Update statistics cards
        document.getElementById('totalBookings').textContent = stats.totalBookings;
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('avgRating').textContent = stats.averageRating.toFixed(1);
        
        // Create charts
        createBookingsChart(stats.bookingsByMonth);
        createRatingsChart(stats.ratingDistribution);
    } catch (error) {
        console.error('Error loading statistics:', error);
        showAlert('Error loading statistics', 'danger');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.sidebar-nav li').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.id === 'logoutBtn') {
                logout();
                return;
            }
            
            // Remove active class from all tabs
            document.querySelectorAll('.sidebar-nav li').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
}

// Utility Functions
function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'confirmed': 'success',
        'cancelled': 'danger',
        'completed': 'info'
    };
    return colors[status.toLowerCase()] || 'secondary';
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.admin-main').prepend(alert);
    setTimeout(() => alert.remove(), 5000);
}

// Logout Function
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}

// Charts
function createBookingsChart(data) {
    const ctx = document.getElementById('bookingsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Bookings per Month',
                data: Object.values(data),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });
}

function createRatingsChart(data) {
    const ctx = document.getElementById('ratingsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Rating Distribution',
                data: Object.values(data),
                backgroundColor: 'rgb(54, 162, 235)'
            }]
        }
    });
}
