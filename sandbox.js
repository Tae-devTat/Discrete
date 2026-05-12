// ============ SANDBOX ENGINE ============
let monacoEditor = null;
let currentLang = 'javascript';
let pyodideInstance = null;
let pyodideLoading = false;
let fengariLoaded = false;
let consoleLines = [];
const editorCodes = { javascript: '', python: '', lua: '' };

const EXAMPLES = {
'js-truth': {lang:'javascript', code:`// Truth Table Verifier - ตรวจสอบ Tautology
function truthTable(expr, vars) {
    const rows = 1 << vars.length;
    let taut = true;
    console.log("Truth Table for: " + expr);
    console.log("-".repeat(40));
    for (let i = 0; i < rows; i++) {
        const vals = {};
        vars.forEach((v, j) => vals[v] = !!(i >> (vars.length-1-j) & 1));
        const p = vals.p, q = vals.q;
        const result = eval(expr);
        if (!result) taut = false;
        console.log(vars.map(v => v+"="+Number(vals[v])).join(", ") + " => " + Number(result));
    }
    console.log("-".repeat(40));
    console.log(taut ? "✅ TAUTOLOGY!" : "❌ Not a tautology");
}

// ตรวจสอบ p → q ≡ ¬p ∨ q
truthTable("(!p || q) === (!p || q)", ["p","q"]);
console.log("");
// ตรวจสอบ p ∨ ¬p (Law of Excluded Middle)
truthTable("p || !p", ["p","q"]);
`},
'js-graph': {lang:'javascript', code:`// Graph Builder - สร้าง Graph อัตโนมัติ
const V = 6; // จำนวน nodes
const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4]];

// สร้าง Adjacency List
const adj = Array.from({length: V}, () => []);
edges.forEach(([u,v]) => { adj[u].push(v); adj[v].push(u); });

console.log("Graph with " + V + " vertices, " + edges.length + " edges");
console.log("Adjacency List:");
adj.forEach((neighbors, i) => console.log("  v" + i + " -> [" + neighbors.join(",") + "]"));

// Degree Sequence
const degrees = adj.map(n => n.length);
console.log("\\nDegree Sequence: [" + degrees.join(",") + "]");
console.log("Sum of degrees: " + degrees.reduce((a,b)=>a+b,0) + " = 2×" + edges.length);

// BFS
function bfs(start) {
    const visited = new Set([start]);
    const queue = [start];
    const order = [];
    while (queue.length) {
        const v = queue.shift();
        order.push(v);
        for (const u of adj[v]) {
            if (!visited.has(u)) { visited.add(u); queue.push(u); }
        }
    }
    return order;
}
console.log("\\nBFS from v0: " + bfs(0).join(" → "));

// Check connectivity
console.log("Connected: " + (bfs(0).length === V ? "✅ Yes" : "❌ No"));
`},
'js-prime': {lang:'javascript', code:`// Sieve of Eratosthenes
function sieve(n) {
    const isPrime = new Array(n+1).fill(true);
    isPrime[0] = isPrime[1] = false;
    for (let i = 2; i*i <= n; i++) {
        if (isPrime[i]) {
            for (let j = i*i; j <= n; j += i) isPrime[j] = false;
        }
    }
    return isPrime.map((v,i) => v ? i : -1).filter(x => x > 0);
}

const primes = sieve(100);
console.log("Primes up to 100:");
console.log(primes.join(", "));
console.log("Count: " + primes.length);

// Twin primes
const twins = [];
for (let i = 0; i < primes.length-1; i++) {
    if (primes[i+1] - primes[i] === 2) twins.push([primes[i], primes[i+1]]);
}
console.log("\\nTwin Primes: " + twins.map(t => "("+t.join(",")+")").join(" "));

// Goldbach check
console.log("\\nGoldbach's Conjecture (even numbers 4-50):");
const ps = new Set(primes);
for (let n = 4; n <= 50; n += 2) {
    for (const p of primes) {
        if (ps.has(n-p)) { console.log(n + " = " + p + " + " + (n-p)); break; }
    }
}
`},
'py-truth': {lang:'python', code:`# Truth Table Generator (Python)
from itertools import product

def truth_table(expression, variables):
    print(f"Truth Table: {expression}")
    print("-" * 40)
    header = "  ".join(variables) + "  | Result"
    print(header)
    print("-" * len(header))
    
    tautology = True
    for values in product([False, True], repeat=len(variables)):
        env = dict(zip(variables, values))
        result = eval(expression, {"__builtins__": {}}, env)
        if not result:
            tautology = False
        row = "  ".join(str(int(v)) for v in values)
        print(f"{row}  |   {int(result)}")
    
    print("-" * 40)
    print("✅ TAUTOLOGY" if tautology else "❌ Not a tautology")

# De Morgan's Law: not(p and q) == (not p) or (not q)
truth_table("(not (p and q)) == ((not p) or (not q))", ["p", "q"])
print()
# Implication: p->q == not p or q  
truth_table("(not p or q) == (not p or q)", ["p", "q"])
`},
'py-combinatorics': {lang:'python', code:`# Combinatorics Calculator (Python)
from math import factorial, comb, perm

print("=== Combinatorics ===")
n, r = 10, 3

print(f"n = {n}, r = {r}")
print(f"n! = {factorial(n):,}")
print(f"P(n,r) = {perm(n,r):,}")
print(f"C(n,r) = {comb(n,r):,}")

print("\\n=== Pascal's Triangle (10 rows) ===")
for i in range(10):
    row = [comb(i, j) for j in range(i+1)]
    padding = "  " * (9 - i)
    print(padding + "  ".join(f"{x:3}" for x in row))

print("\\n=== Binomial Expansion (a+b)^5 ===")
n = 5
terms = []
for k in range(n+1):
    c = comb(n, k)
    a_pow = n - k
    b_pow = k
    term = f"{c}"
    if a_pow > 0: term += f"a^{a_pow}" if a_pow > 1 else "a"
    if b_pow > 0: term += f"b^{b_pow}" if b_pow > 1 else "b"
    terms.append(term)
print(" + ".join(terms))

print("\\n=== Derangements D(n) ===")
def derangement(n):
    if n == 0: return 1
    if n == 1: return 0
    return (n-1) * (derangement(n-1) + derangement(n-2))

for i in range(1, 9):
    print(f"D({i}) = {derangement(i)}")
`},
'py-converter': {lang:'python', code:`# Custom Base Converter (Python)
def to_base(n, base):
    if n == 0: return "0"
    digits = "0123456789ABCDEF"
    result = ""
    num = abs(n)
    while num:
        result = digits[num % base] + result
        num //= base
    return ("-" if n < 0 else "") + result

def from_base(s, base):
    return int(s, base)

# Convert between bases
numbers = [42, 255, 1024, 65535]

print("=== Multi-Base Conversion ===")
print(f"{'Decimal':>10} {'Binary':>20} {'Octal':>10} {'Hex':>10}")
print("-" * 55)
for n in numbers:
    print(f"{n:>10} {to_base(n,2):>20} {to_base(n,8):>10} {to_base(n,16):>10}")

print("\\n=== Step-by-step: 255 to Binary ===")
n = 255
steps = []
while n > 0:
    steps.append(f"{n} ÷ 2 = {n//2} remainder {n%2}")
    n //= 2
for s in steps:
    print(s)
print(f"Result: {to_base(255, 2)}")

print("\\n=== Binary Arithmetic ===")
a, b = 0b1010, 0b0110
print(f"  {to_base(a,2):>8}  ({a})")
print(f"+ {to_base(b,2):>8}  ({b})")
print(f"= {to_base(a+b,2):>8}  ({a+b})")
`},
'lua-graph': {lang:'lua', code:`-- Graph Builder (Lua)
-- สร้าง Graph ด้วย adjacency list

local V = 5
local adj = {}
for i = 0, V-1 do adj[i] = {} end

function addEdge(u, v)
    table.insert(adj[u], v)
    table.insert(adj[v], u)
end

-- สร้าง Petersen-like graph
addEdge(0, 1)
addEdge(1, 2)
addEdge(2, 3)
addEdge(3, 4)
addEdge(4, 0)

print("Graph: " .. V .. " vertices")
print("Adjacency List:")
for i = 0, V-1 do
    local neighbors = {}
    for _, v in ipairs(adj[i]) do
        table.insert(neighbors, "v" .. v)
    end
    print("  v" .. i .. " -> [" .. table.concat(neighbors, ", ") .. "]")
end

-- Compute degrees
print("\\nDegrees:")
local totalDeg = 0
for i = 0, V-1 do
    local deg = #adj[i]
    totalDeg = totalDeg + deg
    print("  v" .. i .. ": degree " .. deg)
end
print("Sum of degrees: " .. totalDeg)

-- DFS
function dfs(start)
    local visited = {}
    local order = {}
    local function visit(v)
        visited[v] = true
        table.insert(order, "v" .. v)
        for _, u in ipairs(adj[v]) do
            if not visited[u] then visit(u) end
        end
    end
    visit(start)
    return order
end

print("\\nDFS from v0: " .. table.concat(dfs(0), " → "))
`},
'lua-logic': {lang:'lua', code:`-- Logic Gate Simulator (Lua)

function AND(a, b) return a and b end
function OR(a, b) return a or b end
function NOT(a) return not a end
function NAND(a, b) return not (a and b) end
function NOR(a, b) return not (a or b) end
function XOR(a, b) return a ~= b end
function XNOR(a, b) return a == b end

function bool2int(b) return b and 1 or 0 end

print("=== Logic Gate Truth Tables ===")
print("")

local gates = {
    {name="AND",  fn=AND},
    {name="OR",   fn=OR},
    {name="NAND", fn=NAND},
    {name="NOR",  fn=NOR},
    {name="XOR",  fn=XOR},
    {name="XNOR", fn=XNOR},
}

for _, gate in ipairs(gates) do
    print("--- " .. gate.name .. " Gate ---")
    print("A  B  | Output")
    for _, a in ipairs({false, true}) do
        for _, b in ipairs({false, true}) do
            local result = gate.fn(a, b)
            print(bool2int(a) .. "  " .. bool2int(b) .. "  |   " .. bool2int(result))
        end
    end
    print("")
end

-- Half Adder
print("=== Half Adder ===")
print("A  B  | Sum  Carry")
for _, a in ipairs({false, true}) do
    for _, b in ipairs({false, true}) do
        local sum = XOR(a, b)
        local carry = AND(a, b)
        print(bool2int(a) .. "  " .. bool2int(b) .. "  |  " .. bool2int(sum) .. "    " .. bool2int(carry))
    end
end
`}
};

// ============ MONACO EDITOR INIT ============
function initSandboxEditor() {
    const container = document.getElementById('sandbox-editor');
    if (!container) return;

    if (typeof require !== 'undefined' && typeof require.config === 'function') {
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
        require(['vs/editor/editor.main'], function() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            monacoEditor = monaco.editor.create(container, {
                value: EXAMPLES['js-truth'].code,
                language: 'javascript',
                theme: isDark ? 'vs-dark' : 'vs',
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
                lineNumbers: 'on',
                roundedSelection: true,
                renderLineHighlight: 'line',
                tabSize: 2,
            });
            editorCodes.javascript = EXAMPLES['js-truth'].code;
            monacoEditor.onDidChangeModelContent(() => {
                editorCodes[currentLang] = monacoEditor.getValue();
            });
            // Ctrl+Enter to run
            monacoEditor.addAction({
                id: 'run-code', label: 'Run Code',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                run: () => runSandbox()
            });
            updateLangBadge();
        });
    } else {
        // Fallback textarea
        container.innerHTML = `<textarea class="fallback-editor" id="fallback-textarea" spellcheck="false">${EXAMPLES['js-truth'].code}</textarea>`;
        editorCodes.javascript = EXAMPLES['js-truth'].code;
        const ta = document.getElementById('fallback-textarea');
        ta.addEventListener('input', () => { editorCodes[currentLang] = ta.value; });
        ta.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') { e.preventDefault(); const s=ta.selectionStart; ta.value=ta.value.substring(0,s)+"  "+ta.value.substring(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+2; }
            if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); runSandbox(); }
        });
        updateLangBadge();
    }
}

// ============ LANGUAGE SWITCHING ============
function switchLang(lang) {
    // Save current code
    editorCodes[currentLang] = getEditorValue();
    currentLang = lang;

    document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.lang-tab[data-lang="${lang}"]`)?.classList.add('active');

    if (monacoEditor) {
        const model = monacoEditor.getModel();
        monaco.editor.setModelLanguage(model, lang === 'lua' ? 'lua' : lang);
        monacoEditor.setValue(editorCodes[lang] || '');
    } else {
        const ta = document.getElementById('fallback-textarea');
        if (ta) ta.value = editorCodes[lang] || '';
    }

    // Load Pyodide if Python selected
    if (lang === 'python' && !pyodideInstance && !pyodideLoading) loadPyodide();
    // Load Fengari if Lua selected
    if (lang === 'lua' && !fengariLoaded) loadFengari();

    updateLangBadge();
}

function getEditorValue() {
    if (monacoEditor) return monacoEditor.getValue();
    const ta = document.getElementById('fallback-textarea');
    return ta ? ta.value : '';
}

function updateLangBadge() {
    const badge = document.getElementById('sandbox-lang-badge');
    if (!badge) return;
    const labels = { javascript: 'JavaScript', python: 'Python', lua: 'Lua' };
    const classes = { javascript: 'js', python: 'python', lua: 'lua' };
    badge.textContent = labels[currentLang];
    badge.className = 'lang-badge ' + classes[currentLang];
}

function updateEditorTheme() {
    if (!monacoEditor) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
}

// Watch theme changes
const origSetTheme = window.setTheme;
if (origSetTheme) {
    window.setTheme = function(t) { origSetTheme(t); updateEditorTheme(); };
}

// ============ CONSOLE ============
function logToConsole(msg, type = 'log') {
    consoleLines.push({ msg, type });
    const div = document.getElementById('sandbox-console');
    if (!div) return;
    const line = document.createElement('div');
    line.className = 'console-line console-' + type;
    line.textContent = typeof msg === 'object' ? JSON.stringify(msg, null, 2) : String(msg);
    div.appendChild(line);
    div.scrollTop = div.scrollHeight;
    document.getElementById('console-count').textContent = consoleLines.length + ' lines';
}

function clearConsole() {
    consoleLines = [];
    const div = document.getElementById('sandbox-console');
    if (div) div.innerHTML = '';
    document.getElementById('console-count').textContent = '0 lines';
    const insp = document.getElementById('sandbox-inspector');
    if (insp) insp.innerHTML = '';
}

// ============ STATE INSPECTOR ============
function inspectState(vars) {
    const insp = document.getElementById('sandbox-inspector');
    if (!insp) return;
    insp.innerHTML = '';
    for (const [key, value] of Object.entries(vars)) {
        const item = document.createElement('div');
        item.className = 'inspector-item';
        const t = Array.isArray(value) ? 'array' : typeof value;
        const display = typeof value === 'object' ? JSON.stringify(value) : String(value);
        item.innerHTML = `<span class="inspector-key">${key}</span><span class="inspector-val">${display}</span><span class="inspector-type">${t}</span>`;
        insp.appendChild(item);
    }
}

// ============ RUN CODE ============
async function runSandbox() {
    const code = getEditorValue();
    if (!code.trim()) return;

    const status = document.getElementById('sandbox-status');
    const btn = document.getElementById('btn-run');
    status.textContent = 'Running...';
    status.className = 'status-running';
    btn.disabled = true;
    clearConsole();
    logToConsole(`▶ Running ${currentLang}...`, 'system');

    const startTime = performance.now();

    try {
        if (currentLang === 'javascript') await runJS(code);
        else if (currentLang === 'python') await runPython(code);
        else if (currentLang === 'lua') await runLua(code);

        const elapsed = (performance.now() - startTime).toFixed(1);
        logToConsole(`✅ Done in ${elapsed}ms`, 'success');
        status.textContent = 'Done';
        status.className = 'status-ready';
    } catch (err) {
        logToConsole(`❌ Error: ${err.message || err}`, 'error');
        status.textContent = 'Error';
        status.className = 'status-error';
    }
    btn.disabled = false;
}

// ============ JS RUNNER ============
async function runJS(code) {
    const sandbox = {};
    const fakeConsole = {
        log: (...args) => logToConsole(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'log'),
        info: (...args) => logToConsole(args.join(' '), 'info'),
        warn: (...args) => logToConsole(args.join(' '), 'warn'),
        error: (...args) => logToConsole(args.join(' '), 'error'),
    };
    const inspect = (vars) => inspectState(vars);

    const wrappedCode = `
        (async function(console, inspect) {
            ${code}
        })
    `;
    const fn = eval(wrappedCode);
    await fn(fakeConsole, inspect);
}

// ============ PYTHON (PYODIDE) ============
async function loadPyodide() {
    pyodideLoading = true;
    const statusEl = document.getElementById('pyodide-status');
    if (statusEl) statusEl.textContent = '⏳ Loading Python (Pyodide)...';
    logToConsole('⏳ Loading Pyodide runtime...', 'system');

    try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });

        pyodideInstance = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
        if (statusEl) statusEl.textContent = '✅ Python Ready';
        logToConsole('✅ Pyodide loaded successfully!', 'success');
    } catch (e) {
        if (statusEl) statusEl.textContent = '❌ Python load failed';
        logToConsole('❌ Failed to load Pyodide: ' + e.message, 'error');
    }
    pyodideLoading = false;
}

async function runPython(code) {
    if (!pyodideInstance) {
        if (pyodideLoading) { logToConsole('⏳ Pyodide is still loading, please wait...', 'warn'); return; }
        await loadPyodide();
        if (!pyodideInstance) throw new Error('Pyodide not available');
    }

    // Redirect stdout
    pyodideInstance.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
    `);

    try {
        pyodideInstance.runPython(code);
        const stdout = pyodideInstance.runPython('sys.stdout.getvalue()');
        const stderr = pyodideInstance.runPython('sys.stderr.getvalue()');
        if (stdout) stdout.split('\n').filter(l=>l).forEach(l => logToConsole(l, 'log'));
        if (stderr) stderr.split('\n').filter(l=>l).forEach(l => logToConsole(l, 'error'));
    } catch (e) {
        throw new Error(e.message);
    }
}

// ============ LUA (FENGARI) ============
async function loadFengari() {
    const statusEl = document.getElementById('pyodide-status');
    if (statusEl) statusEl.textContent = '⏳ Loading Lua (Fengari)...';
    logToConsole('⏳ Loading Fengari runtime...', 'system');

    try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });
        fengariLoaded = true;
        if (statusEl) statusEl.textContent = '✅ Lua Ready';
        logToConsole('✅ Fengari loaded!', 'success');
    } catch (e) {
        if (statusEl) statusEl.textContent = '❌ Lua load failed';
        logToConsole('❌ Failed to load Fengari: ' + e.message, 'error');
    }
}

async function runLua(code) {
    if (typeof fengari === 'undefined') {
        if (!fengariLoaded) { await loadFengari(); }
        if (typeof fengari === 'undefined') throw new Error('Fengari not available');
    }

    const L = fengari.lauxlib.luaL_newstate();
    fengari.lualib.luaL_openlibs(L);

    // Override print
    const output = [];
    fengari.lua.lua_pushcfunction(L, function(L) {
        const n = fengari.lua.lua_gettop(L);
        const parts = [];
        for (let i = 1; i <= n; i++) {
            parts.push(fengari.lauxlib.luaL_tolstring(L, i));
            fengari.lua.lua_pop(L, 1);
        }
        logToConsole(parts.join('\t'), 'log');
        return 0;
    });
    fengari.lua.lua_setglobal(L, fengari.lua.to_luastring('print'));

    const status = fengari.lauxlib.luaL_dostring(L, fengari.lua.to_luastring(code));
    if (status !== 0) {
        const err = fengari.lua.lua_tojsstring(L, -1);
        throw new Error(err);
    }
}

// ============ LOAD EXAMPLES ============
function loadExample() {
    const sel = document.getElementById('sandbox-examples');
    const key = sel.value;
    if (!key || !EXAMPLES[key]) return;

    const ex = EXAMPLES[key];
    if (ex.lang !== currentLang) switchLang(ex.lang);

    if (monacoEditor) {
        monacoEditor.setValue(ex.code);
    } else {
        const ta = document.getElementById('fallback-textarea');
        if (ta) ta.value = ex.code;
    }
    editorCodes[ex.lang] = ex.code;
    sel.value = '';
}

// ============ INIT ON NAV ============
const origNavigateTo = window.navigateTo;
window.navigateTo = function(id) {
    origNavigateTo(id);
    if (id === 'sandbox' && !monacoEditor && !document.getElementById('fallback-textarea')) {
        setTimeout(initSandboxEditor, 100);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Pre-populate default codes
    editorCodes.javascript = EXAMPLES['js-truth'].code;
    editorCodes.python = EXAMPLES['py-truth'].code;
    editorCodes.lua = EXAMPLES['lua-logic'].code;
});
