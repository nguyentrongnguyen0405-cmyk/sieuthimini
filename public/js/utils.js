window.MiniMart = window.MiniMart || {};

MiniMart.Utils = (function() {
  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function showModal(htmlContent) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return;
    content.innerHTML = htmlContent;
    overlay.classList.add('active');
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  }

  function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('active');
  }

  function debounce(fn, delay = 300) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function getDateRange(period) {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start;
    switch(period) {
      case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
      case 'week': start = new Date(end); start.setDate(start.getDate() - 7); break;
      case 'month': start = new Date(end); start.setMonth(start.getMonth() - 1); break;
      case 'year': start = new Date(end); start.setFullYear(start.getFullYear() - 1); break;
      default: start = new Date(end); start.setDate(start.getDate() - 30);
    }
    return { start, end };
  }

  function confirmDialog(message) {
    return confirm(message);
  }

  return { formatCurrency, formatNumber, formatDate, formatDateTime, formatTime, showToast, showModal, closeModal, debounce, getDateRange, confirmDialog };
})();
