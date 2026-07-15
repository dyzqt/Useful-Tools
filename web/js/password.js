const PW_HISTORY_KEY = 'usefultool_pw_history';
const MAX_PW_RECORDS = 20;

function getPWHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(PW_HISTORY_KEY));
    if (!Array.isArray(history)) return [];
    return history.filter(item => item && typeof item.password === 'string').slice(0, MAX_PW_RECORDS);
  } catch { return []; }
}

function savePWHistory(history) {
  localStorage.setItem(PW_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_PW_RECORDS)));
}

function addPWRecord(password, length, types) {
  const history = getPWHistory();
  history.unshift({ password, length, types, time: new Date().toISOString() });
  savePWHistory(history);
  renderPWHistory();
}

function clearPWHistory() {
  localStorage.removeItem(PW_HISTORY_KEY);
  renderPWHistory();
}

function renderPassword() {
  return `
    <div class="tool-header"><h2>密码生成</h2><p>自定义长度和字符类型，生成安全密码</p></div>
    <div class="card"><h3>密码生成器</h3>
      <div class="password-options-row">
        <div class="form-group password-length-field">
          <label for="pw-len">长度</label>
          <input type="text" id="pw-len" value="16" inputmode="numeric" autocomplete="off" aria-describedby="pw-len-error" />
          <div id="pw-len-error" class="field-error hidden">请正确输入长度</div>
        </div>
        <div class="password-type-group" aria-label="密码字符类型">
          <button class="choice-btn active" type="button" id="pw-upper" data-option="uppercase" aria-pressed="true">大写</button>
          <button class="choice-btn active" type="button" id="pw-lower" data-option="lowercase" aria-pressed="true">小写</button>
          <button class="choice-btn active" type="button" id="pw-digit" data-option="digits" aria-pressed="true">数字</button>
          <button class="choice-btn active" type="button" id="pw-sym" data-option="symbols" aria-pressed="true">符号</button>
        </div>
      </div>
      <button class="btn btn-primary" id="btn-password" type="button">生成密码</button>
      <div class="password-output" id="pw-output">点击按钮生成密码</div>
    </div>
    <div class="card" id="pw-history-section"></div>`;
}

function mountPassword() {
  const lengthInput = $('#pw-len');
  const lengthError = $('#pw-len-error');

  function setLengthError(message) {
    lengthError.textContent = message;
    lengthError.classList.remove('hidden');
    lengthInput.classList.add('input-error');
  }

  function clearLengthError() {
    lengthError.classList.add('hidden');
    lengthInput.classList.remove('input-error');
  }

  function validateLength() {
    const lengthText = lengthInput.value.trim();
    if (!/^\d+$/.test(lengthText)) {
      return '请正确输入长度';
    }
    const length = Number(lengthText);
    if (length < 1) return '长度过小';
    if (length > 100) return '长度过大';
    return '';
  }

  lengthInput.addEventListener('input', () => {
    const message = validateLength();
    if (message) setLengthError(message);
    else clearLengthError();
  });

  $$('.choice-btn').forEach(btn => {
    btn.onclick = () => {
      const next = !btn.classList.contains('active');
      btn.classList.toggle('active', next);
      btn.setAttribute('aria-pressed', String(next));
    };
  });

  $('#btn-password').onclick = async () => {
    const message = validateLength();
    if (message) {
      setLengthError(message);
      showToast(message, 'error');
      lengthInput.focus();
      return;
    }
    const length = Number(lengthInput.value.trim());
    const types = getSelectedPasswordTypes();
    try {
      const r = await api.password({
        length,
        use_uppercase: $('#pw-upper').classList.contains('active'),
        use_lowercase: $('#pw-lower').classList.contains('active'),
        use_digits: $('#pw-digit').classList.contains('active'),
        use_symbols: $('#pw-sym').classList.contains('active'),
      });
      $('#pw-output').textContent = r.password;
      addPWRecord(r.password, length, types);
    } catch (e) { showToast(e.message, 'error'); }
  };

  renderPWHistory();
}

function getSelectedPasswordTypes() {
  return [
    $('#pw-upper')?.classList.contains('active') ? '大写' : null,
    $('#pw-lower')?.classList.contains('active') ? '小写' : null,
    $('#pw-digit')?.classList.contains('active') ? '数字' : null,
    $('#pw-sym')?.classList.contains('active') ? '符号' : null,
  ].filter(Boolean).join('/') || '未选择';
}

function renderPWHistory() {
  const section = $('#pw-history-section');
  if (!section) return;

  const history = getPWHistory();
  section.innerHTML = `
    <div class="history-header">
      <h3>生成记录 <span class="history-count">(${history.length})</span></h3>
      <button class="btn btn-sm btn-outline" id="btn-clear-pw-history" type="button" ${history.length ? '' : 'disabled'}>清空</button>
    </div>
    ${history.length ? renderPWHistoryList(history) : '<div class="empty">暂无历史密码</div>'}`;

  section.querySelectorAll('.btn-copy-pw').forEach(btn => {
    btn.addEventListener('click', () => copyPassword(btn.dataset.index));
  });

  section.querySelectorAll('.history-pw').forEach(el => {
    el.addEventListener('click', () => copyPassword(el.dataset.index));
  });

  $('#btn-clear-pw-history')?.addEventListener('click', () => {
    if (!history.length) return;
    if (!confirm('确认清空所有密码记录？')) return;
    clearPWHistory();
    showToast('已清空历史记录');
  });
}

function renderPWHistoryList(history) {
  return `<div class="history-list">${history.map((item, index) => `
    <div class="history-item">
      <div class="history-item-main">
        <code class="history-pw" data-index="${index}" title="点击复制">${escHtml(item.password)}</code>
        <div class="history-meta">
          <span>长度 ${escHtml(String(item.length || item.password.length))}</span>
          <span>${escHtml(item.types || '未记录类型')}</span>
          <span>${formatDate(item.time)}</span>
        </div>
      </div>
      <button class="btn btn-sm btn-outline btn-copy-pw" data-index="${index}" type="button">复制</button>
    </div>
  `).join('')}</div>`;
}

async function copyPassword(index) {
  const item = getPWHistory()[Number(index)];
  if (!item) return;
  try {
    await copyText(item.password);
    showToast('已复制到剪贴板');
  } catch {
    showToast('复制失败，请手动复制', 'error');
  }
}
