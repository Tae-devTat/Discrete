// ============ K-MAP SOLVER ============
let kmapData = [];
let kmapVars = 4;

function initKmap() {
    kmapVars = parseInt(document.getElementById('kmap-vars').value);
    const grid = document.getElementById('kmap-grid');
    let html = '';

    if (kmapVars === 2) {
        kmapData = [0,0,0,0];
        html = '<table class="kmap-table"><tr><th>A\\B</th><th>0</th><th>1</th></tr>';
        html += `<tr><th>0</th><td class="kmap-0" data-i="0" onclick="toggleKmap(0)">0</td><td class="kmap-0" data-i="1" onclick="toggleKmap(1)">0</td></tr>`;
        html += `<tr><th>1</th><td class="kmap-0" data-i="2" onclick="toggleKmap(2)">0</td><td class="kmap-0" data-i="3" onclick="toggleKmap(3)">0</td></tr>`;
        html += '</table>';
    } else if (kmapVars === 3) {
        kmapData = new Array(8).fill(0);
        const colHeaders = ['00','01','11','10'];
        html = '<table class="kmap-table"><tr><th>A\\BC</th>';
        colHeaders.forEach(c => html += `<th>${c}</th>`);
        html += '</tr>';
        // Row A=0: minterms 0,1,3,2
        const row0 = [0,1,3,2];
        const row1 = [4,5,7,6];
        html += '<tr><th>0</th>';
        row0.forEach(m => html += `<td class="kmap-0" data-i="${m}" onclick="toggleKmap(${m})">0</td>`);
        html += '</tr><tr><th>1</th>';
        row1.forEach(m => html += `<td class="kmap-0" data-i="${m}" onclick="toggleKmap(${m})">0</td>`);
        html += '</tr></table>';
    } else {
        kmapData = new Array(16).fill(0);
        const colHeaders = ['00','01','11','10'];
        const rowHeaders = ['00','01','11','10'];
        // Gray code mapping: row(AB) x col(CD)
        // Row 00: m0,m1,m3,m2 | Row 01: m4,m5,m7,m6 | Row 11: m12,m13,m15,m14 | Row 10: m8,m9,m11,m10
        const mapping = [
            [0,1,3,2],[4,5,7,6],[12,13,15,14],[8,9,11,10]
        ];
        html = '<table class="kmap-table"><tr><th>AB\\CD</th>';
        colHeaders.forEach(c => html += `<th>${c}</th>`);
        html += '</tr>';
        mapping.forEach((row, ri) => {
            html += `<tr><th>${rowHeaders[ri]}</th>`;
            row.forEach(m => html += `<td class="kmap-0" data-i="${m}" onclick="toggleKmap(${m})">0</td>`);
            html += '</tr>';
        });
        html += '</table>';
    }

    grid.innerHTML = html;
    document.getElementById('result-kmap').innerHTML = '';
}

function toggleKmap(i) {
    kmapData[i] = kmapData[i] ? 0 : 1;
    const cell = document.querySelector(`[data-i="${i}"]`);
    if (cell) {
        cell.textContent = kmapData[i];
        cell.className = kmapData[i] ? 'kmap-1' : 'kmap-0';
    }
}

function solveKmap() {
    const minterms = [];
    kmapData.forEach((v, i) => { if (v) minterms.push(i); });

    if (minterms.length === 0) {
        document.getElementById('result-kmap').innerHTML = '<div class="result-card"><h3>ผลลัพธ์</h3><div class="value">F = 0</div></div>';
        return;
    }
    if (minterms.length === (1 << kmapVars)) {
        document.getElementById('result-kmap').innerHTML = '<div class="result-card"><h3>ผลลัพธ์</h3><div class="value">F = 1</div></div>';
        return;
    }

    const varNames = ['A','B','C','D'].slice(0, kmapVars);

    // Find all prime implicants using Quine-McCluskey simplified
    const primeImplicants = findPrimeImplicants(minterms, kmapVars);

    // Essential prime implicants (greedy cover)
    const cover = findMinCover(primeImplicants, minterms);

    // Convert implicants to expression
    const terms = cover.map(imp => implicantToTerm(imp, varNames));
    const expr = terms.join(' + ') || '0';

    let html = '<div class="result-card"><h3>Minimized Expression</h3>';
    html += `<div class="value">F = ${expr}</div>`;
    html += `<div class="detail"><strong>Minterms:</strong> Σm(${minterms.join(',')})</div>`;
    html += `<div class="detail"><strong>Prime Implicants:</strong> ${primeImplicants.length}</div>`;
    html += '<div class="detail" style="margin-top:10px"><strong>Groups:</strong><br>';
    cover.forEach((imp, idx) => {
        const colors = ['#34d399','#60a5fa','#f472b6','#fbbf24','#a78bfa','#fb923c'];
        const color = colors[idx % colors.length];
        const coveredMinterms = imp.minterms.join(',');
        html += `<span class="badge" style="background:${color}22;color:${color}">Group ${idx+1}: m(${coveredMinterms}) → ${implicantToTerm(imp, varNames)}</span><br>`;
    });
    html += '</div></div>';

    // Highlight cells on K-map
    highlightKmapGroups(cover);

    document.getElementById('result-kmap').innerHTML = html;
}

