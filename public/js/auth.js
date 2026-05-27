window.MiniMart = window.MiniMart || {};

MiniMart.Auth = (function() {
  function login(username, password) {
    const users = MiniMart.Data.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const safeUser = { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
      MiniMart.Data.setCurrentUser(safeUser);
      return safeUser;
    }
    return null;
  }

  function logout() {
    MiniMart.Data.clearCurrentUser();
    window.location.href = 'index.html';
  }

  function getCurrentUser() {
    return MiniMart.Data.getCurrentUser();
  }

  function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
  }

  function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  return { login, logout, getCurrentUser, isAdmin, requireAuth };
})();
