import { store } from '../utils/store.js';

export class Kanban {
  constructor(container) {
    this.container = container;
    this.columns = [
      { id: 'Draft', title: 'Draft', color: 'var(--text-muted)' },
      { id: 'Submitted', title: 'Submitted', color: 'var(--accent-blue)' },
      { id: 'Impact Analysis', title: 'Impact Analysis', color: 'var(--warning)' },
      { id: 'Approved', title: 'Approved', color: 'var(--primary)' },
      { id: 'In Progress', title: 'In Progress', color: 'var(--secondary)' },
      { id: 'Testing', title: 'Testing', color: '#ff70a6' },
      { id: 'Merged', title: 'Merged', color: 'var(--success)' }
    ];
  }

  init() {
    this.render();
  }

  render() {
    const state = store.getState();
    const crs = state.changeRequests;

    this.container.innerHTML = `
      <div class="dashboard-grid">
        <div style="grid-column: span 12; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 800; background: linear-gradient(90deg, #fff, var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Change Request Lifecycle Board
            </h2>
            <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
              Drag and drop requests to progress their state, or click to analyze impact and view diffs.
            </p>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: var(--secondary); border-radius: 50%; box-shadow: 0 0 8px var(--secondary-glow);"></span>
            State Synced Reactively
          </div>
        </div>

        <div class="kanban-container">
          ${this.columns.map(col => {
            const colCRs = crs.filter(cr => cr.status === col.id);
            return `
              <div class="kanban-column" data-status="${col.id}">
                <div class="column-header" style="border-bottom: 2px solid ${col.color}; padding-bottom: 8px;">
                  <span class="column-title" style="color: ${col.color}">
                    ${col.title}
                  </span>
                  <span class="column-badge">${colCRs.length}</span>
                </div>
                <div class="cards-container" data-status="${col.id}">
                  ${colCRs.map(cr => `
                    <div class="cr-card" draggable="true" data-cr-id="${cr.id}">
                      <div class="cr-card-header">
                        <span class="cr-id">${cr.id}</span>
                        <span class="cr-priority-badge priority-${cr.priority.toLowerCase()}">
                          ${cr.priority}
                        </span>
                      </div>
                      <h4 class="cr-title">${cr.title}</h4>
                      <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">
                        ${cr.description}
                      </p>
                      
                      <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px;">
                        ${cr.affectedComponents.map(comp => `
                          <span style="font-size: 9px; font-family: var(--font-mono); background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 1px 4px; border-radius: 2px; color: var(--text-secondary);">
                            ${comp.toLowerCase()}.js
                          </span>
                        `).join('')}
                      </div>

                      <div class="cr-footer">
                        <span class="cr-category">${cr.category}</span>
                        <div style="display: flex; gap: 8px;">
                          <!-- Action trigger: Analyze Impact -->
                          <button title="Run Impact Simulation" class="btn-action-impact" data-cr-id="${cr.id}" style="background: transparent; color: var(--secondary); cursor: pointer;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                              <polyline points="2 17 12 22 22 17"></polyline>
                              <polyline points="2 12 12 17 22 12"></polyline>
                            </svg>
                          </button>
                          
                          <!-- Action trigger: View Diffs -->
                          <button title="View Code Diffs" class="btn-action-diff" data-cr-id="${cr.id}" style="background: transparent; color: var(--primary); cursor: pointer;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="16 18 22 12 16 6"></polyline>
                              <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                  ${colCRs.length === 0 ? `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100px; border: 1px dashed var(--border); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 11px; text-align: center; pointer-events: none;">
                      Empty Column
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const cards = this.container.querySelectorAll('.cr-card');
    const containers = this.container.querySelectorAll('.cards-container');

    // Drag-and-drop logic
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.getAttribute('data-cr-id'));
        card.style.opacity = '0.5';
      });

      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });
    });

    containers.forEach(container => {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.style.background = 'rgba(255, 255, 255, 0.05)';
      });

      container.addEventListener('dragleave', () => {
        container.style.background = 'transparent';
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.style.background = 'transparent';
        const crId = e.dataTransfer.getData('text/plain');
        const newStatus = container.getAttribute('data-status');
        
        if (crId && newStatus) {
          store.updateCRStatus(crId, newStatus);
        }
      });
    });

    // Action buttons inside cards
    this.container.querySelectorAll('.btn-action-impact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const crId = btn.getAttribute('data-cr-id');
        store.selectImpactCR(crId);
        store.setView('impact');
      });
    });

    this.container.querySelectorAll('.btn-action-diff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const crId = btn.getAttribute('data-cr-id');
        // Retrieve CR from list, select it in the traceability/diff panel
        const crs = store.getState().changeRequests;
        const cr = crs.find(c => c.id === crId);
        if (cr) {
          store.selectImpactCR(crId);
          store.setView('traceability');
        }
      });
    });
  }
}
