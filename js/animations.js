/* Bounded, event-driven motion. No scroll handler or continuous rendering loop. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: 0.06});
    document.querySelectorAll('.reveal').forEach(element => {
      // Never delay content already inside the viewport.
      if (element.getBoundingClientRect().top > innerHeight) { element.classList.add('will-reveal'); observer.observe(element); }
    });
  }
  const stage = document.querySelector('.stage');
  if (!stage) return;
  const visual = document.querySelector('.material-visual');
  const model = document.querySelector('.maquette');
  const palettes = {
    sand: {values: ['#c5b296','#d1bd9d','#8f7250','#e7dac3','#b69d7e'], text: 'Warm limestone tones, soft plaster and pale oak.'},
    walnut: {values: ['#a3917b','#9b8468','#4c3527','#cabba2','#7c6a56'], text: 'Deep timber tones, warm stone and a richer contrast.'},
    chalk: {values: ['#e2ddd1','#e7e1d3','#b7aa8f','#f4eee2','#c8c0ae'], text: 'Quiet whites, pale timber and the softness of chalk.'}
  };
  document.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => {
    const palette = palettes[button.dataset.palette];
    ['--plaster','--floor','--wood','--stone','--side'].forEach((property, i) => visual.style.setProperty(property, palette.values[i]));
    document.querySelectorAll('[data-palette]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelector('.material-description').textContent = palette.text;
    stage.setAttribute('aria-label', `${button.textContent.trim()} palette: three-dimensional architectural material composition`);
  }));
  let rotation = -36, frame = 0;
  function draw(x = 0, y = 0) { model.style.transform = `rotateX(${56 + y}deg) rotateZ(${rotation + x}deg)`; }
  document.querySelectorAll('[data-turn]').forEach(button => button.addEventListener('click', () => {
    rotation = Math.max(-76, Math.min(4, rotation + Number(button.dataset.turn))); draw();
  }));
  document.querySelector('.reset-model')?.addEventListener('click', () => { rotation = -36; draw(); });
  stage.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches || frame) return;
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 5;
    frame = requestAnimationFrame(() => { draw(x, y); frame = 0; });
  }, {passive:true});
  stage.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; draw(); });
  reduced.addEventListener('change', () => { cancelAnimationFrame(frame); frame = 0; draw(); });
})();
