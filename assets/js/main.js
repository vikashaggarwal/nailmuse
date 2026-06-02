/* ===================================================
   NAIL MUSE — Main JavaScript
=================================================== */

// ── Announcement Bar ───────────────────────────
const annBar = document.getElementById('announcement-bar');
const annClose = document.querySelector('.ann-close');
if (annClose && annBar) {
  annClose.addEventListener('click', () => {
    annBar.style.maxHeight = annBar.offsetHeight + 'px';
    requestAnimationFrame(() => {
      annBar.style.transition = 'max-height .3s ease, opacity .3s ease';
      annBar.style.maxHeight = '0';
      annBar.style.opacity = '0';
      annBar.style.overflow = 'hidden';
    });
  });
}

// ── Navbar Scroll ──────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Active Nav Link ────────────────────────────
(function() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ── Mobile Menu ────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Scroll-to-Top ──────────────────────────────
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Fade-Up on Scroll (IntersectionObserver) ──
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12 });
  fadeEls.forEach(el => io.observe(el));
}

// ── Testimonials Carousel ──────────────────────
(function() {
  const track = document.querySelector('.testimonials-track');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  let current = 0;
  let perView = window.innerWidth >= 768 ? 3 : 1;
  let maxIdx = Math.ceil(cards.length / perView) - 1;
  let auto;

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIdx));
    const pct = (current * perView / cards.length) * 100;
    track.style.transform = `translateX(-${pct}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    auto = setInterval(() => goTo((current + 1) > maxIdx ? 0 : current + 1), 4500);
  }
  function stopAuto() { clearInterval(auto); }

  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); stopAuto(); startAuto(); }));
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); stopAuto(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); stopAuto(); startAuto(); });

  window.addEventListener('resize', () => {
    perView = window.innerWidth >= 768 ? 3 : 1;
    maxIdx = Math.ceil(cards.length / perView) - 1;
    goTo(0);
  });

  goTo(0);
  startAuto();
})();

// ── Services Tab Switcher ──────────────────────
(function() {
  const tabs   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.service-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
})();

// ── Gallery Filter & Lightbox ──────────────────
(function() {
  const filterBtns = document.querySelectorAll('.filter-bar .tab-btn');
  const items = document.querySelectorAll('.masonry-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      items.forEach(item => {
        const show = cat === 'all' || item.dataset.category === cat;
        item.style.display = show ? 'block' : 'none';
      });
    });
  });

  // Lightbox
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lb-img');
  const lbCap   = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev  = document.getElementById('lb-prev');
  const lbNext  = document.getElementById('lb-next');
  if (!lb) return;

  let currentIdx = 0;
  const allItems = [...items];

  function openLightbox(idx) {
    const visibleItems = allItems.filter(i => i.style.display !== 'none');
    currentIdx = idx;
    const img = visibleItems[idx]?.querySelector('img');
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    if (lbCap) lbCap.textContent = img.alt;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  items.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  if (lbPrev) lbPrev.addEventListener('click', () => {
    const vis = allItems.filter(i => i.style.display !== 'none');
    openLightbox((currentIdx - 1 + vis.length) % vis.length);
  });
  if (lbNext) lbNext.addEventListener('click', () => {
    const vis = allItems.filter(i => i.style.display !== 'none');
    openLightbox((currentIdx + 1) % vis.length);
  });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lbPrev) lbPrev.click();
    if (e.key === 'ArrowRight' && lbNext) lbNext.click();
  });
})();

// ── Booking Form ───────────────────────────────
(function() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJQk5LglEb1eHJ9oa9U1X_Z-9KzoIvadK-u0HHTIkMQmSv52PifmN30AvmyySL3OE/exec';

  // Disable past dates & Sundays
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.addEventListener('change', () => {
      const selected = new Date(dateInput.value);
      if (selected.getDay() === 0) {
        showFieldError(dateInput, 'We are closed on Sundays. Please select another day.');
        dateInput.value = '';
      } else {
        clearFieldError(dateInput);
      }
    });
  }

  // Phone validation
  const phoneInput = document.getElementById('booking-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  function showFieldError(input, msg) {
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.add('error');
    let err = group.querySelector('.form-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'form-error';
      group.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearFieldError(input) {
    const group = input.closest('.form-group');
    if (group) group.classList.remove('error');
  }

  function validateForm() {
    let valid = true;
    const required = form.querySelectorAll('[required]');
    required.forEach(field => {
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required.');
        valid = false;
      } else {
        clearFieldError(field);
      }
    });
    if (phoneInput && phoneInput.value.length !== 10) {
      showFieldError(phoneInput, 'Please enter a valid 10-digit mobile number.');
      valid = false;
    }
    const email = document.getElementById('booking-email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showFieldError(email, 'Please enter a valid email address.');
      valid = false;
    }
    return valid;
  }

  function generateRef() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
    const seq  = Math.floor(Math.random() * 900) + 100;
    return `NM-${date}-${seq}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitBtn = form.querySelector('.booking-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Booking...';
    submitBtn.disabled = true;

    const ref = generateRef();
    const data = {
      bookingRef:   ref,
      name:         form.querySelector('#booking-name').value,
      phone:        form.querySelector('#booking-phone').value,
      email:        form.querySelector('#booking-email').value,
      service:      form.querySelector('#booking-service').value,
      date:         form.querySelector('#booking-date').value,
      time:         form.querySelector('#booking-time').value,
      requests:     form.querySelector('#booking-requests').value,
      referral:     form.querySelector('#booking-referral').value,
      timestamp:    new Date().toISOString(),
    };

    try {
      // If Apps Script URL is set, POST to it
      if (APPS_SCRIPT_URL !== 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      // Show success
      document.getElementById('ref-number').textContent = ref;
      document.getElementById('booking-form-wrap').style.display = 'none';
      document.getElementById('booking-success').classList.add('show');

    } catch (err) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      document.getElementById('booking-error').style.display = 'block';
    }
  });

  const retryBtn = document.getElementById('retry-booking');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      document.getElementById('booking-error').style.display = 'none';
      const submitBtn = form.querySelector('.booking-submit');
      submitBtn.innerHTML = '✨ Confirm Booking';
      submitBtn.disabled = false;
    });
  }
})();

