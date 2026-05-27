window.MiniMart = window.MiniMart || {};

MiniMart.App = (function() {
  let currentPage = 'dashboard';

  const PAGE_TITLES = {
    dashboard: 'Dashboard',
    pos: 'Bán hàng',
    products: 'Quản lý sản phẩm',
    inventory: 'Quản lý tồn kho',
    customers: 'Quản lý khách hàng',
    invoices: 'Hóa đơn',
    reports: 'Báo cáo doanh thu'
  };

  const modules = {
    dashboard: () => MiniMart.Dashboard,
    pos: () => MiniMart.POS,
    products: () => MiniMart.Products,
    inventory: () => MiniMart.Inventory,
    customers: () => MiniMart.Customers,
    invoices: () => MiniMart.Invoices,
    reports: () => MiniMart.Reports
  };

  function navigateTo(pageName) {
    if (!PAGE_TITLES[pageName]) return;
    currentPage = pageName;

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageName);
    });

    document.getElementById('pageTitle').textContent = PAGE_TITLES[pageName];

    document.querySelectorAll('.page').forEach(page => {
      page.classList.toggle('active', page.id === `page-${pageName}`);
    });

    const mod = modules[pageName]();
    if (mod && mod.render) mod.render();
  }

  function init() {
    if (!MiniMart.Auth.requireAuth()) return;

    MiniMart.Data.initSampleData();

    const user = MiniMart.Auth.getCurrentUser();
    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userRole').textContent = user.role === 'admin' ? 'Quản lý' : 'Nhân viên';
    document.getElementById('userAvatar').textContent = user.fullName.charAt(0).toUpperCase();

    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
      });
    });

    document.getElementById('btnLogout').addEventListener('click', () => MiniMart.Auth.logout());

    Object.values(modules).forEach(getModule => {
      const mod = getModule();
      if (mod && mod.init) mod.init();
    });

    navigateTo('dashboard');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { navigateTo, init };
})();
