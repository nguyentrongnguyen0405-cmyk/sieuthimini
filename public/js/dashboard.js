window.MiniMart = window.MiniMart || {};

MiniMart.Dashboard = (function() {
  let revenueChart = null;

  let productsData = [];
  let invoicesData = [];

  function init() {
    loadData();
  }

  async function loadData() {
    try {
      const [productsRes, invoicesRes] = await Promise.all([
        fetch('/api/products', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token'), 'Accept': 'application/json' } }),
        fetch('/api/orders', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token'), 'Accept': 'application/json' } })
      ]);
      const pData = await productsRes.json();
      const iData = await invoicesRes.json();
      
      productsData = pData.data || [];
      invoicesData = iData.data || [];
      
      render();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  function renderStaffDashboard(container, user, invoices, products) {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Tìm các hóa đơn hôm nay của nhân viên này
    const myTodayInvoices = invoices.filter(inv => {
      const isToday = new Date(inv.createdAt) >= today;
      const isMine = inv.user_id === user.id || inv.employeeName === user.name;
      return isToday && isMine;
    });
    
    const todayRevenue = myTodayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const lowStockCount = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <div class="page-header-left">
          <h2 class="page-header-title">👋 Xin chào, ${user.name}!</h2>
          <p class="page-header-subtitle">Chúc bạn một ngày làm việc năng suất và chốt được nhiều đơn nhé!</p>
        </div>
      </div>

      <div class='stats-grid' style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
        <div class='stat-card card'>
          <div class='stat-card-icon blue'>💰</div>
          <div class='stat-card-info'>
            <div class='stat-card-value'>${MiniMart.Utils.formatCurrency(todayRevenue)}</div>
            <div class='stat-card-label'>Doanh số của bạn hôm nay</div>
          </div>
        </div>
        <div class='stat-card card'>
          <div class='stat-card-icon green'>🧾</div>
          <div class='stat-card-info'>
            <div class='stat-card-value'>${myTodayInvoices.length}</div>
            <div class='stat-card-label'>Đơn hàng đã chốt</div>
          </div>
        </div>
        <div class='stat-card card'>
          <div class='stat-card-icon red'>⚠️</div>
          <div class='stat-card-info'>
            <div class='stat-card-value'>${lowStockCount + outOfStockCount}</div>
            <div class='stat-card-label'>Sản phẩm sắp/đã hết hàng</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 30px; text-align: center; padding: 60px 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);">
        <h3 style="font-size: 24px; color: var(--text-primary); margin-bottom: 20px;">Bạn đã sẵn sàng phục vụ khách hàng?</h3>
        <button class="btn btn-primary" onclick="MiniMart.App.navigateTo('pos')" style="font-size: 16px; padding: 12px 32px; border-radius: 30px;">
          🛒 Mở màn hình Bán Hàng (POS)
        </button>
      </div>
    `;
  }

  function render() {
    const container = document.getElementById('page-dashboard');
    if (!container) return;
    
    const user = MiniMart.Auth.getCurrentUser();
    const isAdmin = user && user.role === 'admin';
    const products = productsData;
    const invoices = invoicesData;
    
    if (!isAdmin) {
      renderStaffDashboard(container, user, invoices, products);
      return;
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayInvoices = invoices.filter(inv => new Date(inv.createdAt) >= today);
    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const lowStockCount = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalProducts = products.filter(p => p.status === 'active').length;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const dayInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate >= d && invDate < nextD;
      });
      last7Days.push({
        label: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: dayInvoices.reduce((sum, inv) => sum + inv.total, 0),
        orders: dayInvoices.length
      });
    }

    const recentInvoices = invoices.slice(0, 5);

    const productSales = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = { name: item.name, qty: 0, revenue: 0 };
        productSales[item.name].qty += item.quantity;
        productSales[item.name].revenue += item.subtotal;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <div class="page-header-left">
          <h2 class="page-header-title">📊 Tổng quan Kinh doanh</h2>
          <p class="page-header-subtitle">Thống kê hoạt động kinh doanh toàn cửa hàng</p>
        </div>
      </div>

      <div class='stats-grid'>
        <div class='stat-card card'>
          <div class='stat-card-icon blue'>💰</div>
          <div class='stat-card-info'>
            <div class='stat-card-value'>${MiniMart.Utils.formatCurrency(todayRevenue)}</div>
            <div class='stat-card-label'>Doanh thu hôm nay</div>
          </div>
        </div>
        <div class='stat-card card'>
          <div class='stat-card-icon green'>🧾</div>
          <div class='stat-card-info'>
            <div class='stat-card-value'>${todayInvoices.length}</div>
            <div class='stat-card-label'>Đơn hàng hôm nay</div>
          </div>
        </div>
        <div class='stat-card card'>
          <div class='stat-card-icon yellow'>📦</div>
          <div class='stat-card-info'>
            <div class='stat-card-value'>${totalProducts}</div>
            <div class='stat-card-label'>Sản phẩm đang bán</div>
          </div>
        </div>
        <div class='stat-card card'>
          <div class='stat-card-icon red'>⚠️</div>
          <div class='stat-card-info'>
            <div class='stat-card-value'>${lowStockCount + outOfStockCount}</div>
            <div class='stat-card-label'>Sắp hết / Hết hàng</div>
          </div>
        </div>
      </div>

      <div class='grid-2'>
        <div class='card'>
          <div class='card-header'>
            <h3 class='card-title'>📈 Doanh thu 7 ngày qua</h3>
          </div>
          <div class='chart-container'>
            <canvas id='revenueChart'></canvas>
          </div>
        </div>
        <div class='card'>
          <div class='card-header'>
            <h3 class='card-title'>🏆 Top sản phẩm bán chạy</h3>
          </div>
          <div class='table-container'>
            <table class='data-table'>
              <thead><tr><th>Sản phẩm</th><th>SL bán</th><th>Doanh thu</th></tr></thead>
              <tbody>
                ${topProducts.map(p => `
                  <tr><td>${p.name}</td><td>${p.qty}</td><td>${MiniMart.Utils.formatCurrency(p.revenue)}</td></tr>
                `).join('')}
                ${topProducts.length === 0 ? '<tr><td colspan="3" class="text-center text-muted">Chưa có dữ liệu</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class='card' style='margin-top:20px'>
        <div class='card-header'>
          <h3 class='card-title'>🕐 Đơn hàng gần đây</h3>
        </div>
        <div class='table-container'>
          <table class='data-table'>
            <thead><tr><th>Mã HĐ</th><th>Thời gian</th><th>Nhân viên</th><th>Thanh toán</th><th>Tổng tiền</th></tr></thead>
            <tbody>
              ${recentInvoices.map(inv => {
                const paymentLabels = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', ewallet: 'Ví điện tử' };
                return `<tr>
                  <td><strong>${inv.id}</strong></td>
                  <td>${MiniMart.Utils.formatDateTime(inv.createdAt)}</td>
                  <td>${inv.employeeName}</td>
                  <td><span class='badge badge-info'>${paymentLabels[inv.paymentMethod] || inv.paymentMethod}</span></td>
                  <td><strong>${MiniMart.Utils.formatCurrency(inv.total)}</strong></td>
                </tr>`;
              }).join('')}
              ${recentInvoices.length === 0 ? '<tr><td colspan="5" class="text-center text-muted">Chưa có đơn hàng</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    renderRevenueChart(last7Days);
  }

  function renderRevenueChart(data) {
    if (revenueChart) revenueChart.destroy();
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Doanh thu (₫)',
          data: data.map(d => d.revenue),
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: '#6366f1',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => MiniMart.Utils.formatCurrency(ctx.raw) } }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', callback: (v) => (v/1000) + 'k' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  return { init, render };
})();
