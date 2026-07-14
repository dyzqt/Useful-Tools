function renderPassword() {
  return `
    <div class="tool-header"><h2>密码生成</h2><p>自定义长度和字符类型，生成安全密码</p></div>
    <div class="card"><h3>密码生成器</h3>
      <div class="form-row">
        <div class="form-group form-group-narrow"><label for="pw-len">长度</label><input type="number" id="pw-len" value="16" min="4" max="128" /></div>
        <div class="form-group form-group-fill">
          <div class="checkbox-group">
            <label><input type="checkbox" id="pw-upper" checked /> 大写</label>
            <label><input type="checkbox" id="pw-lower" checked /> 小写</label>
            <label><input type="checkbox" id="pw-digit" checked /> 数字</label>
            <label><input type="checkbox" id="pw-sym" checked /> 符号</label>
          </div>
        </div>
      </div>
      <button class="btn btn-primary" id="btn-password">生成密码</button>
      <div class="password-output" id="pw-output">点击按钮生成密码</div>
    </div>`;
}

function mountPassword() {
  $('#btn-password').onclick = async () => {
    try {
      const r = await api.password({
        length: parseInt($('#pw-len').value),
        use_uppercase: $('#pw-upper').checked,
        use_lowercase: $('#pw-lower').checked,
        use_digits: $('#pw-digit').checked,
        use_symbols: $('#pw-sym').checked,
      });
      $('#pw-output').textContent = r.password;
    } catch (e) { showToast(e.message, 'error'); }
  };
}
