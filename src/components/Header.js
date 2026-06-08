import { store } from '../utils/store.js';

export class Header {
  constructor(container) {
    this.container = container;
  }

  init() {
    this.render();
  }

  render() {
    const state = store.getState();
    const activeView = state.activeView;
    const pendingCRsCount = state.changeRequests.filter(cr => cr.status !== 'Merged').length;

    this.container.innerHTML = `
      <header class="app-header">
        <div class="logo-container">
          <div class="logo-icon">E</div>
          <div>
            <h1 class="logo-text">EVOLVE</h1>
            <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
              Software Change Management System
            </span>
          </div>
        </div>
        
        <nav class="header-nav">
          <button class="nav-btn ${activeView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
            Dashboard
          </button>
          <button class="nav-btn ${activeView === 'kanban' ? 'active' : ''}" data-view="kanban">
            CR Board
          </button>
          <button class="nav-btn ${activeView === 'impact' ? 'active' : ''}" data-view="impact">
            Impact Simulator
          </button>
          <button class="nav-btn ${activeView === 'traceability' ? 'active' : ''}" data-view="traceability">
            Traceability Matrix
          </button>
        </nav>

        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="text-align: right; display: none; display: md-block;">
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">ACTIVE CHANGE REQS</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--secondary);">${pendingCRsCount} Pending</div>
          </div>
          <div style="width: 1px; height: 24px; background: var(--border);"></div>
          <button class="btn btn-primary" id="btn-create-cr" style="padding: 8px 16px; font-size: 12px;">
            + Create CR
          </button>
        </div>
      </header>
    `;

    // Bind navigation actions
    this.container.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.getAttribute('data-view');
        store.setView(view);
      });
    });

    // Bind Create CR button
    this.container.querySelector('#btn-create-cr').addEventListener('click', () => {
      // Trigger modal display event
      const event = new CustomEvent('open-cr-modal');
      window.dispatchEvent(event);
    });
  }
}
