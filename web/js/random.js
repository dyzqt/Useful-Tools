function renderRandom() {
  return `
    <div class="tool-header"><h2>随机工具</h2><p>随机数生成 · 抽签 · 掷骰子</p></div>
    <div class="card"><h3>随机数</h3>
      <div class="form-row">
        <div class="form-group"><label>最小值</label><input type="number" id="rand-min" value="1" /></div>
        <div class="form-group"><label>最大值</label><input type="number" id="rand-max" value="100" /></div>
        <div class="form-group" style="flex:0;align-self:flex-end"><button class="btn btn-primary" id="btn-number">生成</button></div>
      </div>
      <div id="rand-number-result" style="font-size:28px;font-weight:700;text-align:center;margin-top:12px;color:var(--primary)"></div>
    </div>
    <div class="card"><h3>随机抽签</h3>
      <div class="form-group"><label>候选列表（逗号分隔）</label><input type="text" id="pick-items" value="A, B, C, D, E" /></div>
      <div class="form-row">
        <div class="form-group"><label>抽取数量</label><input type="number" id="pick-count" value="1" min="1" /></div>
        <div class="form-group" style="flex:0;align-self:flex-end"><button class="btn btn-primary" id="btn-pick">抽取</button></div>
      </div>
      <div id="pick-result" style="font-size:18px;text-align:center;margin-top:12px"></div>
    </div>
    <div class="card"><h3>掷骰子</h3>
      <div class="form-row">
        <div class="form-group"><label>面数</label><input type="number" id="dice-sides" value="6" min="2" max="1000" /></div>
        <div class="form-group"><label>数量</label><input type="number" id="dice-count" value="2" min="1" max="100" /></div>
        <div class="form-group" style="flex:0;align-self:flex-end"><button class="btn btn-primary" id="btn-dice">掷骰子</button></div>
      </div>
      <div id="dice-result" style="font-size:18px;text-align:center;margin-top:12px"></div>
    </div>`;
}

function mountRandom() {
  $('#btn-number').onclick = async () => {
    try {
      const min = parseInt($('#rand-min').value);
      const max = parseInt($('#rand-max').value);
      const r = await api.randomNumber({ min, max });
      $('#rand-number-result').textContent = r.result;
    } catch (e) { showToast(e.message, 'error'); }
  };
  $('#btn-pick').onclick = async () => {
    try {
      const items = $('#pick-items').value.split(',').map(s => s.trim()).filter(Boolean);
      const count = parseInt($('#pick-count').value);
      const r = await api.randomPick({ items, count });
      $('#pick-result').innerHTML = r.items.map(i => `<span class="tag" style="font-size:14px">${escHtml(i)}</span>`).join(' ');
    } catch (e) { showToast(e.message, 'error'); }
  };
  $('#btn-dice').onclick = async () => {
    try {
      const sides = parseInt($('#dice-sides').value);
      const count = parseInt($('#dice-count').value);
      const r = await api.randomDice({ sides, count });
      $('#dice-result').innerHTML = r.rolls.map(v => `<span class="tag" style="font-size:14px">${v}</span>`).join(' ') + `&nbsp;&nbsp;总和: <strong>${r.total}</strong>`;
    } catch (e) { showToast(e.message, 'error'); }
  };
}
