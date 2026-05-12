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

// ============ AUTOCOMPLETE KEYWORDS ============
function registerAutoComplete() {
    if (typeof monaco === 'undefined') return;

    const KEYWORDS = [
        // ── Logic & Truth Tables ──
        { label: 'Logic.AND', insert: 'Logic.AND(${1:a}, ${2:b})', doc: 'Logical AND (∧) — returns true only if both a AND b are true', cat: 'Logic' },
        { label: 'Logic.OR', insert: 'Logic.OR(${1:a}, ${2:b})', doc: 'Logical OR (∨) — returns true if a OR b is true', cat: 'Logic' },
        { label: 'Logic.NOT', insert: 'Logic.NOT(${1:a})', doc: 'Logical NOT (¬) — negates the value', cat: 'Logic' },
        { label: 'Logic.NAND', insert: 'Logic.NAND(${1:a}, ${2:b})', doc: 'Logical NAND — NOT(a AND b)', cat: 'Logic' },
        { label: 'Logic.NOR', insert: 'Logic.NOR(${1:a}, ${2:b})', doc: 'Logical NOR — NOT(a OR b)', cat: 'Logic' },
        { label: 'Logic.XOR', insert: 'Logic.XOR(${1:a}, ${2:b})', doc: 'Logical XOR (⊕) — true when inputs differ', cat: 'Logic' },
        { label: 'Logic.XNOR', insert: 'Logic.XNOR(${1:a}, ${2:b})', doc: 'Logical XNOR (⊙) — true when inputs are same', cat: 'Logic' },
        { label: 'Logic.IMPLIES', insert: 'Logic.IMPLIES(${1:p}, ${2:q})', doc: 'Implication (→) — p implies q, false only when p=T, q=F', cat: 'Logic' },
        { label: 'Logic.IFF', insert: 'Logic.IFF(${1:p}, ${2:q})', doc: 'Biconditional (↔) — true when both values are equal', cat: 'Logic' },
        { label: 'truthTable', insert: 'truthTable(${1:expression}, [${2:"p","q"}])', doc: 'Generate a truth table for the given expression with variables', cat: 'Logic' },

        // ── Graph Theory ──
        { label: 'Graph.addNode', insert: 'Graph.addNode(${1:label})', doc: 'Add a new vertex/node to the graph', cat: 'Graph' },
        { label: 'Graph.addEdge', insert: 'Graph.addEdge(${1:u}, ${2:v})', doc: 'Add an undirected edge between nodes u and v', cat: 'Graph' },
        { label: 'Graph.removeNode', insert: 'Graph.removeNode(${1:id})', doc: 'Remove a node and all its incident edges', cat: 'Graph' },
        { label: 'Graph.removeEdge', insert: 'Graph.removeEdge(${1:u}, ${2:v})', doc: 'Remove the edge between u and v', cat: 'Graph' },
        { label: 'Graph.adjacencyList', insert: 'Graph.adjacencyList()', doc: 'Get the adjacency list representation', cat: 'Graph' },
        { label: 'Graph.adjacencyMatrix', insert: 'Graph.adjacencyMatrix()', doc: 'Get the adjacency matrix representation', cat: 'Graph' },
        { label: 'Graph.degree', insert: 'Graph.degree(${1:node})', doc: 'Get the degree of a specific node', cat: 'Graph' },
        { label: 'Graph.degreeSequence', insert: 'Graph.degreeSequence()', doc: 'Get sorted degree sequence of all nodes', cat: 'Graph' },
        { label: 'Graph.bfs', insert: 'Graph.bfs(${1:startNode})', doc: 'Breadth-First Search traversal from start node', cat: 'Graph' },
        { label: 'Graph.dfs', insert: 'Graph.dfs(${1:startNode})', doc: 'Depth-First Search traversal from start node', cat: 'Graph' },
        { label: 'Graph.isConnected', insert: 'Graph.isConnected()', doc: 'Check if the graph is connected', cat: 'Graph' },
        { label: 'Graph.hasEulerPath', insert: 'Graph.hasEulerPath()', doc: 'Check if graph has an Euler path (exactly 2 odd-degree nodes)', cat: 'Graph' },
        { label: 'Graph.hasEulerCircuit', insert: 'Graph.hasEulerCircuit()', doc: 'Check if graph has an Euler circuit (all even degrees)', cat: 'Graph' },
        { label: 'Graph.isTree', insert: 'Graph.isTree()', doc: 'Check if graph is a tree (connected + V-1 edges)', cat: 'Graph' },
        { label: 'Graph.isBipartite', insert: 'Graph.isBipartite()', doc: 'Check if graph is bipartite (2-colorable)', cat: 'Graph' },

        // ── Set Theory ──
        { label: 'Set.union', insert: 'Set.union(${1:A}, ${2:B})', doc: 'A ∪ B — elements in A or B or both', cat: 'Set' },
        { label: 'Set.intersect', insert: 'Set.intersect(${1:A}, ${2:B})', doc: 'A ∩ B — elements in both A and B', cat: 'Set' },
        { label: 'Set.difference', insert: 'Set.difference(${1:A}, ${2:B})', doc: 'A − B — elements in A but not in B', cat: 'Set' },
        { label: 'Set.symmetricDiff', insert: 'Set.symmetricDiff(${1:A}, ${2:B})', doc: 'A △ B — elements in A or B but not both', cat: 'Set' },
        { label: 'Set.cartesian', insert: 'Set.cartesian(${1:A}, ${2:B})', doc: 'A × B — Cartesian product of sets', cat: 'Set' },
        { label: 'Set.powerSet', insert: 'Set.powerSet(${1:A})', doc: 'P(A) — all subsets of A, |P(A)| = 2^|A|', cat: 'Set' },
        { label: 'Set.isSubset', insert: 'Set.isSubset(${1:A}, ${2:B})', doc: 'A ⊆ B — check if A is a subset of B', cat: 'Set' },
        { label: 'Set.isSuperset', insert: 'Set.isSuperset(${1:A}, ${2:B})', doc: 'A ⊇ B — check if A is a superset of B', cat: 'Set' },
        { label: 'Set.complement', insert: 'Set.complement(${1:A}, ${2:U})', doc: "A' relative to universal set U", cat: 'Set' },

        // ── Number Theory ──
        { label: 'Math.gcd', insert: 'Math.gcd(${1:a}, ${2:b})', doc: 'Greatest Common Divisor using Euclidean Algorithm', cat: 'Number Theory' },
        { label: 'Math.lcm', insert: 'Math.lcm(${1:a}, ${2:b})', doc: 'Least Common Multiple — |a·b| / GCD(a,b)', cat: 'Number Theory' },
        { label: 'Math.isPrime', insert: 'Math.isPrime(${1:n})', doc: 'Check if n is a prime number', cat: 'Number Theory' },
        { label: 'Math.primeFactors', insert: 'Math.primeFactors(${1:n})', doc: 'Get prime factorization of n', cat: 'Number Theory' },
        { label: 'Math.eulerTotient', insert: 'Math.eulerTotient(${1:n})', doc: 'φ(n) — count of integers 1..n coprime to n', cat: 'Number Theory' },
        { label: 'Math.modPow', insert: 'Math.modPow(${1:base}, ${2:exp}, ${3:mod})', doc: 'Modular exponentiation — base^exp mod m', cat: 'Number Theory' },
        { label: 'Math.sieve', insert: 'Math.sieve(${1:n})', doc: 'Sieve of Eratosthenes — all primes up to n', cat: 'Number Theory' },
        { label: 'Math.extGcd', insert: 'Math.extGcd(${1:a}, ${2:b})', doc: 'Extended Euclidean Algorithm — returns {gcd, x, y}', cat: 'Number Theory' },

        // ── Combinatorics ──
        { label: 'Comb.factorial', insert: 'Comb.factorial(${1:n})', doc: 'n! — n factorial', cat: 'Combinatorics' },
        { label: 'Comb.permutation', insert: 'Comb.permutation(${1:n}, ${2:r})', doc: 'P(n,r) = n!/(n-r)!', cat: 'Combinatorics' },
        { label: 'Comb.combination', insert: 'Comb.combination(${1:n}, ${2:r})', doc: 'C(n,r) = n!/[r!(n-r)!]', cat: 'Combinatorics' },
        { label: 'Comb.binomial', insert: 'Comb.binomial(${1:n})', doc: 'Binomial expansion coefficients of (1+x)^n', cat: 'Combinatorics' },
        { label: 'Comb.pascal', insert: 'Comb.pascal(${1:rows})', doc: "Generate Pascal's Triangle with given rows", cat: 'Combinatorics' },
        { label: 'Comb.derangement', insert: 'Comb.derangement(${1:n})', doc: 'D(n) — number of derangements (permutations with no fixed point)', cat: 'Combinatorics' },
        { label: 'Comb.catalan', insert: 'Comb.catalan(${1:n})', doc: 'C_n — nth Catalan number', cat: 'Combinatorics' },
        { label: 'Comb.stirling', insert: 'Comb.stirling(${1:n}, ${2:k})', doc: 'Stirling number of the second kind S(n,k)', cat: 'Combinatorics' },

        // ── Boolean Algebra ──
        { label: 'Bool.evaluate', insert: 'Bool.evaluate("${1:expression}", {${2:x: true, y: false}})', doc: 'Evaluate a Boolean expression with given variable values', cat: 'Boolean' },
        { label: 'Bool.truthTable', insert: 'Bool.truthTable("${1:expression}", [${2:"x","y"}])', doc: 'Generate complete truth table for Boolean expression', cat: 'Boolean' },
        { label: 'Bool.simplify', insert: 'Bool.simplify("${1:expression}")', doc: 'Simplify Boolean expression using algebraic laws', cat: 'Boolean' },
        { label: 'Bool.deMorgan', insert: 'Bool.deMorgan("${1:expression}")', doc: "Apply De Morgan's law: ¬(A∧B) ≡ ¬A∨¬B", cat: 'Boolean' },
        { label: 'Bool.minterm', insert: 'Bool.minterm(${1:index}, [${2:"A","B","C"}])', doc: 'Generate minterm for given index and variables', cat: 'Boolean' },
        { label: 'Bool.maxterm', insert: 'Bool.maxterm(${1:index}, [${2:"A","B","C"}])', doc: 'Generate maxterm for given index and variables', cat: 'Boolean' },

        // ── K-Map ──
        { label: 'KMap.solve', insert: 'KMap.solve([${1:0,1,3,5,7}], ${2:4})', doc: 'Solve K-Map with given minterms and number of variables', cat: 'K-Map' },
        { label: 'KMap.primeImplicants', insert: 'KMap.primeImplicants([${1:minterms}], ${2:nVars})', doc: 'Find all prime implicants using Quine-McCluskey', cat: 'K-Map' },
        { label: 'KMap.essentialPI', insert: 'KMap.essentialPI([${1:minterms}], ${2:nVars})', doc: 'Find essential prime implicants', cat: 'K-Map' },
        { label: 'KMap.minimize', insert: 'KMap.minimize("${1:SOP_expression}")', doc: 'Minimize a Sum-of-Products Boolean expression', cat: 'K-Map' },

        // ── Relations ──
        { label: 'Relation.isReflexive', insert: 'Relation.isReflexive(${1:set}, ${2:pairs})', doc: 'Check reflexive: ∀a∈A, (a,a)∈R', cat: 'Relation' },
        { label: 'Relation.isSymmetric', insert: 'Relation.isSymmetric(${1:pairs})', doc: 'Check symmetric: (a,b)∈R → (b,a)∈R', cat: 'Relation' },
        { label: 'Relation.isTransitive', insert: 'Relation.isTransitive(${1:pairs})', doc: 'Check transitive: (a,b)∧(b,c)→(a,c)∈R', cat: 'Relation' },
        { label: 'Relation.isAntisymmetric', insert: 'Relation.isAntisymmetric(${1:pairs})', doc: 'Check antisymmetric: (a,b)∧(b,a)→a=b', cat: 'Relation' },
        { label: 'Relation.isEquivalence', insert: 'Relation.isEquivalence(${1:set}, ${2:pairs})', doc: 'Check if R is equivalence (reflexive+symmetric+transitive)', cat: 'Relation' },
        { label: 'Relation.isPartialOrder', insert: 'Relation.isPartialOrder(${1:set}, ${2:pairs})', doc: 'Check if R is partial order (reflexive+antisymmetric+transitive)', cat: 'Relation' },
        { label: 'Relation.closure', insert: 'Relation.closure(${1:pairs}, "${2:transitive}")', doc: 'Compute closure (reflexive / symmetric / transitive)', cat: 'Relation' },

        // ── Number Converter ──
        { label: 'Convert.toBinary', insert: 'Convert.toBinary(${1:decimal})', doc: 'Convert decimal to binary string', cat: 'Converter' },
        { label: 'Convert.toOctal', insert: 'Convert.toOctal(${1:decimal})', doc: 'Convert decimal to octal string', cat: 'Converter' },
        { label: 'Convert.toHex', insert: 'Convert.toHex(${1:decimal})', doc: 'Convert decimal to hexadecimal string', cat: 'Converter' },
        { label: 'Convert.toDecimal', insert: 'Convert.toDecimal(${1:value}, ${2:fromBase})', doc: 'Convert a value from given base to decimal', cat: 'Converter' },
        { label: 'Convert.baseToBase', insert: 'Convert.baseToBase(${1:value}, ${2:fromBase}, ${3:toBase})', doc: 'Convert between any two bases (2-16)', cat: 'Converter' },
        { label: 'Convert.twosComplement', insert: 'Convert.twosComplement(${1:decimal}, ${2:bits})', doc: "Two's complement representation", cat: 'Converter' },

        // ── Console & Utilities ──
        { label: 'console.log', insert: 'console.log(${1:message})', doc: 'Print output to the sandbox console', cat: 'Console' },
        { label: 'console.warn', insert: 'console.warn(${1:message})', doc: 'Print warning message to console', cat: 'Console' },
        { label: 'console.error', insert: 'console.error(${1:message})', doc: 'Print error message to console', cat: 'Console' },
        { label: 'inspect', insert: 'inspect({${1:key}: ${2:value}})', doc: 'Display variables in the State Inspector panel', cat: 'Console' },

        // ── Common Structures ──
        { label: 'Array.from', insert: 'Array.from({length: ${1:n}}, (_, i) => ${2:i})', doc: 'Create array of length n with mapper', cat: 'Utility' },
        { label: 'new Set', insert: 'new Set([${1:elements}])', doc: 'Create a new Set for unique elements', cat: 'Utility' },
        { label: 'new Map', insert: 'new Map(${1})', doc: 'Create a new Map (key-value pairs)', cat: 'Utility' },
        { label: 'for...of', insert: 'for (const ${1:item} of ${2:iterable}) {\n\t${3}\n}', doc: 'Iterate over iterable values', cat: 'Utility' },
        { label: 'forEach', insert: 'forEach((${1:item}, ${2:index}) => {\n\t${3}\n})', doc: 'Execute function for each element', cat: 'Utility' },
    ];

    // Category → icon mapping for visual flair
    const CAT_ICONS = {
        'Logic': '🔗', 'Graph': '🕸️', 'Set': '📐', 'Number Theory': '🔢',
        'Combinatorics': '🎲', 'Boolean': '⊕', 'K-Map': '🗺️', 'Relation': '↔️',
        'Converter': '🔄', 'Console': '📟', 'Utility': '⚙️',
    };

    function createProvider(langId) {
        return monaco.languages.registerCompletionItemProvider(langId, {
            triggerCharacters: ['.', '_'],
            provideCompletionItems: function (model, position) {
                const word = model.getWordUntilPosition(position);
                const prefix = word && word.word ? word.word.toLowerCase() : '';
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word ? word.startColumn : position.column,
                    endColumn: word ? word.endColumn : position.column,
                };

                const suggestions = (prefix
                    ? KEYWORDS.filter(kw => kw.label.toLowerCase().includes(prefix))
                    : KEYWORDS
                ).map(kw => {
                        const icon = CAT_ICONS[kw.cat] || '📦';
                        return {
                            label: kw.label,
                            kind: kw.cat === 'Utility' ? monaco.languages.CompletionItemKind.Snippet
                                : kw.cat === 'Console' ? monaco.languages.CompletionItemKind.Method
                                : monaco.languages.CompletionItemKind.Function,
                            insertText: kw.insert,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: {
                                value: `**${icon} ${kw.cat}**\n\n${kw.doc}`
                            },
                            detail: `${icon} ${kw.cat}`,
                            range: range,
                            sortText: `0_${kw.cat}_${kw.label}`,
                        };
                    });
                return { suggestions };
            }
        });
    }

    // Register for all 3 supported languages
    createProvider('javascript');
    createProvider('python');
    createProvider('lua');
}

