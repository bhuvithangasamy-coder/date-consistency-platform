/**
 * Authentication Module
 */
const auth = {
  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (!token && !window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
  },
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : { username: 'analyst', role: 'Analyst' };
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
};
