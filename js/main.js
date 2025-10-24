/**
 * Main JavaScript file for the portfolio website.
 * Handles theme toggling, sticky header, mobile navigation,
 * smooth scrolling, intersection observer animations, and project modals.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggler ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');

    /**
     * Applies the theme based on localStorage or system preference.
     */
    function applyTheme() {
        const isDarkMode = localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        }
    }

    /**
     * Toggles the theme and saves the preference to localStorage.
     */
    function toggleTheme() {
        const isDarkMode = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        applyTheme();
    }

    themeToggleBtn.addEventListener('click', toggleTheme);
    applyTheme(); // Apply theme on initial load

    // --- Sticky Header ---
    const header = document.getElementById('main-header');
    
    /**
     * Adds a shadow to the header when the page is scrolled.
     */
    function handleScroll() {
        if (window.scrollY > 10) {
            header.classList.add('shadow-md', 'bg-white/95', 'dark:bg-gray-900/95');
        } else {
            header.classList.remove('shadow-md', 'bg-white/95', 'dark:bg-gray-900/95');
        }
    }
    window.addEventListener('scroll', handleScroll);

    // --- Mobile Menu ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuCloseButton = document.getElementById('mobile-menu-close-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = mobileMenu.querySelectorAll('a');

    /**
     * Toggles the visibility of the mobile menu.
     */
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
    }

    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    mobileMenuCloseButton.addEventListener('click', toggleMobileMenu);
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', toggleMobileMenu);
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Intersection Observer for Scroll Animations ---
    const animatedSections = document.querySelectorAll('section[id]');
    
    /**
     * Callback function for the Intersection Observer.
     * @param {IntersectionObserverEntry[]} entries - The entries being observed.
     * @param {IntersectionObserver} observer - The observer instance.
     */
    const sectionObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve after animation to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    };

    const sectionObserver = new IntersectionObserver(sectionObserverCallback, {
        root: null, // observes intersections relative to the viewport
        threshold: 0.1, // trigger when 10% of the element is visible
    });

    animatedSections.forEach(section => {
        section.classList.add('animated-section');
        sectionObserver.observe(section);
    });

    // --- Project Modal Logic ---
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalMediaContainer = document.getElementById('modal-media-container');
    const modalCloseButton = document.getElementById('modal-close-button');
    const projectDetailButtons = document.querySelectorAll('.btn-details');

    /**
     * Opens the project modal and populates it with data.
     * @param {Event} event - The click event from the "View Details" button.
     */
    function openModal(event) {
        const card = event.target.closest('.project-card');
        const { title, description, mediaType, mediaSrc } = card.dataset;

        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalMediaContainer.innerHTML = ''; // Clear previous media

        // Dynamically create and append media element
        let mediaElement;
        if (mediaType === 'model-viewer') {
            mediaElement = document.createElement('model-viewer');
            mediaElement.setAttribute('src', mediaSrc);
            mediaElement.setAttribute('alt', title);
            mediaElement.setAttribute('auto-rotate', '');
            mediaElement.setAttribute('camera-controls', '');
            mediaElement.setAttribute('shadow-intensity', '1');
            mediaElement.style.width = '100%';
            mediaElement.style.height = '400px';
        } else if (mediaType === 'youtube') {
            mediaElement = document.createElement('iframe');
            mediaElement.setAttribute('src', mediaSrc);
            mediaElement.setAttribute('title', title);
            mediaElement.setAttribute('frameborder', '0');
            mediaElement.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            mediaElement.setAttribute('allowfullscreen', '');
            mediaElement.className = 'w-full h-full aspect-video';
        } else if (mediaType === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.setAttribute('src', mediaSrc);
            mediaElement.setAttribute('controls', '');
            mediaElement.className = 'w-full h-full rounded-lg';
        }

        if (mediaElement) {
            modalMediaContainer.appendChild(mediaElement);
        }

        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        // Add a small delay for the entrance animation
        setTimeout(() => modalContent.classList.add('scale-100'), 50);
    }

    /**
     * Closes the project modal.
     */
    function closeModal() {
        modalContent.classList.remove('scale-100');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            modalMediaContainer.innerHTML = ''; // Clean up media
        }, 300); // Match the transition duration
    }

    projectDetailButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    modalCloseButton.addEventListener('click', closeModal);

    // Close modal on background click
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close modal on 'Escape' key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
});
