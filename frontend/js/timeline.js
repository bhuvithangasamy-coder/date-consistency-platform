/**
 * Patient Chronological Event Timeline Inspector Logic
 */
async function loadTimeline() {
  const subjectId = document.getElementById('patient-search')?.value || '10000001';
  const container = document.getElementById('timeline-container');
  if (!container) return;

  try {
    const data = await api.getPatientTimeline(subjectId);
    if (!data || !data.events || data.events.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 2rem;">No clinical events found for Patient Subject ID '${subjectId}'.</div>`;
      return;
    }

    const eventsHtml = data.events.map((ev, idx) => `
      <div style="display: flex; gap: 1.5rem; position: relative; padding-bottom: 1.5rem;">
        <!-- Vertical Line -->
        ${idx < data.events.length - 1 ? '<div style="position: absolute; left: 1.25rem; top: 2.5rem; bottom: 0; width: 2px; background: #1e293b;"></div>' : ''}

        <!-- Icon Node -->
        <div style="width: 2.5rem; height: 2.5rem; border-radius: 9999px; background: ${ev.is_anomaly ? 'rgba(244,63,94,0.1)' : 'rgba(2,132,199,0.1)'}; border: 2px solid ${ev.is_anomaly ? '#fb7185' : '#0284c7'}; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold; color: ${ev.is_anomaly ? '#fb7185' : '#38bdf8'}; z-index: 10;">
          ${idx + 1}
        </div>

        <!-- Event Details Card -->
        <div style="flex: 1; background: #0b1329; border: 1px solid ${ev.is_anomaly ? 'rgba(244,63,94,0.4)' : '#1e293b'}; border-radius: 0.875rem; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.875rem; font-weight: bold; color: #fff;">${ev.event_name}</div>
            <span style="font-family: monospace; font-size: 0.75rem; color: ${ev.is_anomaly ? '#fb7185' : '#14b8a6'}; font-weight: bold;">${ev.timestamp}</span>
          </div>

          <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.375rem;">
            Source Table: <strong style="color: #cbd5e1;">${ev.table_name}.csv</strong> • Event Type: <strong style="color: #38bdf8;">${ev.event_type}</strong>
          </div>

          ${ev.is_anomaly ? `
            <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); border-radius: 0.5rem; font-size: 0.75rem; color: #fb7185;">
              <strong style="display: block; margin-bottom: 0.25rem;">🚨 Date Violation Flagged [${ev.rule_code}]:</strong>
              ${ev.anomaly_explanation || 'Chronological sequence failure detected by PySpark validation engine.'}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <div>
          <h3 style="font-size: 1.125rem; font-weight: 800; color: #fff;">Patient Subject ID: ${data.subject_id}</h3>
          <p style="font-size: 0.75rem; color: #14b8a6;">Chronological Event Sequence (${data.total_events} Total Events Assembled)</p>
        </div>
        <div style="font-size: 0.75rem;">
          <span style="color: #94a3b8;">Data Quality Status:</span>
          <span style="font-weight: bold; color: ${data.anomaly_count > 0 ? '#fb7185' : '#10b981'}; margin-left: 0.375rem;">
            ${data.anomaly_count > 0 ? `${data.anomaly_count} Violations Flagged` : 'Clean Chronology'}
          </span>
        </div>
      </div>
      <div>${eventsHtml}</div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: #fb7185; padding: 1rem;">Error loading patient timeline: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const subj = urlParams.get('subject_id') || '10000001';
  const inp = document.getElementById('patient-search');
  if (inp) inp.value = subj;
  loadTimeline();
});
