import { store } from '../utils/store.js';

export class Dashboard {
  constructor(container) {
    this.container = container;
    this.charts = {};
  }

  init() {
    this.render();
  }

  destroy() {
    // Clean up Chart.js instances to prevent memory leaks or errors
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key].destroy();
      }
    });
    this.charts = {};
  }

  render() {
    this.destroy(); // Clear existing chart handles
    
    const state = store.getState();
    const crs = state.changeRequests;
    const comps = state.codebase.components;

    // 1. Calculate metrics
    const totalCRs = crs.length;
    const completedCRs = crs.filter(cr => cr.status === 'Merged').length;
    const pendingCRsCount = totalCRs - completedCRs;

    // Churn details
    const totalLOC = comps.reduce((acc, c) => acc + c.loc, 0);
    const avgComplexity = Math.round(comps.reduce((acc, c) => acc + c.complexity, 0) / comps.length);

    // Modularity Hotspot (Component with highest modification frequency)
    let hotspot = { name: 'None', freq: 0, complexity: 0 };
    comps.forEach(c => {
      if (c.changeFrequency > hotspot.freq) {
        hotspot = { name: c.name, freq: c.changeFrequency, complexity: c.complexity };
      }
    });

    // Evolution category distribution
    const categories = { Feature: 0, 'Bug Fix': 0, Refactoring: 0, Optimization: 0 };
    crs.forEach(cr => {
      if (categories[cr.category] !== undefined) {
        categories[cr.category]++;
      }
    });

    this.container.innerHTML = `
      <div class="dashboard-grid">
        <!-- Metrics Row -->
        <div class="metrics-row">
          <div class="glass-card metric-card">
            <div class="metric-header">
              <span>Total Change Requests</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--secondary)">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div class="metric-value">${totalCRs}</div>
            <div class="metric-sub">
              <span class="metric-trend-up">● ${pendingCRsCount} Active</span>
              <span>| ${completedCRs} Merged to Prod</span>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-header">
              <span>Modularity Hotspot</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--danger)">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="metric-value" style="font-size: 20px; line-height: 1.6; word-break: break-all;">
              ${hotspot.name}
            </div>
            <div class="metric-sub">
              <span class="metric-trend-down">★ Churn Freq: ${hotspot.freq}</span>
              <span>| Complexity: ${hotspot.complexity}</span>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-header">
              <span>Avg System Complexity</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--warning)">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <div class="metric-value">${avgComplexity}</div>
            <div class="metric-sub">
              <span>Total Lines of Code: <b>${totalLOC}</b></span>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-header">
              <span>Evolution System Health</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success)">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div class="metric-value">A-</div>
            <div class="metric-sub">
              <span class="metric-trend-up">✔ Low Regression Risk</span>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="glass-card chart-card-large">
          <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 4px; height: 16px; background: var(--primary); border-radius: 2px;"></span>
            Codebase Modularity Layer Distribution (LOC & Complexity)
          </h3>
          <div class="chart-container">
            <canvas id="modularityChart"></canvas>
          </div>
        </div>

        <div class="glass-card chart-card-small">
          <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 4px; height: 16px; background: var(--secondary); border-radius: 2px;"></span>
            Change Category Share
          </h3>
          <div class="chart-container">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>

        <!-- Software Evolution Theory Panel (Lehman's Laws) -->
        <div class="glass-card" style="grid-column: span 12;">
          <h3 style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--secondary)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Software Evolution Insights Engine (Lehman's Laws Alignment)
          </h3>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 16px;">
            <div style="background: rgba(255,255,255,0.01); border-left: 3px solid var(--primary); padding: 16px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
              <h4 style="font-size: 14px; margin-bottom: 8px; color: var(--text-primary)">
                I. Law of Continuing Change
              </h4>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
                An active system must undergo continual modification to remain satisfactory. With <b>${totalCRs}</b> historical change requests and an active churn rate, your platform is demonstrating a healthy lifecycle pattern matching Lehman's first law.
              </p>
            </div>
            
            <div style="background: rgba(255,255,255,0.01); border-left: 3px solid var(--warning); padding: 16px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
              <h4 style="font-size: 14px; margin-bottom: 8px; color: var(--text-primary)">
                II. Law of Increasing Complexity
              </h4>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
                As a system evolves, its complexity increases unless work is done to maintain or reduce it. 
                <br><b style="color: var(--warning)">Insight:</b> <code style="color: var(--secondary); font-family: var(--font-mono)">${hotspot.name}</code> has been modified <b>${hotspot.freq}</b> times and stands at a complexity index of <b>${hotspot.complexity}</b>. Refactoring is advised.
              </p>
            </div>

            <div style="background: rgba(255,255,255,0.01); border-left: 3px solid var(--success); padding: 16px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
              <h4 style="font-size: 14px; margin-bottom: 8px; color: var(--text-primary)">
                VI. Law of Continuing Growth
              </h4>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
                Functional content of a system must continually increase to maintain user satisfaction. Features represent <b>${Math.round((categories.Feature / totalCRs) * 100) || 0}%</b> of changes. Evolution matches healthy system expansion.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render ChartJS elements
    setTimeout(() => {
      this.renderCharts(comps, categories);
    }, 10);
  }

  renderCharts(components, categoryCounts) {
    const ctxModularity = document.getElementById('modularityChart');
    const ctxCategory = document.getElementById('categoryChart');

    if (!ctxModularity || !ctxCategory) return;

    // Modularity Chart details (Bubble/Bar Chart to show LOC and Complexity per layer)
    const layers = {};
    components.forEach(comp => {
      if (!layers[comp.layer]) {
        layers[comp.layer] = { loc: 0, complexity: 0, count: 0 };
      }
      layers[comp.layer].loc += comp.loc;
      layers[comp.layer].complexity += comp.complexity;
      layers[comp.layer].count++;
    });

    const layerLabels = Object.keys(layers);
    const layerLOCs = layerLabels.map(l => layers[l].loc);
    const layerComplexities = layerLabels.map(l => Math.round(layers[l].complexity / layers[l].count));

    this.charts.modularity = new Chart(ctxModularity, {
      type: 'bar',
      data: {
        labels: layerLabels,
        datasets: [
          {
            label: 'Total Lines of Code (LOC)',
            data: layerLOCs,
            backgroundColor: 'rgba(157, 78, 221, 0.45)',
            borderColor: '#9d4edd',
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Average Complexity',
            data: layerComplexities,
            type: 'line',
            backgroundColor: 'rgba(0, 245, 212, 0.2)',
            borderColor: '#00f5d4',
            borderWidth: 3,
            tension: 0.4,
            pointBackgroundColor: '#00f5d4',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#adb5bd', font: { family: 'Plus Jakarta Sans' } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#adb5bd', font: { family: 'Plus Jakarta Sans' } },
            position: 'left',
            title: { display: true, text: 'Lines of Code', color: '#adb5bd' }
          },
          y1: {
            grid: { drawOnChartArea: false },
            ticks: { color: '#adb5bd', font: { family: 'Plus Jakarta Sans' } },
            position: 'right',
            title: { display: true, text: 'Cyclomatic Complexity', color: '#adb5bd' }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#f8f9fa', font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
          }
        }
      }
    });

    // Category Doughnut Chart
    this.charts.category = new Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoryCounts),
        datasets: [{
          data: Object.values(categoryCounts),
          backgroundColor: [
            'rgba(0, 245, 212, 0.65)',  // Feature - Teal/Cyan
            'rgba(255, 0, 110, 0.65)',  // Bug Fix - Pink/Rose
            'rgba(157, 78, 221, 0.65)', // Refactoring - Purple
            'rgba(255, 183, 3, 0.65)'   // Optimization - Amber/Yellow
          ],
          borderColor: [
            '#00f5d4',
            '#ff006e',
            '#9d4edd',
            '#ffb703'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#f8f9fa', font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        },
        cutout: '65%'
      }
    });
  }
}
