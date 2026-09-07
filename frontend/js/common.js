/**
 * Common UI Layout Renderer (Navbar, Sidebar, Live Clock, Badges)
 */
function renderNavbar() {
  const user = auth.getUser();
  const header = document.getElementById('navbar-container');
  if (!header) return;

  header.innerHTML = `
    <header class="top-header">
      <div class="brand-container">
        <div class="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#020617" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div>
          <div class="brand-title">Date Consistency Platform</div>
          <div class="brand-subtitle">MIMIC-IV Clinical Quality Engine</div>
        </div>
        <div class="source-badge" style="margin-left: 1rem;">
          <span style="color: #14b8a6;">●</span>
          <span>Data Source: <strong style="color: #38bdf8;">Kaggle MIMIC-IV Clinical DB</strong></span>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="font-size: 0.75rem; color: #94a3b8; font-family: monospace;" id="live-clock">
          12:00:00 PM | PySpark 4.2 Engine
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; background: #0f172a; padding: 0.375rem 0.75rem; border-radius: 0.5rem; border: 1px solid #1e293b;">
          <div style="width: 1.75rem; height: 1.75rem; border-radius: 9999px; background: rgba(2, 132, 199, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.75rem;">
            ${(user.username || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 600; color: #f1f5f9;">${user.username || 'analyst'}</div>
            <div style="font-size: 0.625rem; color: #38bdf8;">${user.role || 'Analyst'}</div>
          </div>
        </div>
        <button onclick="auth.logout()" title="Logout" style="background: none; border: none; color: #64748b; cursor: pointer; padding: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </header>
  `;

  // Start live clock
  setInterval(() => {
    const clock = document.getElementById('live-clock');
    if (clock) {
      clock.innerText = `${new Date().toLocaleTimeString()} | PySpark 4.2 Engine`;
    }
  }, 1000);
}

function renderSidebar(activePage) {
  const sidebar = document.getElementById('sidebar-container');
  if (!sidebar) return;

  const navItems = [
    { name: 'Dashboard', page: 'dashboard.html', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { name: 'Dataset Management', page: 'datasets.html', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { name: 'Data Preview', page: 'preview.html', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
    { name: 'Processing Monitor', page: 'monitor.html', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
    { name: 'Date Validation', page: 'validation.html', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3' },
    { name: 'Anomaly Report', page: 'anomalies.html', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01' },
    { name: 'Record Timeline', page: 'timeline.html', icon: 'M18 6L6 18M6 6l12 12' },
    { name: 'Rule Management', page: 'rules.html', icon: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3' },
    { name: 'Dataset Onboarding', page: 'onboarding.html', icon: 'M12 5v14M5 12h14' },
    { name: 'Audit Logs', page: 'audit-logs.html', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { name: 'Settings', page: 'settings.html', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' }
  ];

  let linksHtml = navItems.map(item => `
    <a href="${item.page}" class="nav-link ${activePage === item.page ? 'active' : ''}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${item.icon}"/>
      </svg>
      <span>${item.name}</span>
    </a>
  `).join('');

  sidebar.innerHTML = `
    <aside class="sidebar-nav">
      <div>
        <div class="nav-section-title">Platform Navigation</div>
        <nav style="display: flex; flex-direction: column; gap: 0.25rem;">
          ${linksHtml}
        </nav>
      </div>
      <div style="border-top: 1px solid #1e293b; padding-top: 1rem;">
        <div style="background: #0f172a; border-radius: 0.75rem; padding: 0.75rem; border: 1px solid #1e293b; font-size: 0.75rem;">
          <div style="display: flex; justify-content: space-between; color: #94a3b8;">
            <span>Engine</span>
            <span style="color: #14b8a6; font-weight: bold;">v2.0.0</span>
          </div>
          <div style="font-size: 0.6875rem; color: #64748b; margin-top: 0.25rem;">PySpark Distributed Validator</div>
        </div>
      </div>
    </aside>
  `;
}

function renderSeverityBadge(severity) {
  let cls = 'badge-low';
  if (severity === 'Critical') cls = 'badge-critical';
  else if (severity === 'High') cls = 'badge-high';
  else if (severity === 'Medium') cls = 'badge-medium';
  return `<span class="badge ${cls}">${severity}</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
  auth.checkAuth();
  renderNavbar();
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  renderSidebar(currentPage);
});
