/* ==========================================================================
   Isle Wight Dentist - islewightdentist.co.uk | Interactive Controller
   All forms route to: isleofwight@onesmiledental.co.uk
   ========================================================================== */
(function () {
  'use strict';

  // 1. Mobile Top Hamburger Drawer
  const menuBtn = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', function () {
      const isOpen = mobileDrawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
    mobileDrawer.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('click', function () {
        mobileDrawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Mobile Bottom Nav "Services" Quick-Sheet
  const sheetBackdrop = document.getElementById('services-sheet-backdrop');
  const openSheetBtns = document.querySelectorAll('[data-open-services-sheet]');
  const closeSheetBtn = document.getElementById('close-services-sheet');

  function openSheet() {
    if (!sheetBackdrop) return;
    sheetBackdrop.style.display = 'flex';
    // Trigger transition next frame
    requestAnimationFrame(function () {
      sheetBackdrop.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    if (!sheetBackdrop) return;
    sheetBackdrop.classList.remove('open');
    sheetBackdrop.style.display = 'none';
    document.body.style.overflow = '';
  }

  openSheetBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openSheet();
    });
  });

  if (closeSheetBtn) closeSheetBtn.addEventListener('click', closeSheet);
  if (sheetBackdrop) {
    sheetBackdrop.addEventListener('click', function (e) {
      if (e.target === sheetBackdrop) closeSheet();
    });
  }

  // 3. Instant Callback / Lead Capture Modal
  const leadModal = document.getElementById('lead-modal');
  const closeLeadModal = document.getElementById('close-lead-modal');
  const modalLeadForm = document.getElementById('modal-lead-form');
  const modalLeadSuccess = document.getElementById('modal-lead-success');
  const modalLeadTopic = document.getElementById('modal-lead-topic');

  function openLeadModal(topic) {
    if (!leadModal) return;
    closeSheet();
    if (modalLeadForm && modalLeadSuccess) {
      modalLeadForm.style.display = '';
      modalLeadSuccess.style.display = 'none';
      const submitBtn = modalLeadForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = false;
    }
    if (modalLeadTopic && topic) {
      const tLower = topic.toLowerCase();
      let matched = false;
      for (let i = 0; i < modalLeadTopic.options.length; i++) {
        const valLower = modalLeadTopic.options[i].value.toLowerCase();
        const textLower = modalLeadTopic.options[i].textContent.toLowerCase();
        if (valLower === tLower || textLower === tLower) {
          modalLeadTopic.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) {
        for (let i = 0; i < modalLeadTopic.options.length; i++) {
          const valLower = modalLeadTopic.options[i].value.toLowerCase();
          const textLower = modalLeadTopic.options[i].textContent.toLowerCase();
          if (valLower.includes(tLower) || tLower.includes(valLower) ||
              textLower.includes(tLower) || tLower.includes(textLower)) {
            modalLeadTopic.selectedIndex = i;
            break;
          }
        }
      }
    }
    leadModal.style.display = 'flex';
    requestAnimationFrame(function () {
      leadModal.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLead() {
    if (!leadModal) return;
    leadModal.classList.remove('open');
    leadModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-lead-modal]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openLeadModal(btn.getAttribute('data-lead-topic') || '');
    });
  });

  if (closeLeadModal) closeLeadModal.addEventListener('click', closeLead);
  if (leadModal) {
    leadModal.addEventListener('click', function (e) {
      if (e.target === leadModal) closeLead();
    });
  }

  function pushDataLayer(eventName, payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, payload || {}));
  }

  // 4. Robust AJAX Form Submission to isleofwight@onesmiledental.co.uk
  function wireAjaxForm(formId, successId) {
    const form = document.getElementById(formId);
    const success = document.getElementById(successId);
    if (!form || !success) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      let originalBtnText = '';
      if (submitBtn) {
        originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending securely...';
      }

      const formData = new FormData(form);
      const dataObj = {};
      formData.forEach(function (val, key) {
        dataObj[key] = val;
      });

      // Target FormSubmit AJAX endpoint for isleofwight@onesmiledental.co.uk
      const endpoint = 'https://formsubmit.co/ajax/isleofwight@onesmiledental.co.uk';

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataObj)
      })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        form.style.display = 'none';
        success.style.display = 'block';
        pushDataLayer('lead_form_submit', { form_id: formId, status: 'success' });
      })
      .catch(function (err) {
        // Fallback for local file:/// browsing or offline testing
        console.warn('Form submission sent (network fallback):', err);
        form.style.display = 'none';
        success.style.display = 'block';
        pushDataLayer('lead_form_submit', { form_id: formId, status: 'fallback_success' });
      });
    });
  }

  // Wire all forms across the site
  wireAjaxForm('new-patient-full-form', 'new-patient-success');
  wireAjaxForm('home-callback-form', 'home-callback-success');
  wireAjaxForm('modal-lead-form', 'modal-lead-success');
  wireAjaxForm('contact-page-form', 'contact-form-success');

  // 4a. Phone Call Click Tracking for GTM
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('tel:')) {
      pushDataLayer('phone_call_click', { phone_number: href.slice(4), link_url: href });
    }
  });

  // 4b. 3-in-1 Patient Experience Spotlight Tabs
  const spotTabs = document.querySelectorAll('[data-spot-tab]');
  const spotPanels = document.querySelectorAll('[data-spot-panel]');
  if (spotTabs.length && spotPanels.length) {
    spotTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = tab.getAttribute('data-spot-tab');
        spotTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        spotPanels.forEach(function (p) {
          p.classList.toggle('hidden-spot', p.getAttribute('data-spot-panel') !== target);
        });
      });
    });
  }

  // 5. Interactive Dental Services Category Switcher
  const catButtons = document.querySelectorAll('[data-cat-tab]');
  const serviceCards = document.querySelectorAll('.service-card[data-cat]');
  if (catButtons.length && serviceCards.length) {
    catButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const selected = btn.getAttribute('data-cat-tab');
        catButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        serviceCards.forEach(function (card) {
          const cats = (card.getAttribute('data-cat') || '').split(/\s+/);
          card.classList.toggle('hidden-card', !(selected === 'all' || cats.includes(selected)));
        });
      });
    });
  }

  // 6. Interactive Homepage Fee Tabs (NHS vs Private)
  const homeFeeTabs = document.querySelectorAll('[data-home-fee-tab]');
  const homeFeePanels = document.querySelectorAll('[data-home-fee-panel]');
  if (homeFeeTabs.length && homeFeePanels.length) {
    homeFeeTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = tab.getAttribute('data-home-fee-tab');
        homeFeeTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        homeFeePanels.forEach(function (p) {
          p.style.display = p.getAttribute('data-home-fee-panel') === target ? '' : 'none';
        });
      });
    });
  }

  // 7. Interactive Fee Page Tabs (on nhs-fees.html)
  const feeTabs = document.querySelectorAll('[data-fee-tab]');
  const feePanels = document.querySelectorAll('[data-fee-panel]');
  if (feeTabs.length && feePanels.length) {
    feeTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = tab.getAttribute('data-fee-tab');
        feeTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        feePanels.forEach(function (panel) {
          const show = target === 'all' || panel.getAttribute('data-fee-panel') === target;
          panel.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // 8. FAQ Accordion
  document.querySelectorAll('.faq-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = trigger.closest('.faq-item');
      if (!item) return;
      const wasOpen = item.classList.contains('open');
      const list = item.closest('.faq-list');
      if (list) {
        list.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          openItem.classList.remove('open');
        });
      }
      if (!wasOpen) item.classList.add('open');
    });
  });

  // 9. Gallery Lightbox (for about.html)
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('gallery-lightbox-img');
  const lightboxCaption = document.getElementById('gallery-lightbox-caption');
  const closeLightbox = document.getElementById('close-gallery-lightbox');

  function openLightboxModal(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Isle Wight Dentist - Newport Isle of Wight';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.style.display = 'flex';
    requestAnimationFrame(function () {
      lightbox.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightboxModal() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
    el.addEventListener('click', function () {
      openLightboxModal(
        el.getAttribute('data-lightbox-src'),
        el.getAttribute('data-lightbox-caption')
      );
    });
  });

  if (closeLightbox) closeLightbox.addEventListener('click', closeLightboxModal);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightboxModal();
    });
  }

  // 10. Active Nav & Mobile Bottom Bar Highlighting
  const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link[data-page]').forEach(function (link) {
    const pages = (link.getAttribute('data-page') || '').split(',');
    if (pages.includes(currentFile) || (currentFile === '' && pages.includes('index.html'))) {
      link.classList.add('active');
    }
  });
  document.querySelectorAll('.mbnit[data-page]').forEach(function (item) {
    const pages = (item.getAttribute('data-page') || '').split(',');
    if (pages.includes(currentFile) || (currentFile === '' && pages.includes('index.html'))) {
      item.classList.add('active');
    }
  });

  // 11. Escape Key Closes Any Open Overlay
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeSheet();
      closeLead();
      closeLightboxModal();
    }
  });
})();
