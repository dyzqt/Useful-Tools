function renderRandom() {
  return `
    <div class="tool-header"><h2>随机工具</h2><p>随机数生成 · 抽签 · 掷骰子</p></div>
    <div class="tabs random-tabs" aria-label="随机工具类型">
      <button class="tab-btn active" data-random-tool="number">随机数</button>
      <button class="tab-btn" data-random-tool="pick">随机抽签</button>
      <button class="tab-btn" data-random-tool="dice">掷骰子</button>
    </div>
    <div id="random-tool-panel"></div>`;
}

function mountRandom() {
  const panel = $('#random-tool-panel');

  const views = {
    number: `
      <div class="card"><h3>随机数</h3>
        <div class="form-row">
          <div class="form-group"><label for="rand-min">最小值</label><input type="text" id="rand-min" value="1" inputmode="numeric" autocomplete="off" /><div id="rand-min-error" class="field-error hidden"></div></div>
          <div class="form-group"><label for="rand-max">最大值</label><input type="text" id="rand-max" value="100" inputmode="numeric" autocomplete="off" /><div id="rand-max-error" class="field-error hidden"></div></div>
          <div class="form-group form-group-compact"><button class="btn btn-primary" id="btn-number">生成</button></div>
        </div>
        <div id="rand-number-result" class="result-panel result-panel-strong"></div>
      </div>`,
    pick: `
      <div class="card"><h3>随机抽签</h3>
        <div class="form-group"><label for="pick-items">候选列表（逗号分隔）</label><input type="text" id="pick-items" value="A, B, C, D, E" /><div id="pick-items-error" class="field-error hidden"></div></div>
        <div class="form-row">
          <div class="form-group"><label for="pick-count">抽取数量</label><input type="text" id="pick-count" value="1" inputmode="numeric" autocomplete="off" /><div id="pick-count-error" class="field-error hidden"></div></div>
          <div class="form-group form-group-compact"><button class="btn btn-primary" id="btn-pick">抽取</button></div>
        </div>
        <div id="pick-result" class="result-panel result-panel-medium"></div>
      </div>`,
    dice: `
      <div class="card"><h3>掷骰子</h3>
        <div class="form-row">
          <div class="form-group"><label for="dice-sides">面数</label><input type="text" id="dice-sides" value="6" inputmode="numeric" autocomplete="off" /><div id="dice-sides-error" class="field-error hidden"></div></div>
          <div class="form-group"><label for="dice-count">数量</label><input type="text" id="dice-count" value="2" inputmode="numeric" autocomplete="off" /><div id="dice-count-error" class="field-error hidden"></div></div>
          <div class="form-group form-group-compact"><button class="btn btn-primary" id="btn-dice">掷骰子</button></div>
        </div>
        <div id="dice-result" class="result-panel result-panel-medium"></div>
      </div>`,
  };

  function switchTool(tool) {
    $$('.random-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.randomTool === tool);
      btn.setAttribute('aria-selected', String(btn.dataset.randomTool === tool));
    });
    panel.innerHTML = views[tool];
    if (tool === 'number') mountRandomNumber();
    if (tool === 'pick') mountRandomPick();
    if (tool === 'dice') mountRandomDice();
  }

  $$('.random-tabs .tab-btn').forEach(btn => {
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.onclick = () => switchTool(btn.dataset.randomTool);
  });

  switchTool('number');
}

function showFieldError(inputId, message) {
  const input = $(`#${inputId}`);
  const error = $(`#${inputId}-error`);
  error.textContent = message;
  error.classList.remove('hidden');
  input.classList.add('input-error');
}

function clearFieldError(inputId) {
  const input = $(`#${inputId}`);
  const error = $(`#${inputId}-error`);
  error.classList.add('hidden');
  input.classList.remove('input-error');
}

function readInteger(inputId, label, options = {}) {
  const value = $(`#${inputId}`).value.trim();
  if (!/^-?\d+$/.test(value)) {
    showFieldError(inputId, `请正确输入${label}`);
    return null;
  }
  const num = Number(value);
  if (!Number.isSafeInteger(num)) {
    showFieldError(inputId, `${label}过大`);
    return null;
  }
  if (options.min !== undefined && num < options.min) {
    showFieldError(inputId, `${label}过小`);
    return null;
  }
  if (options.max !== undefined && num > options.max) {
    showFieldError(inputId, `${label}过大`);
    return null;
  }
  clearFieldError(inputId);
  return num;
}

function bindIntegerValidation(inputId, label, options = {}) {
  $(`#${inputId}`).addEventListener('input', () => {
    const value = $(`#${inputId}`).value.trim();
    if (!value) {
      clearFieldError(inputId);
      return;
    }
    readInteger(inputId, label, options);
  });
}

