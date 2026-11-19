/* DMS Studio measurement. GTM owns GA4 configuration; do not also install gtag.js. */
(() => {
  'use strict';
  // Preview/localhost traffic must never contaminate the production property.
  if (!['www.dmsstudio.in', 'dmsstudio.in'].includes(location.hostname)) return;
  if (window.__dmsTagManagerLoaded) return;
  window.__dmsTagManagerLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-PC8KZ9RG';
  document.head.appendChild(script);
})();
