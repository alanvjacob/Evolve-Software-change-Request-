import { initialCRs } from '../data/initialCRs.js';
import { mockCodebase } from '../data/mockCodebase.js';

class StateStore {
  constructor() {
    this.state = {
      activeView: 'dashboard', // dashboard | kanban | impact | traceability
      changeRequests: [...initialCRs],
      codebase: { ...mockCodebase },
      selectedComponentId: null,
      activeImpactCR: null // Current CR selected for impact visualization
    };
    this.listeners = [];
  }

  // Subscribe to state modifications
  subscribe(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Emit state modification event
  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // Getters
  getState() {
    return this.state;
  }

  // Actions
  setView(view) {
    this.state.activeView = view;
    this.notify();
  }

  addChangeRequest(cr) {
    const newCR = {
      id: `CR-${Math.floor(100 + Math.random() * 900)}`,
      createdDate: new Date().toISOString().split('T')[0],
      diffs: {},
      status: 'Draft',
      ...cr
    };
    
    // Generate simulated diffs for the selected components if they don't exist
    if (newCR.affectedComponents && Object.keys(newCR.diffs).length === 0) {
      newCR.affectedComponents.forEach(componentId => {
        const comp = this.state.codebase.components.find(c => c.id === componentId);
        const fileName = comp ? comp.name : 'component.js';
        newCR.diffs[componentId] = `// ${fileName} - Evolution refactoring
@@ -25,3 +25,8 @@
 function handleEvolutionChange() {
-  // Previous legacy implementation
+  // Modern high-performance logic
+  logAuditTrigger("CR_EVOLVED", "${newCR.id}");
+  return runModernProcessFlow();
 }`;
      });
    }

    this.state.changeRequests.unshift(newCR);
    this.notify();
    return newCR;
  }

  updateCRStatus(crId, newStatus) {
    this.state.changeRequests = this.state.changeRequests.map(cr => {
      if (cr.id === crId) {
        return { ...cr, status: newStatus };
      }
      return cr;
    });
    this.notify();
  }

  selectComponent(componentId) {
    this.state.selectedComponentId = componentId;
    this.notify();
  }

  selectImpactCR(crId) {
    this.state.activeImpactCR = this.state.changeRequests.find(cr => cr.id === crId) || null;
    this.notify();
  }
}

export const store = new StateStore();
