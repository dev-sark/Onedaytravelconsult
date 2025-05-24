// API Configuration
const API_URL = 'http://localhost:5000/api';

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(26, 26, 26, 0.9)';
    } else {
        navbar.style.backgroundColor = 'rgba(26, 26, 26, 0.7)';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Booking form submission
document.getElementById('travelBookingForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';

    const formData = new FormData(form);
    const bookingData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
            credentials: 'include'
        });

        if (response.ok) {
            showAlert('Success!', 'Your booking has been submitted successfully. We will contact you soon!', 'success');
            form.reset();
        } else {
            const error = await response.json();
            showAlert('Error!', error.message || 'Something went wrong. Please try again.', 'error');
        }
    } catch (error) {
        showAlert('Error!', 'Network error. Please check your connection and try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Booking';
    }
});

// Contact form submission
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending...';

    const formData = new FormData(form);
    const contactData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });

        if (response.ok) {
            showAlert('Success!', 'Your message has been sent successfully!', 'success');
            form.reset();
        } else {
            const error = await response.json();
            showAlert('Error!', error.message || 'Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        showAlert('Error!', 'Network error. Please check your connection and try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
});

// Review submission
document.getElementById('reviewForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';

    const formData = new FormData(form);
    const reviewData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
            credentials: 'include'
        });

        if (response.ok) {
            showAlert('Success!', 'Your review has been submitted successfully!', 'success');
            form.reset();
            $('#reviewModal').modal('hide');
            loadReviews(); // Refresh reviews
        } else {
            const error = await response.json();
            showAlert('Error!', error.message || 'Failed to submit review. Please try again.', 'error');
        }
    } catch (error) {
        showAlert('Error!', 'Network error. Please check your connection and try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Review';
    }
});

// Load and display reviews
async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/reviews`);
        if (response.ok) {
            const reviews = await response.json();
            displayReviews(reviews);
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Display reviews in the carousel
function displayReviews(reviews) {
    const carousel = document.querySelector('#testimonialsCarousel .carousel-inner');
    if (!carousel) return;

    carousel.innerHTML = reviews.map((review, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>${review.content}</p>
                    <div class="testimonial-author">
                        <h5>${review.name}</h5>
                        <div class="rating">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Google OAuth Login
function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google`;
}

// Alert function for success/error messages
function showAlert(title, message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.innerHTML = `
        <strong>${title}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Initialize Cloudinary upload widget
const cloudinaryWidget = cloudinary.createUploadWidget({
    cloudName: 'dv2oix7gu',
    uploadPreset: 'ml_default',
    sources: ['local', 'camera'],
    multiple: false
}, (error, result) => {
    if (!error && result && result.event === "success") {
        const imageUrl = result.info.secure_url;
        document.getElementById('profileImage').value = imageUrl;
        document.getElementById('imagePreview').src = imageUrl;
        document.getElementById('imagePreview').style.display = 'block';
    }
});

// Image upload button click handler
document.getElementById('uploadImageBtn')?.addEventListener('click', () => {
    cloudinaryWidget.open();
});

// Load reviews on page load
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
});

// Image viewer modal functionality
function viewImage(imageSrc, title) {
    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
    const modalTitle = document.querySelector('#imageModal .modal-title');
    const modalImage = document.querySelector('#imageModal .modal-body img');
    
    modalTitle.textContent = title;
    modalImage.src = imageSrc;
    modalImage.alt = title;
    
    modal.show();
}

// Add animation to service cards on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease-out';
    observer.observe(card);
});
