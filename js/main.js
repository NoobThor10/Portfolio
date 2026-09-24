/**
 * Yashvardhan Samsukha — Portfolio Script
 * Pure Vanilla JavaScript (Zero External Library Bloat)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initAudioEngine();
  initCustomCursor();
  initCanvasBackground();
  initTypewriter();
  initNavbar();
  initTiltCards();
  initProjectFilters();
  initModals();
  initTerminal();
  initContactActions();
  initScrollAnimations();
  initFooterClock();
});

/* ==========================================================================
   1. THEME ENGINE
   ========================================================================== */
function initThemeEngine() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  const themeOptBtns = document.querySelectorAll('.theme-opt-btn');
  const htmlEl = document.documentElement;

  // Load saved theme or default to cyberpunk
  const savedTheme = localStorage.getItem('ys_portfolio_theme') || 'cyberpunk';
  applyTheme(savedTheme);

  if (themeToggleBtn && themeDropdown) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('open');
      playAudio('click');
    });

    document.addEventListener('click', (e) => {
      if (!themeDropdown.contains(e.target) && e.target !== themeToggleBtn) {
        themeDropdown.classList.remove('open');
      }
    });
  }

  themeOptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.getAttribute('data-theme-val');
      applyTheme(selectedTheme);
      if (themeDropdown) themeDropdown.classList.remove('open');
      playAudio('themeSwitch');
      showToast(`Switched theme to ${btn.innerText.trim()}`);
    });
  });

  function applyTheme(themeName) {
    if (themeName === 'cyberpunk') {
      htmlEl.removeAttribute('data-theme');
    } else {
      htmlEl.setAttribute('data-theme', themeName);
    }
    localStorage.setItem('ys_portfolio_theme', themeName);

    themeOptBtns.forEach(b => {
      if (b.getAttribute('data-theme-val') === themeName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Notify canvas particles of color changes
    if (window.updateCanvasColors) {
      window.updateCanvasColors();
    }
  }

  // Expose to global for terminal
  window.setThemeFromTerminal = applyTheme;
}

/* ==========================================================================
   2. WEB AUDIO SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initAudioEngine() {
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  const savedSound = localStorage.getItem('ys_portfolio_sound');
  soundEnabled = savedSound === 'true';
  updateSoundUI();

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      soundEnabled = !soundEnabled;
      localStorage.setItem('ys_portfolio_sound', soundEnabled);
      updateSoundUI();

      if (soundEnabled) {
        playAudio('themeSwitch');
        showToast('Sound Effects Enabled 🔊');
      } else {
        showToast('Sound Effects Muted 🔇');
      }
    });
  }

  function updateSoundUI() {
    if (!soundIcon) return;
    if (soundEnabled) {
      soundIcon.className = 'fas fa-volume-up';
      soundIcon.style.color = 'var(--primary)';
    } else {
      soundIcon.className = 'fas fa-volume-mute';
      soundIcon.style.color = 'var(--text-muted)';
    }
  }
}

function playAudio(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'themeSwitch') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.14); // G5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.08);
      osc.frequency.setValueAtTime(659.25, now + 0.16);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'key') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  } catch (err) {
    // Graceful fallback if autoplay policies block audio
  }
}

/* ==========================================================================
   3. CUSTOM CURSOR
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.custom-cursor-dot');
  const ring = document.querySelector('.custom-cursor-ring');

  if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover state on interactive elements
  const hoverTargets = 'a, button, .project-card, .highlight-card, .fact-pill, .skill-pill, .cert-card, .filter-btn';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ==========================================================================
   4. CANVAS INTERACTIVE CONSTELLATION PARTICLES
   ========================================================================== */
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  const particleCount = window.innerWidth < 768 ? 40 : 85;
  const connectionDistance = 140;

  let pR = 0, pG = 245, pB = 255; // default primary rgb

  window.updateCanvasColors = () => {
    const computed = getComputedStyle(document.documentElement);
    const rgbStr = computed.getPropertyValue('--primary-rgb').trim();
    if (rgbStr) {
      const parts = rgbStr.split(',').map(n => parseInt(n.trim(), 10));
      if (parts.length === 3) {
        pR = parts[0];
        pG = parts[1];
        pB = parts[2];
      }
    }
  };
  window.updateCanvasColors();

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  let mouse = { x: null, y: null, radius: 180 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.75;
      this.vy = (Math.random() - 0.5) * 0.75;
      this.radius = Math.random() * 2 + 1;
      this.baseAlpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pR}, ${pG}, ${pB}, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${pR}, ${pG}, ${pB}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================================================
   5. TYPEWRITER EFFECT
   ========================================================================== */
function initTypewriter() {
  const target = document.getElementById('typewriter-text');
  if (!target) return;

  const roles = [
    'Full-Stack & Mobile App Developer',
    'Flutter & Android Engineer',
    'Generative AI & Python Specialist',
    'MCA Scholar @ MIT-WPU (GPA 7.70)',
    'Passionate CS Problem Solver'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 75;

  function type() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      target.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 35;
    } else {
      target.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      typingSpeed = 2000; // Hold at full text
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   6. NAVBAR & MOBILE DRAWER
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
      if (backToTop) backToTop.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      if (backToTop) backToTop.classList.remove('visible');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      playAudio('click');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        navMenu.classList.remove('open');
        playAudio('click');
      });
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playAudio('click');
    });
  }
}

