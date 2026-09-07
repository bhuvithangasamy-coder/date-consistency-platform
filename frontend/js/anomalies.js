/**
 * Anomaly Report Page Logic (Server-side Pagination & Filters)
 */
let currentPage = 1;
let totalPages = 1;

async function loadAnomalies(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('anomalies-tbody');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  const severity = document.getElementById('severity-filter')?.value || '';
  const anomalyType = document.getElementById('type-filter')?.value || '';

  // Update CSV Export URL
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.href = api.getExportCsvUrl(null, severity, anomalyType);
  }

  try {
    const res = await api.getAnomalies({
      page: currentPage,
      limit: 25,
      severity,
      anomaly_type: anomalyType
    });

    if (!res || !res.items || res.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 2rem;">No anomalies match selected filters.</td></tr>`;
      if (pageInfo) pageInfo.innerText = `Showing page 1 of 1 (0 total)`;
      return;
    }

    totalPages = res.pages || 1;
    if (pageInfo) pageInfo.innerText = `Showing page ${res.page} of ${res.pages} (${res.total.toLocaleString()} total anomalies)`;

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    tbody.innerHTML = res.items.map(a => `
      <tr>
        <td style="color: #64748b;">#${a.id}</td>
        <td>
          <a href="timeline.html?subject_id=${a.subject_id}" style="color: #38bdf8; text-decoration: none; font-weight: bold;">
            ${a.subject_id}
          </a>
        </td>
        <td><span style="background: #0b1329; padding: 0.25rem 0.5rem; border-radius: 0.375rem; border: 1px solid #1e293b; color: #e2e8f0;">${a.table_name}.csv</span></td>
        <td><strong style="color: #c084fc;">${a.rule_code}</strong></td>
        <td><span style="color: #f1f5f9; font-weight: 500;">${a.anomaly_type}</span></td>
        <td>${renderSeverityBadge(a.severity)}</td>
        <td style="color: #fb7185; font-family: monospace;">${a.original_value || 'NULL'}</td>
        <td style="color: #94a3b8; font-size: 0.6875rem;">${a.expected_condition}</td>
        <td>
          <a href="timeline.html?subject_id=${a.subject_id}" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.6875rem;">
            Inspect Timeline
          </a>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="9" style="color: #fb7185; padding: 1rem;">Error loading anomalies: ${err.message}</td></tr>`;
  }
}

function changePage(delta) {
  const newPage = currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    loadAnomalies(newPage);
  }
}

document.addEventListener('DOMContentLoaded', () => loadAnomalies(1));
