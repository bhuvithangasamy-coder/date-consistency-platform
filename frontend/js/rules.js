/**
 * Rule Management Logic
 */
async function loadRules() {
  const tbody = document.getElementById('rules-tbody');
  if (!tbody) return;

  try {
    const list = await api.getRules();
    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 2rem;">No rules defined.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(r => `
      <tr>
        <td><strong style="color: #38bdf8; font-family: monospace;">${r.rule_code}</strong></td>
        <td>
          <div style="font-weight: bold; color: #fff;">${r.name}</div>
          <div style="font-size: 0.6875rem; color: #64748b;">${r.description || ''}</div>
        </td>
        <td><span style="background: #0b1329; padding: 0.25rem 0.5rem; border-radius: 0.375rem; border: 1px solid #1e293b; color: #cbd5e1;">${r.source_table}.csv</span></td>
        <td><span style="font-family: monospace; color: #14b8a6; background: rgba(20,184,166,0.1); padding: 0.25rem 0.5rem; border-radius: 0.375rem;">${r.left_field} ${r.operator} ${r.right_field || ''}</span></td>
        <td>${renderSeverityBadge(r.severity)}</td>
        <td>
          <span style="color: ${r.status === 'Active' ? '#10b981' : '#64748b'}; font-weight: bold;">
            ${r.status}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary" onclick="toggleRule(${r.id}, '${r.status === 'Active' ? 'Disabled' : 'Active'}')" style="padding: 0.25rem 0.5rem; font-size: 0.6875rem;">
            ${r.status === 'Active' ? 'Disable' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: #fb7185; padding: 1rem;">Error loading rules: ${err.message}</td></tr>`;
  }
}

async function toggleRule(id, newStatus) {
  try {
    await api.updateRule(id, { status: newStatus });
    await loadRules();
  } catch (e) {
    alert('Failed to update rule status: ' + e.message);
  }
}

document.addEventListener('DOMContentLoaded', loadRules);