function findPrimeImplicants(minterms, nVars) {
    // Simplified Quine-McCluskey
    let groups = minterms.map(m => ({
        minterms: [m],
        mask: 0, // bits that are "don't care"
        value: m,
        used: false
    }));

    let allImplicants = [];
    let currentGroups = [...groups];

    while (true) {
        const nextGroups = [];
        const used = new Set();

        for (let i = 0; i < currentGroups.length; i++) {
            for (let j = i + 1; j < currentGroups.length; j++) {
                const a = currentGroups[i], b = currentGroups[j];
                if (a.mask !== b.mask) continue;
                const diff = a.value ^ b.value;
                // Check if differ in exactly one bit (that's not masked)
                if (diff && (diff & (diff - 1)) === 0 && (diff & a.mask) === 0) {
                    used.add(i);
                    used.add(j);
                    const newMinterms = [...new Set([...a.minterms, ...b.minterms])].sort((x,y)=>x-y);
                    const key = newMinterms.join(',');
                    if (!nextGroups.some(g => g.minterms.join(',') === key)) {
                        nextGroups.push({
                            minterms: newMinterms,
                            mask: a.mask | diff,
                            value: a.value & ~diff,
                            used: false
                        });
                    }
                }
            }
        }

        // Unused groups are prime implicants
        currentGroups.forEach((g, i) => {
            if (!used.has(i)) {
                const key = g.minterms.join(',');
                if (!allImplicants.some(p => p.minterms.join(',') === key)) {
                    allImplicants.push(g);
                }
            }
        });

        if (nextGroups.length === 0) break;
        currentGroups = nextGroups;
    }

    return allImplicants;
}

function findMinCover(implicants, minterms) {
    const uncovered = new Set(minterms);
    const selected = [];

    // Find essential prime implicants
    for (const m of minterms) {
        const covering = implicants.filter(imp => imp.minterms.includes(m));
        if (covering.length === 1 && !selected.includes(covering[0])) {
            selected.push(covering[0]);
            covering[0].minterms.forEach(mt => uncovered.delete(mt));
        }
    }

    // Greedy cover remaining
    while (uncovered.size > 0) {
        let best = null, bestCount = 0;
        for (const imp of implicants) {
            if (selected.includes(imp)) continue;
            const count = imp.minterms.filter(m => uncovered.has(m)).length;
            if (count > bestCount) { bestCount = count; best = imp; }
        }
        if (!best) break;
        selected.push(best);
        best.minterms.forEach(m => uncovered.delete(m));
    }

    return selected;
}

function implicantToTerm(imp, varNames) {
    const nVars = varNames.length;
    const parts = [];
    for (let i = nVars - 1; i >= 0; i--) {
        const bit = 1 << i;
        if (imp.mask & bit) continue; // don't care
        if (imp.value & bit) parts.push(varNames[nVars - 1 - i]);
        else parts.push(varNames[nVars - 1 - i] + "'");
    }
    return parts.length === 0 ? '1' : parts.join('');
}

function highlightKmapGroups(groups) {
    const colors = ['#34d399','#60a5fa','#f472b6','#fbbf24','#a78bfa','#fb923c'];
    // Reset all cell styles
    document.querySelectorAll('.kmap-table td').forEach(td => {
        td.style.outline = '';
        td.style.outlineOffset = '';
    });

    groups.forEach((group, gi) => {
        const color = colors[gi % colors.length];
        group.minterms.forEach(m => {
            const cell = document.querySelector(`[data-i="${m}"]`);
            if (cell) {
                const existing = cell.style.outline;
                const offset = gi * -4 - 3;
                if (existing) {
                    // Multiple groups - add box shadow instead
                    cell.style.boxShadow = (cell.style.boxShadow ? cell.style.boxShadow + ',' : '') +
                        `inset 0 0 0 ${gi * 2 + 2}px ${color}44`;
                } else {
                    cell.style.outline = `3px solid ${color}`;
                    cell.style.outlineOffset = `${offset}px`;
                }
            }
        });
    });
}

// Init K-map on load
document.addEventListener('DOMContentLoaded', initKmap);

// ============ LOGIC GATE SIMULATOR ============
let gateInputs = { a: false, b: false };

