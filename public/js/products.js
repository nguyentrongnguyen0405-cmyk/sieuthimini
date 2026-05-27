window.MiniMart = window.MiniMart || {};

MiniMart.Products = (function () {
  'use strict';

  let searchQuery = '';
  let filterCategory = 'all';
  let currentPage = 1;
  const perPage = 10;

  function init() {
    // Reset state on init
    searchQuery = '';
    filterCategory = 'all';
    currentPage = 1;
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
            categories.map(function (c) {
              return '<option value="' + c.id + '"' + (filterCategory === c.id ? ' selected' : '') + '>' + c.icon + ' ' + escapeHtml(c.name) + '</option>';
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
    var products = MiniMart.Data.getProducts();
    var categories = MiniMart.Data.getCategories();

    return products.filter(function (p) {
      // Search filter
      if (searchQuery) {
        var q = searchQuery;
        var nameMatch = p.name.toLowerCase().indexOf(q) !== -1;
        var codeMatch = p.code.toLowerCase().indexOf(q) !== -1;
        if (!nameMatch && !codeMatch) return false;
      }
      // Category filter
      if (filterCategory !== 'all' && p.category !== filterCategory) {
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

    var categories = MiniMart.Data.getCategories();
    var catMap = {};
    categories.forEach(function (c) { catMap[c.id] = c; });

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
        var cat = catMap[p.category];
        var catName = cat ? (cat.icon + ' ' + cat.name) : p.category;

        // Stock indicator
        var stockClass, stockLabel;
        if (p.stock <= 0) {
          stockClass = 'red';
          stockLabel = 'Hết hàng';
        } else if (p.stock <= 10) {
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
            '<span class="product-image-preview">' + (p.image || '📦') + '</span>' +
            '<span>' + escapeHtml(p.name) + '</span>' +
          '</div></td>' +
          '<td><code>' + escapeHtml(p.code) + '</code></td>' +
          '<td>' + escapeHtml(catName) + '</td>' +
          '<td class="text-right">' + MiniMart.Utils.formatCurrency(p.price) + '</td>' +
          '<td class="text-right">' + MiniMart.Utils.formatCurrency(p.costPrice) + '</td>' +
          '<td><div class="flex" style="align-items:center;gap:6px"><span class="stock-indicator ' + stockClass + '"></span>' + p.stock + ' ' + escapeHtml(p.unit || '') + '</div></td>' +
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
        var products = MiniMart.Data.getProducts();
        var product = products.find(function (p) { return p.id === id; });
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
    var categories = MiniMart.Data.getCategories();

    var title = isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới';
    var p = product || {
      name: '',
      code: '',
      category: categories.length > 0 ? categories[0].id : '',
      price: '',
      costPrice: '',
      stock: 0,
      unit: 'cái',
      image: '📦',
      status: 'active'
    };

    var html =
      '<div class="modal-header">' +
        '<h3>' + title + '</h3>' +
        '<button class="modal-close" onclick="MiniMart.Utils.closeModal()">✕</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<form id="productForm">' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Tên sản phẩm <span class="text-danger">*</span></label>' +
              '<input type="text" class="form-input" id="pf_name" value="' + escapeAttr(p.name) + '" placeholder="Nhập tên sản phẩm" required>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Mã sản phẩm <span class="text-danger">*</span></label>' +
              '<input type="text" class="form-input" id="pf_code" value="' + escapeAttr(p.code) + '" placeholder="VD: SP001" required>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Danh mục <span class="text-danger">*</span></label>' +
              '<select class="form-select" id="pf_category">' +
                categories.map(function (c) {
                  return '<option value="' + c.id + '"' + (p.category === c.id ? ' selected' : '') + '>' + c.icon + ' ' + escapeHtml(c.name) + '</option>';
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
              '<input type="number" class="form-input" id="pf_costPrice" value="' + (p.costPrice || '') + '" placeholder="0" min="0" required>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Tồn kho</label>' +
              '<input type="number" class="form-input" id="pf_stock" value="' + (p.stock != null ? p.stock : 0) + '" min="0">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Biểu tượng (emoji)</label>' +
              '<input type="text" class="form-input" id="pf_image" value="' + escapeAttr(p.image || '📦') + '" placeholder="📦">' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Trạng thái</label>' +
            '<select class="form-select" id="pf_status">' +
              '<option value="active"' + (p.status === 'active' ? ' selected' : '') + '>Hoạt động</option>' +
              '<option value="inactive"' + (p.status === 'inactive' ? ' selected' : '') + '>Ngừng bán</option>' +
            '</select>' +
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

  function saveProduct(editId) {
    var name = document.getElementById('pf_name').value.trim();
    var code = document.getElementById('pf_code').value.trim();
    var category = document.getElementById('pf_category').value;
    var price = parseFloat(document.getElementById('pf_price').value);
    var costPrice = parseFloat(document.getElementById('pf_costPrice').value);
    var stock = parseInt(document.getElementById('pf_stock').value, 10) || 0;
    var unit = document.getElementById('pf_unit').value.trim();
    var image = document.getElementById('pf_image').value.trim() || '📦';
    var status = document.getElementById('pf_status').value;

    // Validation
    if (!name) {
      MiniMart.Utils.showToast('Vui lòng nhập tên sản phẩm', 'error');
      document.getElementById('pf_name').focus();
      return;
    }
    if (!code) {
      MiniMart.Utils.showToast('Vui lòng nhập mã sản phẩm', 'error');
      document.getElementById('pf_code').focus();
      return;
    }
    if (isNaN(price) || price < 0) {
      MiniMart.Utils.showToast('Giá bán không hợp lệ', 'error');
      document.getElementById('pf_price').focus();
      return;
    }
    if (isNaN(costPrice) || costPrice < 0) {
      MiniMart.Utils.showToast('Giá vốn không hợp lệ', 'error');
      document.getElementById('pf_costPrice').focus();
      return;
    }
    if (stock < 0) {
      MiniMart.Utils.showToast('Tồn kho không hợp lệ', 'error');
      document.getElementById('pf_stock').focus();
      return;
    }

    var products = MiniMart.Data.getProducts();

    // Check duplicate code
    var duplicateCode = products.find(function (p) {
      return p.code.toLowerCase() === code.toLowerCase() && p.id !== editId;
    });
    if (duplicateCode) {
      MiniMart.Utils.showToast('Mã sản phẩm đã tồn tại', 'error');
      document.getElementById('pf_code').focus();
      return;
    }

    if (editId) {
      // Update existing product
      products = products.map(function (p) {
        if (p.id === editId) {
          return Object.assign({}, p, {
            name: name,
            code: code,
            category: category,
            price: price,
            costPrice: costPrice,
            stock: stock,
            unit: unit,
            image: image,
            status: status
          });
        }
        return p;
      });
      MiniMart.Data.setProducts(products);
      MiniMart.Utils.showToast('Cập nhật sản phẩm thành công!', 'success');
    } else {
      // Add new product
      var newProduct = {
        id: MiniMart.Data.generateId(),
        name: name,
        code: code,
        category: category,
        price: price,
        costPrice: costPrice,
        stock: stock,
        unit: unit,
        image: image,
        status: status
      };
      products.push(newProduct);
      MiniMart.Data.setProducts(products);
      MiniMart.Utils.showToast('Thêm sản phẩm thành công!', 'success');
    }

    MiniMart.Utils.closeModal();
    renderTable();
  }

  function deleteProduct(productId) {
    if (!MiniMart.Utils.confirmDialog('Bạn có chắc chắn muốn ngừng bán sản phẩm này?')) {
      return;
    }

    var products = MiniMart.Data.getProducts();
    products = products.map(function (p) {
      if (p.id === productId) {
        return Object.assign({}, p, { status: 'inactive' });
      }
      return p;
    });

    MiniMart.Data.setProducts(products);
    MiniMart.Utils.showToast('Đã ngừng bán sản phẩm', 'success');
    renderTable();
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
