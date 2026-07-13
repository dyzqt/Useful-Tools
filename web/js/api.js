const BASE = 'http://127.0.0.1:8000';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `${method} ${path} failed`);
  return data;
}

const api = {
  // Weather
  weather: (city) => req('GET', `/api/weather?city=${encodeURIComponent(city)}`),

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
