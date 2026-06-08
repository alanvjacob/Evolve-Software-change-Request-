import { store } from '../utils/store.js';

export class Traceability {
  constructor(container) {
    this.container = container;
    this.activeDiffComponentId = null;
    
    // Static definition of system requirements
    this.requirements = [
      { id: 'REQ-001', desc: 'Secure Cryptographic Audit Ledger', tier: 'High Security', components: ['TransactionEngine', 'Database'] },
      { id: 'REQ-002', desc: 'SMS Two-Factor Authentication', tier: 'Medium Security', components: ['AuthService', 'NotificationAPI'] },
      { id: 'REQ-003', desc: 'Parameterized Input Sanitization', tier: 'Critical Security', components: ['SecurityAuditor', 'Database'] },
      { id: 'REQ-004', desc: 'Comprehensive PDF Activity Reporting', tier: 'Business Logic', components: ['ReportingService', 'Database'] },
      { id: 'REQ-005', desc: 'Real-time Payment Settlement Interface', tier: 'Integration', components: ['PaymentGateway', 'TransactionEngine'] }
    ];
  }

  init() {
    const state = store.getState();
    // If a CR is selected globally, default the diff viewer to its first modified component
    if (state.activeImpactCR) {
      const cr = state.activeImpactCR;
      if (cr.affectedComponents && cr.affectedComponents.length > 0) {
        this.activeDiffComponentId = cr.affectedComponents[0];
      }
    }
    this.render();
  }

