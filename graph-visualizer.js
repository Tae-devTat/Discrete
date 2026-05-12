// ============ INTERACTIVE GRAPH VISUALIZER ============
let graphNodes = [];
let graphEdges = [];
let graphTool = 'node';
let selectedNode = null;
let draggingNode = null;
let edgeStart = null;
let graphCanvas, graphCtx;
let nodeRadius = 22;
let nextNodeId = 0;

function initGraphCanvas() {
    graphCanvas = document.getElementById('graph-canvas');
    if (!graphCanvas) return;
    graphCtx = graphCanvas.getContext('2d');
    // Set actual size
    const rect = graphCanvas.getBoundingClientRect();
    graphCanvas.width = rect.width * (window.devicePixelRatio || 1);
    graphCanvas.height = rect.height * (window.devicePixelRatio || 1);
    graphCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    graphCanvas.style.width = rect.width + 'px';
    graphCanvas.style.height = rect.height + 'px';
    drawGraph();
}

function setGraphTool(tool) {
    graphTool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tool-' + tool);
    if (btn) btn.classList.add('active');
    edgeStart = null;
    selectedNode = null;
    if (graphCanvas) graphCanvas.style.cursor = tool === 'move' ? 'grab' : tool === 'delete' ? 'not-allowed' : 'crosshair';
    drawGraph();
}

function clearGraph() {
    graphNodes = [];
    graphEdges = [];
    nextNodeId = 0;
    edgeStart = null;
    selectedNode = null;
    drawGraph();
    updateGraphInfo();
}