// ============ MONACO EDITOR INIT ============
function initSandboxEditor() {
    const container = document.getElementById('sandbox-editor');
    if (!container) return;

    if (typeof require !== 'undefined' && typeof require.config === 'function') {
        window.MonacoEnvironment = window.MonacoEnvironment || {};
        window.MonacoEnvironment.getWorkerUrl = function(workerId, label) {
            const baseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs';
            const workerScript = label === 'json' ? 'vs/language/json/jsonWorker' :
                                 label === 'css' || label === 'scss' ? 'vs/language/css/cssWorker' :
                                 label === 'html' || label === 'handlebars' || label === 'razor' ? 'vs/language/html/htmlWorker' :
                                 label === 'typescript' || label === 'javascript' ? 'vs/language/typescript/tsWorker' :
                                 'vs/editor/editor.worker';
            return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(
                "self.MonacoEnvironment = { baseUrl: '" + baseUrl + "' }; importScripts('" + baseUrl + "/" + workerScript + ".js');"
            );
        };

        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
        require(['vs/editor/editor.main'], function() {
            // Register autocomplete before creating the editor
            registerAutoComplete();

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
                suggestOnTriggerCharacters: true,
                quickSuggestions: { other: true, comments: true, strings: true },
                quickSuggestionsDelay: 50,
                wordBasedSuggestions: 'currentDocument',
                suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showFunctions: true,
                    preview: true,
                    filterGraceful: true,
                },
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
    if (lang === 'python' && !pyodideInstance && !pyodideLoading) initializePyodide();
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
            const Logic = {
                AND: (a, b) => Boolean(a && b),
                OR: (a, b) => Boolean(a || b),
                NOT: (a) => !a,
                NAND: (a, b) => !(a && b),
                NOR: (a, b) => !(a || b),
                XOR: (a, b) => Boolean(a) !== Boolean(b),
                XNOR: (a, b) => Boolean(a) === Boolean(b),
                IMPLIES: (p, q) => !p || q,
                IFF: (p, q) => p === q,
            };

            const Graph = (() => {
                const nodes = [];
                const edges = [];
                const addNode = (label = '') => {
                    const id = nodes.length;
                    nodes.push({ id, label });
                    return id;
                };
                const addEdge = (u, v) => {
                    edges.push([u, v]);
                    return edges;
                };
                const removeNode = (id) => {
                    const index = nodes.findIndex((node) => node.id === id);
                    if (index >= 0) nodes.splice(index, 1);
                    return nodes;
                };
                const removeEdge = (u, v) => {
                    const index = edges.findIndex((edge) => (edge[0] === u && edge[1] === v) || (edge[0] === v && edge[1] === u));
                    if (index >= 0) edges.splice(index, 1);
                    return edges;
                };
                const adjacencyList = () => nodes.map((node, i) => ({
                    node: node.id,
                    label: node.label,
                    neighbors: edges.reduce((list, edge) => {
                        if (edge[0] === i) list.push(edge[1]);
                        if (edge[1] === i) list.push(edge[0]);
                        return list;
                    }, []),
                }));
                const adjacencyMatrix = () => {
                    const matrix = Array.from({ length: nodes.length }, () => Array(nodes.length).fill(0));
                    edges.forEach(([u, v]) => {
                        if (u >= 0 && v >= 0 && u < nodes.length && v < nodes.length) {
                            matrix[u][v] = 1;
                            matrix[v][u] = 1;
                        }
                    });
                    return matrix;
                };
                const degree = (node) => edges.reduce((count, [u, v]) => count + ((u === node || v === node) ? 1 : 0), 0);
                const degreeSequence = () => nodes.map((_, i) => degree(i)).sort((a, b) => b - a);
                const bfs = (start) => {
                    const queue = [start];
                    const visited = new Set([start]);
                    const order = [];
                    while (queue.length) {
                        const u = queue.shift();
                        order.push(u);
                        edges.forEach(([x, y]) => {
                            const neighbor = x === u ? y : (y === u ? x : null);
                            if (neighbor !== null && !visited.has(neighbor)) {
                                visited.add(neighbor);
                                queue.push(neighbor);
                            }
                        });
                    }
                    return order;
                };
                const dfs = (start) => {
                    const visited = new Set();
                    const order = [];
                    const explore = (u) => {
                        if (visited.has(u)) return;
                        visited.add(u);
                        order.push(u);
                        edges.forEach(([x, y]) => {
                            const neighbor = x === u ? y : (y === u ? x : null);
                            if (neighbor !== null) explore(neighbor);
                        });
                    };
                    explore(start);
                    return order;
                };
                const isConnected = () => nodes.length === 0 || new Set(bfs(0)).size === nodes.length;
                const hasEulerPath = () => {
                    const oddCount = degreeSequence().filter((d) => d % 2 !== 0).length;
                    return isConnected() && (oddCount === 0 || oddCount === 2);
                };
                const hasEulerCircuit = () => {
                    const oddCount = degreeSequence().filter((d) => d % 2 !== 0).length;
                    return isConnected() && oddCount === 0;
                };
                const isTree = () => isConnected() && edges.length === nodes.length - 1;
                const isBipartite = () => {
                    const colors = Array(nodes.length).fill(null);
                    const queue = [];
                    for (let i = 0; i < nodes.length; i++) {
                        if (colors[i] !== null) continue;
                        colors[i] = 0;
                        queue.push(i);
                        while (queue.length) {
                            const u = queue.shift();
                            edges.forEach(([x, y]) => {
                                const neighbor = x === u ? y : (y === u ? x : null);
                                if (neighbor === null) return;
                                if (colors[neighbor] === null) {
                                    colors[neighbor] = 1 - colors[u];
                                    queue.push(neighbor);
                                } else if (colors[neighbor] === colors[u]) {
                                    return false;
                                }
                            });
                        }
                    }
                    return true;
                };
                return {
                    addNode,
                    addEdge,
                    removeNode,
                    removeEdge,
                    adjacencyList,
                    adjacencyMatrix,
                    degree,
                    degreeSequence,
                    bfs,
                    dfs,
                    isConnected,
                    hasEulerPath,
                    hasEulerCircuit,
                    isTree,
                    isBipartite,
                };
            })();

            const Set = {
                union: (A, B) => [...new Set([...(A || []), ...(B || [])])],
                intersect: (A, B) => (A || []).filter((x) => (B || []).includes(x)),
                difference: (A, B) => (A || []).filter((x) => !(B || []).includes(x)),
                symmetricDiff: (A, B) => [...new Set([...(A || []).filter((x) => !(B || []).includes(x)), ...(B || []).filter((x) => !(A || []).includes(x))])],
                cartesian: (A, B) => (A || []).flatMap((a) => (B || []).map((b) => [a, b])),
                powerSet: (A) => (A || []).reduce((result, value) => result.concat(result.map((set) => [...set, value])), [[]]),
                isSubset: (A, B) => (A || []).every((x) => (B || []).includes(x)),
                isSuperset: (A, B) => (B || []).every((x) => (A || []).includes(x)),
                complement: (A, U) => (U || []).filter((x) => !(A || []).includes(x)),
            };

            const Comb = {
                factorial: (n) => {
                    n = Number(n);
                    if (isNaN(n) || n < 0) return NaN;
                    let result = 1;
                    for (let i = 2; i <= n; i++) result *= i;
                    return result;
                },
                permutation: (n, r) => {
                    n = Number(n); r = Number(r);
                    if (isNaN(n) || isNaN(r) || r > n) return NaN;
                    let res = 1;
                    for (let i = n; i > n - r; i--) res *= i;
                    return res;
                },
                combination: (n, r) => {
                    n = Number(n); r = Number(r);
                    if (isNaN(n) || isNaN(r) || r > n) return NaN;
                    return Comb.permutation(n, r) / Comb.factorial(r);
                },
                binomial: (n) => {
                    const row = [];
                    for (let k = 0; k <= n; k++) row.push(Comb.combination(n, k));
                    return row;
                },
                pascal: (rows) => {
                    const triangle = [];
                    for (let i = 0; i < rows; i++) {
                        triangle[i] = [];
                        for (let j = 0; j <= i; j++) {
                            if (j === 0 || j === i) triangle[i][j] = 1;
                            else triangle[i][j] = triangle[i-1][j-1] + triangle[i-1][j];
                        }
                    }
                    return triangle;
                },
                derangement: (n) => {
                    n = Number(n);
                    if (n === 0) return 1;
                    if (n === 1) return 0;
                    return (n - 1) * (Comb.derangement(n - 1) + Comb.derangement(n - 2));
                },
                catalan: (n) => Comb.combination(2 * n, n) / (n + 1),
                stirling: (n, k) => {
                    n = Number(n); k = Number(k);
                    if (k > n) return 0;
                    const dp = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));
                    dp[0][0] = 1;
                    for (let i = 1; i <= n; i++) {
                        for (let j = 1; j <= k; j++) {
                            dp[i][j] = j * dp[i - 1][j] + dp[i - 1][j - 1];
                        }
                    }
                    return dp[n][k];
                },
            };

            const Bool = {
                evaluate: (expression, vars = {}) => {
                    const context = Object.keys(vars).map((name) => 'const ' + name + ' = ' + Boolean(vars[name]) + ';').join('\n');
                    return eval(context + '\nBoolean(' + expression + ')');
                },
                truthTable: (expression, variables = []) => {
                    const rows = 1 << variables.length;
                    for (let i = 0; i < rows; i++) {
                        const env = {};
                        variables.forEach((v, j) => env[v] = Boolean((i >> (variables.length - 1 - j)) & 1));
                        const line = variables.map((v) => v + '=' + Number(env[v])).join(' ');
                        console.log(line + ' => ' + Number(Bool.evaluate(expression, env)));
                    }
                },
                simplify: (expression) => expression,
                deMorgan: (expression) => expression.replace(/not\s*\(([^)]+)\)/gi, '(not $1)'),
                minterm: (index, variables = []) => {
                    const bits = index.toString(2).padStart(variables.length, '0');
                    return variables.map((v, i) => (bits[i] === '1' ? v : 'not ' + v)).join(' and ');
                },
                maxterm: (index, variables = []) => {
                    const bits = index.toString(2).padStart(variables.length, '0');
                    return variables.map((v, i) => (bits[i] === '0' ? v : 'not ' + v)).join(' or ');
                },
            };

            const Convert = {
                toBinary: (decimal) => Number(decimal).toString(2),
                toOctal: (decimal) => Number(decimal).toString(8),
                toHex: (decimal) => Number(decimal).toString(16).toUpperCase(),
                toDecimal: (value, fromBase) => parseInt(value, fromBase),
                baseToBase: (value, fromBase, toBase) => parseInt(value, fromBase).toString(toBase),
                twosComplement: (decimal, bits) => {
                    const num = Number(decimal);
                    const mask = (1 << bits) - 1;
                    return (num & mask).toString(2).padStart(bits, '0');
                },
            };

            const KMap = {
                solve: (minterms, nVars) => ({ minterms, vars: nVars }),
                primeImplicants: (minterms, nVars) => [],
                essentialPI: (minterms, nVars) => [],
                minimize: (expression) => expression,
            };

            const Relation = {
                isReflexive: (set, pairs) => (set || []).every((a) => (pairs || []).some(([x, y]) => x === a && y === a)),
                isSymmetric: (pairs) => (pairs || []).every(([x, y]) => (pairs || []).some(([u, v]) => u === y && v === x)),
                isTransitive: (pairs) => (pairs || []).every(([x, y]) => (pairs || []).every(([u, v]) => u === y ? (pairs || []).some(([p, q]) => p === x && q === v) : true)),
                isAntisymmetric: (pairs) => (pairs || []).every(([x, y]) => x === y || !(pairs || []).some(([u, v]) => u === y && v === x)),
                isEquivalence: (set, pairs) => Relation.isReflexive(set, pairs) && Relation.isSymmetric(pairs) && Relation.isTransitive(pairs),
                isPartialOrder: (set, pairs) => Relation.isReflexive(set, pairs) && Relation.isAntisymmetric(pairs) && Relation.isTransitive(pairs),
                closure: (pairs, type) => pairs,
            };

            Math.gcd = (a, b) => {
                a = Math.abs(a);
                b = Math.abs(b);
                while (b) [a, b] = [b, a % b];
                return a;
            };
            Math.lcm = (a, b) => Math.abs(a * b) / Math.gcd(a, b);
            Math.isPrime = (n) => {
                n = Number(n);
                if (n < 2) return false;
                for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
                return true;
            };
            Math.primeFactors = (n) => {
                n = Math.abs(Number(n));
                const factors = [];
                for (let i = 2; i * i <= n; i++) {
                    while (n % i === 0) {
                        factors.push(i);
                        n /= i;
                    }
                }
                if (n > 1) factors.push(n);
                return factors;
            };
            Math.eulerTotient = (n) => {
                n = Math.abs(Number(n));
                let result = n;
                for (let p = 2; p * p <= n; p++) {
                    if (n % p === 0) {
                        while (n % p === 0) n /= p;
                        result -= result / p;
                    }
                }
                if (n > 1) result -= result / n;
                return Math.round(result);
            };
            Math.modPow = (base, exp, mod) => {
                base = BigInt(base);
                exp = BigInt(exp);
                mod = BigInt(mod);
                let result = 1n;
                base %= mod;
                while (exp > 0) {
                    if (exp % 2n === 1n) result = (result * base) % mod;
                    exp /= 2n;
                    base = (base * base) % mod;
                }
                return Number(result);
            };
            Math.sieve = (n) => {
                n = Number(n);
                const isPrime = Array(n + 1).fill(true);
                isPrime[0] = isPrime[1] = false;
                for (let i = 2; i * i <= n; i++) if (isPrime[i]) for (let j = i * i; j <= n; j += i) isPrime[j] = false;
                return isPrime.map((v, i) => v ? i : -1).filter((x) => x > 0);
            };
            Math.extGcd = (a, b) => {
                a = Number(a);
                b = Number(b);
                if (b === 0) return { gcd: a, x: 1, y: 0 };
                const { gcd, x: x1, y: y1 } = Math.extGcd(b, a % b);
                return { gcd, x: y1, y: x1 - Math.floor(a / b) * y1 };
            };

            ${code}
        })
    `;
    const fn = eval(wrappedCode);
    await fn(fakeConsole, inspect);
}

// ============ PYTHON (PYODIDE) ============
async function initializePyodide() {
    pyodideLoading = true;
    const statusEl = document.getElementById('pyodide-status');
    if (statusEl) statusEl.textContent = '⏳ Loading Python (Pyodide)...';
    logToConsole('⏳ Loading Pyodide runtime...', 'system');

    try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });

        pyodideInstance = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
        if (statusEl) statusEl.textContent = '✅ Python Ready';
        logToConsole('✅ Pyodide loaded successfully!', 'success');
        setupPythonHelpers();
    } catch (e) {
        if (statusEl) statusEl.textContent = '❌ Python load failed';
        logToConsole('❌ Failed to load Pyodide: ' + e.message, 'error');
    }
    pyodideLoading = false;
}

function setupPythonHelpers() {
    if (!pyodideInstance) return;
    pyodideInstance.runPython(`
class Logic:
    @staticmethod
    def AND(a, b):
        return bool(a and b)
    @staticmethod
    def OR(a, b):
        return bool(a or b)
    @staticmethod
    def NOT(a):
        return not a
    @staticmethod
    def NAND(a, b):
        return not (a and b)
    @staticmethod
    def NOR(a, b):
        return not (a or b)
    @staticmethod
    def XOR(a, b):
        return bool(a) != bool(b)
    @staticmethod
    def XNOR(a, b):
        return bool(a) == bool(b)
    @staticmethod
    def IMPLIES(p, q):
        return (not p) or q
    @staticmethod
    def IFF(p, q):
        return p == q

class Graph:
    nodes = []
    edges = []

    @staticmethod
    def addNode(label=''):
        node_id = len(Graph.nodes)
        Graph.nodes.append({'id': node_id, 'label': label})
        return node_id

    @staticmethod
    def addEdge(u, v):
        Graph.edges.append((u, v))
        return Graph.edges

    @staticmethod
    def removeNode(node_id):
        Graph.nodes = [n for n in Graph.nodes if n['id'] != node_id]
        Graph.edges = [(u, v) for (u, v) in Graph.edges if u != node_id and v != node_id]
        return Graph.nodes

    @staticmethod
    def removeEdge(u, v):
        Graph.edges = [(x, y) for (x, y) in Graph.edges if not ((x == u and y == v) or (x == v and y == u))]
        return Graph.edges

    @staticmethod
    def adjacencyList():
        return [{
            'node': n['id'],
            'label': n['label'],
            'neighbors': [v if u == n['id'] else u for (u, v) in Graph.edges if u == n['id'] or v == n['id']]
        } for n in Graph.nodes]

    @staticmethod
    def adjacencyMatrix():
        size = len(Graph.nodes)
        matrix = [[0] * size for _ in range(size)]
        for (u, v) in Graph.edges:
            if 0 <= u < size and 0 <= v < size:
                matrix[u][v] = 1
                matrix[v][u] = 1
        return matrix

    @staticmethod
    def degree(node):
        return sum(1 for (u, v) in Graph.edges if u == node or v == node)

    @staticmethod
    def degreeSequence():
        return sorted([Graph.degree(i) for i in range(len(Graph.nodes))], reverse=True)

    @staticmethod
    def bfs(start):
        visited = {start}
        queue = [start]
        order = []
        while queue:
            u = queue.pop(0)
            order.append(u)
            for (x, y) in Graph.edges:
                neighbor = y if x == u else x if y == u else None
                if neighbor is not None and neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return order

    @staticmethod
    def dfs(start):
        visited = set()
        order = []
        def visit(u):
            if u in visited:
                return
            visited.add(u)
            order.append(u)
            for (x, y) in Graph.edges:
                neighbor = y if x == u else x if y == u else None
                if neighbor is not None:
                    visit(neighbor)
        visit(start)
        return order

    @staticmethod
    def isConnected():
        return len(Graph.nodes) == 0 or len(set(Graph.bfs(0))) == len(Graph.nodes)

    @staticmethod
    def hasEulerPath():
        odd = sum(1 for d in Graph.degreeSequence() if d % 2 != 0)
        return Graph.isConnected() and (odd == 0 or odd == 2)

    @staticmethod
    def hasEulerCircuit():
        return Graph.isConnected() and all(d % 2 == 0 for d in Graph.degreeSequence())

    @staticmethod
    def isTree():
        return Graph.isConnected() and len(Graph.edges) == len(Graph.nodes) - 1

    @staticmethod
    def isBipartite():
        color = {}
        for node in range(len(Graph.nodes)):
            if node in color:
                continue
            color[node] = 0
            queue = [node]
            while queue:
                u = queue.pop(0)
                for (x, y) in Graph.edges:
                    neighbor = y if x == u else x if y == u else None
                    if neighbor is None:
                        continue
                    if neighbor not in color:
                        color[neighbor] = 1 - color[u]
                        queue.append(neighbor)
                    elif color[neighbor] == color[u]:
                        return False
        return True

class Set:
    @staticmethod
    def union(A, B):
        return list(dict.fromkeys((A or []) + (B or [])))
    @staticmethod
    def intersect(A, B):
        return [x for x in (A or []) if x in (B or [])]
    @staticmethod
    def difference(A, B):
        return [x for x in (A or []) if x not in (B or [])]
    @staticmethod
    def symmetricDiff(A, B):
        return list(dict.fromkeys([x for x in (A or []) if x not in (B or [])] + [x for x in (B or []) if x not in (A or [])]))
    @staticmethod
    def cartesian(A, B):
        return [(a, b) for a in (A or []) for b in (B or [])]
    @staticmethod
    def powerSet(A):
        result = [[]]
        for x in (A or []):
            result += [subset + [x] for subset in result]
        return result
    @staticmethod
    def isSubset(A, B):
        return all(x in (B or []) for x in (A or []))
    @staticmethod
    def isSuperset(A, B):
        return all(x in (A or []) for x in (B or []))
    @staticmethod
    def complement(A, U):
        return [x for x in (U or []) if x not in (A or [])]

class Comb:
    @staticmethod
    def factorial(n):
        n = int(n)
        if n < 0:
            return None
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result
    @staticmethod
    def permutation(n, r):
        n = int(n)
        r = int(r)
        if r > n:
            return None
        result = 1
        for i in range(n, n - r, -1):
            result *= i
        return result
    @staticmethod
    def combination(n, r):
        return Comb.permutation(n, r) // Comb.factorial(r)
    @staticmethod
    def binomial(n):
        return [Comb.combination(n, k) for k in range(n + 1)]
    @staticmethod
    def pascal(rows):
        triangle = []
        for i in range(rows):
            row = [1] * (i + 1)
            for j in range(1, i):
                row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j]
            triangle.append(row)
        return triangle
    @staticmethod
    def derangement(n):
        n = int(n)
        if n == 0:
            return 1
        if n == 1:
            return 0
        return (n - 1) * (Comb.derangement(n - 1) + Comb.derangement(n - 2))
    @staticmethod
    def catalan(n):
        return Comb.combination(2 * n, n) // (n + 1)
    @staticmethod
    def stirling(n, k):
        n = int(n)
        k = int(k)
        if k > n:
            return 0
        dp = [[0] * (k + 1) for _ in range(n + 1)]
        dp[0][0] = 1
        for i in range(1, n + 1):
            for j in range(1, min(i, k) + 1):
                dp[i][j] = j * dp[i - 1][j] + dp[i - 1][j - 1]
        return dp[n][k]

class Bool:
    @staticmethod
    def evaluate(expression, vars=None):
        env = {} if vars is None else dict(vars)
        env.update({'True': True, 'False': False, 'None': None})
        return bool(eval(expression, {'__builtins__': {}}, env))
    @staticmethod
    def truthTable(expression, variables=None):
        if variables is None:
            variables = []
        rows = 1 << len(variables)
        for i in range(rows):
            env = {variables[j]: bool((i >> (len(variables) - 1 - j)) & 1) for j in range(len(variables))}
            print(' '.join(f"{v}={int(env[v])}" for v in variables) + ' => ' + str(int(Bool.evaluate(expression, env))))
    @staticmethod
    def simplify(expression):
        return expression
    @staticmethod
    def deMorgan(expression):
        return expression.replace('not(', '(not ')
    @staticmethod
    def minterm(index, variables=None):
        if variables is None:
            variables = []
        bits = bin(index)[2:].zfill(len(variables))
        return ' and '.join([v if bit == '1' else f'not {v}' for v, bit in zip(variables, bits)])
    @staticmethod
    def maxterm(index, variables=None):
        if variables is None:
            variables = []
        bits = bin(index)[2:].zfill(len(variables))
        return ' or '.join([v if bit == '0' else f'not {v}' for v, bit in zip(variables, bits)])

class Convert:
    @staticmethod
    def toBinary(decimal):
        return bin(int(decimal))[2:]
    @staticmethod
    def toOctal(decimal):
        return oct(int(decimal))[2:]
    @staticmethod
    def toHex(decimal):
        return hex(int(decimal))[2:].upper()
    @staticmethod
    def toDecimal(value, fromBase):
        return int(value, int(fromBase))
    @staticmethod
    def baseToBase(value, fromBase, toBase):
        dec = int(value, int(fromBase))
        t = int(toBase)
        if t == 2:
            return bin(dec)[2:]
        if t == 8:
            return oct(dec)[2:]
        if t == 10:
            return str(dec)
        if t == 16:
            return hex(dec)[2:].upper()
        return str(dec)
    @staticmethod
    def twosComplement(decimal, bits):
        value = int(decimal) & ((1 << int(bits)) - 1)
        return format(value, 'b').zfill(int(bits))
`);
}

async function runPython(code) {
    if (!pyodideInstance) {
        if (pyodideLoading) { logToConsole('⏳ Pyodide is still loading, please wait...', 'warn'); return; }
        await initializePyodide();
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