  render() {
    const state = store.getState();
    const crs = state.changeRequests;
    const comps = state.codebase.components;

    // Pick active CR for the Diff Viewer
    const activeCR = state.activeImpactCR || crs[0];

    // Check if the selected component exists in activeCR, otherwise reset activeDiffComponentId
    if (activeCR && (!this.activeDiffComponentId || !activeCR.affectedComponents.includes(this.activeDiffComponentId))) {
      this.activeDiffComponentId = activeCR.affectedComponents[0] || null;
    }

    this.container.innerHTML = `
      <div class="dashboard-grid">
        <!-- Part 1: Requirements Traceability Matrix -->
        <div class="glass-card trace-table-card">
          <h2 style="font-size: 20px; font-weight: 800; background: linear-gradient(90deg, #fff, var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
            Requirements Traceability Matrix
          </h2>
          <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">
            Guarantees full software auditability by mapping system requirements directly to implementing codebase modules and active Change Requests.
          </p>

          <table class="trace-table">
            <thead>
              <tr>
                <th>Requirement ID</th>
                <th>Description</th>
                <th>Security Classification</th>
                <th>Implementing Modules</th>
                <th>Linked Evolution CRs</th>
                <th>Coverage Status</th>
              </tr>
            </thead>
            <tbody>
              ${this.requirements.map(req => {
                // Find change requests modifying components linked to this requirement
                const linkedCRs = crs.filter(cr => 
                  cr.affectedComponents.some(comp => req.components.includes(comp))
                );

                const coverageLabel = linkedCRs.length > 0 ? 'Evolution Active' : 'Stable';
                const coverageClass = linkedCRs.length > 0 ? 'color: var(--secondary); font-weight: bold;' : 'color: var(--success);';

                return `
                  <tr>
                    <td style="font-family: var(--font-mono); font-weight: 700; color: var(--secondary);">${req.id}</td>
                    <td style="font-weight: 600;">${req.desc}</td>
                    <td>
                      <span style="font-size: 11px; padding: 2px 8px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--text-secondary);">
                        ${req.tier}
                      </span>
                    </td>
                    <td>
                      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        ${req.components.map(compId => {
                          const comp = comps.find(c => c.id === compId);
                          return `
                            <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-primary);">
                              ${comp ? comp.name : compId}
                            </span>
                          `;
                        }).join(', ')}
                      </div>
                    </td>
                    <td>
                      ${linkedCRs.length > 0 ? linkedCRs.map(cr => `
                        <span class="cr-id" style="cursor: pointer; text-decoration: underline;" data-cr-id="${cr.id}">
                          ${cr.id}
                        </span>
                      `).join(', ') : '<span style="color: var(--text-muted);">None</span>'}
                    </td>
                    <td style="${coverageClass}">${coverageLabel}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Part 2: Interactive Code Diff Viewer -->
        <div class="glass-card" style="grid-column: span 12;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
            <div>
              <h2 style="font-size: 20px; font-weight: 800; background: linear-gradient(90deg, #fff, var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                Simulated Evolution Code Diff Viewer
              </h2>
              <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">
                Review the exact source-level modifications introduced by a specific Change Request.
              </p>
            </div>
            
            <div style="display: flex; gap: 12px; align-items: center;">
              <label style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Select Change Request:</label>
              <select id="select-diff-cr" style="padding: 6px 12px; font-size: 12px; background: rgba(0,0,0,0.4); border: 1px solid var(--border);">
                ${crs.map(cr => `
                  <option value="${cr.id}" ${activeCR && activeCR.id === cr.id ? 'selected' : ''}>
                    ${cr.id}: ${cr.title}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          ${activeCR ? `
            <div style="display: grid; grid-template-columns: 240px 1fr; gap: 20px; min-height: 380px;">
              <!-- File Tabs Panel -->
              <div style="border-right: 1px solid var(--border); padding-right: 16px;">
                <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; margin-bottom: 12px;">
                  Modified Source Files
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${activeCR.affectedComponents.map(compId => {
                    const comp = comps.find(c => c.id === compId);
                    const fileName = comp ? comp.name : compId;
                    const isActive = this.activeDiffComponentId === compId;

                    return `
                      <button class="file-tab-btn ${isActive ? 'active' : ''}" data-comp-id="${compId}" style="text-align: left; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid ${isActive ? 'var(--border-active)' : 'var(--border)'}; background: ${isActive ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)'}; color: ${isActive ? 'var(--primary)' : 'var(--text-secondary)'}; font-family: var(--font-mono); font-size: 13px; font-weight: 600; cursor: pointer; transition: all var(--transition-fast);">
                        📁 ${fileName}
                      </button>
                    `;
                  }).join('')}
                  ${activeCR.affectedComponents.length === 0 ? `
                    <div style="font-size: 12px; color: var(--text-muted); padding: 10px; text-align: center; border: 1px dashed var(--border); border-radius: var(--radius-sm);">
                      No source files modified (pure administrative CR).
                    </div>
                  ` : ''}
                </div>

                <!-- CR metadata block -->
                <div style="margin-top: 24px; padding: 12px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; line-height: 1.6;">
                  <div style="color: var(--text-muted); font-weight: bold; text-transform: uppercase; font-size: 10px; margin-bottom: 8px;">
                    Change Record
                  </div>
                  <div><b>Submitter:</b> ${activeCR.submitter}</div>
                  <div><b>Assignee:</b> ${activeCR.assignedTo}</div>
                  <div><b>Date:</b> ${activeCR.createdDate}</div>
                  <div><b>Priority:</b> <span class="cr-priority-badge priority-${activeCR.priority.toLowerCase()}" style="font-size: 9px; padding: 1px 4px;">${activeCR.priority}</span></div>
                </div>
              </div>

              <!-- Diff Visualizer View -->
              <div>
                ${this.activeDiffComponentId && activeCR.diffs[this.activeDiffComponentId] ? `
                  <div class="diff-container">
                    <div class="diff-header">
                      <span>${comps.find(c => c.id === this.activeDiffComponentId)?.name || this.activeDiffComponentId}</span>
                      <span style="color: var(--secondary);">Unified Diff Format</span>
                    </div>
                    <div class="diff-body">
                      ${activeCR.diffs[this.activeDiffComponentId].split('\n').map((line, idx) => {
                        let lineClass = 'diff-line';
                        if (line.startsWith('+')) lineClass = 'diff-line addition';
                        else if (line.startsWith('-')) lineClass = 'diff-line deletion';
                        
                        return `
                          <div class="${lineClass}" data-line="${idx + 1}">${escapeHtml(line)}</div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 350px; border: 1px dashed var(--border); border-radius: var(--radius-sm); color: var(--text-muted);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    <span>Select a modified source file on the left to review code diffs.</span>
                  </div>
                `}
              </div>
            </div>
          ` : `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
              No Change Requests available in the database.
            </div>
          `}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Select CR diff
    const crSelect = this.container.querySelector('#select-diff-cr');
    if (crSelect) {
      crSelect.addEventListener('change', (e) => {
        const crId = e.target.value;
        store.selectImpactCR(crId);
        this.activeDiffComponentId = null; // Reset tab selection
        this.render();
      });
    }

    // Click file tabs
    this.container.querySelectorAll('.file-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const compId = btn.getAttribute('data-comp-id');
        this.activeDiffComponentId = compId;
        this.render();
      });
    });

    // Requirements table link click
    this.container.querySelectorAll('.trace-table .cr-id').forEach(link => {
      link.addEventListener('click', () => {
        const crId = link.getAttribute('data-cr-id');
        store.selectImpactCR(crId);
        this.activeDiffComponentId = null;
        this.render();
      });
    });
  }
}

// Helper to escape HTML characters in diff logs
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
