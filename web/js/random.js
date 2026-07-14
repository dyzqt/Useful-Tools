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
          <div class="form-group"><label for="rand-min">最小值</label><input type="number" id="rand-min" value="1" /></div>
          <div class="form-group"><label for="rand-max">最大值</label><input type="number" id="rand-max" value="100" /></div>
          <div class="form-group form-group-compact"><button class="btn btn-primary" id="btn-number">生成</button></div>
        </div>
        <div id="rand-number-result" class="result-panel result-panel-strong"></div>
      </div>`,
    pick: `
      <div class="card"><h3>随机抽签</h3>
        <div class="form-group"><label for="pick-items">候选列表（逗号分隔）</label><input type="text" id="pick-items" value="A, B, C, D, E" /></div>
        <div class="form-row">
          <div class="form-group"><label for="pick-count">抽取数量</label><input type="number" id="pick-count" value="1" min="1" /></div>
          <div class="form-group form-group-compact"><button class="btn btn-primary" id="btn-pick">抽取</button></div>
        </div>
        <div id="pick-result" class="result-panel result-panel-medium"></div>
      </div>`,
    dice: `
      <div class="card"><h3>掷骰子</h3>
        <div class="form-row">
          <div class="form-group"><label for="dice-sides">面数</label><input type="number" id="dice-sides" value="6" min="2" max="1000" /></div>
          <div class="form-group"><label for="dice-count">数量</label><input type="number" id="dice-count" value="2" min="1" max="100" /></div>
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

function mountRandomNumber() {
  $('#btn-number').onclick = async () => {
    try {
      const min = parseInt($('#rand-min').value);
      const max = parseInt($('#rand-max').value);
      const r = await api.randomNumber({ min, max });
      $('#rand-number-result').textContent = r.result;
    } catch (e) { showToast(e.message, 'error'); }
  };
}

function mountRandomPick() {
  $('#btn-pick').onclick = async () => {
    try {
      const items = $('#pick-items').value.split(',').map(s => s.trim()).filter(Boolean);
      const count = parseInt($('#pick-count').value);
      const r = await api.randomPick({ items, count });
      $('#pick-result').innerHTML = r.items.map(i => `<span class="tag tag-lg">${escHtml(i)}</span>`).join(' ');
    } catch (e) { showToast(e.message, 'error'); }
  };
}

function mountRandomDice() {
  $('#btn-dice').onclick = async () => {
    try {
      const sides = parseInt($('#dice-sides').value);
      const count = parseInt($('#dice-count').value);
      const r = await api.randomDice({ sides, count });
      $('#dice-result').innerHTML = r.rolls.map(v => `<span class="tag tag-lg">${v}</span>`).join(' ') + `&nbsp;&nbsp;总和: <strong>${r.total}</strong>`;
    } catch (e) { showToast(e.message, 'error'); }
  };
}
