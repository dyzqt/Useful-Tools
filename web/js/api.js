const BASE = '';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  let data = null;

  if (contentType.includes('application/json')) {
    data = text ? JSON.parse(text) : null;
  } else {
    const isHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
    const message = isHtml
      ? 'API 返回了 HTML 页面，请确认当前页面是通过后端 8000 端口或 ngrok 的 8000 tunnel 打开的。'
      : `API 返回了非 JSON 内容：${text.slice(0, 80)}`;
    throw new Error(message);
  }

  if (!res.ok) throw new Error(data.detail || `${method} ${path} failed`);
  return data;
}

const api = {
  // Weather
  weather: (city, days = 3) => req('GET', `/api/weather?city=${encodeURIComponent(city)}&days=${days}`),

  // Memos
  createMemo:  (d) => req('POST', '/api/memos', d),
  listMemos:   (q) => req('GET', q ? `/api/memos?q=${encodeURIComponent(q)}` : '/api/memos'),
  getMemo:     (id) => req('GET', `/api/memos/${id}`),
  updateMemo:  (id, d) => req('PUT', `/api/memos/${id}`, d),
  deleteMemo:  (id) => req('DELETE', `/api/memos/${id}`),

  // Countdowns
  createCountdown: (d) => req('POST', '/api/countdowns', d),
  listCountdowns:  () => req('GET', '/api/countdowns'),
  getCountdown:    (id) => req('GET', `/api/countdowns/${id}`),
  updateCountdown: (id, d) => req('PUT', `/api/countdowns/${id}`, d),
  deleteCountdown: (id) => req('DELETE', `/api/countdowns/${id}`),

  // Tools
  randomNumber: (d) => req('POST', '/api/tools/random/number', d),
  randomPick:   (d) => req('POST', '/api/tools/random/pick', d),
  randomDice:   (d) => req('POST', '/api/tools/random/dice', d),
  password:     (d) => req('POST', '/api/tools/password', d),
  convert:      (d) => req('POST', '/api/tools/convert', d),
};
