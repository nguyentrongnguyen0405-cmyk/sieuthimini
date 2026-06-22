window.MiniMart = window.MiniMart || {};

MiniMart.Products = (function () {
  'use strict';

  let searchQuery = '';
  let filterCategory = 'all';
  let currentPage = 1;
  const perPage = 10;
  let serverProducts = [];
  let serverCategories = [];
  const token = localStorage.getItem('auth_token');

  async function loadData() {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('api/products', { headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' } }),
        fetch('api/categories', { headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' } })
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      
      if (prodData.success) serverProducts = prodData.data;
      if (catData.success) serverCategories = catData.data;
      
      renderTable();
    } catch (e) {
      console.error('Error loading data', e);
    }
  }

  function init() {
    // Reset state on init
    searchQuery = '';
    filterCategory = 'all';
    currentPage = 1;
    loadData();
  }

  function render() {
    const container = document.getElementById('page-products');
    if (!container) return;

    const categories = MiniMart.Data.getCategories();

    container.innerHTML =
      '<div class="page-header">' +
        '<div class="page-header-left">' +
          '<h2 class="page-header-title">📦 Quản lý sản phẩm</h2>' +
          '<p class="page-header-subtitle">Thêm, sửa, xóa sản phẩm trong siêu thị</p>' +
        '</div>' +
        '<div class="page-header-actions">' +
          '<div class="search-bar">' +
            '<span class="search-icon">🔍</span>' +
            '<input type="text" class="form-input" id="productSearch" placeholder="Tìm sản phẩm..." value="' + escapeAttr(searchQuery) + '">' +
          '</div>' +
          '<select class="form-select" id="productCategoryFilter" style="width:160px">' +
            '<option value="all">Tất cả danh mục</option>' +
            serverCategories.map(function (c) {
              return '<option value="' + c.id + '"' + (filterCategory == c.id ? ' selected' : '') + '>📁 ' + escapeHtml(c.name) + '</option>';
            }).join('') +
          '</select>' +
          '<button class="btn btn-primary" id="addProductBtn">➕ Thêm sản phẩm</button>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="table-container">' +
          '<table class="data-table">' +
            '<thead><tr>' +
              '<th>Sản phẩm</th>' +
              '<th>Mã SP</th>' +
              '<th>Danh mục</th>' +
              '<th>Giá bán</th>' +
              '<th>Giá vốn</th>' +
              '<th>Tồn kho</th>' +
              '<th>Trạng thái</th>' +
              '<th>Thao tác</th>' +
            '</tr></thead>' +
            '<tbody id="productTableBody"></tbody>' +
          '</table>' +
        '</div>' +
        '<div class="pagination" id="productPagination"></div>' +
      '</div>';

    // Event listeners
    var searchInput = document.getElementById('productSearch');
    if (searchInput) {
      searchInput.addEventListener('input', MiniMart.Utils.debounce(function (e) {
        searchQuery = e.target.value.toLowerCase().trim();
        currentPage = 1;
        renderTable();
      }, 200));
    }

    var catFilter = document.getElementById('productCategoryFilter');
    if (catFilter) {
      catFilter.addEventListener('change', function (e) {
        filterCategory = e.target.value;
        currentPage = 1;
        renderTable();
      });
    }

    var addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        showProductForm();
      });
    }

    renderTable();
  }

  function getFilteredProducts() {
    return serverProducts.filter(function (p) {
      // Search filter
      if (searchQuery) {
        var q = searchQuery;
        var nameMatch = p.name.toLowerCase().indexOf(q) !== -1;
        var codeMatch = p.barcode && p.barcode.toLowerCase().indexOf(q) !== -1;
        if (!nameMatch && !codeMatch) return false;
      }
      // Category filter
      if (filterCategory !== 'all' && p.category_id != filterCategory) {
        return false;
      }
      return true;
    });
  }

  function renderTable() {
    var tbody = document.getElementById('productTableBody');
    var paginationEl = document.getElementById('productPagination');
    if (!tbody || !paginationEl) return;

    var filtered = getFilteredProducts();
    var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    var startIdx = (currentPage - 1) * perPage;
    var pageItems = filtered.slice(startIdx, startIdx + perPage);

    var catMap = {};
    serverCategories.forEach(function (c) { catMap[c.id] = c; });

    if (pageItems.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8">' +
          '<div class="empty-state">' +
            '<div class="empty-state-icon">📦</div>' +
            '<div class="empty-state-text">Không tìm thấy sản phẩm nào</div>' +
          '</div>' +
        '</td></tr>';
    } else {
      tbody.innerHTML = pageItems.map(function (p) {
        var cat = p.category || catMap[p.category_id];
        var catName = cat ? ('📁 ' + cat.name) : 'Chưa phân loại';

        // Stock indicator
        var stockClass, stockLabel;
        if (p.stock_qty <= 0) {
          stockClass = 'red';
          stockLabel = 'Hết hàng';
        } else if (p.stock_qty <= 10) {
          stockClass = 'yellow';
          stockLabel = 'Sắp hết';
        } else {
          stockClass = 'green';
          stockLabel = 'Còn hàng';
        }

        // Status badge
        var statusBadge = p.status === 'active'
          ? '<span class="badge badge-success">Hoạt động</span>'
          : '<span class="badge badge-danger">Ngừng bán</span>';

        return '<tr>' +
          '<td><div class="flex" style="align-items:center;gap:8px">' +
            '<img src="' + escapeAttr(p.image_url || 'https://placehold.co/100x100?text=SP') + '" class="product-image-preview" alt="' + escapeAttr(p.name) + '" style="object-fit:cover">' +
            '<span>' + escapeHtml(p.name) + '</span>' +
          '</div></td>' +
          '<td><code>' + escapeHtml(p.barcode) + '</code></td>' +
          '<td>' + escapeHtml(catName) + '</td>' +
          '<td class="text-right">' + MiniMart.Utils.formatCurrency(p.price) + '</td>' +
          '<td class="text-right">' + MiniMart.Utils.formatCurrency(p.import_price) + '</td>' +
          '<td><div class="flex" style="align-items:center;gap:6px"><span class="stock-indicator ' + stockClass + '"></span>' + p.stock_qty + ' ' + escapeHtml(p.unit || '') + '</div></td>' +
          '<td>' + statusBadge + '</td>' +
          '<td><div class="product-actions">' +
            '<button class="btn btn-sm btn-ghost btn-edit-product" data-id="' + p.id + '" title="Sửa">✏️</button>' +
            '<button class="btn btn-sm btn-ghost btn-delete-product" data-id="' + p.id + '" title="Xóa">🗑️</button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }

    // Attach edit/delete handlers
    tbody.querySelectorAll('.btn-edit-product').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        var product = serverProducts.find(function (p) { return p.id == id; });
        if (product) showProductForm(product);
      });
    });

    tbody.querySelectorAll('.btn-delete-product').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        deleteProduct(id);
      });
    });

    // Pagination
    renderPagination(paginationEl, currentPage, totalPages, function (page) {
      currentPage = page;
      renderTable();
    });
  }

  function renderPagination(container, current, total, onPageChange) {
    if (total <= 1) {
      container.innerHTML = '';
      return;
    }

    var html = '';

    html += '<button class="btn btn-sm btn-ghost" ' + (current <= 1 ? 'disabled' : '') + ' data-page="' + (current - 1) + '">◀ Trước</button>';

    var startPage = Math.max(1, current - 2);
    var endPage = Math.min(total, current + 2);

    if (startPage > 1) {
      html += '<button class="btn btn-sm btn-ghost" data-page="1">1</button>';
      if (startPage > 2) html += '<span style="padding:0 4px">...</span>';
    }

    for (var i = startPage; i <= endPage; i++) {
      html += '<button class="btn btn-sm ' + (i === current ? 'btn-primary' : 'btn-ghost') + '" data-page="' + i + '">' + i + '</button>';
    }

    if (endPage < total) {
      if (endPage < total - 1) html += '<span style="padding:0 4px">...</span>';
      html += '<button class="btn btn-sm btn-ghost" data-page="' + total + '">' + total + '</button>';
    }

    html += '<button class="btn btn-sm btn-ghost" ' + (current >= total ? 'disabled' : '') + ' data-page="' + (current + 1) + '">Sau ▶</button>';

    container.innerHTML = html;

    container.querySelectorAll('button[data-page]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var page = parseInt(this.getAttribute('data-page'), 10);
        if (page >= 1 && page <= total) {
          onPageChange(page);
        }
      });
    });
  }

  function showProductForm(product) {
    var isEdit = !!product;

    var title = isEdit ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới';
    var p = product || {
      name: '',
      barcode: '',
      category_id: serverCategories.length > 0 ? serverCategories[0].id : '',
      price: '',
      import_price: '',
      stock_qty: 0,
      unit: 'cái',
      image_url: '',
      status: 'active'
    };

    var currentImage = p.image_url || '';
    var previewSrc = currentImage || 'https://placehold.co/300x300/242836/94a3b8?text=Chưa+có+ảnh';

    var html =
      '<div class="modal-header">' +
        '<h3>' + title + '</h3>' +
        '<button class="modal-close" onclick="MiniMart.Utils.closeModal()">✕</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<form id="productForm">' +

          // ── Image Preview Section ──
          '<div style="margin-bottom:20px; padding:16px; background:var(--bg-secondary); border-radius:var(--radius); border:1px solid var(--border-color)">' +
            '<label class="form-label" style="font-size:14px; font-weight:600; margin-bottom:12px; display:block">🖼️ Hình ảnh sản phẩm</label>' +
            '<div style="display:flex; gap:16px; align-items:flex-start">' +
              // Preview thumbnail
              '<div style="flex-shrink:0">' +
                '<img id="pf_imagePreview" src="' + escapeAttr(previewSrc) + '" alt="Xem trước" ' +
                  'style="width:120px; height:120px; object-fit:cover; border-radius:var(--radius-sm); border:2px solid var(--border-color); background:var(--bg-card); display:block">' +
              '</div>' +
              // URL input + helpers
              '<div style="flex:1; display:flex; flex-direction:column; gap:8px">' +
                '<input type="text" class="form-input" id="pf_image" value="' + escapeAttr(currentImage) + '" ' +
                  'placeholder="Dán link ảnh sản phẩm vào đây (https://...)" ' +
                  'style="font-size:13px">' +
                '<div style="font-size:11px; color:var(--text-muted); line-height:1.5">' +
                  '💡 <strong>Mẹo:</strong> Tìm ảnh trên <a href="https://unsplash.com" target="_blank" style="color:var(--primary)">Unsplash</a>, ' +
                  '<a href="https://www.google.com/imghp" target="_blank" style="color:var(--primary)">Google Hình ảnh</a> ' +
                  'hoặc bất kỳ link ảnh nào. Nhấp chuột phải vào ảnh → "Copy Image Address" rồi dán vào ô trên.' +
                '</div>' +
                '<div style="display:flex; gap:6px; flex-wrap:wrap">' +
                  '<button type="button" class="btn btn-sm btn-secondary" id="pf_testImageBtn">🔄 Kiểm tra ảnh</button>' +
                  '<button type="button" class="btn btn-sm btn-ghost" id="pf_clearImageBtn" style="color:var(--danger)">🗑️ Xóa ảnh</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // ── Product Info Fields ──
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Tên sản phẩm <span class="text-danger">*</span></label>' +
              '<input type="text" class="form-input" id="pf_name" value="' + escapeAttr(p.name) + '" placeholder="Nhập tên sản phẩm" required>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Mã sản phẩm <span class="text-danger">*</span></label>' +
              '<input type="text" class="form-input" id="pf_code" value="' + escapeAttr(p.barcode) + '" placeholder="VD: SP001" required>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Danh mục <span class="text-danger">*</span></label>' +
              '<select class="form-select" id="pf_category">' +
                serverCategories.map(function (c) {
                  return '<option value="' + c.id + '"' + (p.category_id == c.id ? ' selected' : '') + '>📁 ' + escapeHtml(c.name) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Đơn vị tính</label>' +
              '<input type="text" class="form-input" id="pf_unit" value="' + escapeAttr(p.unit || '') + '" placeholder="VD: cái, kg, hộp">' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Giá bán <span class="text-danger">*</span></label>' +
              '<input type="number" class="form-input" id="pf_price" value="' + (p.price || '') + '" placeholder="0" min="0" required>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Giá vốn <span class="text-danger">*</span></label>' +
              '<input type="number" class="form-input" id="pf_costPrice" value="' + (p.import_price || '') + '" placeholder="0" min="0" required>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Tồn kho</label>' +
              '<input type="number" class="form-input" id="pf_stock" value="' + (p.stock_qty != null ? p.stock_qty : 0) + '" min="0">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Trạng thái</label>' +
              '<select class="form-select" id="pf_status">' +
                '<option value="active"' + (p.status === 'active' ? ' selected' : '') + '>Hoạt động</option>' +
                '<option value="inactive"' + (p.status === 'inactive' ? ' selected' : '') + '>Ngừng bán</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
        '</form>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="MiniMart.Utils.closeModal()">Hủy</button>' +
        '<button class="btn btn-primary" id="saveProductBtn">' + (isEdit ? '💾 Lưu thay đổi' : '➕ Thêm sản phẩm') + '</button>' +
      '</div>';

    MiniMart.Utils.showModal(html);

    setTimeout(function () {
      var saveBtn = document.getElementById('saveProductBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          saveProduct(isEdit ? p.id : null);
        });
      }

      // Image preview: update on input/paste
      var imageInput = document.getElementById('pf_image');
      var imagePreview = document.getElementById('pf_imagePreview');

      function updatePreview() {
        var url = imageInput.value.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          imagePreview.src = url;
          imagePreview.style.borderColor = 'var(--success)';
        } else if (!url) {
          imagePreview.src = 'https://placehold.co/300x300/242836/94a3b8?text=Chưa+có+ảnh';
          imagePreview.style.borderColor = 'var(--border-color)';
        }
      }

      imageInput.addEventListener('input', updatePreview);
      imageInput.addEventListener('paste', function() {
        setTimeout(updatePreview, 50);
      });

      // Handle image load error
      imagePreview.addEventListener('error', function() {
        imagePreview.src = 'https://placehold.co/300x300/242836/ef4444?text=Ảnh+lỗi';
        imagePreview.style.borderColor = 'var(--danger)';
      });

      // Test image button
      var testBtn = document.getElementById('pf_testImageBtn');
      if (testBtn) {
        testBtn.addEventListener('click', function () {
          updatePreview();
          var url = imageInput.value.trim();
          if (url) {
            MiniMart.Utils.showToast('Đang kiểm tra ảnh...', 'info');
          } else {
            MiniMart.Utils.showToast('Chưa nhập link ảnh', 'error');
          }
        });
      }

      // Clear image button
      var clearBtn = document.getElementById('pf_clearImageBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          imageInput.value = '';
          updatePreview();
          MiniMart.Utils.showToast('Đã xóa ảnh sản phẩm', 'info');
        });
      }

      // Allow Enter to submit
      var form = document.getElementById('productForm');
      if (form) {
        form.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            saveProduct(isEdit ? p.id : null);
          }
        });
      }
    }, 50);
  }

  async function saveProduct(editId) {
    var name = document.getElementById('pf_name').value.trim();
    var code = document.getElementById('pf_code').value.trim();
    var category = document.getElementById('pf_category').value;
    var price = parseFloat(document.getElementById('pf_price').value);
    var costPrice = parseFloat(document.getElementById('pf_costPrice').value);
    var stock = parseInt(document.getElementById('pf_stock').value, 10) || 0;
    var unit = document.getElementById('pf_unit').value.trim();
    var image = document.getElementById('pf_image').value.trim();
    var status = document.getElementById('pf_status').value;

    // Validation
    if (!name) { MiniMart.Utils.showToast('Vui lòng nhập tên sản phẩm', 'error'); return; }
    if (!code) { MiniMart.Utils.showToast('Vui lòng nhập mã sản phẩm', 'error'); return; }
    if (isNaN(price) || price < 0) { MiniMart.Utils.showToast('Giá bán không hợp lệ', 'error'); return; }
    if (isNaN(costPrice) || costPrice < 0) { MiniMart.Utils.showToast('Giá vốn không hợp lệ', 'error'); return; }

    var payload = {
      name: name,
      barcode: code,
      category_id: category,
      price: price,
      import_price: costPrice,
      stock_qty: stock,
      unit: unit,
      image_url: image,
      status: status
    };

    try {
      let url = 'api/products';
      let method = 'POST';
      if (editId) {
        url += '/' + editId;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.success) {
        MiniMart.Utils.showToast(result.message, 'success');
        MiniMart.Utils.closeModal();
        loadData();
      } else {
        MiniMart.Utils.showToast(result.message || 'Lỗi lưu sản phẩm', 'error');
      }
    } catch (e) {
      console.error(e);
      MiniMart.Utils.showToast('Lỗi kết nối API', 'error');
    }
  }

  async function deleteProduct(productId) {
    if (!MiniMart.Utils.confirmDialog('Bạn có chắc chắn muốn ngừng bán sản phẩm này?')) {
      return;
    }

    try {
      const response = await fetch('api/products/' + productId, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        MiniMart.Utils.showToast(result.message, 'success');
        loadData();
      } else {
        MiniMart.Utils.showToast(result.message, 'error');
      }
    } catch (e) {
      console.error(e);
      MiniMart.Utils.showToast('Lỗi kết nối API', 'error');
    }
  }

  // --- Utility helpers ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  return { init: init, render: render };
})();
