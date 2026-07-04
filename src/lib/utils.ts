/* ══════════════════════════════════════════
   UTILS — دوال مساعدة عامة (لا تعتمد على أي ملف آخر)
══════════════════════════════════════════ */
const $ = id => document.getElementById(id);

function esc(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function fp(p) {
  return currency === 'USD' ? `$${Math.round(p)}` : `${(p / PI_RATE).toFixed(2)} π`;
}

function toast(msg, type = '') {
  const t = $('toastEl');
  t.textContent = msg;
  t.className = 'toast ' + (type || '');
  t.classList.add('on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('on'), 2900);
}

function toggleTheme() {
  const d = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', d ? 'light' : 'dark');
  savePrefs();
}

function counterAnim(el, target) {
  let n = 0;
  const s = target / 55;
  const r = () => {
    n += s;
    if (n >= target) { el.textContent = Math.round(target); return; }
    el.textContent = Math.floor(n);
    requestAnimationFrame(r);
  };
  r();
}
