const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 3000);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('zh-CN', {
    year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit'});
}

function tagList(tags) {
  return (tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('');
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