/* ==========================================================================
   7. 3D CARD TILT EFFECT (Vanilla Math)
   ========================================================================== */
function initTiltCards() {
  const tiltElements = document.querySelectorAll('.tilt-card, .avatar-card');

  tiltElements.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   8. PROJECT FILTER SYSTEM
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playAudio('click');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue || category.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   9. MODALS SYSTEM (Project Deep Dives & Resume Viewer)
   ========================================================================== */
const projectDetails = {
  nova: {
    title: 'NOVA — Fashion E-Commerce Android App',
    category: 'Mobile App Development',
    tags: ['Flutter', 'Firebase Auth', 'Cloud Firestore', 'Cloud Storage', 'Dart', 'REST APIs'],
    image: 'assets/images/nova.jpg',
    summary: 'A production-grade mobile shopping experience engineered with Flutter and Firebase. Features a high-converting UI with complete retail user flow, real-time discount validation, and scalable feature architecture.',
    highlights: [
      'Engineered complete e-commerce lifecycle: user authentication, dynamic catalog browsing, animated wishlist, dynamic cart calculations, checkout pipeline, and order history tracking.',
      'Developed real-time coupon code discount validation engine with instant recalculation of subtotals, taxes, and shipping.',
      'Implemented clean, modular, feature-based architecture separating presentation, domain, and data layers to ensure maintainability and testability.',
      'Optimized image caching and pagination to reduce mobile data usage by over 40%.'
    ],
    github: 'https://github.com/NoobThor10'
  },
  tunemap: {
    title: 'TuneMap — Mood-Based Music Discovery Web App',
    category: 'AI & Web Engineering',
    tags: ['Python', 'Flask', 'Spotify Web API', 'SQLite', 'Apple Music API', 'HTML5/CSS3'],
    image: 'assets/images/tunemap.jpg',
    summary: 'A sentiment-driven music discovery web app that translates user emotional states into finely tuned music playlists with real-time audio previews and one-click saving.',
    highlights: [
      'Built a mood-to-music mapping algorithm integrating with Spotify Web API and Apple Music to query curated tracks corresponding to emotional valence and energy.',
      'Integrated instant lyrics synchronization and 30-second audio stream previews directly within the browser.',
      'Implemented OAuth2 authentication for Spotify accounts, enabling one-click export and synchronization of generated playlists to user libraries.',
      'Designed responsive glassmorphism UI with reactive audio waveforms that visualize playing tracks.'
    ],
    github: 'https://github.com/NoobThor10'
  },
  voice_assistant: {
    title: 'AI Voice Assistant',
    category: 'AI & Multithreading',
    tags: ['Python', 'SpeechRecognition', 'PyAudio', 'Threading', 'REST APIs', 'gTTS'],
    image: 'assets/images/voice_assistant.jpg',
    summary: 'An intelligent desktop voice assistant capable of hands-free task automation, background stopwatch/timer execution, and live knowledge retrieval.',
    highlights: [
      'Engineered real-time speech recognition and text-to-speech feedback pipeline with sub-second response latency.',
      'Employed Python multithreading to manage concurrent stopwatch, countdown timers, and alarms in the background without freezing voice listening threads.',
      'Integrated external REST APIs for live weather updates, Wikipedia summaries, news headlines, and computational lookups.',
      'Handled over 100+ weekly voice interactions with robust error handling and acoustic noise reduction.'
    ],
    github: 'https://github.com/NoobThor10'
  },
  cinema: {
    title: 'Cinema Management System',
    category: 'Enterprise Systems & Database',
    tags: ['C#', '.NET', 'MySQL', 'Relational DB Design', 'Stored Procedures', 'Reporting'],
    image: 'assets/images/cinema.jpg',
    summary: 'A high-throughput cinema booking and administrative management system capable of processing 300+ daily reservations with real-time seat matrices.',
    highlights: [
      'Engineered interactive real-time theater seat grid with instant color-coded visual feedback for available, reserved, and selected seats.',
      'Designed normalized MySQL schema with ACID transaction isolation to prevent double-booking of seats during concurrent checkouts.',
      'Automated digital ticket issuance with unique barcode encoding, showtime auditing, and daily revenue generation reports.',
      'Streamlined ticketing workflow, reducing average box-office booking time from 2 minutes to under 35 seconds.'
    ],
    github: 'https://github.com/NoobThor10'
  },
  caretail: {
    title: 'CareTail — Pet Care Mobile App',
    category: 'Mobile App Development',
    tags: ['Java', 'Android SDK', 'SQLite', 'Material Design', 'Notifications', 'Mobile QA'],
    image: 'assets/images/caretail.jpg',
    summary: 'A personalized veterinary and pet care companion mobile app offering tailored wellness routines, vaccination schedules, and dietary guidance.',
    highlights: [
      'Built tailored feeding schedule algorithms and nutrition recommendations calculated according to pet breed, weight, age, and existing health conditions.',
      'Created local SQLite database for offline-first tracking of medical history, immunization dates, and appointment logs.',
      'Implemented Android AlarmManager and push notification services to ensure pet parents never miss medication or feeding windows.',
      'Designed intuitive Material Design interface with joyful animations and pet photo gallery.'
    ],
    github: 'https://github.com/NoobThor10'
  }
};

function initModals() {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBody = document.getElementById('modal-body');

  function openModal(contentHtml) {
    if (!modalOverlay || !modalBody) return;
    modalBody.innerHTML = contentHtml;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    playAudio('click');
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    playAudio('click');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Project Modal Triggers
  document.querySelectorAll('.project-deepdive-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-project');
      const data = projectDetails[projKey];
      if (!data) return;

      const html = `
        <div style="margin-bottom: 1.5rem;">
          <div style="border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.5rem; max-height: 280px;">
            <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <span class="badge" style="background: rgba(var(--primary-rgb), 0.15); color: var(--primary); margin-bottom: 0.5rem;">${data.category}</span>
          <h2 style="font-family: var(--font-display); font-size: 1.75rem; margin-top: 0.4rem; margin-bottom: 1rem;">${data.title}</h2>
          <p style="color: var(--text-muted); line-height: 1.7; font-size: 1rem; margin-bottom: 1.5rem;">${data.summary}</p>
          
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; margin-bottom: 0.75rem; color: var(--text-main);">Technical Architecture & Key Highlights:</h3>
          <ul style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.75rem;">
            ${data.highlights.map(h => `
              <li style="display: flex; gap: 0.75rem; font-size: 0.95rem; color: var(--text-muted); line-height: 1.6;">
                <i class="fas fa-check-circle" style="color: var(--primary); margin-top: 0.25rem;"></i>
                <span>${h}</span>
              </li>
            `).join('')}
          </ul>

          <h3 style="font-family: var(--font-display); font-size: 1.15rem; margin-bottom: 0.75rem; color: var(--text-main);">Tech Stack Used:</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem;">
            ${data.tags.map(t => `<span class="badge" style="background: rgba(255,255,255,0.06);">${t}</span>`).join('')}
          </div>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
              <i class="fab fa-github"></i> View GitHub Repository
            </a>
            <button class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">
              Close Preview
            </button>
          </div>
        </div>
      `;

      openModal(html);
    });
  });

  // Resume Modal Trigger
  const resumeBtn = document.getElementById('view-resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const resumeHtml = `
        <div class="resume-modal-content">
          <div class="resume-header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <h1 class="resume-name">YASHVARDHAN SAMSUKHA</h1>
                <p style="color: var(--text-muted); font-size: 1.05rem; margin-top: 0.25rem;">Pune, Maharashtra | yashsamsukha10@gmail.com | +91 7020961022</p>
                <p style="color: var(--primary); font-family: var(--font-code); font-size: 0.9rem; margin-top: 0.25rem;">
                  <a href="https://github.com/NoobThor10" target="_blank" style="color: var(--primary); text-decoration: underline;">GitHub: NoobThor10</a> &bull; 
                  <a href="https://www.linkedin.com/in/yashvardhan-samsukha" target="_blank" style="color: var(--primary); text-decoration: underline;">LinkedIn Profile</a>
                </p>
              </div>
              <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-primary" onclick="window.print()" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;">
                  <i class="fas fa-print"></i> Print / Save PDF
                </button>
              </div>
            </div>
          </div>

          <div class="resume-section">
            <h3 class="resume-sec-title">Education</h3>
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span>MIT World Peace University, Pune</span>
                <span>Aug 2024 – Jun 2026</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: var(--primary);">
                <span>Master of Computer Applications (MCA)</span>
                <span>GPA: 7.70 / 10</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                <strong>Relevant Coursework:</strong> Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Software Engineering, Mobile Application Development, Artificial Intelligence & Machine Learning, Cloud Computing, Computer Networks.
              </p>
            </div>

            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span>Savitribai Phule Pune University (SPPU), Pune</span>
                <span>Jul 2021 – Mar 2024</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: var(--primary);">
                <span>BBA (Computer Applications)</span>
                <span>CGPA: 9.05 / 10 (Distinction)</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                <strong>Relevant Coursework:</strong> Programming Fundamentals, Data Structures, Database Management Systems, Web Technologies, Statistics, Financial Accounting, Business Communication, Principles of Management.
              </p>
            </div>

            <div style="display: flex; gap: 2rem; font-size: 0.88rem; color: var(--text-muted);">
              <span><strong>HSC 12th Board:</strong> 80.16% (2021 | Pune, MH)</span>
              <span><strong>ICSE 10th Board:</strong> 81.40% (2019 | Pune, MH)</span>
            </div>
          </div>

          <div class="resume-section">
            <h3 class="resume-sec-title">Work Experience</h3>
            <div>
              <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span>Junior Software Engineer — Meticulous Invention</span>
                <span>Jan 2026 – Aug 2026</span>
              </div>
              <ul style="margin-top: 0.5rem; font-size: 0.88rem; color: var(--text-muted); padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem; list-style: disc;">
                <li>Contributed to mobile app development and led User Acceptance Testing (UAT) cycles to validate software quality and functionality before release.</li>
                <li>Partnered with the development team to identify, report, and resolve bugs across multiple testing phases, improving release stability.</li>
                <li>Executed and validated test cases against functional requirements, ensuring accurate app behavior prior to deployment.</li>
              </ul>
            </div>
          </div>

          <div class="resume-section">
            <h3 class="resume-sec-title">Projects</h3>
            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.88rem;">
              <div>
                <strong>• NOVA-Fashion E-Commerce Android App</strong> | <em>Flutter, Firebase, Dart</em><br>
                <span style="color: var(--text-muted);">Built a full-featured Android e-commerce app (auth, catalog, wishlist, cart, checkout, orders) with real-time coupon validation and a scalable, feature-based architecture.</span>
              </div>
              <div>
                <strong>• TuneMap - Mood-Based Music Discovery Web App</strong> | <em>Python, Flask, Spotify Web API, SQLite</em><br>
                <span style="color: var(--text-muted);">Built a mood-based web app that turns emotions into curated playlists via Spotify/Apple Music, with lyrics fetching, audio previews, and one-click playlist saving.</span>
              </div>
              <div>
                <strong>• AI Voice Assistant</strong> | <em>Python, Speech Recognition, Threading, APIs</em><br>
                <span style="color: var(--text-muted);">Engineered a voice assistant with stopwatch/timer functionality, handling 100+ user interactions weekly using speech recognition and multithreading.</span>
              </div>
              <div>
                <strong>• Cinema Management System</strong> | <em>C#, MySQL</em><br>
                <span style="color: var(--text-muted);">Developed a cinema management system processing 300+ daily bookings with real-time seat selection and a streamlined ticketing interface.</span>
              </div>
              <div>
                <strong>• CareTail — Pet Care Mobile App</strong> | <em>Java/Android, SQLite</em><br>
                <span style="color: var(--text-muted);">Built personalized pet care routines with feeding schedules and nutrition recommendations tailored by breed, age, and health condition.</span>
              </div>
            </div>
          </div>

          <div class="resume-section">
            <h3 class="resume-sec-title">Skills</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.7;">
              <strong>Programming Languages:</strong> Java, Python, C++, SQL, Dart, JavaScript<br>
              <strong>Mobile & App Development:</strong> Flutter, Android Development, Firebase (Auth, Firestore, Cloud Storage), REST APIs, State Management<br>
              <strong>Data & Analytics:</strong> Data Analysis, SQL (Queries, Joins, Aggregations), Excel, Data Visualization<br>
              <strong>CS Fundamentals:</strong> Data Structures & Algorithms, OOP, DBMS, Software Design Principles<br>
              <strong>Tools & Platforms:</strong> Git/GitHub, Android Studio, VS Code, Postman<br>
              <strong>AI & Emerging Tech:</strong> Generative AI, Prompt Engineering, Oracle Cloud GenAI
            </p>
          </div>

          <div class="resume-section">
            <h3 class="resume-sec-title">Certifications</h3>
            <ul style="font-size: 0.88rem; color: var(--text-muted); padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem; list-style: disc;">
              <li><strong>Oracle:</strong> Oracle Cloud Infrastructure 2025 Certified Generative AI Professional (Nov 2025)</li>
              <li><strong>Udemy:</strong> Complete Full Stack Web Development Bootcamp (Mar 2026)</li>
              <li><strong>Infosys Springboard:</strong> JavaScript Essentials (2025); C++ Programming Certification (2024)</li>
              <li><strong>Cognitive Class:</strong> Python and Data Science Certification (2025)</li>
              <li><strong>Cybersecurity:</strong> CISEH (Certified Information Security and Ethical Hacking); Certified Penetration Tester (2021)</li>
            </ul>
          </div>
        </div>
      `;
      openModal(resumeHtml);
    });
  }
}

/* ==========================================================================
   10. INTERACTIVE DEVELOPER TERMINAL
   ========================================================================== */
function initTerminal() {
  const termBody = document.getElementById('terminal-body');
  const termInput = document.getElementById('terminal-input');
  const termLauncherBtn = document.getElementById('terminal-launcher-btn');

  if (!termInput || !termBody) return;

  const commandHistory = [];
  let historyIdx = -1;

  if (termLauncherBtn) {
    termLauncherBtn.addEventListener('click', () => {
      const termSection = document.getElementById('terminal-section');
      if (termSection) {
        termSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => termInput.focus(), 600);
      }
      playAudio('click');
    });
  }

  const commands = {
    help: `Available commands:
  <span class="cyan">about</span>          - Yashvardhan's background & career focus
  <span class="cyan">skills</span>         - Full programming stack and tools
  <span class="cyan">projects</span>       - View featured projects with tech stacks
  <span class="cyan">experience</span>     - Work experience at Meticulous Invention
  <span class="cyan">education</span>      - Degrees, CGPA & academic record
  <span class="cyan">certs</span>          - Industry certifications & credentials
  <span class="cyan">contact</span>        - Email, phone, and social handles
  <span class="cyan">theme [name]</span>   - Switch themes: cyberpunk | cosmic | matrix | sunset
  <span class="cyan">matrix</span>         - Trigger the Matrix digital rain simulation
  <span class="cyan">clear</span>          - Clear terminal console`,

    about: `<span class="green">Yashvardhan Samsukha</span> — Software Engineer & MCA Scholar
Location: Pune, Maharashtra, India
Specialization: Mobile Applications (Flutter/Android), Web Systems (Python/Flask), and Generative AI.
Academic: MCA candidate at MIT World Peace University (7.70 GPA); SPPU graduate (9.05 CGPA).`,

    skills: `<span class="purple">Programming Languages:</span>  Java, Python, C++, SQL, Dart, JavaScript
<span class="cyan">Mobile & Cloud:</span>         Flutter, Android SDK, Firebase (Auth/Firestore), REST APIs
<span class="yellow">Data & Analytics:</span>       Data Analysis, SQL Joins/Aggregations, Excel, Data Viz
<span class="green">CS Core:</span>                DSA, OOP, DBMS, Software Engineering, Networks
<span class="pink">AI & Emerging Tech:</span>     Generative AI, Prompt Engineering, Oracle Cloud GenAI`,

    projects: `<span class="cyan">1. NOVA</span> [Flutter, Firebase, Dart] - Fashion E-Commerce Android App
<span class="green">2. TuneMap</span> [Python, Flask, Spotify API] - Mood-Based Music Discovery Web App
<span class="yellow">3. AI Voice Assistant</span> [Python, Threading] - Multithreaded Speech Automation
<span class="purple">4. Cinema Management System</span> [C#, MySQL] - 300+ Daily Ticket Engine
<span class="pink">5. CareTail</span> [Java, Android, SQLite] - Smart Pet Nutrition & Routine App`,

    experience: `<span class="green">Junior Software Engineer</span> @ <span class="cyan">Meticulous Invention</span> (Jan 2026 – Aug 2026)
• Spearheaded mobile application development and User Acceptance Testing (UAT).
• Partnered cross-functionally to isolate, report, and squash bugs across release cycles.
• Executed robust test suites to ensure zero regression defects prior to deployment.`,

    education: `<span class="cyan">MIT World Peace University, Pune</span> (Aug 2024 – Jun 2026)
  Master of Computer Applications (MCA) | GPA: 7.70 / 10

<span class="green">Savitribai Phule Pune University (SPPU), Pune</span> (Jul 2021 – Mar 2024)
  BBA (Computer Applications) | CGPA: 9.05 / 10 (Distinction)

<span class="yellow">Board Examinations:</span>
  HSC 12th Grade: 80.16% (2021) | ICSE 10th Grade: 81.40% (2019)`,

    certs: `• <span class="cyan">Oracle Cloud Infrastructure 2025</span> Certified Generative AI Professional
• <span class="purple">Udemy:</span> Complete Full Stack Web Development Bootcamp (2026)
• <span class="green">Infosys Springboard:</span> JavaScript Essentials (2025) & C++ (2024)
• <span class="yellow">Cognitive Class:</span> Python and Data Science Certification (2025)
• <span class="pink">Cybersecurity:</span> CISEH Ethical Hacking & Certified Penetration Tester (2021)`,

    contact: `Email:    <span class="cyan">yashsamsukha10@gmail.com</span>
Phone:    <span class="green">+91 7020961022</span>
GitHub:   <span class="yellow">https://github.com/NoobThor10</span>
Location: <span class="purple">Pune, Maharashtra, India</span>`,

    easteregg: `<span class="pink">🎉 You found the hidden Easter egg! Here is a developer mantra:</span>
"Good code is its own best documentation. As you're about to add a comment, ask yourself, 'How can I improve the code so that this comment isn't needed?'"`,

    sudo: `<span class="yellow">Nice try! Yashvardhan has restricted root access to authorized personnel only. 😉</span>`,
    coffee: `☕ Here's a fresh cup of coffee! Now back to shipping features.`
  };

  termInput.addEventListener('keydown', (e) => {
    playAudio('key');

    if (e.key === 'Enter') {
      const fullCmd = termInput.value.trim();
      termInput.value = '';

      if (!fullCmd) return;

      commandHistory.push(fullCmd);
      historyIdx = commandHistory.length;

      // Echo command
      appendOutput(`<span class="term-prompt">yash@terminal:~$</span> ${escapeHtml(fullCmd)}`);

      const parts = fullCmd.toLowerCase().split(' ');
      const mainCmd = parts[0];
      const arg = parts[1];

      if (mainCmd === 'clear') {
        termBody.innerHTML = '';
        return;
      }

      if (mainCmd === 'matrix') {
        runMatrixRain();
        return;
      }

      if (mainCmd === 'theme') {
        if (['cyberpunk', 'cosmic', 'matrix', 'sunset'].includes(arg)) {
          window.setThemeFromTerminal(arg);
          appendOutput(`<span class="green">✓ Switched theme to '${arg}'.</span>`);
        } else {
          appendOutput(`<span class="yellow">Usage: theme [cyberpunk | cosmic | matrix | sunset]</span>`);
        }
        return;
      }

      if (commands[mainCmd]) {
        appendOutput(commands[mainCmd]);
      } else {
        appendOutput(`<span class="yellow">Command not recognized: '${escapeHtml(fullCmd)}'. Type <span class="cyan">'help'</span> for list of commands.</span>`);
      }
    } else if (e.key === 'ArrowUp') {
      if (historyIdx > 0) {
        historyIdx--;
        termInput.value = commandHistory[historyIdx] || '';
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIdx < commandHistory.length - 1) {
        historyIdx++;
        termInput.value = commandHistory[historyIdx] || '';
      } else {
        historyIdx = commandHistory.length;
        termInput.value = '';
      }
      e.preventDefault();
    }
  });

  function appendOutput(html) {
    const div = document.createElement('div');
    div.className = 'term-output';
    div.innerHTML = html;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function runMatrixRain() {
    appendOutput('<span class="green">Entering the Matrix... Wake up, Neo. (Rain running for 4 seconds)</span>');
    let count = 0;
    const interval = setInterval(() => {
      let line = '';
      for (let i = 0; i < 40; i++) {
        const char = String.fromCharCode(33 + Math.floor(Math.random() * 90));
        line += `<span style="color: hsl(${120 + Math.random() * 40}, 100%, ${40 + Math.random() * 50}%);">${char}</span> `;
      }
      appendOutput(line);
      count++;
      if (count > 12) {
        clearInterval(interval);
        appendOutput('<span class="cyan">Matrix session terminated. System operational.</span>');
      }
    }, 150);
  }
}

/* ==========================================================================
   11. CONTACT ACTIONS & TOASTS
   ========================================================================== */
function initContactActions() {
  // Copy Email Buttons
  document.querySelectorAll('.copy-email-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'yashsamsukha10@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email copied to clipboard: ' + email);
        playAudio('success');
      }).catch(() => {
        showToast('Email: ' + email);
      });
    });
  });

  // Copy Phone Buttons
  document.querySelectorAll('.copy-phone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = '7020961022';
      navigator.clipboard.writeText(phone).then(() => {
        showToast('Phone number copied: ' + phone);
        playAudio('success');
      }).catch(() => {
        showToast('Phone: ' + phone);
      });
    });
  });

  // Contact Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending message...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        showToast('Message sent successfully! Yashvardhan will get back to you shortly.');
        playAudio('success');
      }, 1200);
    });
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ==========================================================================
   12. SCROLL ANIMATIONS (IntersectionObserver)
   ========================================================================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-header, .glass-card, .exp-card, .edu-card, .cert-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}

/* ==========================================================================
   13. FOOTER LIVE CLOCK (Pune IST)
   ========================================================================== */
function initFooterClock() {
  const clockEl = document.getElementById('footer-clock');
  if (!clockEl) return;

  function updateClock() {
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const timeStr = new Intl.DateTimeFormat('en-US', options).format(new Date());
    clockEl.innerHTML = `<i class="fas fa-clock"></i> Pune, India: <span>${timeStr} IST</span>`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}
