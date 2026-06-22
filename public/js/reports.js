window.MiniMart = window.MiniMart || {};

MiniMart.Reports = (function () {
  'use strict';

  let reportPeriod = 'month'; // 'today', 'week', 'month'
  let trendChart = null;
  let paymentChart = null;
  let categoryChart = null;

  let productsData = [];
  let invoicesData = [];
  let categoriesData = [];

  function init() {
    reportPeriod = 'month';
    loadData();
  }

  async function loadData() {
    try {
      const [productsRes, invoicesRes, categoriesRes] = await Promise.all([
        fetch('/api/products', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token'), 'Accept': 'application/json' } }),
        fetch('/api/orders', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token'), 'Accept': 'application/json' } }),
        fetch('/api/categories', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token'), 'Accept': 'application/json' } })
      ]);
      const pData = await productsRes.json();
      const iData = await invoicesRes.json();
      const cData = await categoriesRes.json();
      
      productsData = pData.data || [];
      invoicesData = iData.data || [];
      categoriesData = cData.data || [];
      
      render();
    } catch (error) {
      console.error('Error loading reports data:', error);
    }
  }

  function render() {
    const container = document.getElementById('page-reports');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h2 class="page-header-title">📈 Báo cáo doanh thu</h2>
          <p class="page-header-subtitle">Thống kê doanh số bán lẻ siêu thị mini</p>
        </div>
        <div class="page-header-actions">
          <div class="tabs" id="reportPeriodTabs">
            <button class="tab-btn${reportPeriod === 'today' ? ' active' : ''}" data-period="today">Hôm nay</button>
            <button class="tab-btn${reportPeriod === 'week' ? ' active' : ''}" data-period="week">7 ngày qua</button>
            <button class="tab-btn${reportPeriod === 'month' ? ' active' : ''}" data-period="month">30 ngày qua</button>
          </div>
        </div>
      </div>

      <div class="stats-grid" id="reportStatsGrid"></div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📈 Biểu đồ doanh thu</h3>
          </div>
          <div class="chart-container" style="position: relative; height: 320px;">
            <canvas id="reportTrendChart"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">💳 Cơ cấu thanh toán</h3>
          </div>
          <div class="chart-container" style="position: relative; height: 320px; display: flex; justify-content: center;">
            <canvas id="reportPaymentChart" style="max-width: 280px;"></canvas>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-top: 20px;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🏷️ Doanh thu theo danh mục</h3>
          </div>
          <div class="chart-container" style="position: relative; height: 320px; display: flex; justify-content: center;">
            <canvas id="reportCategoryChart" style="max-width: 280px;"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">⭐ Top 5 sản phẩm sinh lời tốt nhất</h3>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th class="text-center">Số lượng bán</th>
                  <th class="text-right">Doanh thu</th>
                  <th class="text-right">Lợi nhuận</th>
                </tr>
              </thead>
              <tbody id="topProfitProductsBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    const periodTabs = document.getElementById('reportPeriodTabs');
    if (periodTabs) {
      periodTabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          reportPeriod = this.getAttribute('data-period');
          periodTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          updateReportData();
        });
      });
    }

    updateReportData();
  }

  function updateReportData() {
    const products = productsData;
    const invoices = invoicesData;

    // Map products to their cost price for profit calculation
    const costMap = {};
    const catMap = {};
    products.forEach(p => {
      costMap[p.name] = p.costPrice || 0;
      catMap[p.name] = p.category || 'khac';
    });

    // Date range filter
    const now = new Date();
    let startDate = new Date();
    let daysCount = 30;

    if (reportPeriod === 'today') {
      startDate.setHours(0, 0, 0, 0);
      daysCount = 1;
    } else if (reportPeriod === 'week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      daysCount = 7;
    } else {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      daysCount = 30;
    }

    // Filter invoices by date
    const filteredInvoices = invoices.filter(inv => new Date(inv.createdAt) >= startDate);

    // Calculate metrics
    let totalRevenue = 0;
    let totalCost = 0;
    let totalOrders = filteredInvoices.length;

    const paymentCounts = { cash: 0, transfer: 0, ewallet: 0 };
    const categoryRevenue = {};
    const productProfit = {};

    filteredInvoices.forEach(inv => {
      totalRevenue += inv.total;
      
      // Calculate costs and statistics for items
      inv.items.forEach(item => {
        const itemCost = (costMap[item.name] || (item.price * 0.75)) * item.quantity;
        totalCost += itemCost;

        // Category breakdown
        const catId = catMap[item.name] || 'khac';
        categoryRevenue[catId] = (categoryRevenue[catId] || 0) + item.subtotal;

        // Product profit statistics
        if (!productProfit[item.name]) {
          productProfit[item.name] = { name: item.name, quantity: 0, revenue: 0, profit: 0 };
        }
        productProfit[item.name].quantity += item.quantity;
        productProfit[item.name].revenue += item.subtotal;
        productProfit[item.name].profit += (item.subtotal - itemCost);
      });

      // Payment method share
      const method = inv.paymentMethod || 'cash';
      paymentCounts[method] = (paymentCounts[method] || 0) + inv.total;
    });

    const netProfit = totalRevenue - totalCost;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // Render Stats Grid
    const statsGrid = document.getElementById('reportStatsGrid');
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="stat-card card">
          <div class="stat-card-icon blue">💰</div>
          <div class="stat-card-info">
            <div class="stat-card-value">${MiniMart.Utils.formatCurrency(totalRevenue)}</div>
            <div class="stat-card-label">Tổng doanh thu</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-card-icon red">📉</div>
          <div class="stat-card-info">
            <div class="stat-card-value">${MiniMart.Utils.formatCurrency(totalCost)}</div>
            <div class="stat-card-label">Giá vốn hàng bán</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-card-icon green">📈</div>
          <div class="stat-card-info">
            <div class="stat-card-value">${MiniMart.Utils.formatCurrency(netProfit)}</div>
            <div class="stat-card-label">Lợi nhuận gộp</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-card-icon yellow">🛒</div>
          <div class="stat-card-info">
            <div class="stat-card-value">${MiniMart.Utils.formatCurrency(avgOrderValue)}</div>
            <div class="stat-card-label">Giá trị ĐH trung bình</div>
          </div>
        </div>
      `;
    }

    // Top Profit Products Table
    const topProfitList = Object.values(productProfit)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    const tbody = document.getElementById('topProfitProductsBody');
    if (tbody) {
      if (topProfitList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chưa có dữ liệu giao dịch</td></tr>';
      } else {
        tbody.innerHTML = topProfitList.map(item => `
          <tr>
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${MiniMart.Utils.formatCurrency(item.revenue)}</td>
            <td class="text-right text-success"><strong>+${MiniMart.Utils.formatCurrency(item.profit)}</strong></td>
          </tr>
        `).join('');
      }
    }

    // Prepare Trend Chart Data
    const trendLabels = [];
    const trendValues = [];

    if (reportPeriod === 'today') {
      // Hour by hour
      for (let h = 8; h <= 21; h++) {
        trendLabels.push(`${h}h`);
        const hourRev = filteredInvoices.filter(inv => {
          const invHour = new Date(inv.createdAt).getHours();
          return invHour === h;
        }).reduce((sum, inv) => sum + inv.total, 0);
        trendValues.push(hourRev);
      }
    } else {
      // Day by day
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0,0,0,0);
        
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        trendLabels.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
        const dayRev = filteredInvoices.filter(inv => {
          const invDate = new Date(inv.createdAt);
          return invDate >= d && invDate < nextD;
        }).reduce((sum, inv) => sum + inv.total, 0);
        trendValues.push(dayRev);
      }
    }

    // Render Charts
    renderCharts(trendLabels, trendValues, paymentCounts, categoryRevenue);
  }

  function renderCharts(trendLabels, trendValues, paymentCounts, categoryRevenue) {
    // 1. Trend Chart
    const trendCtx = document.getElementById('reportTrendChart');
    if (trendCtx) {
      if (trendChart) trendChart.destroy();
      trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: trendLabels,
          datasets: [{
            label: 'Doanh thu (₫)',
            data: trendValues,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1'
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
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', callback: (v) => v >= 1000 ? (v / 1000) + 'k' : v }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8' }
            }
          }
        }
      });
    }

    // 2. Payment Distribution Chart
    const payCtx = document.getElementById('reportPaymentChart');
    if (payCtx) {
      if (paymentChart) paymentChart.destroy();
      paymentChart = new Chart(payCtx, {
        type: 'pie',
        data: {
          labels: ['Tiền mặt', 'Chuyển khoản QR', 'Ví Momo'],
          datasets: [{
            data: [paymentCounts.cash || 0, paymentCounts.transfer || 0, paymentCounts.ewallet || 0],
            backgroundColor: ['#22c55e', '#3b82f6', '#ec4899'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#e2e8f0', font: { family: 'Inter', size: 12 } }
            },
            tooltip: { callbacks: { label: (ctx) => 'Doanh số: ' + MiniMart.Utils.formatCurrency(ctx.raw) } }
          }
        }
      });
    }

    // 3. Category Share Chart
    const catCtx = document.getElementById('reportCategoryChart');
    if (catCtx) {
      if (categoryChart) categoryChart.destroy();

      const categories = categoriesData;
      const labels = categories.map(c => c.name);
      const dataValues = categories.map(c => categoryRevenue[c.id] || 0);

      // Filter categories with > 0 sales to avoid cluttered chart, but fallback to all if empty
      const chartColors = [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
        '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
      ];

      categoryChart = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: chartColors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#e2e8f0', boxWidth: 12, font: { family: 'Inter', size: 11 } }
            },
            tooltip: { callbacks: { label: (ctx) => 'Doanh số: ' + MiniMart.Utils.formatCurrency(ctx.raw) } }
          },
          cutout: '60%'
        }
      });
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

  return { init, render };
})();
