function renderConvert() {
  return `
    <div class="tool-header"><h2>单位换算</h2><p>长度 · 温度 · 重量换算</p></div>
    <div class="card"><h3>单位换算</h3>
      <div class="form-row">
        <div class="form-group"><label for="conv-cat">类别</label><select id="conv-cat"><option value="length">长度</option><option value="temperature">温度</option><option value="weight">重量</option></select></div>
        <div class="form-group"><label for="conv-val">数值</label><input type="number" id="conv-val" value="1" step="any" /></div>
        <div class="form-group"><label for="conv-from">从</label><select id="conv-from"></select></div>
        <div class="form-group"><label for="conv-to">到</label><select id="conv-to"></select></div>
        <div class="form-group form-group-compact"><button class="btn btn-primary" id="btn-convert">换算</button></div>
      </div>
      <div id="conv-result" class="result-panel result-panel-convert"></div>
    </div>`;
}

const UNITS = {
  length: ['mm','cm','m','km','in','ft','yd','mile'],
  temperature: ['c','f','k'],
  weight: ['mg','g','kg','ton','oz','lb'],
};

const UNIT_LABELS = {
  mm: '毫米',
  cm: '厘米',
  m: '米',
  km: '千米',
  in: '英寸',
  ft: '英尺',
  yd: '码',
  mile: '英里',
  c: '摄氏度',
  f: '华氏度',
  k: '开尔文',
  mg: '毫克',
  g: '克',
  kg: '千克',
  ton: '吨',
  oz: '盎司',
  lb: '磅',
};

function unitLabel(unit) {
  return UNIT_LABELS[unit] || unit;
}

function mountConvert() {
  function populateUnits() {
    const cat = $('#conv-cat').value;
    const opts = UNITS[cat].map(u => `<option value="${u}">${unitLabel(u)}</option>`).join('');
    $('#conv-from').innerHTML = opts;
    $('#conv-to').innerHTML = opts;
    if (UNITS[cat].length > 1) {
      $('#conv-from').value = UNITS[cat][0];
      $('#conv-to').value = UNITS[cat][1];
    }
  }
  $('#conv-cat').onchange = populateUnits;
  populateUnits();

  $('#btn-convert').onclick = async () => {
    try {
      const r = await api.convert({
        category: $('#conv-cat').value,
        from_unit: $('#conv-from').value,
        to_unit: $('#conv-to').value,
        value: parseFloat($('#conv-val').value),
      });
      $('#conv-result').textContent = `${r.value} ${unitLabel(r.from_unit)} = ${r.result} ${unitLabel(r.to_unit)}`;
    } catch (e) { showToast(e.message, 'error'); }
  };
}
