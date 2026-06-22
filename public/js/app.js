window.MiniMart = window.MiniMart || {};

MiniMart.App = (function() {
  let currentPage = 'dashboard';

  const PAGE_TITLES = {
    dashboard: 'Dashboard',
    pos: 'Bán hàng',
    categories: 'Quản lý danh mục',
    products: 'Quản lý sản phẩm',
    inventory: 'Quản lý tồn kho',
    customers: 'Quản lý khách hàng',
    invoices: 'Hóa đơn',
    reports: 'Báo cáo doanh thu'
  };

  const modules = {
    dashboard: () => MiniMart.Dashboard,
    pos: () => MiniMart.POS,
    categories: () => MiniMart.Categories,
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
    const isAdmin = user && user.role === 'admin';
    
    const displayName = user.name || user.fullName || 'User';
    document.getElementById('userName').textContent = displayName;
    document.getElementById('userRole').textContent = isAdmin ? 'Quản lý' : 'Nhân viên';
    document.getElementById('userAvatar').textContent = displayName.charAt(0).toUpperCase();

    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    // RBAC: Hide menu items for non-admins
    document.querySelectorAll('.nav-link').forEach(link => {
      const page = link.dataset.page;
      if (!isAdmin && ['categories', 'products', 'inventory', 'reports'].includes(page)) {
        link.style.display = 'none';
        // Hide empty section headers if needed
        const section = link.closest('.sidebar-section');
        if (section && section.querySelectorAll('.nav-link[style="display: none;"]').length === section.querySelectorAll('.nav-link').length) {
          section.style.display = 'none';
        }
      }

      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Prevent navigation for unauthorized pages
        if (!isAdmin && ['categories', 'products', 'inventory', 'reports'].includes(page)) {
          MiniMart.Utils.showToast('Bạn không có quyền truy cập trang này', 'error');
          return;
        }
        navigateTo(page);
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
