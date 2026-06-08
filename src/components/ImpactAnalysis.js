import { store } from '../utils/store.js';
import { calculateChangeImpact } from '../utils/impactEngine.js';

export class ImpactAnalysis {
  constructor(container) {
    this.container = container;
    this.selectedSeedComponents = [];
  }

  init() {
    const state = store.getState();
    // If a CR was selected for impact elsewhere (e.g. from Kanban), initialize simulation with its components
    if (state.activeImpactCR) {
      this.selectedSeedComponents = [...state.activeImpactCR.affectedComponents];
    } else if (state.selectedComponentId) {
      this.selectedSeedComponents = [state.selectedComponentId];
    } else {
      this.selectedSeedComponents = ["Database"]; // default seed
    }
    
    this.render();
  }

  render() {
    const state = store.getState();
    const components = state.codebase.components;
    const crs = state.changeRequests;

    // Calculate propagation impact
    const impactReport = calculateChangeImpact(components, this.selectedSeedComponents);
    const affected = impactReport.affected;

    // Prepare components metrics
    const totalComponents = components.length;
    const affectedCount = Object.keys(affected).length;
    const propagationRatio = Math.round((affectedCount / totalComponents) * 100);

    // Calculate average risk score of the impact
    const avgRiskScore = affectedCount > 0 
      ? Math.round(Object.values(affected).reduce((acc, a) => acc + a.riskScore, 0) / affectedCount) 
      : 0;

    this.container.innerHTML = `
      <div class="dashboard-grid">
        <div style="grid-column: span 12; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 800; background: linear-gradient(90deg, #fff, var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Change Propagation & Ripple Simulator
            </h2>
            <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
              Select components or Change Requests to simulate how code modifications ripple through dependencies.
            </p>
          </div>
          
          <div style="display: flex; gap: 12px; align-items: center;">
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Simulate CR:</label>
            <select id="select-cr-impact" style="padding: 6px 12px; font-size: 12px; background: rgba(0,0,0,0.4); border: 1px solid var(--border);">
              <option value="">-- Custom Simulation --</option>
              ${crs.map(cr => `
                <option value="${cr.id}" ${state.activeImpactCR && state.activeImpactCR.id === cr.id ? 'selected' : ''}>
                  ${cr.id}: ${cr.title.substring(0, 30)}...
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Interactive SVG Dependency Graph -->
        <div class="glass-card graph-card">
          <div class="graph-controls">
            <button class="btn btn-secondary" id="btn-reset-graph" style="padding: 6px 12px; font-size: 11px; display: flex; align-items: center; gap: 6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Clear Seeds
            </button>
            <span style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; background: rgba(0,0,0,0.3); padding: 0 10px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
              💡 Click any node to add/remove change seeds
            </span>
          </div>

          <div class="svg-canvas-container">
            <svg id="network-svg" width="100%" height="100%" viewBox="0 0 1050 600" style="background: transparent;">
              <!-- Defs for arrow markers and gradient glow effects -->
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.2)" />
                </marker>
                <marker id="arrow-impacted" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--danger)" />
                </marker>
                <marker id="arrow-direct" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--warning)" />
                </marker>
                
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
                </radialGradient>
              </defs>

              <!-- Link Lines -->
              <g id="links-group"></g>

              <!-- Node Groups -->
              <g id="nodes-group"></g>
            </svg>
          </div>
        </div>

        <!-- Simulation Sidebar -->
        <div class="glass-card side-panel-card">
          <h3 style="font-size: 18px; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 4px; height: 16px; background: var(--secondary); border-radius: 2px;"></span>
            Propagation Insights
          </h3>

          <!-- Stats Block -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 12px; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Impacted Rate</div>
              <div style="font-size: 24px; font-weight: 800; color: ${propagationRatio > 50 ? 'var(--danger)' : 'var(--warning)'}; margin-top: 4px;">
                ${propagationRatio}%
              </div>
              <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">${affectedCount} / ${totalComponents} files</div>
            </div>
            
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 12px; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Average Risk</div>
              <div style="font-size: 24px; font-weight: 800; color: ${avgRiskScore > 65 ? 'var(--danger)' : avgRiskScore > 35 ? 'var(--warning)' : 'var(--success)'}; margin-top: 4px;">
                ${avgRiskScore}/100
              </div>
              <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">Regression index</div>
            </div>
          </div>

          <!-- Seeds list -->
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; margin-bottom: 8px;">
              Active Change Seeds (${this.selectedSeedComponents.length})
            </h4>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${this.selectedSeedComponents.map(s => `
                <span class="priority-high" style="font-family: var(--font-mono); font-size: 11px; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 6px;">
                  ${components.find(c => c.id === s)?.name || s}
                  <button class="btn-remove-seed" data-id="${s}" style="background: transparent; border: none; color: var(--danger); font-weight: bold; font-size: 12px; line-height: 1; cursor: pointer;">×</button>
                </span>
              `).join('')}
              ${this.selectedSeedComponents.length === 0 ? `
                <span style="font-size: 11px; color: var(--text-muted);">No seed selected. Click a node in the graph.</span>
              ` : ''}
            </div>
          </div>

          <!-- Recommendation Alert -->
          <div style="background: ${propagationRatio > 50 ? 'rgba(255, 0, 110, 0.08)' : 'rgba(255, 183, 3, 0.08)'}; border: 1px solid ${propagationRatio > 50 ? 'var(--danger)' : 'var(--warning)'}; border-radius: var(--radius-sm); padding: 12px; font-size: 12px; line-height: 1.5; color: var(--text-primary); margin-bottom: 20px;">
            <b style="color: ${propagationRatio > 50 ? 'var(--danger)' : 'var(--warning)'}; text-transform: uppercase;">
              ⚠️ Evolution Testing Recommendation:
            </b>
            <br>
            ${propagationRatio === 0 
              ? 'Please select a codebase component to calculate modular ripples.' 
              : propagationRatio > 50 
                ? `System-wide change ripple detected. Modifying these seeds carries high evolutionary risk. <b>Requires full regression test suites</b> and integration approvals for dependencies.` 
                : `Targeted ripple detected. Recommended: run unit tests specifically for <b>${Object.keys(affected).filter(k => !this.selectedSeedComponents.includes(k)).join(', ')}</b>.`}
          </div>

          <!-- Impacted components list -->
          <div style="flex-grow: 1;">
            <h4 style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; margin-bottom: 8px;">
              Propagation Risk Breakdown
            </h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${Object.values(affected).sort((a, b) => b.riskScore - a.riskScore).map(aff => {
                const comp = components.find(c => c.id === aff.id);
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 10px; border-radius: var(--radius-sm); transition: border-color var(--transition-fast);" class="impact-item-hover">
                    <div>
                      <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                        ${comp?.name || aff.id}
                        <span style="font-size: 9px; font-weight: 600; padding: 1px 4px; border-radius: 3px; background: ${aff.distance === 0 ? 'var(--primary-glow)' : 'rgba(255,255,255,0.05)'}; color: ${aff.distance === 0 ? 'var(--primary)' : 'var(--text-secondary)'}">
                          d=${aff.distance}
                        </span>
                      </div>
                      <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                        ${aff.type} | Owner: ${comp?.owner || 'Unknown'}
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 14px; font-weight: 800; color: ${aff.riskScore > 65 ? 'var(--danger)' : aff.riskScore > 35 ? 'var(--warning)' : 'var(--success)'}">
                        ${aff.riskScore}
                      </div>
                      <div style="font-size: 9px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">
                        Risk
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
              ${Object.keys(affected).length === 0 ? `
                <div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px; border: 1px dashed var(--border); border-radius: var(--radius-sm);">
                  No propagation active. Choose a seed above or click a node in the graph.
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Draw the SVG graph content
    this.drawSVGGraph(components, state.codebase.layout, affected);
    this.bindEvents();
  }

  drawSVGGraph(components, layout, affected) {
    const svg = this.container.querySelector('#network-svg');
    const linksGroup = svg.querySelector('#links-group');
    const nodesGroup = svg.querySelector('#nodes-group');

    // 1. Draw Links
    let linksHTML = '';
    components.forEach(comp => {
      comp.dependencies.forEach(depId => {
        const sourceLoc = layout[depId];
        const targetLoc = layout[comp.id];

        if (sourceLoc && targetLoc) {
          // If the dependency source is in our affected list AND target is affected, we highlight the link
          const sourceAffected = affected[depId];
          const targetAffected = affected[comp.id];
          
          let linkClass = 'link-line';
          let marker = 'url(#arrow)';
          
          if (sourceAffected && targetAffected) {
            // Check if transitive or direct
            if (targetAffected.distance === sourceAffected.distance + 1) {
              if (targetAffected.distance === 1) {
                linkClass = 'link-line direct-impacted';
                marker = 'url(#arrow-direct)';
              } else {
                linkClass = 'link-line impacted';
                marker = 'url(#arrow-impacted)';
              }
            }
          }

          linksHTML += `
            <line 
              x1="${sourceLoc.x}" 
              y1="${sourceLoc.y}" 
              x2="${targetLoc.x}" 
              y2="${targetLoc.y}" 
              class="${linkClass}"
              marker-end="${marker}"
            />
          `;
        }
      });
    });
    linksGroup.innerHTML = linksHTML;

    // 2. Draw Nodes
    let nodesHTML = '';
    components.forEach(comp => {
      const loc = layout[comp.id];
      if (!loc) return;

      const isSeed = this.selectedSeedComponents.includes(comp.id);
      const aff = affected[comp.id];
      
      let nodeClass = '';
      let circleColor = 'rgba(25d, 25d, 35, 0.85)';
      let strokeColor = 'rgba(255, 255, 255, 0.15)';
      let r = 20;

      if (isSeed) {
        nodeClass = 'selected-node';
        circleColor = 'var(--secondary)';
        strokeColor = '#ffffff';
        r = 23;
      } else if (aff) {
        if (aff.riskScore > 65) {
          nodeClass = 'impact-high';
          circleColor = 'var(--danger)';
          strokeColor = '#ffccd5';
        } else if (aff.riskScore > 35) {
          nodeClass = 'impact-medium';
          circleColor = 'var(--warning)';
          strokeColor = '#ffe3a8';
        } else {
          nodeClass = 'impact-low';
          circleColor = 'var(--primary)';
          strokeColor = 'var(--primary-glow)';
        }
      }

      nodesHTML += `
        <g class="node-group" transform="translate(${loc.x}, ${loc.y})" data-id="${comp.id}">
          <!-- Radial blur glow background -->
          ${isSeed || aff ? `<circle r="${r + 15}" fill="url(#glow)" opacity="0.6" style="pointer-events: none;"></circle>` : ''}
          
          <!-- Core node circle -->
          <circle 
            r="${r}" 
            fill="${circleColor}" 
            stroke="${strokeColor}" 
            stroke-width="2" 
            class="${nodeClass}" 
          />
          
          <!-- Inside text tag -->
          <text 
            y="4" 
            text-anchor="middle" 
            fill="${isSeed || (aff && aff.riskScore > 35) ? '#06060c' : '#f8f9fa'}" 
            font-family="var(--font-sans)" 
            font-size="11px" 
            font-weight="800"
            style="pointer-events: none;"
          >
            ${comp.name.substring(0, 4).toUpperCase()}
          </text>
          
          <!-- Node Label text -->
          <text 
            y="${r + 18}" 
            text-anchor="middle" 
            fill="#f8f9fa" 
            font-family="var(--font-sans)" 
            font-size="11px" 
            font-weight="600"
            style="pointer-events: none;"
          >
            ${comp.name}
          </text>

          <!-- Owner label (subtle) -->
          <text 
            y="${r + 30}" 
            text-anchor="middle" 
            fill="var(--text-muted)" 
            font-family="var(--font-sans)" 
            font-size="9px"
            style="pointer-events: none;"
          >
            ${comp.owner}
          </text>
        </g>
      `;
    });
    nodesGroup.innerHTML = nodesHTML;
  }

  bindEvents() {
    // Click node to toggle seed selection
    this.container.querySelectorAll('.node-group').forEach(node => {
      node.addEventListener('click', () => {
        const componentId = node.getAttribute('data-id');
        this.toggleSeed(componentId);
      });
    });

    // Remove seed via button in sidebar
    this.container.querySelectorAll('.btn-remove-seed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const compId = btn.getAttribute('data-id');
        this.toggleSeed(compId);
      });
    });

    // Clear all seeds
    const resetBtn = this.container.querySelector('#btn-reset-graph');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.selectedSeedComponents = [];
        store.selectComponent(null);
        store.selectImpactCR(null);
        this.render();
      });
    }

    // Select CR impact
    const crSelect = this.container.querySelector('#select-cr-impact');
    if (crSelect) {
      crSelect.addEventListener('change', (e) => {
        const crId = e.target.value;
        if (crId) {
          const state = store.getState();
          const cr = state.changeRequests.find(c => c.id === crId);
          if (cr) {
            store.selectImpactCR(crId);
            this.selectedSeedComponents = [...cr.affectedComponents];
            this.render();
          }
        } else {
          store.selectImpactCR(null);
          this.selectedSeedComponents = [];
          this.render();
        }
      });
    }
  }

  toggleSeed(componentId) {
    // If the component is already in the seed, remove it. Else add it.
    if (this.selectedSeedComponents.includes(componentId)) {
      this.selectedSeedComponents = this.selectedSeedComponents.filter(c => c !== componentId);
    } else {
      this.selectedSeedComponents.push(componentId);
    }

    // De-select active CR impact because we are custom simulating
    const state = store.getState();
    if (state.activeImpactCR) {
      store.selectImpactCR(null);
    }
    
    this.render();
  }
}
