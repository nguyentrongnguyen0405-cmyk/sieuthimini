window.MiniMart = window.MiniMart || {};

MiniMart.Invoices = (function () {
  'use strict';

  let searchQuery = '';
  let filterPayment = 'all'; // 'all', 'cash', 'transfer', 'ewallet'
  let invoicesData = [];

  function init() {
    searchQuery = '';
    filterPayment = 'all';
    loadData();
  }

  async function loadData() {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        invoicesData = data.data;
        render();
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  }

  function render() {
    const container = document.getElementById('page-invoices');
    if (!container) return;

    const invoices = invoicesData;

    // Calculate stats
    const totalCount = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const cashAmount = invoices.filter(inv => inv.paymentMethod === 'cash').reduce((sum, inv) => sum + inv.total, 0);
    const digitalAmount = invoices.filter(inv => inv.paymentMethod !== 'cash').reduce((sum, inv) => sum + inv.total, 0);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2 class="page-header-title">🧾 Quản lý hóa đơn</h2>
          <p class="page-header-subtitle">Xem, tra cứu và in hóa đơn bán hàng</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-card-icon blue">🧾</div>
          <div class="stat-card-info">
            <div class="stat-card-value">${totalCount}</div>
            <div class="stat-card-label">Tổng hóa đơn</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-card-icon green">💰</div>
          <div class="stat-card-info">
            <div class="stat-card-value">${MiniMart.Utils.formatCurrency(totalAmount)}</div>
            <div class="stat-card-label">Tổng doanh thu</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-card-icon blue">💵</div>
          <div class="stat-card-info">
            <div class="stat-card-value">${MiniMart.Utils.formatCurrency(cashAmount)}</div>
            <div class="stat-card-label">Tiền mặt</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-card-icon yellow">💳</div>
          <div class="stat-card-info">
            <div class="stat-card-value">${MiniMart.Utils.formatCurrency(digitalAmount)}</div>
            <div class="stat-card-label">Chuyển khoản & Ví</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📋 Danh sách hóa đơn</h3>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input type="text" class="form-input" id="invoiceSearch" placeholder="Tìm mã hóa đơn, tên khách..." value="${escapeAttr(searchQuery)}">
            </div>
            <div class="tabs" id="invoiceFilterTabs">
              <button class="tab-btn${filterPayment === 'all' ? ' active' : ''}" data-filter="all">Tất cả</button>
              <button class="tab-btn${filterPayment === 'cash' ? ' active' : ''}" data-filter="cash">Tiền mặt</button>
              <button class="tab-btn${filterPayment === 'transfer' ? ' active' : ''}" data-filter="transfer">Ngân hàng</button>
              <button class="tab-btn${filterPayment === 'ewallet' ? ' active' : ''}" data-filter="ewallet">Ví Momo</button>
            </div>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Thời gian</th>
                <th>Khách hàng</th>
                <th>Thu ngân</th>
                <th>Thanh toán</th>
                <th class="text-right">Tổng tiền</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody id="invoiceTableBody"></tbody>
          </table>
        </div>
      </div>
    `;

    // Event listeners
    const searchInput = document.getElementById('invoiceSearch');
    if (searchInput) {
      searchInput.addEventListener('input', MiniMart.Utils.debounce(function (e) {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTable();
      }, 200));
    }

    const filterTabs = document.getElementById('invoiceFilterTabs');
    if (filterTabs) {
      filterTabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          filterPayment = this.getAttribute('data-filter');
          filterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          renderTable();
        });
      });
    }

    renderTable();
  }

  function renderTable() {
    const tbody = document.getElementById('invoiceTableBody');
    if (!tbody) return;

    let invoices = invoicesData;

    // Filter by search query
    if (searchQuery) {
      invoices = invoices.filter(inv => 
        inv.id.toLowerCase().indexOf(searchQuery) !== -1 ||
        (inv.customerName && inv.customerName.toLowerCase().indexOf(searchQuery) !== -1) ||
        (inv.employeeName && inv.employeeName.toLowerCase().indexOf(searchQuery) !== -1)
      );
    }

    // Filter by payment method
    if (filterPayment !== 'all') {
      invoices = invoices.filter(inv => inv.paymentMethod === filterPayment);
    }

    if (invoices.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <div class="empty-state-icon">🧾</div>
              <div class="empty-state-text">Không tìm thấy hóa đơn nào</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const paymentLabels = {
      cash: '<span class="badge badge-success">💵 Tiền mặt</span>',
      transfer: '<span class="badge badge-info">🏦 Chuyển khoản</span>',
      ewallet: '<span class="badge badge-primary">📱 Ví Momo</span>'
    };

    tbody.innerHTML = invoices.map(inv => `
      <tr>
        <td><strong>${inv.id}</strong></td>
        <td>${MiniMart.Utils.formatDateTime(inv.createdAt)}</td>
        <td>${escapeHtml(inv.customerName || 'Khách vãng lai')}</td>
        <td>${escapeHtml(inv.employeeName || 'Nhân viên')}</td>
        <td>${paymentLabels[inv.paymentMethod] || inv.paymentMethod}</td>
        <td class="text-right"><strong>${MiniMart.Utils.formatCurrency(inv.total)}</strong></td>
        <td class="text-center">
          <div class="product-actions" style="justify-content: center">
            <button class="btn btn-secondary btn-sm" onclick="MiniMart.Invoices.viewInvoice('${inv.id}')">👁️ Xem</button>
            <button class="btn btn-ghost btn-sm" onclick="MiniMart.Invoices.printInvoice('${inv.id}')">🖨️ In</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function viewInvoice(invoiceId) {
    const invoices = invoicesData;
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) {
      MiniMart.Utils.showToast('Không tìm thấy hóa đơn', 'error');
      return;
    }

    const paymentLabels = { cash: 'Tiền mặt', transfer: 'Chuyển khoản QR', ewallet: 'Ví Momo' };

    const html = `
      <div class="modal-header">
        <h3>🧾 Chi tiết hóa đơn</h3>
        <button class="modal-close" onclick="MiniMart.Utils.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="font-family: 'Courier New', Courier, monospace; color: #1e293b; background: #fff; padding: 24px; border-radius: 8px;">
        <div class="invoice-header" style="text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 20px; font-weight: 700; margin: 0;">MINIMART SUPERMARKET</h2>
          <p style="margin: 4px 0; font-size: 13px;">Địa chỉ: 123 Đường Số 1, Bình Thạnh, TP.HCM</p>
          <p style="margin: 4px 0; font-size: 13px;">Điện thoại: 1900 8198</p>
          <h3 style="font-size: 15px; margin: 12px 0 0; border: 1px solid #000; display: inline-block; padding: 4px 12px;">HÓA ĐƠN BÁN LẺ</h3>
        </div>

        <div class="invoice-info" style="font-size: 13px; line-height: 1.6; margin-bottom: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px;">
          <div style="display:flex; justify-content:space-between"><span>Số HĐ:</span> <strong>${inv.id}</strong></div>
          <div style="display:flex; justify-content:space-between"><span>Ngày mua:</span> <span>${MiniMart.Utils.formatDateTime(inv.createdAt)}</span></div>
          <div style="display:flex; justify-content:space-between"><span>Thu ngân:</span> <span>${escapeHtml(inv.employeeName || 'Nhân viên')}</span></div>
          <div style="display:flex; justify-content:space-between"><span>Khách hàng:</span> <span>${escapeHtml(inv.customerName || 'Khách vãng lai')}</span></div>
          <div style="display:flex; justify-content:space-between"><span>Thanh toán:</span> <span><strong>${paymentLabels[inv.paymentMethod] || inv.paymentMethod}</strong></span></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left; padding: 4px 0;">Sản phẩm</th>
              <th style="text-align: center; padding: 4px 0; width: 60px;">SL</th>
              <th style="text-align: right; padding: 4px 0; width: 80px;">Đơn giá</th>
              <th style="text-align: right; padding: 4px 0; width: 90px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map(item => `
              <tr style="border-bottom: 1px dashed #e2e8f0;">
                <td style="padding: 6px 0;">${escapeHtml(item.name)}</td>
                <td style="text-align: center; padding: 6px 0;">${item.quantity}</td>
                <td style="text-align: right; padding: 6px 0;">${MiniMart.Utils.formatCurrency(item.price)}</td>
                <td style="text-align: right; padding: 6px 0;"><strong>${MiniMart.Utils.formatCurrency(item.subtotal)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="font-size: 13px; line-height: 1.6; border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 8px;">
          <div style="display:flex; justify-content:space-between"><span>Cộng tiền hàng:</span> <span>${MiniMart.Utils.formatCurrency(inv.subtotal)}</span></div>
          <div style="display:flex; justify-content:space-between"><span>Chiết khấu:</span> <span>-${MiniMart.Utils.formatCurrency(inv.discount || 0)}</span></div>
          <div style="display:flex; justify-content:space-between; font-size: 16px; font-weight: 700; border-top: 1px solid #000; padding-top: 6px; margin-top: 6px;">
            <span>TỔNG CỘNG:</span>
            <span>${MiniMart.Utils.formatCurrency(inv.total)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 12px; font-style: italic;">
          Cảm ơn Quý khách! Hẹn gặp lại!<br>
          Powered by MiniMart POS
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="MiniMart.Utils.closeModal()">Đóng</button>
        <button class="btn btn-primary" onclick="MiniMart.Invoices.printInvoice('${inv.id}')">🖨️ In hóa đơn</button>
      </div>
    `;

    MiniMart.Utils.showModal(html);
  }

  function printInvoice(invoiceId) {
    const invoices = invoicesData;
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) {
      MiniMart.Utils.showToast('Không tìm thấy hóa đơn', 'error');
      return;
    }

    const paymentLabels = { cash: 'Tiền mặt', transfer: 'Chuyển khoản QR', ewallet: 'Ví Momo' };

    const printContainer = document.getElementById('invoicePrint');
    if (!printContainer) return;

    printContainer.innerHTML = `
      <div style="font-family: 'Courier New', Courier, monospace; color: #000; background: #fff; padding: 20px; width: 300px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          <h2 style="font-size: 16px; font-weight: 700; margin: 0;">MINIMART SUPERMARKET</h2>
          <p style="margin: 2px 0; font-size: 11px;">123 Đường Số 1, Bình Thạnh, TP.HCM</p>
          <p style="margin: 2px 0; font-size: 11px;">ĐT: 1900 8198</p>
          <h3 style="font-size: 13px; margin: 6px 0 0; font-weight: bold;">HÓA ĐƠN BÁN LẺ</h3>
        </div>

        <div style="font-size: 11px; line-height: 1.4; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 6px;">
          <div>Số HĐ: <strong>${inv.id}</strong></div>
          <div>Ngày: ${MiniMart.Utils.formatDateTime(inv.createdAt)}</div>
          <div>TN: ${escapeHtml(inv.employeeName || 'Nhân viên')}</div>
          <div>KH: ${escapeHtml(inv.customerName || 'Khách vãng lai')}</div>
          <div>TT: ${paymentLabels[inv.paymentMethod] || inv.paymentMethod}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px;">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left; padding: 2px 0;">SP</th>
              <th style="text-align: center; padding: 2px 0; width: 40px;">SL</th>
              <th style="text-align: right; padding: 2px 0; width: 60px;">ĐG</th>
              <th style="text-align: right; padding: 2px 0; width: 70px;">T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map(item => `
              <tr style="border-bottom: 1px dashed #ccc;">
                <td style="padding: 4px 0;">${escapeHtml(item.name)}</td>
                <td style="text-align: center; padding: 4px 0;">${item.quantity}</td>
                <td style="text-align: right; padding: 4px 0;">${MiniMart.Utils.formatCurrency(item.price)}</td>
                <td style="text-align: right; padding: 4px 0;">${MiniMart.Utils.formatCurrency(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="font-size: 11px; line-height: 1.4; border-top: 1px dashed #000; padding-top: 6px;">
          <div style="display:flex; justify-content:space-between"><span>Cộng tiền hàng:</span> <span>${MiniMart.Utils.formatCurrency(inv.subtotal)}</span></div>
          <div style="display:flex; justify-content:space-between"><span>Chiết khấu:</span> <span>-${MiniMart.Utils.formatCurrency(inv.discount || 0)}</span></div>
          <div style="display:flex; justify-content:space-between; font-size: 13px; font-weight: 700; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px;">
            <span>TỔNG CỘNG:</span>
            <span>${MiniMart.Utils.formatCurrency(inv.total)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 15px; font-size: 10px; font-style: italic;">
          Cảm ơn Quý khách! Hẹn gặp lại!
        </div>
      </div>
    `;

    window.print();
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

  return { init, render, viewInvoice, printInvoice };
})();
