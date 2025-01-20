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
document.getElementById('travelBookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        destination: document.getElementById('destination').value,
        dates: document.getElementById('dates').value,
        message: document.getElementById('message').value
    };

    // Here you would typically send this data to your server
    console.log('Booking request:', formData);
    alert('Thank you for your booking request! We will contact you shortly.');
    this.reset();
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