function animateRandomNumber(min, max, finalValue) {
  const resultEl = $('#rand-number-result');
  const button = $('#btn-number');
  button.disabled = true;
  button.textContent = '生成中...';
  resultEl.classList.add('random-rolling');

  const steps = 28;
  let index = 0;

  function next() {
    const progress = index / (steps - 1);
    const delay = 28 + Math.pow(progress, 2.4) * 210;
    const value = index === steps - 1
      ? finalValue
      : Math.floor(Math.random() * (max - min + 1)) + min;
    resultEl.textContent = value;
    index += 1;

    if (index <= steps) {
      setTimeout(next, delay);
    } else {
      resultEl.classList.remove('random-rolling');
      resultEl.classList.add('random-final');
      setTimeout(() => resultEl.classList.remove('random-final'), 420);
      button.disabled = false;
      button.textContent = '生成';
    }
  }

  next();
}

function mountRandomNumber() {
  bindIntegerValidation('rand-min', '最小值');
  bindIntegerValidation('rand-max', '最大值');
  $('#btn-number').onclick = async () => {
    const min = readInteger('rand-min', '最小值');
    const max = readInteger('rand-max', '最大值');
    if (min === null || max === null) return;
    if (min > max) {
      showFieldError('rand-min', '最小值不能大于最大值');
      showFieldError('rand-max', '最大值不能小于最小值');
      showToast('最小值不能大于最大值', 'error');
      return;
    }
    try {
      const r = await api.randomNumber({ min, max });
      animateRandomNumber(min, max, r.result);
    } catch (e) { showToast(e.message, 'error'); }
  };
}

function animateRandomPick(items, count, finalItems) {
  const resultEl = $('#pick-result');
  const button = $('#btn-pick');
  button.disabled = true;
  button.textContent = '抽取中...';
  resultEl.classList.add('random-rolling');

  const steps = 28;
  let index = 0;

  function sampleItems() {
    const pool = [...items];
    const selected = [];
    for (let i = 0; i < count && pool.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }
    return selected;
  }

  function render(itemsToRender) {
    resultEl.innerHTML = itemsToRender.map(i => `<span class="tag tag-lg">${escHtml(i)}</span>`).join(' ');
  }

  function next() {
    const progress = index / (steps - 1);
    const delay = 28 + Math.pow(progress, 2.4) * 210;
    render(index === steps - 1 ? finalItems : sampleItems());
    index += 1;

    if (index <= steps) {
      setTimeout(next, delay);
    } else {
      resultEl.classList.remove('random-rolling');
      resultEl.classList.add('random-final');
      setTimeout(() => resultEl.classList.remove('random-final'), 420);
      button.disabled = false;
      button.textContent = '抽取';
    }
  }

  next();
}

function mountRandomPick() {
  bindIntegerValidation('pick-count', '抽取数量', { min: 1 });
  $('#pick-items').addEventListener('input', () => {
    const items = $('#pick-items').value.split(',').map(s => s.trim()).filter(Boolean);
    if (items.length === 0) showFieldError('pick-items', '请至少输入一个候选项');
    else clearFieldError('pick-items');
  });
  $('#btn-pick').onclick = async () => {
    const items = $('#pick-items').value.split(',').map(s => s.trim()).filter(Boolean);
    if (items.length === 0) {
      showFieldError('pick-items', '请至少输入一个候选项');
      return;
    }
    clearFieldError('pick-items');
    const count = readInteger('pick-count', '抽取数量', { min: 1 });
    if (count === null) return;
    if (count > items.length) {
      showFieldError('pick-count', '抽取数量不能大于候选项数量');
      showToast('抽取数量不能大于候选项数量', 'error');
      return;
    }
    try {
      const r = await api.randomPick({ items, count });
      animateRandomPick(items, count, r.items);
    } catch (e) { showToast(e.message, 'error'); }
  };
}

function mountRandomDice() {
  bindIntegerValidation('dice-sides', '面数', { min: 2, max: 1000 });
  bindIntegerValidation('dice-count', '数量', { min: 1, max: 100 });
  $('#btn-dice').onclick = async () => {
    const sides = readInteger('dice-sides', '面数', { min: 2, max: 1000 });
    const count = readInteger('dice-count', '数量', { min: 1, max: 100 });
    if (sides === null || count === null) return;
    try {
      const r = await api.randomDice({ sides, count });
      $('#dice-result').innerHTML = r.rolls.map(v => `<span class="tag tag-lg">${v}</span>`).join(' ') + `&nbsp;&nbsp;总和: <strong>${r.total}</strong>`;
    } catch (e) { showToast(e.message, 'error'); }
  };
}
