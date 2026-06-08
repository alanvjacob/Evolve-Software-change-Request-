import { store } from './utils/store.js';
import { Header } from './components/Header.js';
import { Dashboard } from './components/Dashboard.js';
import { Kanban } from './components/Kanban.js';
import { ImpactAnalysis } from './components/ImpactAnalysis.js';
import { Traceability } from './components/Traceability.js';

class App {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.activeComponent = null;
    this.prevView = null;
  }

  bootstrap() {
    // 1. Render core page shell
    this.appContainer.innerHTML = `
      <div id="header-container"></div>
      <main id="app-content" style="flex-grow: 1; min-height: calc(100vh - 73px); display: flex; flex-direction: column;"></main>
      <footer style="text-align: center; padding: 24px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border); background: rgba(0,0,0,0.2);">
        EVOLVE Change Request System &copy; 2026 | Built for Advanced Software Evolution
      </footer>

      <!-- Global CR Creation Modal Overlay -->
      <div class="modal-overlay" id="cr-modal">
        <div class="modal-content">
          <button class="modal-close" id="btn-close-modal">&times;</button>
          <h2 style="font-size: 22px; margin-bottom: 24px; background: linear-gradient(90deg, #fff, var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;">
            Create Software Change Request (CR)
          </h2>
          
          <form id="create-cr-form">
            <div class="form-group">
              <label for="cr-title">CR Title</label>
              <input type="text" id="cr-title" placeholder="e.g., Upgrade user session token expiration security" required />
            </div>

            <div class="form-group">
              <label for="cr-description">Description & Evolution Rationale</label>
              <textarea id="cr-description" rows="3" placeholder="Describe the change reason and what needs to be evolved..." required></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label for="cr-priority">Priority</label>
                <select id="cr-priority">
                  <option value="Low">Low</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div class="form-group">
                <label for="cr-category">Category</label>
                <select id="cr-category">
                  <option value="Feature">Feature (Growth)</option>
                  <option value="Bug Fix">Bug Fix (Corrective)</option>
                  <option value="Refactoring">Refactoring (Preventive)</option>
                  <option value="Optimization">Optimization (Perfective)</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top: 8px;">
              <label>Select Affected Codebase Components</label>
              <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
                Hold Ctrl (Windows) / Cmd (Mac) to select multiple files. These will seed the impact analysis graph.
              </p>
              <select id="cr-affected" multiple style="height: 120px; font-family: var(--font-mono); font-size: 12px; padding: 8px;">
                <!-- Dynamically loaded -->
              </select>
            </div>

            <div class="btn-row">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Submit Change Request</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // 2. Initialize Core Layout
    this.header = new Header(document.getElementById('header-container'));
    this.header.init();

    this.populateModalComponents();

    // 3. Subscribe to reactive state changes
    store.subscribe((state) => this.handleStateChange(state));

    // 4. Bind Modal Overlay Toggles
    this.bindModalEvents();

    // 5. Initial View Load
    this.handleStateChange(store.getState());
  }

  populateModalComponents() {
    const select = document.getElementById('cr-affected');
    const comps = store.getState().codebase.components;
    select.innerHTML = comps.map(c => `
      <option value="${c.id}">${c.name} (${c.layer})</option>
    `).join('');
  }

  bindModalEvents() {
    const modal = document.getElementById('cr-modal');
    const closeBtn = document.getElementById('btn-close-modal');
    const cancelBtn = document.getElementById('btn-cancel-modal');
    const form = document.getElementById('create-cr-form');

    const openModal = () => {
      // Clear values
      form.reset();
      modal.classList.add('active');
    };

    const closeModal = () => {
      modal.classList.remove('active');
    };

    window.addEventListener('open-cr-modal', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Form submit action
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('cr-title').value;
      const description = document.getElementById('cr-description').value;
      const priority = document.getElementById('cr-priority').value;
      const category = document.getElementById('cr-category').value;
      
      // Multi-select reading
      const selectAffected = document.getElementById('cr-affected');
      const affectedComponents = Array.from(selectAffected.selectedOptions).map(opt => opt.value);

      if (affectedComponents.length === 0) {
        alert('Please select at least one affected component to calculate evolution ripples!');
        return;
      }

      // Add to store
      const newCR = store.addChangeRequest({
        title,
        description,
        priority,
        category,
        affectedComponents,
        submitter: "David K.",
        assignedTo: "David K."
      });

      closeModal();
      
      // Auto routing: take them to the Kanban board to see the new Draft ticket!
      store.setView('kanban');
    });
  }

  handleStateChange(state) {
    const currentView = state.activeView;
    const contentContainer = document.getElementById('app-content');

    // 1. Re-render navigation header
    this.header.render();

    // 2. If view changed, swap active component object
    if (currentView !== this.prevView) {
      if (this.activeComponent && typeof this.activeComponent.destroy === 'function') {
        this.activeComponent.destroy();
      }

      switch (currentView) {
        case 'dashboard':
          this.activeComponent = new Dashboard(contentContainer);
          break;
        case 'kanban':
          this.activeComponent = new Kanban(contentContainer);
          break;
        case 'impact':
          this.activeComponent = new ImpactAnalysis(contentContainer);
          break;
        case 'traceability':
          this.activeComponent = new Traceability(contentContainer);
          break;
      }

      this.activeComponent.init();
      this.prevView = currentView;
    } else {
      // If the view is the same but state updated (e.g. status drop, addition), just trigger re-render
      if (this.activeComponent) {
        this.activeComponent.render();
      }
    }
  }
}

// Instantiate and start
const app = new App();
document.addEventListener('DOMContentLoaded', () => {
  app.bootstrap();
});
export default app;
