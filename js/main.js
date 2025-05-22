// Booking Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('travelBookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                whatsapp: document.getElementById('whatsapp').value,
                destination: document.getElementById('destination').value,
                departureDate: document.getElementById('departureDate').value,
                returnDate: document.getElementById('returnDate').value,
                travelPurpose: document.getElementById('travelPurpose').value,
                travelers: document.getElementById('travelers').value,
                budget: document.getElementById('budget').value,
                message: document.getElementById('message').value,
                status: 'pending',
                bookingId: generateBookingId(),
                bookingDate: new Date().toISOString()
            };

            // Save booking to localStorage (in real app, this would be sent to a server)
            saveBooking(formData);
            
            // Show success message
            alert('Thank you for your booking request! We will contact you within 24 hours.');
            bookingForm.reset();
        });
    }
});

// Admin Dashboard Functionality
if (document.querySelector('.admin-dashboard')) {
    // Load bookings into table
    loadBookings();
    
    // Handle destination management
    setupDestinationManagement();
}

// Utility Functions
function generateBookingId() {
    return 'BK' + Date.now().toString().slice(-6);
}

function saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const tableBody = document.querySelector('#bookingsTable tbody');
    
    if (tableBody) {
        tableBody.innerHTML = bookings.map(booking => `
            <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.name}</td>
                <td>${booking.email}</td>
                <td>${booking.phone}</td>
                <td>${booking.destination}</td>
                <td>${booking.departureDate}</td>
                <td>
                    <span class="booking-status status-${booking.status}">
                        ${booking.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewBookingDetails('${booking.bookingId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="updateBookingStatus('${booking.bookingId}')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function viewBookingDetails(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (booking) {
        const detailsContainer = document.querySelector('.booking-details');
        detailsContainer.innerHTML = `
            <div class="booking-detail-group">
                <h6>Personal Information</h6>
                <p><strong>Name:</strong> ${booking.name}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>WhatsApp:</strong> ${booking.whatsapp || 'Not provided'}</p>
            </div>
            <div class="booking-detail-group">
                <h6>Travel Details</h6>
                <p><strong>Destination:</strong> ${booking.destination}</p>
                <p><strong>Departure:</strong> ${booking.departureDate}</p>
                <p><strong>Return:</strong> ${booking.returnDate || 'Not specified'}</p>
                <p><strong>Purpose:</strong> ${booking.travelPurpose}</p>
                <p><strong>Travelers:</strong> ${booking.travelers}</p>
                <p><strong>Budget:</strong> $${booking.budget}</p>
            </div>
            <div class="booking-detail-group">
                <h6>Additional Information</h6>
                <p>${booking.message || 'No additional information provided.'}</p>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('viewBookingModal'));
        modal.show();
    }
}

function updateBookingStatus(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = bookings.findIndex(b => b.bookingId === bookingId);
    
    if (bookingIndex !== -1) {
        const newStatus = bookings[bookingIndex].status === 'pending' ? 'confirmed' : 'pending';
        bookings[bookingIndex].status = newStatus;
        localStorage.setItem('bookings', JSON.stringify(bookings));
        loadBookings();
    }
}

// Destination Management
function setupDestinationManagement() {
    const destinationForm = document.getElementById('destinationForm');
    if (destinationForm) {
        destinationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            saveDestination(formData);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addDestinationModal'));
            modal.hide();
            loadDestinations();
        });
    }
}

function saveDestination(formData) {
    let destinations = JSON.parse(localStorage.getItem('destinations')) || [];
    const newDestination = {
        id: 'DEST' + Date.now().toString().slice(-6),
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        mediaType: formData.get('mediaType'),
        mediaUrl: URL.createObjectURL(formData.get('media')),
        dateAdded: new Date().toISOString()
    };
    
    destinations.push(newDestination);
    localStorage.setItem('destinations', JSON.stringify(destinations));
}

function loadDestinations() {
    const destinations = JSON.parse(localStorage.getItem('destinations')) || [];
    const gallery = document.getElementById('adminDestinationsGallery');
    
    if (gallery) {
        gallery.innerHTML = destinations.map(dest => `
            <div class="col-md-4">
                <div class="destination-card admin-destination-card">
                    <div class="destination-media">
                        ${dest.mediaType === 'video' 
                            ? `<video controls><source src="${dest.mediaUrl}" type="video/mp4"></video>`
                            : `<img src="${dest.mediaUrl}" alt="${dest.name}" class="img-fluid">`
                        }
                        <span class="media-type-badge">
                            <i class="fas fa-${dest.mediaType === 'video' ? 'video' : 'image'}"></i>
                            ${dest.mediaType === 'video' ? 'Video' : 'Photo'}
                        </span>
                    </div>
                    <div class="destination-info">
                        <h3>${dest.name}</h3>
                        <p>${dest.description}</p>
                        <div class="price">From $${dest.price}</div>
                    </div>
                    <div class="admin-destination-actions">
                        <button onclick="editDestination('${dest.id}')" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteDestination('${dest.id}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Login Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Login Type Switching
    const loginTypeBtns = document.querySelectorAll('.login-type-btn');
    const userForm = document.getElementById('userLoginForm');
    const adminForm = document.getElementById('adminLoginForm');

    if (loginTypeBtns.length) {
        loginTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active state
                loginTypeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Show/hide appropriate form
                if (this.dataset.type === 'user') {
                    userForm.classList.remove('d-none');
                    adminForm.classList.add('d-none');
                } else {
                    adminForm.classList.remove('d-none');
                    userForm.classList.add('d-none');
                }
            });
        });
    }

    // Handle form submissions
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            
            // In a real application, this would be a server request
            localStorage.setItem('userLoggedIn', 'true');
            window.location.href = 'index.html';
        });
    }

    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            // In a real application, this would be a server request
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin-dashboard.html';
            } else {
                alert('Invalid admin credentials');
            }
        });
    }

    // Password Toggle Functionality
    const toggleBtns = document.querySelectorAll('[id^="toggle"]');
    if (toggleBtns.length) {
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const passwordInput = this.previousElementSibling;
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }
});

// Handle Review Form Rating
document.addEventListener('DOMContentLoaded', function() {
    const ratingStars = document.querySelectorAll('.rating-input i');
    let currentRating = 0;

    // Handle star hover and click
    ratingStars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = this.dataset.rating;
            highlightStars(rating);
        });

        star.addEventListener('mouseleave', function() {
            highlightStars(currentRating);
        });

        star.addEventListener('click', function() {
            currentRating = this.dataset.rating;
            highlightStars(currentRating);
        });
    });

    function highlightStars(rating) {
        ratingStars.forEach(star => {
            const starRating = star.dataset.rating;
            if (starRating <= rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    // Handle Review Form Submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.closest('.modal').querySelector('.btn-primary').addEventListener('click', function() {
            if (reviewForm.checkValidity()) {
                // Here you would typically send the data to your backend
                const formData = new FormData(reviewForm);
                formData.append('rating', currentRating);
                
                // For demo purposes, we'll just show a success message
                alert('Thank you for your review! It will be published after moderation.');
                
                // Reset form and close modal
                reviewForm.reset();
                currentRating = 0;
                highlightStars(0);
                bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
            } else {
                reviewForm.reportValidity();
            }
        });
    }

    // Initialize testimonials carousel
    new bootstrap.Carousel(document.getElementById('testimonialsCarousel'), {
        interval: 5000,
        touch: true
    });
});
