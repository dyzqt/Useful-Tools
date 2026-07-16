function renderCountdowns() {
  return `
    <div class="tool-header"><h2>倒计时</h2><p>设置目标日期，实时查看剩余时间</p></div>
    <div class="card">
      <h3 id="cd-form-title">新建倒计时</h3>
      <input type="hidden" id="cd-edit-id" />
      <div class="form-group">
        <label for="cd-title">标题</label><input type="text" id="cd-title" placeholder="如：期末考试" maxlength="120" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="cd-target">目标日期时间</label><input type="datetime-local" id="cd-target" />
        </div>
        <div class="form-group">
          <label for="cd-desc">说明（可选）</label><input type="text" id="cd-desc" placeholder="简短说明" />
        </div>
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" id="cd-save">保存</button>
        <button class="btn btn-outline hidden" id="cd-cancel">取消编辑</button>
      </div>
    </div>
    <div id="cd-confirm" class="confirm-overlay hidden">
      <div class="confirm-box">
        <p>是否添加到备忘录？</p>
        <div class="confirm-actions">
          <button class="btn btn-outline" id="cd-confirm-cancel">取消</button>
          <button class="btn btn-primary" id="cd-confirm-ok">确定</button>
        </div>
      </div>
    </div>
    <div class="card"><div id="cd-list" class="item-list"></div></div>`;
}

function mountCountdowns() {
  const listEl = () => $('#cd-list');
  const titleEl = $('#cd-title');
  const targetEl = $('#cd-target');
  const descEl = $('#cd-desc');
  const editIdEl = $('#cd-edit-id');
  const formTitle = $('#cd-form-title');
  const cancelBtn = $('#cd-cancel');
  const confirmEl = $('#cd-confirm');
  const confirmOkBtn = $('#cd-confirm-ok');
  const confirmCancelBtn = $('#cd-confirm-cancel');

  function resetForm() {
    editIdEl.value = '';
    titleEl.value = '';
    targetEl.value = '';
    descEl.value = '';
    formTitle.textContent = '新建倒计时';
    cancelBtn.classList.add('hidden');
  }

  async function saveCountdown(addToMemo) {
    const title = titleEl.value.trim();
    const target = targetEl.value;
    const id = editIdEl.value;
    const dt = new Date(target);
    const payload = { title, target_at: dt.toISOString(), description: descEl.value };
    if (!id) payload.add_to_memo = addToMemo;
    try {
      if (id) { await api.updateCountdown(id, payload); showToast('已更新'); }
      else { await api.createCountdown(payload); showToast('已创建'); }
      resetForm();
      loadList();
    } catch (e) { showToast(e.message, 'error'); }
  }

  $('#cd-save').onclick = async () => {
    const title = titleEl.value.trim();
    const target = targetEl.value;
    if (!title || !target) { showToast('标题和目标日期不能为空', 'error'); return; }
    if (editIdEl.value) {
      await saveCountdown(false);
      return;
    }
    confirmEl.classList.remove('hidden');
  };
  confirmOkBtn.onclick = () => { confirmEl.classList.add('hidden'); saveCountdown(true); };
  confirmCancelBtn.onclick = () => { confirmEl.classList.add('hidden'); saveCountdown(false); };
  confirmEl.onclick = (e) => { if (e.target === confirmEl) { confirmEl.classList.add('hidden'); saveCountdown(false); } };
  cancelBtn.onclick = resetForm;

  async function loadList() {
    try {
      const data = await api.listCountdowns();
      if (data.items.length === 0) {
        listEl().innerHTML = `<div class="empty">暂无倒计时，来创建一个吧</div>`;
        return;
      }
      listEl().innerHTML = data.items.map(c => {
        const r = c.remaining;
        const expired = c.is_expired;
        return `
        <div class="item-row">
          <div class="item-info">
            <div class="item-title">${escHtml(c.title)} ${expired ? '<span class="expired-badge">已过期</span>' : ''}</div>
            <div class="item-meta">目标: ${formatDate(c.target_at)} · ${escHtml(c.description || '')}</div>
            ${expired ? '' : `
              <div class="remaining">
                <div class="remaining-unit"><div class="num">${r.days}</div><div class="lbl">天</div></div>
                <div class="remaining-unit"><div class="num">${r.hours}</div><div class="lbl">时</div></div>
                <div class="remaining-unit"><div class="num">${r.minutes}</div><div class="lbl">分</div></div>
              </div>`}
          </div>
          <div class="item-actions">
            <button class="btn btn-outline btn-sm edit-cd" data-id="${c.id}">编辑</button>
            <button class="btn btn-danger btn-sm del-cd" data-id="${c.id}">删除</button>
          </div>
        </div>`;
      }).join('');

      $$('.edit-cd').forEach(btn => btn.onclick = () => editItem(parseInt(btn.dataset.id)));
      $$('.del-cd').forEach(btn => btn.onclick = () => delItem(parseInt(btn.dataset.id)));
    } catch (e) { listEl().innerHTML = `<div class="empty">加载失败: ${escHtml(e.message)}</div>`; }
  }

  async function editItem(id) {
    try {
      const c = await api.getCountdown(id);
      editIdEl.value = c.id;
      titleEl.value = c.title;
      // convert ISO to datetime-local format
      const d = new Date(c.target_at);
      targetEl.value = d.toISOString().slice(0, 16);
      descEl.value = c.description || '';
      formTitle.textContent = '编辑倒计时';
      cancelBtn.classList.remove('hidden');
      titleEl.focus();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function delItem(id) {
    if (!confirm('确认删除？')) return;
    try { await api.deleteCountdown(id); showToast('已删除'); loadList(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  loadList();
}
