/**
 * Change Propagation & Impact Analysis Engine
 * Calculates the ripple effect of changes through the dependency graph.
 */

/**
 * Computes which components are affected when a set of seed components is modified.
 * 
 * Note: If component B depends on component A, then changing A will impact B.
 * So the propagation flows in the INVERSE direction of dependencies.
 * 
 * @param {Array<Object>} components - List of all components in the codebase.
 * @param {Array<string>} seedComponentIds - The components initially selected for modification.
 * @returns {Object} Propagation report containing affected components and calculated risk scores.
 */
export function calculateChangeImpact(components, seedComponentIds) {
  if (!seedComponentIds || seedComponentIds.length === 0) {
    return {
      affected: {},
      edges: [],
      maxDepth: 0
    };
  }

  // Create an adjacency list representing the INVERSE of dependencies (propagation graph)
  // key: componentId, value: list of components that depend on it
  const propagationGraph = {};
  components.forEach(comp => {
    propagationGraph[comp.id] = [];
  });

  components.forEach(comp => {
    comp.dependencies.forEach(depId => {
      if (propagationGraph[depId]) {
        propagationGraph[depId].push(comp.id);
      }
    });
  });

  const affected = {}; // map of componentId -> { distance, riskScore, riskLevel, type }
  const queue = [];
  const edges = []; // List of edges traversed in propagation format: { from, to, type }

  // Initialize queue with seed components (distance 0)
  seedComponentIds.forEach(id => {
    affected[id] = {
      id,
      distance: 0,
      riskScore: 100,
      riskLevel: 'Critical',
      type: 'Seed (Direct Modification)'
    };
    queue.push(id);
  });

  let maxDepth = 0;

  // BFS to propagate changes
  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentMeta = affected[currentId];
    
    maxDepth = Math.max(maxDepth, currentMeta.distance);

    const dependents = propagationGraph[currentId] || [];
    dependents.forEach(depId => {
      const edgeKey = `${currentId}->${depId}`;
      
      // If not yet visited, calculate risk and traverse
      if (!affected[depId]) {
        const comp = components.find(c => c.id === depId);
        const distance = currentMeta.distance + 1;
        
        // Calculate Software Evolution Risk Score
        // Formula leverages complexity, churn rate, and distance
        const baseImpact = 1 / distance; // Decreases with distance
        const complexityFactor = comp ? (1 + comp.complexity / 20) : 1;
        const churnFactor = comp ? (1 + comp.churnRate) : 1;
        const rawScore = baseImpact * complexityFactor * churnFactor * 45;
        const riskScore = Math.min(100, Math.round(rawScore));
        
        let riskLevel = 'Low';
        if (riskScore > 65) riskLevel = 'High';
        else if (riskScore > 35) riskLevel = 'Medium';

        affected[depId] = {
          id: depId,
          distance,
          riskScore,
          riskLevel,
          type: distance === 1 ? 'Direct Impact' : 'Transitive Impact'
        };

        edges.push({
          from: currentId,
          to: depId,
          type: distance === 1 ? 'direct' : 'transitive'
        });

        queue.push(depId);
      } else {
        // If already visited but we found another path, we show the relationship in edges
        const existingDep = affected[depId];
        edges.push({
          from: currentId,
          to: depId,
          type: existingDep.distance === 1 ? 'direct' : 'transitive'
        });
      }
    });
  }

  return {
    affected,
    edges,
    maxDepth
  };
}
