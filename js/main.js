/* Progressive enhancement: links, content and galleries remain usable without JS. */
(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() {
    menu?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);

  // One-tap WhatsApp contact, available throughout the site.
  if (!document.querySelector('.whatsapp-float')) {
    const whatsapp = document.createElement('a');
    whatsapp.className = 'whatsapp-float';
    whatsapp.href = 'https://wa.me/917087419592?text=Hello%20DMS%20Studio%2C%20I%E2%80%99d%20like%20to%20discuss%20an%20interior%20design%20project.';
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener noreferrer';
    whatsapp.setAttribute('aria-label', 'Chat with DMS Studio on WhatsApp');
    whatsapp.title = 'Chat with DMS Studio on WhatsApp';
    whatsapp.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.02 3.2A12.7 12.7 0 0 0 5.1 22.37L3.3 28.9l6.69-1.75A12.7 12.7 0 1 0 16.02 3.2Zm0 23.1c-1.95 0-3.86-.52-5.53-1.5l-.4-.23-3.97 1.04 1.06-3.87-.26-.42a10.36 10.36 0 1 1 9.1 4.98Zm5.7-7.76c-.31-.16-1.86-.92-2.15-1.02-.29-.1-.5-.16-.71.16-.21.31-.82 1.02-1.01 1.23-.19.21-.37.23-.68.08-.31-.16-1.32-.49-2.52-1.55-.93-.83-1.56-1.86-1.74-2.17-.18-.31-.02-.48.14-.64.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.98-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.65.76.24 1.45.2 2 .12.61-.09 1.86-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.6-.37Z"/></svg>';
    document.body.append(whatsapp);
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-category]')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    let count = 0;
    projects.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) { count++; card.classList.add('is-visible'); }
    });
    document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`;
  }));

  const gallery = [...document.querySelectorAll('.gallery-item')];
  const dialog = document.querySelector('.lightbox');
  let activePhoto = 0;
  let previousOverflow = '';
  function showPhoto(index) {
    activePhoto = (index + gallery.length) % gallery.length;
    const item = gallery[activePhoto];
    const image = dialog.querySelector('img');
    image.src = item.href;
    image.alt = item.dataset.caption;
    dialog.querySelector('.lightbox-caption').textContent = item.dataset.caption;
    dialog.querySelector('.lightbox-count').textContent = `${activePhoto + 1} / ${gallery.length}`;
  }
  gallery.forEach((item, index) => item.addEventListener('click', event => {
    if (!dialog?.showModal) return;
    event.preventDefault(); showPhoto(index); dialog.showModal();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }));
  dialog?.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog?.querySelectorAll('[data-gallery-step]').forEach(button => button.addEventListener('click', () => showPhoto(activePhoto + Number(button.dataset.galleryStep))));
  dialog?.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); showPhoto(activePhoto + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  const form = document.querySelector('#enquiry-form');
  if (form) {
    const service = new URLSearchParams(location.search).get('service');
    if ([...form.elements.service.options].some(option => option.value === service)) form.elements.service.value = service;
    const submitButton = form.querySelector('button[type="submit"]');
    const result = document.querySelector('#enquiry-result');
    const resultTitle = document.querySelector('#enquiry-result-title');
    const resultMessage = document.querySelector('#enquiry-result-message');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      result.hidden = true;
      submitButton.disabled = true;
      submitButton.dataset.originalLabel = submitButton.textContent;
      submitButton.textContent = 'Sending…';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(form.action, {
          signal: controller.signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
        });
        const payload = await response.json().catch(() => ({}));
        const accepted = response.ok && (payload.success === true || payload.success === 'true');
        if (!accepted) throw new Error(payload.message || 'The form service did not accept the enquiry.');
        resultTitle.textContent = 'Thank you — your enquiry was sent.';
        resultMessage.textContent = 'Your enquiry was accepted by our delivery service. DMS Studio will get back to you soon.';
        form.reset();
        result.dataset.state = 'success';
      } catch (error) {
        console.warn('Enquiry submission failed:', error.message);
        resultTitle.textContent = 'Your enquiry could not be sent.';
        resultMessage.textContent = 'Please try again, or email dmsstudiomohali@gmail.com directly. Your form details have not been confirmed as delivered.';
        result.dataset.state = 'error';
      } finally {
        clearTimeout(timeout);
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.originalLabel;
        result.hidden = false;
        result.focus({preventScroll: true});
        result.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'});
      }
    });
    form.addEventListener('input', () => { result.hidden = true; });
  }
})();