function getMousePos(e) {
    const rect = graphCanvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function findNodeAt(x, y) {
    for (let i = graphNodes.length - 1; i >= 0; i--) {
        const n = graphNodes[i];
        const dx = n.x - x, dy = n.y - y;
        if (dx * dx + dy * dy <= nodeRadius * nodeRadius) return n;
    }
    return null;
}

// Mouse events
document.addEventListener('DOMContentLoaded', () => {
    const c = document.getElementById('graph-canvas');
    if (!c) return;

    c.addEventListener('mousedown', (e) => {
        const pos = getMousePos(e);
        const node = findNodeAt(pos.x, pos.y);

        if (graphTool === 'node' && !node) {
            graphNodes.push({ id: nextNodeId++, x: pos.x, y: pos.y, label: 'v' + (nextNodeId - 1) });
            drawGraph();
            updateGraphInfo();
        } else if (graphTool === 'edge') {
            if (node) {
                if (!edgeStart) {
                    edgeStart = node;
                    selectedNode = node;
                    drawGraph();
                } else if (edgeStart.id !== node.id) {
                    // Check duplicate
                    const exists = graphEdges.some(e =>
                        (e.from === edgeStart.id && e.to === node.id) ||
                        (e.from === node.id && e.to === edgeStart.id)
                    );
                    if (!exists) {
                        graphEdges.push({ from: edgeStart.id, to: node.id });
                    }
                    edgeStart = null;
                    selectedNode = null;
                    drawGraph();
                    updateGraphInfo();
                }
            }
        } else if (graphTool === 'move' && node) {
            draggingNode = node;
            c.style.cursor = 'grabbing';
        } else if (graphTool === 'delete') {
            if (node) {
                graphEdges = graphEdges.filter(e => e.from !== node.id && e.to !== node.id);
                graphNodes = graphNodes.filter(n => n.id !== node.id);
                drawGraph();
                updateGraphInfo();
            } else {
                // Try to find and delete edge
                for (const edge of graphEdges) {
                    const from = graphNodes.find(n => n.id === edge.from);
                    const to = graphNodes.find(n => n.id === edge.to);
                    if (from && to && distToSegment(pos, from, to) < 8) {
                        graphEdges = graphEdges.filter(e => e !== edge);
                        drawGraph();
                        updateGraphInfo();
                        break;
                    }
                }
            }
        }
    });

    c.addEventListener('mousemove', (e) => {
        if (draggingNode) {
            const pos = getMousePos(e);
            draggingNode.x = pos.x;
            draggingNode.y = pos.y;
            drawGraph();
        }
    });

    c.addEventListener('mouseup', () => {
        if (draggingNode) {
            draggingNode = null;
            c.style.cursor = 'grab';
            updateGraphInfo();
        }
    });

    c.addEventListener('mouseleave', () => {
        if (draggingNode) {
            draggingNode = null;
            c.style.cursor = 'grab';
        }
    });
});

function distToSegment(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function drawGraph() {
    if (!graphCtx || !graphCanvas) return;
    const w = graphCanvas.getBoundingClientRect().width;
    const h = graphCanvas.getBoundingClientRect().height;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    graphCtx.clearRect(0, 0, w, h);

    // Draw edges
    for (const edge of graphEdges) {
        const from = graphNodes.find(n => n.id === edge.from);
        const to = graphNodes.find(n => n.id === edge.to);
        if (!from || !to) continue;

        graphCtx.beginPath();
        graphCtx.moveTo(from.x, from.y);
        graphCtx.lineTo(to.x, to.y);
        graphCtx.strokeStyle = isDark ? '#a78bfa' : '#6d28d9';
        graphCtx.lineWidth = 2.5;
        graphCtx.stroke();

        // Edge label (midpoint)
        const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
        graphCtx.fillStyle = isDark ? '#555' : '#999';
        graphCtx.font = '11px Inter';
    }

    // Draw nodes
    for (const node of graphNodes) {
        const isSelected = selectedNode && selectedNode.id === node.id;

        // Glow
        if (isSelected) {
            graphCtx.beginPath();
            graphCtx.arc(node.x, node.y, nodeRadius + 6, 0, Math.PI * 2);
            graphCtx.fillStyle = 'rgba(124,58,237,0.2)';
            graphCtx.fill();
        }

        // Node circle
        const grad = graphCtx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, nodeRadius);
        grad.addColorStop(0, isDark ? '#a78bfa' : '#8b5cf6');
        grad.addColorStop(1, isDark ? '#7c3aed' : '#6d28d9');

        graphCtx.beginPath();
        graphCtx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        graphCtx.fillStyle = grad;
        graphCtx.fill();
        graphCtx.strokeStyle = isSelected ? '#22d3ee' : (isDark ? '#c4b5fd' : '#5b21b6');
        graphCtx.lineWidth = isSelected ? 3 : 2;
        graphCtx.stroke();

        // Label
        graphCtx.fillStyle = '#fff';
        graphCtx.font = 'bold 13px Inter';
        graphCtx.textAlign = 'center';
        graphCtx.textBaseline = 'middle';
        graphCtx.fillText(node.label, node.x, node.y);
    }

    // Draw edge-start indicator
    if (edgeStart && graphTool === 'edge') {
        graphCtx.beginPath();
        graphCtx.arc(edgeStart.x, edgeStart.y, nodeRadius + 8, 0, Math.PI * 2);
        graphCtx.strokeStyle = '#22d3ee';
        graphCtx.lineWidth = 2;
        graphCtx.setLineDash([4, 4]);
        graphCtx.stroke();
        graphCtx.setLineDash([]);
    }
}

function updateGraphInfo() {
    const el = document.getElementById('graph-info');
    if (!el) return;
    if (graphNodes.length === 0) { el.innerHTML = ''; return; }

    const V = graphNodes.length, E = graphEdges.length;

    // Compute degrees
    const degMap = {};
    graphNodes.forEach(n => degMap[n.id] = 0);
    graphEdges.forEach(e => { degMap[e.from]++; degMap[e.to]++; });
    const degrees = graphNodes.map(n => degMap[n.id]);
    const totalDeg = degrees.reduce((s, d) => s + d, 0);
    const oddCount = degrees.filter(d => d % 2 !== 0).length;

    let euler = '';
    if (oddCount === 0) euler = '✅ Euler Circuit (ทุกจุดดีกรีคู่)';
    else if (oddCount === 2) euler = '✅ Euler Path (จุดดีกรีคี่ 2 จุด)';
    else euler = '❌ No Euler Path (จุดดีกรีคี่ = ' + oddCount + ')';

    // Adjacency matrix
    const ids = graphNodes.map(n => n.id);
    let mat = '<table>';
    mat += '<tr><th></th>' + graphNodes.map(n => `<th>${n.label}</th>`).join('') + '</tr>';
    for (const ni of graphNodes) {
        mat += `<tr><th>${ni.label}</th>`;
        for (const nj of graphNodes) {
            const has = graphEdges.some(e =>
                (e.from === ni.id && e.to === nj.id) || (e.from === nj.id && e.to === ni.id)
            ) ? 1 : 0;
            mat += `<td class="cell-${has}">${has}</td>`;
        }
        mat += '</tr>';
    }
    mat += '</table>';

    el.innerHTML = `<div class="result-card">
        <h3>Graph Analysis</h3>
        <div class="detail"><strong>V:</strong> ${V} | <strong>E:</strong> ${E} | <strong>Degree:</strong> [${degrees.join(',')}] | <strong>Σ:</strong> ${totalDeg} = 2×${E}</div>
        <div class="detail" style="margin-top:8px">${euler}</div>
        <h3 style="margin-top:16px">Adjacency Matrix</h3>
        <div class="matrix-display">${mat}</div>
    </div>`;
}
