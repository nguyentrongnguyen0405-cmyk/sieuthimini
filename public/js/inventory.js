window.MiniMart = window.MiniMart || {};

MiniMart.Inventory = (function () {
  'use strict';

  let searchQuery = '';
  let filterStock = 'all'; // 'all', 'low', 'out'

  let stockEntriesData = [];
  let productsData = [];

  function init() {
    searchQuery = '';
    filterStock = 'all';
    loadData();
  }

  async function loadData() {
    try {
      const [productsRes, stockRes] = await Promise.all([
        fetch('/api/products', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            'Accept': 'application/json'
          }
        }),
        fetch('/api/stock-entries', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
            'Accept': 'application/json'
          }
        })
      ]);

      const productsDataResponse = await productsRes.json();
      const stockDataResponse = await stockRes.json();

      if (productsDataResponse.success) {
        productsData = productsDataResponse.data.filter(p => p.status === 'active');
      }
      if (stockDataResponse.success) {
        stockEntriesData = stockDataResponse.data;
      }
      render();
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }

  function render() {
    var container = document.getElementById('page-inventory');
    if (!container) return;

    var products = productsData;

    var totalProducts = products.length;
    var inStockCount = products.filter(function (p) { return p.stock_qty > 10; }).length;
    var lowStockCount = products.filter(function (p) { return p.stock_qty > 0 && p.stock_qty <= 10; }).length;
    var outOfStockCount = products.filter(function (p) { return p.stock_qty === 0; }).length;
    var totalValue = products.reduce(function (sum, p) { return sum + (p.import_price * p.stock_qty); }, 0);

    container.innerHTML =
      '<div class="page-header">' +
        '<div class="page-header-left">' +
          '<h2 class="page-header-title">🏪 Quản lý tồn kho</h2>' +
          '<p class="page-header-subtitle">Theo dõi và nhập hàng cho siêu thị</p>' +
        '</div>' +
        '<div class="page-header-actions">' +
          '<button class="btn btn-primary" id="importStockBtn">📥 Nhập hàng</button>' +
          '<button class="btn btn-secondary" id="exportStockBtn">📤 Xuất hàng</button>' +
        '</div>' +
      '</div>' +

      '<div class="stats-grid">' +
        '<div class="stat-card card"><div class="stat-card-icon blue">📦</div><div class="stat-card-info"><div class="stat-card-value">' + totalProducts + '</div><div class="stat-card-label">Tổng sản phẩm</div></div></div>' +
        '<div class="stat-card card"><div class="stat-card-icon green">✅</div><div class="stat-card-info"><div class="stat-card-value">' + inStockCount + '</div><div class="stat-card-label">Còn hàng</div></div></div>' +
        '<div class="stat-card card"><div class="stat-card-icon yellow">⚠️</div><div class="stat-card-info"><div class="stat-card-value">' + lowStockCount + '</div><div class="stat-card-label">Sắp hết hàng</div></div></div>' +
        '<div class="stat-card card"><div class="stat-card-icon red">❌</div><div class="stat-card-info"><div class="stat-card-value">' + outOfStockCount + '</div><div class="stat-card-label">Hết hàng</div></div></div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-header">' +
          '<h3 class="card-title">📋 Danh sách tồn kho — Tổng giá trị: ' + MiniMart.Utils.formatCurrency(totalValue) + '</h3>' +
          '<div style="display:flex;gap:12px;align-items:center">' +
            '<div class="search-bar"><span class="search-icon">🔍</span><input type="text" class="form-input" id="inventorySearch" placeholder="Tìm kiếm..." value="' + escapeAttr(searchQuery) + '"></div>' +
            '<div class="tabs" id="stockFilterTabs">' +
              '<button class="tab-btn' + (filterStock === 'all' ? ' active' : '') + '" data-filter="all">Tất cả</button>' +
              '<button class="tab-btn' + (filterStock === 'low' ? ' active' : '') + '" data-filter="low">Sắp hết</button>' +
              '<button class="tab-btn' + (filterStock === 'out' ? ' active' : '') + '" data-filter="out">Hết hàng</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="table-container">' +
          '<table class="data-table">' +
            '<thead><tr><th></th><th>Sản phẩm</th><th>Danh mục</th><th>Tồn kho</th><th>Đơn vị</th><th>Giá vốn</th><th>Giá trị</th><th>Trạng thái</th></tr></thead>' +
            '<tbody id="inventoryTableBody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-top:20px">' +
        '<div class="card-header"><h3 class="card-title">📋 Lịch sử nhập/xuất hàng gần đây</h3></div>' +
        '<div class="table-container">' +
          '<table class="data-table">' +
            '<thead><tr><th>Thời gian</th><th>Sản phẩm</th><th>Loại</th><th>Số lượng</th><th>Ghi chú</th><th>Người thực hiện</th></tr></thead>' +
            '<tbody id="stockHistoryBody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

    // Wire up events
    var searchInput = document.getElementById('inventorySearch');
    if (searchInput) {
      searchInput.addEventListener('input', MiniMart.Utils.debounce(function (e) {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTable();
      }, 200));
    }

    var filterTabs = document.getElementById('stockFilterTabs');
    if (filterTabs) {
      filterTabs.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          filterStock = this.getAttribute('data-filter');
          filterTabs.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');
          renderTable();
        });
      });
    }

    var importBtn = document.getElementById('importStockBtn');
    if (importBtn) {
      importBtn.addEventListener('click', function () { showStockModal('import'); });
    }

    var exportBtn = document.getElementById('exportStockBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () { showStockModal('export'); });
    }

    renderTable();
    renderStockHistory();
  }

  function renderTable() {
    var tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    var products = productsData;
    var categories = MiniMart.Data.getCategories();
    var catMap = {};
    categories.forEach(function (c) { catMap[c.id] = c; });

    // Apply search filter
    if (searchQuery) {
      products = products.filter(function (p) {
        return p.name.toLowerCase().indexOf(searchQuery) !== -1 ||
               (p.barcode && p.barcode.toLowerCase().indexOf(searchQuery) !== -1);
      });
    }

    // Apply stock filter
    if (filterStock === 'low') {
      products = products.filter(function (p) { return p.stock_qty > 0 && p.stock_qty <= 10; });
    } else if (filterStock === 'out') {
      products = products.filter(function (p) { return p.stock_qty === 0; });
    }

    if (products.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8">' +
          '<div class="empty-state">' +
            '<div class="empty-state-icon">📦</div>' +
            '<div class="empty-state-text">Không tìm thấy sản phẩm nào</div>' +
          '</div>' +
        '</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(function (p) {
      var cat = catMap[p.category_id];
      var catName = cat ? (cat.icon + ' ' + cat.name) : 'Chưa phân loại';
      var value = p.import_price * p.stock_qty;

      var stockClass, statusBadge;
      if (p.stock_qty <= 0) {
        stockClass = 'red';
        statusBadge = '<span class="badge badge-danger">Hết hàng</span>';
      } else if (p.stock_qty <= 10) {
        stockClass = 'yellow';
        statusBadge = '<span class="badge badge-warning">Sắp hết</span>';
      } else {
        stockClass = 'green';
        statusBadge = '<span class="badge badge-success">Còn hàng</span>';
      }

      return '<tr>' +
        '<td><img src="' + escapeAttr(p.image_url || 'https://placehold.co/100x100?text=SP') + '" alt="' + escapeAttr(p.name) + '" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; display: block; border: 1px solid var(--border-color)"></td>' +
        '<td><strong>' + escapeHtml(p.name) + '</strong><br><small class="text-muted">' + escapeHtml(p.barcode) + '</small></td>' +
        '<td>' + escapeHtml(catName) + '</td>' +
        '<td><div class="flex" style="align-items:center;gap:6px"><span class="stock-indicator ' + stockClass + '"></span><strong>' + p.stock_qty + '</strong></div></td>' +
        '<td>' + escapeHtml(p.unit || '') + '</td>' +
        '<td class="text-right">' + MiniMart.Utils.formatCurrency(p.import_price) + '</td>' +
        '<td class="text-right">' + MiniMart.Utils.formatCurrency(value) + '</td>' +
        '<td>' + statusBadge + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderStockHistory() {
    var tbody = document.getElementById('stockHistoryBody');
    if (!tbody) return;

    var entries = stockEntriesData;
    // Show latest 20 entries
    var recentEntries = entries.slice().sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 20);

    if (recentEntries.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6">' +
          '<div class="empty-state">' +
            '<div class="empty-state-icon">📋</div>' +
            '<div class="empty-state-text">Chưa có lịch sử nhập hàng</div>' +
          '</div>' +
        '</td></tr>';
      return;
    }

    tbody.innerHTML = recentEntries.map(function (entry) {
      var typeBadge = entry.type === 'import'
        ? '<span class="badge badge-success">Nhập hàng</span>'
        : '<span class="badge badge-warning">Xuất hàng</span>';

      return '<tr>' +
        '<td>' + MiniMart.Utils.formatDateTime(entry.createdAt) + '</td>' +
        '<td>' + escapeHtml(entry.productName) + '</td>' +
        '<td>' + typeBadge + '</td>' +
        '<td><strong>' + (entry.type === 'import' ? '+' : '-') + entry.quantity + '</strong></td>' +
        '<td>' + escapeHtml(entry.note || '—') + '</td>' +
        '<td>' + escapeHtml(entry.createdBy || '—') + '</td>' +
      '</tr>';
    }).join('');
  }

  function showStockModal(type) {
    var isImport = type === 'import';
    var title = isImport ? '📥 Nhập hàng' : '📤 Xuất hàng';
    var products = productsData;
    var categories = MiniMart.Data.getCategories();
    var catMap = {};
    categories.forEach(function (c) { catMap[c.id] = c; });

    var html =
      '<div class="modal-header">' +
        '<h3>' + title + '</h3>' +
        '<button class="modal-close" onclick="MiniMart.Utils.closeModal()">✕</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<form id="stockForm">' +
          '<div class="form-group">' +
            '<label class="form-label">Sản phẩm <span class="text-danger">*</span></label>' +
            '<select class="form-select" id="sf_product" required>' +
              '<option value="">-- Chọn sản phẩm --</option>' +
              products.map(function (p) {
                var cat = catMap[p.category_id];
                var icon = cat ? cat.icon : '📦';
                return '<option value="' + p.id + '">' + icon + ' ' + escapeHtml(p.name) + ' (Tồn kho: ' + p.stock_qty + ' ' + escapeHtml(p.unit || '') + ')</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Số lượng <span class="text-danger">*</span></label>' +
            '<input type="number" class="form-input" id="sf_quantity" min="1" value="1" placeholder="Nhập số lượng" required>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Ghi chú</label>' +
            '<textarea class="form-textarea" id="sf_note" rows="3" placeholder="Ghi chú thêm (không bắt buộc)"></textarea>' +
          '</div>' +
        '</form>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="MiniMart.Utils.closeModal()">Hủy</button>' +
        '<button class="btn ' + (isImport ? 'btn-primary' : 'btn-warning') + '" id="saveStockBtn">' + (isImport ? '📥 Nhập hàng' : '📤 Xuất hàng') + '</button>' +
      '</div>';

    MiniMart.Utils.showModal(html);

    setTimeout(function () {
      var saveBtn = document.getElementById('saveStockBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          saveStockEntry(type);
        });
      }

      var form = document.getElementById('stockForm');
      if (form) {
        form.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            saveStockEntry(type);
          }
        });
      }
    }, 50);
  }

  async function saveStockEntry(type) {
    var isImport = type === 'import';
    var productId = document.getElementById('sf_product').value;
    var quantity = parseInt(document.getElementById('sf_quantity').value, 10);
    var note = document.getElementById('sf_note').value.trim();

    if (!productId) {
      MiniMart.Utils.showToast('Vui lòng chọn sản phẩm', 'error');
      return;
    }
    if (!quantity || quantity <= 0) {
      MiniMart.Utils.showToast('Số lượng phải lớn hơn 0', 'error');
      return;
    }

    var payload = {
      product_id: productId,
      type: type,
      quantity: quantity,
      note: note
    };

    try {
      const response = await fetch('/api/stock-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Lỗi lưu phiếu kho');
      }

      MiniMart.Utils.closeModal();
      MiniMart.Utils.showToast(data.message, 'success');
      loadData();
    } catch (e) {
      MiniMart.Utils.showToast(e.message, 'error');
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