// ── Contact Form ───────────────────────────────
(function() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJQk5LglEb1eHJ9oa9U1X_Z-9KzoIvadK-u0HHTIkMQmSv52PifmN30AvmyySL3OE/exec';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = {
      type:      'contact',
      name:      form.querySelector('#contact-name').value,
      email:     form.querySelector('#contact-email').value,
      message:   form.querySelector('#contact-message').value,
      timestamp: new Date().toISOString(),
    };

    try {
      if (APPS_SCRIPT_URL !== 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
        await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
      }
      form.innerHTML = '<div style="text-align:center;padding:2rem"><span style="font-size:2.5rem">✅</span><br><br><strong>Message sent!</strong><br><span style="color:#6B6B6B">We\'ll get back to you within 24 hours.</span></div>';
    } catch {
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }
  });
})();

// ── Our Work — Home Gallery ────────────────────
(function () {
  const grid     = document.getElementById('og-grid');
  if (!grid) return;

  const tabs     = document.querySelectorAll('.og-tab');
  const loadBtn  = document.getElementById('og-load-more');
  const lb       = document.getElementById('og-lightbox');
  const lbImg    = document.getElementById('og-lb-img');
  const lbTitle  = document.getElementById('og-lb-title');
  const lbDesc   = document.getElementById('og-lb-desc');
  const lbTag    = document.getElementById('og-lb-tag');
  const lbCur    = document.getElementById('og-lb-cur');
  const lbTot    = document.getElementById('og-lb-tot');
  const lbClose  = document.getElementById('og-lb-close');
  const lbPrev   = document.getElementById('og-lb-prev');
  const lbNext   = document.getElementById('og-lb-next');

  let currentFilter  = 'all';
  let currentLbIndex = 0;
  let visibleItems   = [];   // items currently visible after filter

  // ── Helpers ──────────────────────────────────
  function allItems() {
    return [...grid.querySelectorAll('.og-item')];
  }

  function getVisible() {
    // items matching current filter (including load-more revealed ones)
    return allItems().filter(el => {
      const cat   = el.dataset.category;
      const match = currentFilter === 'all' || cat === currentFilter;
      const shown = !el.classList.contains('og-hidden') ||
                     el.classList.contains('og-revealed');
      return match && shown;
    });
  }

  // ── Filter ────────────────────────────────────
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.filter === currentFilter) return;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;

      const items = allItems();

      // Phase 1: fade all visible items out
      items.forEach(el => {
        const shown = !el.classList.contains('og-hidden') ||
                       el.classList.contains('og-revealed');
        if (shown) {
          el.classList.remove('og-in');
          el.classList.add('og-out');
        }
      });

      setTimeout(() => {
        items.forEach(el => {
          el.classList.remove('og-out', 'og-in');
          const cat   = el.dataset.category;
          const match = currentFilter === 'all' || cat === currentFilter;
          const isExtra = el.classList.contains('og-hidden') &&
                          !el.classList.contains('og-revealed');

          if (match && !isExtra) {
            el.style.display = '';
            el.classList.add('og-in');
          } else {
            el.style.display = 'none';
          }
        });

        // Check if load more needed for this filter
        const hiddenMatchCount = items.filter(el => {
          const cat   = el.dataset.category;
          const match = currentFilter === 'all' || cat === currentFilter;
          return match && el.classList.contains('og-hidden') &&
                 !el.classList.contains('og-revealed');
        }).length;

        if (loadBtn) {
          loadBtn.classList.toggle('og-done', hiddenMatchCount === 0);
        }

        visibleItems = getVisible();
      }, 250);
    });
  });

  // ── Load More ─────────────────────────────────
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      const hidden = allItems().filter(el =>
        el.classList.contains('og-hidden') && !el.classList.contains('og-revealed')
      );
      hidden.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('og-revealed');
          // Re-apply display based on current filter
          const cat   = el.dataset.category;
          const match = currentFilter === 'all' || cat === currentFilter;
          el.style.display = match ? '' : 'none';
        }, i * 80);
      });
      loadBtn.classList.add('og-done');
      visibleItems = getVisible();
    });
  }

  // ── Lightbox ──────────────────────────────────
  function openLightbox(index) {
    visibleItems = getVisible();
    currentLbIndex = Math.max(0, Math.min(index, visibleItems.length - 1));
    renderLightbox();
    lb.classList.add('og-lb-open');
    document.body.style.overflow = 'hidden';
    lb.focus();
  }

  function closeLightbox() {
    lb.classList.remove('og-lb-open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  function renderLightbox() {
    const el    = visibleItems[currentLbIndex];
    if (!el) return;
    const img   = el.querySelector('img');
    const cap   = el.dataset.caption    || '';
    const desc  = el.dataset.description || '';
    const cat   = el.dataset.category   || '';
    const catLabel = el.querySelector('.og-cat-tag')?.textContent || cat;

    lbImg.classList.add('og-lb-loading');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbImg.onload = () => lbImg.classList.remove('og-lb-loading');

    lbTitle.textContent = cap;
    lbDesc.textContent  = desc;
    lbTag.textContent   = catLabel;
    lbCur.textContent   = currentLbIndex + 1;
    lbTot.textContent   = visibleItems.length;
  }

  function prevItem() {
    currentLbIndex = (currentLbIndex - 1 + visibleItems.length) % visibleItems.length;
    renderLightbox();
  }

  function nextItem() {
    currentLbIndex = (currentLbIndex + 1) % visibleItems.length;
    renderLightbox();
  }

  // Open on item click
  allItems().forEach((el, i) => {
    el.addEventListener('click', () => {
      visibleItems = getVisible();
      const visIdx = visibleItems.indexOf(el);
      openLightbox(visIdx >= 0 ? visIdx : 0);
    });
  });

  // Controls
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click', prevItem);
  if (lbNext)  lbNext.addEventListener('click', nextItem);

  // Click outside image closes
  lb.addEventListener('click', e => {
    if (e.target === lb) closeLightbox();
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('og-lb-open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevItem();
    if (e.key === 'ArrowRight')  nextItem();
  });

  // Init visible list
  visibleItems = getVisible();
})();

// ── Counter Animation ──────────────────────────
(function() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const dur = 1800;
      const step = timestamp => {
        if (!start) start = timestamp;
        const prog = Math.min((timestamp - start) / dur, 1);
        const ease = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (prog < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: .5 });

  counters.forEach(c => io.observe(c));
})();
