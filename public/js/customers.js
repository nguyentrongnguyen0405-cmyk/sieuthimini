window.MiniMart = window.MiniMart || {};

MiniMart.Customers = (function () {
  'use strict';

  let searchQuery = '';
  let filterTier = 'all';
  let currentPage = 1;
  const perPage = 10;

  let customersData = [];

  function init() {
    searchQuery = '';
    filterTier = 'all';
    currentPage = 1;
    loadData();
  }

  async function loadData() {
    try {
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        customersData = data.data;
        render();
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }

  function render() {
    const container = document.getElementById('page-customers');
    if (!container) return;

    const customers = customersData;
    const stats = getCustomerStats(customers);

    container.innerHTML =
      '<div class="stats-grid" style="margin-bottom:24px">' +
        '<div class="stat-card"><div class="stat-card-icon blue">👥</div><div class="stat-card-info"><div class="stat-card-value">' + stats.total + '</div><div class="stat-card-label">Tổng khách hàng</div></div></div>' +
        '<div class="stat-card"><div class="stat-card-icon green">⭐</div><div class="stat-card-info"><div class="stat-card-value">' + stats.vip + '</div><div class="stat-card-label">Khách VIP</div></div></div>' +
        '<div class="stat-card"><div class="stat-card-icon yellow">💰</div><div class="stat-card-info"><div class="stat-card-value">' + MiniMart.Utils.formatCurrency(stats.totalSpent) + '</div><div class="stat-card-label">Tổng chi tiêu</div></div></div>' +
        '<div class="stat-card"><div class="stat-card-icon red">🎯</div><div class="stat-card-info"><div class="stat-card-value">' + MiniMart.Utils.formatNumber(stats.totalPoints) + '</div><div class="stat-card-label">Tổng điểm tích lũy</div></div></div>' +
      '</div>' +
      '<div class="page-header">' +
        '<div class="page-header-left">' +
          '<h2 class="page-header-title">👥 Quản lý khách hàng</h2>' +
          '<p class="page-header-subtitle">Quản lý thông tin, điểm tích lũy và lịch sử mua hàng</p>' +
        '</div>' +
        '<div class="page-header-actions">' +
          '<div class="search-bar">' +
            '<span class="search-icon">🔍</span>' +
            '<input type="text" class="form-input" id="customerSearch" placeholder="Tìm tên, SĐT, email..." value="' + escapeAttr(searchQuery) + '">' +
          '</div>' +
          '<select class="form-select" id="customerTierFilter" style="width:160px">' +
            '<option value="all"' + (filterTier === 'all' ? ' selected' : '') + '>Tất cả hạng</option>' +
            '<option value="vip"' + (filterTier === 'vip' ? ' selected' : '') + '>⭐ VIP</option>' +
            '<option value="gold"' + (filterTier === 'gold' ? ' selected' : '') + '>🥇 Vàng</option>' +
            '<option value="silver"' + (filterTier === 'silver' ? ' selected' : '') + '>🥈 Bạc</option>' +
            '<option value="member"' + (filterTier === 'member' ? ' selected' : '') + '>🎫 Thành viên</option>' +
          '</select>' +
          '<button class="btn btn-primary" id="addCustomerBtn">➕ Thêm khách hàng</button>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="table-container">' +
          '<table class="data-table">' +
            '<thead><tr>' +
              '<th>Khách hàng</th>' +
              '<th>Số điện thoại</th>' +
              '<th>Email</th>' +
              '<th>Hạng thành viên</th>' +
              '<th>Điểm tích lũy</th>' +
              '<th>Tổng chi tiêu</th>' +
              '<th>Số đơn hàng</th>' +
              '<th>Thao tác</th>' +
            '</tr></thead>' +
            '<tbody id="customerTableBody"></tbody>' +
          '</table>' +
        '</div>' +
        '<div class="pagination" id="customerPagination"></div>' +
      '</div>';

    // Event listeners
    var searchInput = document.getElementById('customerSearch');
    if (searchInput) {
      searchInput.addEventListener('input', MiniMart.Utils.debounce(function (e) {
        searchQuery = e.target.value.toLowerCase().trim();
        currentPage = 1;
        renderTable();
      }, 200));
    }

    var tierFilter = document.getElementById('customerTierFilter');
    if (tierFilter) {
      tierFilter.addEventListener('change', function (e) {
        filterTier = e.target.value;
        currentPage = 1;
        renderTable();
      });
    }

    var addBtn = document.getElementById('addCustomerBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        showCustomerForm();
      });
    }

    renderTable();
  }

  function getCustomerStats(customers) {
    var total = customers.length;
    var vip = customers.filter(function(c) { return c.tier === 'vip'; }).length;
    var totalSpent = customers.reduce(function(sum, c) { return sum + (c.totalSpent || 0); }, 0);
    var totalPoints = customers.reduce(function(sum, c) { return sum + (c.points || 0); }, 0);
    return { total: total, vip: vip, totalSpent: totalSpent, totalPoints: totalPoints };
  }

  function getFilteredCustomers() {
    var customers = customersData;

    return customers.filter(function (c) {
      if (searchQuery) {
        var q = searchQuery;
        var nameMatch = c.name.toLowerCase().indexOf(q) !== -1;
        var phoneMatch = c.phone.toLowerCase().indexOf(q) !== -1;
        var emailMatch = (c.email || '').toLowerCase().indexOf(q) !== -1;
        if (!nameMatch && !phoneMatch && !emailMatch) return false;
      }
      if (filterTier !== 'all' && c.tier !== filterTier) return false;
      return true;
    });
  }

  function getTierBadge(tier) {
    var map = {
      vip: '<span class="badge badge-danger">⭐ VIP</span>',
      gold: '<span class="badge badge-warning">🥇 Vàng</span>',
      silver: '<span class="badge badge-info">🥈 Bạc</span>',
      member: '<span class="badge badge-primary">🎫 Thành viên</span>'
    };
    return map[tier] || map['member'];
  }

  function renderTable() {
    var tbody = document.getElementById('customerTableBody');
    var paginationEl = document.getElementById('customerPagination');
    if (!tbody || !paginationEl) return;

    var filtered = getFilteredCustomers();
    var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    var startIdx = (currentPage - 1) * perPage;
    var pageItems = filtered.slice(startIdx, startIdx + perPage);

    if (pageItems.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8">' +
          '<div class="empty-state">' +
            '<div class="empty-state-icon">👥</div>' +
            '<div class="empty-state-text">Không tìm thấy khách hàng nào</div>' +
          '</div>' +
        '</td></tr>';
    } else {
      tbody.innerHTML = pageItems.map(function (c) {
        return '<tr>' +
          '<td><div class="flex" style="align-items:center;gap:8px">' +
            '<div class="sidebar-user-avatar" style="width:36px;height:36px;font-size:14px;flex-shrink:0">' + c.name.charAt(0).toUpperCase() + '</div>' +
            '<div><div style="font-weight:500">' + escapeHtml(c.name) + '</div>' +
            (c.address ? '<div class="text-muted" style="font-size:12px">' + escapeHtml(c.address) + '</div>' : '') +
            '</div>' +
          '</div></td>' +
          '<td>' + escapeHtml(c.phone) + '</td>' +
          '<td>' + escapeHtml(c.email || '—') + '</td>' +
          '<td>' + getTierBadge(c.tier) + '</td>' +
          '<td class="text-right"><strong>' + MiniMart.Utils.formatNumber(c.points || 0) + '</strong></td>' +
          '<td class="text-right">' + MiniMart.Utils.formatCurrency(c.totalSpent || 0) + '</td>' +
          '<td class="text-center">' + (c.orderCount || 0) + '</td>' +
          '<td><div class="product-actions">' +
            '<button class="btn btn-sm btn-ghost btn-view-customer" data-id="' + c.id + '" title="Xem chi tiết">👁️</button>' +
            '<button class="btn btn-sm btn-ghost btn-edit-customer" data-id="' + c.id + '" title="Sửa">✏️</button>' +
            '<button class="btn btn-sm btn-ghost btn-delete-customer" data-id="' + c.id + '" title="Xóa">🗑️</button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }

    // Attach handlers
    tbody.querySelectorAll('.btn-view-customer').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        viewCustomer(id);
      });
    });

    tbody.querySelectorAll('.btn-edit-customer').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        var customers = customersData;
        var customer = customers.find(function (c) { return c.id === id; });
        if (customer) showCustomerForm(customer);
      });
    });

    tbody.querySelectorAll('.btn-delete-customer').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        deleteCustomer(id);
      });
    });

    // Pagination
    renderPagination(paginationEl, currentPage, totalPages, function (page) {
      currentPage = page;
      renderTable();
    });
  }

  function renderPagination(container, current, total, onPageChange) {
    if (total <= 1) { container.innerHTML = ''; return; }
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
        if (page >= 1 && page <= total) onPageChange(page);
      });
    });
  }

  function showCustomerForm(customer) {
    var isEdit = !!customer;
    var title = isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới';
    var c = customer || {
      name: '', phone: '', email: '', address: '', tier: 'member', points: 0, notes: ''
    };

    var html =
      '<div class="modal-header">' +
        '<h3>' + title + '</h3>' +
        '<button class="modal-close" onclick="MiniMart.Utils.closeModal()">✕</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<form id="customerForm">' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Họ tên <span class="text-danger">*</span></label>' +
              '<input type="text" class="form-input" id="cf_name" value="' + escapeAttr(c.name) + '" placeholder="Nhập họ tên khách hàng" required>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Số điện thoại <span class="text-danger">*</span></label>' +
              '<input type="text" class="form-input" id="cf_phone" value="' + escapeAttr(c.phone) + '" placeholder="VD: 0912345678" required>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Email</label>' +
              '<input type="email" class="form-input" id="cf_email" value="' + escapeAttr(c.email || '') + '" placeholder="email@example.com">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Hạng thành viên</label>' +
              '<select class="form-select" id="cf_tier">' +
                '<option value="member"' + (c.tier === 'member' ? ' selected' : '') + '>🎫 Thành viên</option>' +
                '<option value="silver"' + (c.tier === 'silver' ? ' selected' : '') + '>🥈 Bạc</option>' +
                '<option value="gold"' + (c.tier === 'gold' ? ' selected' : '') + '>🥇 Vàng</option>' +
                '<option value="vip"' + (c.tier === 'vip' ? ' selected' : '') + '>⭐ VIP</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Địa chỉ</label>' +
            '<input type="text" class="form-input" id="cf_address" value="' + escapeAttr(c.address || '') + '" placeholder="Nhập địa chỉ">' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Điểm tích lũy</label>' +
              '<input type="number" class="form-input" id="cf_points" value="' + (c.points || 0) + '" min="0">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
              '<label class="form-label">Ngày sinh</label>' +
              '<input type="date" class="form-input" id="cf_birthday" value="' + escapeAttr(c.birthday || '') + '">' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Ghi chú</label>' +
            '<textarea class="form-input" id="cf_notes" rows="2" placeholder="Ghi chú thêm...">' + escapeHtml(c.notes || '') + '</textarea>' +
          '</div>' +
        '</form>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="MiniMart.Utils.closeModal()">Hủy</button>' +
        '<button class="btn btn-primary" id="saveCustomerBtn">' + (isEdit ? '💾 Lưu thay đổi' : '➕ Thêm khách hàng') + '</button>' +
      '</div>';

    MiniMart.Utils.showModal(html);

    setTimeout(function () {
      var saveBtn = document.getElementById('saveCustomerBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          saveCustomer(isEdit ? c.id : null);
        });
      }
      var form = document.getElementById('customerForm');
      if (form) {
        form.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            saveCustomer(isEdit ? c.id : null);
          }
        });
      }
    }, 50);
  }

  async function saveCustomer(editId) {
    var name = document.getElementById('cf_name').value.trim();
    var phone = document.getElementById('cf_phone').value.trim();
    var email = document.getElementById('cf_email').value.trim();
    var address = document.getElementById('cf_address').value.trim();
    var tier = document.getElementById('cf_tier').value;
    var points = parseInt(document.getElementById('cf_points').value, 10) || 0;
    var birthday = document.getElementById('cf_birthday').value;
    var notes = document.getElementById('cf_notes').value.trim();

    if (!name || !phone) {
      MiniMart.Utils.showToast('Vui lòng nhập tên và số điện thoại', 'error');
      return;
    }

    var payload = {
      name: name, phone: phone, email: email, address: address,
      tier: tier, points: points, birthday: birthday, notes: notes
    };

    var url = editId ? '/api/customers/' + editId : '/api/customers';
    var method = editId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Lỗi lưu khách hàng');
      }
      MiniMart.Utils.showToast(data.message, 'success');
      MiniMart.Utils.closeModal();
      loadData();
    } catch (e) {
      MiniMart.Utils.showToast(e.message, 'error');
    }
  }

  function viewCustomer(customerId) {
    var customers = customersData;
    var c = customers.find(function (cust) { return cust.id === customerId; });
    if (!c) return;

    // Find invoices for this customer
    var invoices = MiniMart.Data.getInvoices().filter(function (inv) {
      return inv.customerId === c.id;
    });

    var html =
      '<div class="modal-header">' +
        '<h3>👤 Chi tiết khách hàng</h3>' +
        '<button class="modal-close" onclick="MiniMart.Utils.closeModal()">✕</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div style="display:flex;gap:16px;align-items:center;margin-bottom:20px;padding:16px;background:var(--bg-secondary);border-radius:var(--radius);border:1px solid var(--border-color)">' +
          '<div class="sidebar-user-avatar" style="width:56px;height:56px;font-size:22px;flex-shrink:0">' + c.name.charAt(0).toUpperCase() + '</div>' +
          '<div style="flex:1">' +
            '<h3 style="margin:0 0 4px 0">' + escapeHtml(c.name) + '</h3>' +
            '<div style="color:var(--text-secondary);font-size:14px">📞 ' + escapeHtml(c.phone) + (c.email ? ' · 📧 ' + escapeHtml(c.email) : '') + '</div>' +
            (c.address ? '<div style="color:var(--text-muted);font-size:13px;margin-top:2px">📍 ' + escapeHtml(c.address) + '</div>' : '') +
          '</div>' +
          '<div style="text-align:right">' +
            getTierBadge(c.tier) +
            '<div style="margin-top:8px;font-size:20px;font-weight:700;color:var(--primary)">' + MiniMart.Utils.formatNumber(c.points || 0) + ' điểm</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">' +
          '<div style="padding:12px;background:var(--bg-card);border-radius:var(--radius-sm);text-align:center;border:1px solid var(--border-color)">' +
            '<div style="font-size:20px;font-weight:700;color:var(--success)">' + MiniMart.Utils.formatCurrency(c.totalSpent || 0) + '</div>' +
            '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Tổng chi tiêu</div>' +
          '</div>' +
          '<div style="padding:12px;background:var(--bg-card);border-radius:var(--radius-sm);text-align:center;border:1px solid var(--border-color)">' +
            '<div style="font-size:20px;font-weight:700;color:var(--info)">' + (c.orderCount || 0) + '</div>' +
            '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Đơn hàng</div>' +
          '</div>' +
          '<div style="padding:12px;background:var(--bg-card);border-radius:var(--radius-sm);text-align:center;border:1px solid var(--border-color)">' +
            '<div style="font-size:20px;font-weight:700;color:var(--warning)">' + (c.birthday || '—') + '</div>' +
            '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Ngày sinh</div>' +
          '</div>' +
        '</div>' +

        (c.notes ? '<div style="padding:12px;background:var(--bg-card);border-radius:var(--radius-sm);margin-bottom:16px;border:1px solid var(--border-color)"><strong>📝 Ghi chú:</strong> ' + escapeHtml(c.notes) + '</div>' : '') +

        '<h4 style="margin:0 0 12px 0">🧾 Lịch sử mua hàng gần đây</h4>' +
        (invoices.length > 0 ?
          '<div class="table-container"><table class="data-table">' +
            '<thead><tr><th>Mã HĐ</th><th>Ngày</th><th>Tổng tiền</th><th>Thanh toán</th></tr></thead>' +
            '<tbody>' +
            invoices.slice(0, 10).map(function (inv) {
              var payLabel = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', ewallet: 'Ví điện tử' };
              return '<tr>' +
                '<td><code>' + escapeHtml(inv.id) + '</code></td>' +
                '<td>' + new Date(inv.createdAt).toLocaleDateString('vi-VN') + '</td>' +
                '<td class="text-right">' + MiniMart.Utils.formatCurrency(inv.total) + '</td>' +
                '<td>' + (payLabel[inv.paymentMethod] || inv.paymentMethod) + '</td>' +
              '</tr>';
            }).join('') +
            '</tbody></table></div>'
          : '<div class="empty-state" style="padding:24px"><div class="empty-state-icon">🛒</div><div class="empty-state-text">Chưa có lịch sử mua hàng</div></div>'
        ) +
        '<div style="margin-top:12px;font-size:12px;color:var(--text-muted)">Ngày tạo: ' + (c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—') + '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="MiniMart.Utils.closeModal()">Đóng</button>' +
      '</div>';

    MiniMart.Utils.showModal(html);
  }

  async function deleteCustomer(customerId) {
    if (!MiniMart.Utils.confirmDialog('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

    try {
      const response = await fetch('/api/customers/' + customerId, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      
      MiniMart.Utils.showToast('Đã xóa khách hàng', 'success');
      loadData();
    } catch (e) {
      MiniMart.Utils.showToast(e.message, 'error');
    }
  }

  // --- Utility helpers ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeAttr(str) { return escapeHtml(str); }

  return { init: init, render: render };
})();
