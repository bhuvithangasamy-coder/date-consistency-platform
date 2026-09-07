/**
 * Dataset Management Page Logic
 */
async function loadDatasets() {
  const container = document.getElementById('dataset-list-container');
  if (!container) return;

  try {
    const list = await api.getDatasets();
    if (!list || list.length === 0) {
      container.innerHTML = `<div class="card" style="text-align: center; color: #94a3b8;">No datasets registered yet. Click "Import Kaggle MIMIC-IV" to import.</div>`;
      return;
    }

    container.innerHTML = list.map(ds => `
      <div class="card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(2, 132, 199, 0.1); border: 1px solid rgba(2, 132, 199, 0.3); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
            </div>
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 800; color: #fff;">${ds.name}</h3>
              <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">
                Source: <strong style="color: #38bdf8;">${ds.source_type}</strong> • Version: <strong style="color: #c084fc;">${ds.version}</strong> • Status: <strong style="color: #10b981;">${ds.status}</strong>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <a href="preview.html?dataset_id=${ds.id}" class="btn btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Preview Data
            </a>
            <a href="validation.html?dataset_id=${ds.id}" class="btn btn-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Validate Dataset
            </a>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; font-size: 0.75rem;">
          <div style="background: #0b1329; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #1e293b;">
            <span style="color: #64748b; display: block;">Total Records</span>
            <span style="font-size: 1.125rem; font-weight: 800; color: #fff;">${Number(ds.record_count).toLocaleString()}</span>
          </div>
          <div style="background: #0b1329; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #1e293b;">
            <span style="color: #64748b; display: block;">Clinical Tables</span>
            <span style="font-size: 1.125rem; font-weight: 800; color: #38bdf8;">${ds.table_count} Tables</span>
          </div>
          <div style="background: #0b1329; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #1e293b;">
            <span style="color: #64748b; display: block;">Storage Location</span>
            <span style="font-family: monospace; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; display: block;">${ds.storage_path}</span>
          </div>
          <div style="background: #0b1329; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #1e293b;">
            <span style="color: #64748b; display: block;">Last Validated</span>
            <span style="font-family: monospace; color: #14b8a6;">${ds.last_validated_at ? new Date(ds.last_validated_at).toLocaleString() : 'Just Now'}</span>
          </div>
        </div>

        <div>
          <div style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.75rem;">Detected Tables & Date Columns</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            ${ds.tables.map(tbl => `
              <div style="background: rgba(11, 19, 41, 0.6); padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #1e293b; font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; color: #fff;">
                  <span>${tbl.table_name}.csv</span>
                  <span style="color: #64748b; font-size: 0.6875rem;">${Number(tbl.record_count).toLocaleString()} rows</span>
                </div>
                <div style="font-size: 0.6875rem; color: #38bdf8; font-family: monospace; margin-top: 0.25rem;">
                  Date Cols: ${(tbl.date_columns || []).join(', ')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="card" style="color: #fb7185;">Error loading datasets: ${err.message}</div>`;
  }
}

async function importKaggleDataset() {
  try {
    alert('Importing Kaggle MIMIC-IV Clinical Dataset...');
    await api.importKaggleDataset();
    await loadDatasets();
    alert('Dataset imported successfully!');
  } catch (e) {
    alert('Import failed: ' + e.message);
  }
}

document.addEventListener('DOMContentLoaded', loadDatasets);
