window.MiniMart = window.MiniMart || {};

MiniMart.POS = (function() {
  let cart = [];
  let selectedCategory = 'all';
  let searchQuery = '';
  let paymentMethod = 'cash';
  let discountPercent = 0;

  function init() {}

  function render() {
    const container = document.getElementById('page-pos');
    const categories = MiniMart.Data.getCategories();

    container.innerHTML = `
      <div class='pos-layout'>
        <div class='pos-products-section'>
          <div class='search-bar'>
            <span class='search-icon'>🔍</span>
            <input type='text' class='form-input' id='posSearch' placeholder='Tìm sản phẩm theo tên hoặc mã...' value='${searchQuery}'>
          </div>
          <div class='pos-categories'>
            <button class='pos-category-btn ${selectedCategory === "all" ? "active" : ""}' data-category='all'>Tất cả</button>
            ${categories.map(c => `
              <button class='pos-category-btn ${selectedCategory === c.id ? "active" : ""}' data-category='${c.id}'>${c.icon} ${c.name}</button>
            `).join('')}
          </div>
          <div class='pos-product-grid' id='posProductGrid'></div>
        </div>
        <div class='pos-cart-section'>
          <div class='pos-cart-header'>
            <span>🛒 Giỏ hàng</span>
            <span class='badge badge-primary' id='cartCount'>${cart.length}</span>
          </div>
          <div class='pos-cart-items' id='posCartItems'></div>
          <div class='pos-cart-summary' id='posCartSummary'></div>
          <div class='pos-cart-actions' id='posCartActions'></div>
        </div>
      </div>
    `;

    document.getElementById('posSearch').addEventListener('input', MiniMart.Utils.debounce((e) => {
      searchQuery = e.target.value.toLowerCase();
      renderProducts();
    }, 200));

    document.querySelectorAll('.pos-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.dataset.category;
        document.querySelectorAll('.pos-category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProducts();
      });
    });

    renderProducts();
    renderCart();
  }

  function renderProducts() {
    const grid = document.getElementById('posProductGrid');
    if (!grid) return;
    let products = MiniMart.Data.getProducts().filter(p => p.status === 'active');
    
    if (selectedCategory !== 'all') products = products.filter(p => p.category === selectedCategory);
    if (searchQuery) products = products.filter(p => p.name.toLowerCase().includes(searchQuery) || p.code.includes(searchQuery));

    grid.innerHTML = products.map(p => `
      <div class='pos-product-card ${p.stock === 0 ? "out-of-stock" : ""}' data-id='${p.id}'>
        <span class='pos-product-emoji'>${p.image}</span>
        <div class='pos-product-name'>${p.name}</div>
        <div class='pos-product-price'>${MiniMart.Utils.formatCurrency(p.price)}</div>
        <div class='pos-product-stock'>${p.stock === 0 ? 'Hết hàng' : 'Còn ' + p.stock + ' ' + p.unit}</div>
      </div>
    `).join('');

    if (products.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Không tìm thấy sản phẩm</div></div>';
    }

    grid.querySelectorAll('.pos-product-card:not(.out-of-stock)').forEach(card => {
      card.addEventListener('click', () => addToCart(card.dataset.id));
    });
  }

  function addToCart(productId) {
    const products = MiniMart.Data.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      if (existing.quantity >= product.stock) {
        MiniMart.Utils.showToast('Số lượng vượt quá tồn kho!', 'error');
        return;
      }
      existing.quantity++;
      existing.subtotal = existing.quantity * existing.price;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
        image: product.image
      });
    }
    renderCart();
  }

  function updateQuantity(productId, delta) {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    const product = MiniMart.Data.getProducts().find(p => p.id === productId);
    
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.productId !== productId);
    } else if (product && item.quantity > product.stock) {
      MiniMart.Utils.showToast('Vượt quá tồn kho!', 'error');
      item.quantity = product.stock;
    }
    if (item.quantity > 0) item.subtotal = item.quantity * item.price;
    renderCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.productId !== productId);
    renderCart();
  }

  function renderCart() {
    const itemsContainer = document.getElementById('posCartItems');
    const summaryContainer = document.getElementById('posCartSummary');
    const actionsContainer = document.getElementById('posCartActions');
    const countBadge = document.getElementById('cartCount');
    if (!itemsContainer) return;

    countBadge.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);

    if (cart.length === 0) {
      itemsContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛒</div><div class="empty-state-text">Giỏ hàng trống</div></div>';
      summaryContainer.innerHTML = '';
      actionsContainer.innerHTML = '';
      return;
    }

    itemsContainer.innerHTML = cart.map(item => `
      <div class='pos-cart-item'>
        <span style='font-size:24px'>${item.image}</span>
        <div class='pos-cart-item-info'>
          <div class='pos-cart-item-name'>${item.name}</div>
          <div class='pos-cart-item-price'>${MiniMart.Utils.formatCurrency(item.price)}</div>
        </div>
        <div class='pos-cart-item-qty'>
          <button onclick='MiniMart.POS.updateQuantity("${item.productId}", -1)'>−</button>
          <span>${item.quantity}</span>
          <button onclick='MiniMart.POS.updateQuantity("${item.productId}", 1)'>+</button>
        </div>
        <div class='pos-cart-item-subtotal'>${MiniMart.Utils.formatCurrency(item.subtotal)}</div>
        <button class='pos-cart-item-remove' onclick='MiniMart.POS.removeFromCart("${item.productId}")'>✕</button>
      </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = Math.round(subtotal * discountPercent / 100);
    const total = subtotal - discountAmount;

    summaryContainer.innerHTML = `
      <div class='pos-cart-summary-row'><span>Tạm tính</span><span>${MiniMart.Utils.formatCurrency(subtotal)}</span></div>
      <div class='pos-cart-discount'>
        <div class='pos-cart-summary-row'>
          <span>Giảm giá (%)</span>
          <input type='number' class='form-input' id='discountInput' value='${discountPercent}' min='0' max='100' style='width:80px;text-align:center;padding:6px'>
        </div>
      </div>
      ${discountAmount > 0 ? `<div class='pos-cart-summary-row text-success'><span>Tiết kiệm</span><span>-${MiniMart.Utils.formatCurrency(discountAmount)}</span></div>` : ''}
      <div class='pos-cart-summary-row total'><span>Tổng cộng</span><span>${MiniMart.Utils.formatCurrency(total)}</span></div>
    `;

    const discountInput = document.getElementById('discountInput');
    if (discountInput) {
      discountInput.addEventListener('change', (e) => {
        discountPercent = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
        renderCart();
      });
    }

    const paymentLabels = [
      { id: 'cash', icon: '💵', label: 'Tiền mặt' },
      { id: 'transfer', icon: '🏦', label: 'Chuyển khoản' },
      { id: 'ewallet', icon: '📱', label: 'Ví điện tử' }
    ];

    actionsContainer.innerHTML = `
      <div class='pos-payment-methods'>
        ${paymentLabels.map(pm => `
          <div class='pos-payment-btn ${paymentMethod === pm.id ? "active" : ""}' data-method='${pm.id}'>
            <span class='payment-icon'>${pm.icon}</span>${pm.label}
          </div>
        `).join('')}
      </div>
      <button class='pos-checkout-btn' id='checkoutBtn'>💳 Thanh toán ${MiniMart.Utils.formatCurrency(total)}</button>
      <button class='btn btn-secondary' style='width:100%;margin-top:8px' onclick='MiniMart.POS.clearCart()'>🗑️ Xóa giỏ hàng</button>
    `;

    actionsContainer.querySelectorAll('.pos-payment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        paymentMethod = btn.dataset.method;
        actionsContainer.querySelectorAll('.pos-payment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.getElementById('checkoutBtn').addEventListener('click', checkout);
  }

  function checkout() {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = Math.round(subtotal * discountPercent / 100);
    const total = subtotal - discountAmount;

    if (paymentMethod === 'cash') {
      MiniMart.Utils.showModal(`
        <div class='modal-header'><h3>💵 Thanh toán tiền mặt</h3><button class='modal-close' onclick='MiniMart.Utils.closeModal()'>✕</button></div>
        <div class='modal-body'>
          <p style='margin-bottom:16px'>Tổng tiền: <strong style='color:var(--primary);font-size:20px'>${MiniMart.Utils.formatCurrency(total)}</strong></p>
          <div class='form-group'>
            <label class='form-label'>Tiền khách đưa</label>
            <input type='number' class='form-input' id='cashReceivedInput' value='${total}' autofocus>
          </div>
          <p id='changeDisplay' style='font-size:18px;font-weight:600;margin-top:12px'>Tiền thối: ${MiniMart.Utils.formatCurrency(0)}</p>
        </div>
        <div class='modal-footer'>
          <button class='btn btn-secondary' onclick='MiniMart.Utils.closeModal()'>Hủy</button>
          <button class='btn btn-primary' id='confirmCashBtn'>✅ Xác nhận</button>
        </div>
      `);

      const cashInput = document.getElementById('cashReceivedInput');
      const changeDisplay = document.getElementById('changeDisplay');
      cashInput.addEventListener('input', () => {
        const received = parseInt(cashInput.value) || 0;
        const change = received - total;
        changeDisplay.textContent = `Tiền thối: ${MiniMart.Utils.formatCurrency(Math.max(0, change))}`;
        changeDisplay.style.color = change >= 0 ? 'var(--success)' : 'var(--danger)';
      });
      cashInput.select();

      document.getElementById('confirmCashBtn').addEventListener('click', () => {
        const cashReceived = parseInt(cashInput.value) || 0;
        if (cashReceived < total) {
          MiniMart.Utils.showToast('Tiền khách đưa không đủ!', 'error');
          return;
        }
        processPayment(total, subtotal, discountAmount, cashReceived, cashReceived - total);
      });
    } else {
      processPayment(total, subtotal, discountAmount, total, 0);
    }
  }

  function processPayment(total, subtotal, discountAmount, cashReceived, change) {
    const user = MiniMart.Auth.getCurrentUser();
    const invoices = MiniMart.Data.getInvoices();
    const invoiceNumber = 'INV-' + String(invoices.length + 1).padStart(4, '0');

    const invoice = {
      id: invoiceNumber,
      items: cart.map(item => ({...item})),
      subtotal,
      discount: discountAmount,
      discountPercent,
      total,
      paymentMethod,
      cashReceived,
      change,
      employeeId: user.id,
      employeeName: user.fullName,
      createdAt: new Date().toISOString(),
      customerName: 'Khách lẻ'
    };

    MiniMart.Data.addInvoice(invoice);

    const products = MiniMart.Data.getProducts();
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });
    MiniMart.Data.setProducts(products);

    MiniMart.Utils.closeModal();
    showInvoiceReceipt(invoice);

    cart = [];
    discountPercent = 0;
    renderProducts();
    renderCart();
  }

  function showInvoiceReceipt(invoice) {
    const paymentLabels = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', ewallet: 'Ví điện tử' };
    MiniMart.Utils.showModal(`
      <div class='modal-header'><h3>✅ Thanh toán thành công!</h3><button class='modal-close' onclick='MiniMart.Utils.closeModal()'>✕</button></div>
      <div class='modal-body'>
        <div class='invoice-header'>
          <h2>🛒 MINIMART POS</h2>
          <p>Hóa đơn bán hàng</p>
        </div>
        <div class='invoice-info'>
          <div><span>Mã HĐ:</span> <strong>${invoice.id}</strong></div>
          <div><span>Ngày:</span> ${MiniMart.Utils.formatDateTime(invoice.createdAt)}</div>
          <div><span>NV:</span> ${invoice.employeeName}</div>
          <div><span>TT:</span> ${paymentLabels[invoice.paymentMethod]}</div>
        </div>
        <table class='data-table' style='font-size:13px'>
          <thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>T.Tiền</th></tr></thead>
          <tbody>
            ${invoice.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${MiniMart.Utils.formatCurrency(item.price)}</td><td>${MiniMart.Utils.formatCurrency(item.subtotal)}</td></tr>`).join('')}
          </tbody>
        </table>
        <div style='margin-top:16px;padding-top:12px;border-top:1px dashed var(--border-color)'>
          <div class='pos-cart-summary-row'><span>Tạm tính:</span><span>${MiniMart.Utils.formatCurrency(invoice.subtotal)}</span></div>
          ${invoice.discount > 0 ? `<div class='pos-cart-summary-row text-success'><span>Giảm giá (${invoice.discountPercent}%):</span><span>-${MiniMart.Utils.formatCurrency(invoice.discount)}</span></div>` : ''}
          <div class='pos-cart-summary-row total'><span>Tổng cộng:</span><span>${MiniMart.Utils.formatCurrency(invoice.total)}</span></div>
          ${invoice.paymentMethod === 'cash' ? `
            <div class='pos-cart-summary-row'><span>Tiền nhận:</span><span>${MiniMart.Utils.formatCurrency(invoice.cashReceived)}</span></div>
            <div class='pos-cart-summary-row'><span>Tiền thối:</span><span>${MiniMart.Utils.formatCurrency(invoice.change)}</span></div>
          ` : ''}
        </div>
      </div>
      <div class='modal-footer'>
        <button class='btn btn-secondary' onclick='MiniMart.Utils.closeModal()'>Đóng</button>
        <button class='btn btn-primary' onclick='MiniMart.POS.printInvoice("${invoice.id}")'>🖨️ In hóa đơn</button>
      </div>
    `);

    MiniMart.Utils.showToast('Thanh toán thành công!', 'success');
  }

  function printInvoice(invoiceId) {
    const invoice = MiniMart.Data.getInvoices().find(inv => inv.id === invoiceId);
    if (!invoice) return;
    const printArea = document.getElementById('invoicePrint');
    if (!printArea) return;
    const paymentLabels = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', ewallet: 'Ví điện tử' };
    printArea.innerHTML = `
      <div style='max-width:300px;margin:0 auto;font-family:monospace;font-size:12px;color:#000'>
        <h2 style='text-align:center;margin-bottom:4px'>MINIMART POS</h2>
        <p style='text-align:center;margin-bottom:8px'>Siêu thị mini</p>
        <hr>
        <p>Mã HĐ: ${invoice.id}</p>
        <p>Ngày: ${MiniMart.Utils.formatDateTime(invoice.createdAt)}</p>
        <p>NV: ${invoice.employeeName}</p>
        <hr>
        ${invoice.items.map(item => `<p>${item.name} x${item.quantity} = ${MiniMart.Utils.formatCurrency(item.subtotal)}</p>`).join('')}
        <hr>
        <p><strong>Tổng: ${MiniMart.Utils.formatCurrency(invoice.total)}</strong></p>
        <p>Thanh toán: ${paymentLabels[invoice.paymentMethod]}</p>
        ${invoice.paymentMethod === 'cash' ? `<p>Tiền nhận: ${MiniMart.Utils.formatCurrency(invoice.cashReceived)}</p><p>Thối lại: ${MiniMart.Utils.formatCurrency(invoice.change)}</p>` : ''}
        <hr>
        <p style='text-align:center'>Cảm ơn quý khách!</p>
      </div>
    `;
    window.print();
  }

  function clearCart() {
    cart = [];
    discountPercent = 0;
    renderCart();
  }

  return { init, render, updateQuantity, removeFromCart, clearCart, printInvoice };
})();
