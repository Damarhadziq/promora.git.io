// Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });

    // Mobile menu toggle (if needed)
    let isMenuOpen = false;
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        // Add mobile menu logic here if needed
    }

    // Add active state to nav items
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('text-purple-600'));
            this.classList.add('text-purple-600');
        });
    });

    // Testimonial slider functionality
    let currentTestimonial = 0;
    const dots = document.querySelectorAll('.flex.justify-center button');
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            dots.forEach(d => {
                d.classList.remove('primary-color');
                d.classList.add('bg-gray-300');
            });
            dot.classList.remove('bg-gray-300');
            dot.classList.add('primary-color');
            currentTestimonial = index;
        });
    });

    // Auto-rotate testimonials every 5 seconds
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % dots.length;
        dots.forEach((d, i) => {
            if (i === currentTestimonial) {
                d.classList.remove('bg-gray-300');
                d.classList.add('primary-color');
            } else {
                d.classList.remove('primary-color');
                d.classList.add('bg-gray-300');
            }
        });
    }, 5000);

    // Add hover effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });