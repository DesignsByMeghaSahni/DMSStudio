/* Progressive enhancement: complete answers remain available without scripts. */
(() => {
  const input = document.getElementById('faq-search');
  if (!input) return;
  const sections = [...document.querySelectorAll('.faq-topic')];
  const questions = [...document.querySelectorAll('.faq-question')];
  const count = document.getElementById('faq-count');
  const empty = document.getElementById('faq-empty');
  const normalize = text => text.toLowerCase().normalize('NFKC').replace(/[’']/g, '');
  const text = new Map(questions.map(item => [item, normalize(item.querySelector('summary').textContent + ' ' + item.querySelector('p').textContent)]));
  const filter = () => {
    const words = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    let matches = 0;
    questions.forEach(item => {
      const match = words.every(word => text.get(item).includes(word));
      item.hidden = !match;
      if (match) matches++;
    });
    sections.forEach(section => { section.hidden = ![...section.querySelectorAll('.faq-question')].some(item => !item.hidden); });
    count.textContent = words.length ? `${matches} of ${questions.length} questions match` : `${questions.length} questions · ${sections.length} topics`;
    empty.hidden = matches > 0;
  };
  const revealHash = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || (!target.classList.contains('faq-question') && !target.classList.contains('faq-topic'))) return;
    input.value = ''; filter();
    if (target.classList.contains('faq-question')) target.open = true;
    target.scrollIntoView({block: 'start', behavior: 'auto'});
  };
  document.querySelector('.faq-search').hidden = false;
  input.addEventListener('input', filter);
  document.getElementById('faq-clear').addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
  document.querySelector('.faq-directory nav').addEventListener('click', () => { input.value = ''; filter(); });
  window.addEventListener('hashchange', revealHash);
  if (location.hash) revealHash();
})();
