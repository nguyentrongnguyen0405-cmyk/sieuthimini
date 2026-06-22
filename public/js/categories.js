window.MiniMart = window.MiniMart || {};

MiniMart.Categories = (function() {
  let categories = [];
  const token = localStorage.getItem('auth_token');

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeAttr(str) { return escapeHtml(str); }

  async function loadCategories() {
    try {
      const response = await fetch('api/categories', {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        categories = data.data;
        renderCategories();
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  }

  function renderCategories() {
    const container = document.getElementById('page-categories');
    if (!container) return;

    let html = `
      <div class="page-header">
        <div class="page-header-left">
          <h2 class="page-header-title">🏷️ Quản lý Danh mục</h2>
          <p class="page-header-subtitle">Thêm, sửa, xóa danh mục sản phẩm</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="MiniMart.Categories.showAddModal()">+ Thêm Danh mục</button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th width="80">ID</th>
                <th width="80" class="text-center">Icon</th>
                <th>Tên danh mục</th>
                <th width="200" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
    `;

    categories.forEach(cat => {
      html += `
        <tr>
          <td><strong>${cat.id}</strong></td>
          <td class="text-center"><span style="font-size: 20px;">${cat.icon || '🏷️'}</span></td>
          <td>${escapeHtml(cat.name)}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-secondary" onclick="MiniMart.Categories.showEditModal(${cat.id}, '${escapeAttr(cat.name)}', '${escapeAttr(cat.icon || '')}')">✏️ Sửa</button>
            <button class="btn btn-sm btn-secondary" style="color: var(--danger); margin-left: 4px;" onclick="MiniMart.Categories.deleteCategory(${cat.id})">🗑️ Xóa</button>
          </td>
        </tr>
      `;
    });

    if (categories.length === 0) {
      html += `<tr><td colspan="4" class="text-center text-muted">Chưa có danh mục nào</td></tr>`;
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  function showAddModal() {
    MiniMart.Utils.showModal(`
      <div class="modal-header">
        <h3>+ Thêm Danh mục</h3>
        <button class="modal-close" onclick="MiniMart.Utils.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Tên danh mục <span class="text-danger">*</span></label>
          <input type="text" class="form-input" id="catNameInput" placeholder="VD: Nước giải khát">
        </div>
        <div class="form-group">
          <label class="form-label">Icon (Emoji)</label>
          <input type="text" class="form-input" id="catIconInput" placeholder="VD: 🥤">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="MiniMart.Utils.closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="MiniMart.Categories.submitAdd()">Lưu</button>
      </div>
    `);
    setTimeout(() => document.getElementById('catNameInput').focus(), 100);
  }

  function submitAdd() {
    const name = document.getElementById('catNameInput').value;
    const icon = document.getElementById('catIconInput').value;
    if (!name.trim()) return MiniMart.Utils.showToast('Vui lòng nhập tên danh mục', 'error');
    
    saveCategory({ name: name.trim(), icon: icon.trim() });
    MiniMart.Utils.closeModal();
  }

  function showEditModal(id, currentName, currentIcon) {
    MiniMart.Utils.showModal(`
      <div class="modal-header">
        <h3>✏️ Sửa Danh mục</h3>
        <button class="modal-close" onclick="MiniMart.Utils.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Tên danh mục <span class="text-danger">*</span></label>
          <input type="text" class="form-input" id="catNameEdit" value="${currentName}">
        </div>
        <div class="form-group">
          <label class="form-label">Icon (Emoji)</label>
          <input type="text" class="form-input" id="catIconEdit" value="${currentIcon}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="MiniMart.Utils.closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="MiniMart.Categories.submitEdit(${id})">Cập nhật</button>
      </div>
    `);
    setTimeout(() => document.getElementById('catNameEdit').focus(), 100);
  }

  function submitEdit(id) {
    const name = document.getElementById('catNameEdit').value;
    const icon = document.getElementById('catIconEdit').value;
    if (!name.trim()) return MiniMart.Utils.showToast('Vui lòng nhập tên danh mục', 'error');
    
    updateCategory(id, { name: name.trim(), icon: icon.trim() });
    MiniMart.Utils.closeModal();
  }

  async function saveCategory(data) {
    try {
      const response = await fetch('api/categories', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        MiniMart.Utils.showToast('Thêm danh mục thành công!', 'success');
        loadCategories();
      } else {
        MiniMart.Utils.showToast("Lỗi: " + result.message, 'error');
      }
    } catch (e) {
      console.error(e);
      MiniMart.Utils.showToast('Có lỗi xảy ra', 'error');
    }
  }

  async function updateCategory(id, data) {
    try {
      const response = await fetch('api/categories/' + id, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        MiniMart.Utils.showToast('Cập nhật danh mục thành công!', 'success');
        loadCategories();
      } else {
        MiniMart.Utils.showToast("Lỗi: " + result.message, 'error');
      }
    } catch (e) {
      console.error(e);
      MiniMart.Utils.showToast('Có lỗi xảy ra', 'error');
    }
  }

  async function deleteCategory(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      const response = await fetch('api/categories/' + id, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        MiniMart.Utils.showToast('Xóa danh mục thành công!', 'success');
        loadCategories();
      } else {
        MiniMart.Utils.showToast("Lỗi: " + result.message, 'error');
      }
    } catch (e) {
      console.error(e);
      MiniMart.Utils.showToast('Có lỗi xảy ra', 'error');
    }
  }

  function init() {
    loadCategories();
  }

  return { init, loadCategories, showAddModal, showEditModal, submitAdd, submitEdit, deleteCategory };
})();