function toggleGateInput(input) {
    gateInputs[input] = !gateInputs[input];
    const btn = document.getElementById('gate-input-' + input);
    btn.textContent = gateInputs[input] ? '1' : '0';
    btn.className = 'toggle-btn ' + (gateInputs[input] ? 'on' : 'off');
    renderGates();
}

function renderGates() {
    const a = gateInputs.a, b = gateInputs.b;
    const gates = [
        { name: 'AND', symbol: '∧', formula: `${+a} AND ${+b}`, output: a && b },
        { name: 'OR', symbol: '∨', formula: `${+a} OR ${+b}`, output: a || b },
        { name: 'NOT A', symbol: '¬', formula: `NOT ${+a}`, output: !a },
        { name: 'NOT B', symbol: '¬', formula: `NOT ${+b}`, output: !b },
        { name: 'NAND', symbol: '⊼', formula: `NOT(${+a} AND ${+b})`, output: !(a && b) },
        { name: 'NOR', symbol: '⊽', formula: `NOT(${+a} OR ${+b})`, output: !(a || b) },
        { name: 'XOR', symbol: '⊕', formula: `${+a} XOR ${+b}`, output: a !== b },
        { name: 'XNOR', symbol: '⊙', formula: `${+a} XNOR ${+b}`, output: a === b },
    ];

    const grid = document.getElementById('gates-grid');
    if (!grid) return;
    grid.innerHTML = gates.map(g => {
        const out = g.output ? 1 : 0;
        return `<div class="gate-card">
            <div class="gate-name">${g.name}</div>
            <div class="gate-symbol">${g.symbol}</div>
            <div class="gate-formula">${g.formula}</div>
            <div class="gate-output ${out ? 'out-1' : 'out-0'}">${out}</div>
        </div>`;
    }).join('');
}

// Init gates
document.addEventListener('DOMContentLoaded', () => {
    // Set initial button states
    document.getElementById('gate-input-a')?.classList.add('off');
    document.getElementById('gate-input-b')?.classList.add('off');
    renderGates();
});

// ============ NUMBER CONVERTER ============
function convertNumber() {
    const input = document.getElementById('conv-input').value.trim();
    const base = parseInt(document.getElementById('conv-base').value);
    const resultDiv = document.getElementById('result-conv');

    if (!input) { resultDiv.innerHTML = ''; return; }

    let decimal;
    try {
        decimal = parseInt(input, base);
        if (isNaN(decimal)) throw new Error('Invalid');
    } catch (e) {
        resultDiv.innerHTML = '<div class="result-card"><h3>❌ ตัวเลขไม่ถูกต้องสำหรับฐานที่เลือก</h3></div>';
        return;
    }

    const binary = decimal.toString(2);
    const octal = decimal.toString(8);
    const dec = decimal.toString(10);
    const hex = decimal.toString(16).toUpperCase();

    // Format binary with spaces every 4 bits
    const binFormatted = binary.replace(/\B(?=(\d{4})+(?!\d))/g, ' ');

    const conversions = [
        { label: 'Binary (2)', value: binFormatted, base: 2 },
        { label: 'Octal (8)', value: octal, base: 8 },
        { label: 'Decimal (10)', value: Number(dec).toLocaleString(), base: 10 },
        { label: 'Hexadecimal (16)', value: '0x' + hex, base: 16 },
    ];

    let html = '<div class="conv-results">';
    conversions.forEach(c => {
        const isSource = c.base === base;
        html += `<div class="conv-card" style="${isSource ? 'border-color:var(--accent);' : ''}">
            <div class="conv-label">${c.label}${isSource ? ' ← input' : ''}</div>
            <div class="conv-value">${c.value}</div>
        </div>`;
    });
    html += '</div>';

    // Show conversion steps
    html += '<div class="result-card" style="margin-top:14px"><h3>Conversion Steps</h3><div class="detail">';
    if (base !== 10) {
        html += `<strong>${input}<sub>${base}</sub> → Decimal:</strong><br>`;
        const digits = input.split('').reverse();
        const steps = digits.map((d, i) => {
            const val = parseInt(d, base);
            return `${d}×${base}<sup>${i}</sup>`;
        }).reverse();
        html += steps.join(' + ') + ` = <strong>${decimal}</strong><br><br>`;
    }
    if (base !== 2) {
        html += `<strong>Decimal ${decimal} → Binary:</strong><br>`;
        let n = Math.abs(decimal), divSteps = [];
        if (n === 0) divSteps.push('0');
        while (n > 0) {
            divSteps.push(`${n} ÷ 2 = ${Math.floor(n/2)} remainder ${n%2}`);
            n = Math.floor(n / 2);
        }
        html += divSteps.join('<br>');
        html += `<br>→ <strong>${binary}</strong>`;
    }
    html += '</div></div>';

    resultDiv.innerHTML = html;
}
