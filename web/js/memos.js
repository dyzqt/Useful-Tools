function renderMemos() {
  return `
    <div class="tool-header"><h2>备忘录</h2><p>记录待办事项，支持搜索、标签分类</p></div>
    <div class="card">
      <h3 id="memo-form-title">新建备忘录</h3>
      <input type="hidden" id="memo-edit-id" />
      <div class="form-group">
        <label>标题</label><input type="text" id="memo-title" placeholder="备忘录标题" maxlength="120" />
      </div>
      <div class="form-group">
        <label>内容</label><textarea id="memo-content" placeholder="备忘录内容（可选）"></textarea>
      </div>
      <div class="form-group">
        <label>标签（逗号分隔）</label><input type="text" id="memo-tags" placeholder="如：学习, 作业" />
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" id="memo-save">保存</button>
        <button class="btn btn-outline hidden" id="memo-cancel">取消编辑</button>
      </div>
    </div>
    <div class="card">
      <div class="search-bar"><input type="text" id="memo-search" placeholder="搜索备忘录..." /></div>
      <div id="memo-list" class="item-list"></div>
    </div>`;
}

function mountMemos() {
  const listEl = () => $('#memo-list');
  const saveBtn = $('#memo-save');
  const cancelBtn = $('#memo-cancel');
  const titleEl = $('#memo-title');
  const contentEl = $('#memo-content');
  const tagsEl = $('#memo-tags');
  const editIdEl = $('#memo-edit-id');
  const formTitle = $('#memo-form-title');

  function resetForm() {
    editIdEl.value = '';
    titleEl.value = '';
    contentEl.value = '';
    tagsEl.value = '';
    formTitle.textContent = '新建备忘录';
    cancelBtn.classList.add('hidden');
  }

  saveBtn.onclick = async () => {
    const title = titleEl.value.trim();
    if (!title) { showToast('标题不能为空', 'error'); return; }
    const tags = tagsEl.value.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { title, content: contentEl.value, tags };
    try {
      const id = editIdEl.value;
      if (id) { await api.updateMemo(id, payload); showToast('已更新'); }
      else { await api.createMemo(payload); showToast('已创建'); }
      resetForm();
      loadMemoList();
    } catch (e) { showToast(e.message, 'error'); }
  };

  cancelBtn.onclick = resetForm;

  $('#memo-search').oninput = () => loadMemoList();

  async function loadMemoList() {
    const q = $('#memo-search').value.trim();
    try {
      const data = await api.listMemos(q || undefined);
      if (data.items.length === 0) {
        listEl().innerHTML = `<div class="empty">暂无备忘录，来新建一条吧</div>`;
        return;
      }
      listEl().innerHTML = data.items.map(m => `
        <div class="item-row">
          <div class="item-info">
            <div class="item-title">${escHtml(m.title)}</div>
            <div class="item-meta">${formatDate(m.updated_at)}</div>
            ${m.content ? `<div class="item-content">${escHtml(m.content)}</div>` : ''}
            ${tagList(m.tags)}
          </div>
          <div class="item-actions">
            <button class="btn btn-outline btn-sm edit-memo" data-id="${m.id}">编辑</button>
            <button class="btn btn-danger btn-sm del-memo" data-id="${m.id}">删除</button>
          </div>
        </div>`).join('');

      $$('.edit-memo').forEach(btn => btn.onclick = () => editMemo(parseInt(btn.dataset.id)));
      $$('.del-memo').forEach(btn => btn.onclick = () => delMemo(parseInt(btn.dataset.id)));
    } catch (e) { listEl().innerHTML = `<div class="empty">加载失败: ${escHtml(e.message)}</div>`; }
  }

  async function editMemo(id) {
    try {
      const m = await api.getMemo(id);
      editIdEl.value = m.id;
      titleEl.value = m.title;
      contentEl.value = m.content;
      tagsEl.value = (m.tags || []).join(', ');
      formTitle.textContent = '编辑备忘录';
      cancelBtn.classList.remove('hidden');
      titleEl.focus();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function delMemo(id) {
    if (!confirm('确认删除？')) return;
    try { await api.deleteMemo(id); showToast('已删除'); loadMemoList(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  loadMemoList();
}
