/**
 * Nara Novaes Studio Hair - Main JavaScript
 * Interactive Features: Scroll Reveal, Lazy Loading, WhatsApp Booking, Lightbox, Live Business Status
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initLazyLoading();
  initAnimatedCounters();
  initBusinessStatus();
  initGalleryFilter();
  initLightbox();
  initWhatsAppBooking();
});

/* --------------------------------------------------------------------------
   1. Header Scroll & Active Link Spy
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scroll Spy for nav links
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');

  if (!menuToggle || !navLinks) return;

  function toggleMenu() {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  }

  menuToggle.addEventListener('click', toggleMenu);

  // Close when clicking link
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      toggleMenu();
    }
  });
}

/* --------------------------------------------------------------------------
   3. Scroll Reveal Animations (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/* --------------------------------------------------------------------------
   4. Lazy Loading & Image Transition Effects
   -------------------------------------------------------------------------- */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img.lazy-img');
  
  lazyImages.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    }
  });
}

/* --------------------------------------------------------------------------
   5. Animated Number Counters
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.stat-number[data-count]');
  if (!counterElements.length) return;

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const isDecimal = el.getAttribute('data-decimal') === 'true';
        const suffix = el.getAttribute('data-suffix') || '';
        
        animateValue(el, 0, target, 1600, isDecimal, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => counterObserver.observe(el));
}

function animateValue(obj, start, end, duration, isDecimal, suffix) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // Ease out quart
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    const currentVal = start + (end - start) * easeProgress;
    
    if (isDecimal) {
      obj.textContent = currentVal.toFixed(1).replace('.', ',') + suffix;
    } else {
      obj.textContent = Math.floor(currentVal).toLocaleString('pt-BR') + suffix;
    }

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      if (isDecimal) {
        obj.textContent = end.toFixed(1).replace('.', ',') + suffix;
      } else {
        obj.textContent = end.toLocaleString('pt-BR') + suffix;
      }
    }
  };
  window.requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   6. Live Business Open / Closed Status & Day Highlight
   -------------------------------------------------------------------------- */
function initBusinessStatus() {
  const statusContainer = document.getElementById('liveBusinessStatus');
  const hoursTable = document.querySelector('.hours-table');
  if (!statusContainer) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
  const currentHour = now.getHours() + (now.getMinutes() / 60);

  // Business schedule mapping: [openHour, closeHour]
  const schedule = {
    0: null,            // Domingo: Fechado
    1: null,            // Segunda: Fechado
    2: [9, 22],         // Terça: 09:00 - 22:00
    3: [9, 22],         // Quarta: 09:00 - 22:00
    4: [9, 22],         // Quinta: 09:00 - 22:00
    5: [9, 22],         // Sexta: 09:00 - 22:00
    6: [8, 22]          // Sábado: 08:00 - 22:00
  };

  // Highlight today's row in table
  if (hoursTable) {
    const rows = hoursTable.querySelectorAll('tr[data-day]');
    rows.forEach(row => {
      if (parseInt(row.getAttribute('data-day')) === day) {
        row.classList.add('today');
      }
    });
  }

  const todayHours = schedule[day];
  let isOpen = false;
  let statusText = '';

  if (todayHours) {
    const [open, close] = todayHours;
    if (currentHour >= open && currentHour < close) {
      isOpen = true;
      statusText = `Aberto agora • Fecha às ${close}h`;
    } else if (currentHour < open) {
      statusText = `Fechado agora • Abre hoje às 0${open}h`;
    } else {
      statusText = `Fechado no momento • Abre amanhã`;
    }
  } else {
    // Closed on Sun / Mon
    if (day === 0) {
      statusText = `Fechado hoje (Domingo) • Reabre Terça às 09h`;
    } else {
      statusText = `Fechado hoje (Segunda) • Reabre Terça às 09h`;
    }
  }

  statusContainer.className = `live-status-badge ${isOpen ? 'open' : 'closed'}`;
  statusContainer.innerHTML = `
    <span class="status-dot"></span>
    <span>${statusText}</span>
  `;
}

/* --------------------------------------------------------------------------
   7. Gallery Filter System
   -------------------------------------------------------------------------- */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter || (category && category.includes(filter))) {
          item.classList.remove('hidden');
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            item.classList.add('hidden');
          }, 300);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   8. Image Lightbox Modal
   -------------------------------------------------------------------------- */
function initLightbox() {
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightbox || !lightboxImg) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-item-title')?.textContent || '';
      const tag = item.querySelector('.gallery-item-tag')?.textContent || '';

      lightboxImg.src = img.getAttribute('src');
      lightboxImg.alt = img.getAttribute('alt') || 'Transformação Studio Hair';
      lightboxCaption.textContent = tag ? `${tag} — ${title}` : title;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* --------------------------------------------------------------------------
   9. WhatsApp Smart Booking Form Submission (Robust Emoji Encoding)
   -------------------------------------------------------------------------- */
function initWhatsAppBooking() {
  const bookingForm = document.getElementById('whatsappBookingForm');
  if (!bookingForm) return;

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName')?.value.trim() || '';
    const phone = document.getElementById('clientPhone')?.value.trim() || '';
    const service = document.getElementById('serviceSelect')?.value || 'Não especificado';
    const day = document.getElementById('daySelect')?.value || 'A combinar';
    const period = document.getElementById('periodSelect')?.value || 'A combinar';
    const notes = document.getElementById('clientNotes')?.value.trim() || '';

    if (!name) {
      alert('Por favor, informe seu nome para continuarmos.');
      document.getElementById('clientName')?.focus();
      return;
    }

    // Build structured lines with highly compatible standard UTF-8 emojis
    const messageParts = [
      '✨ *SOLICITAÇÃO DE AGENDAMENTO* ✨',
      '⭐ *Nara Novaes Studio Hair*',
      '',
      `👤 *Nome:* ${name}`,
      phone ? `📱 *WhatsApp:* ${phone}` : '',
      `✂️ *Serviço:* ${service}`,
      `📅 *Dia de preferência:* ${day}`,
      `⏰ *Período:* ${period}`,
      notes ? `💬 *Observações:* ${notes}` : '',
      '',
      'Olá Nara! Gostaria de verificar a disponibilidade de horário para este atendimento. Aguardo seu retorno! 💕'
    ].filter(item => item !== '');

    const fullMessage = messageParts.join('\n');
    const encodedMessage = encodeURIComponent(fullMessage);

    // Using api.whatsapp.com endpoint guarantees full emoji parsing on web and mobile apps
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5511953978759&text=${encodedMessage}`;

    // Trigger click through temporary anchor to ensure popup blocker bypass & native app opening
    const tempLink = document.createElement('a');
    tempLink.href = whatsappUrl;
    tempLink.target = '_blank';
    tempLink.rel = 'noopener noreferrer';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  });
}
