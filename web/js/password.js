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
      <button class="btn btn-primary" id="btn-password">生成密码</button>
      <div class="password-output" id="pw-output">点击按钮生成密码</div>
    </div>`;
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
    try {
      const r = await api.password({
        length,
        use_uppercase: $('#pw-upper').classList.contains('active'),
        use_lowercase: $('#pw-lower').classList.contains('active'),
        use_digits: $('#pw-digit').classList.contains('active'),
        use_symbols: $('#pw-sym').classList.contains('active'),
      });
      $('#pw-output').textContent = r.password;
    } catch (e) { showToast(e.message, 'error'); }
  };
}
