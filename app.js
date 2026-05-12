// ============ NAVIGATION ============
document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => navigateTo(btn.dataset.section)));
document.querySelectorAll('.topic-card').forEach(card => card.addEventListener('click', () => navigateTo(card.dataset.goto)));

function navigateTo(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('section-' + id)?.classList.add('active');
    document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'graph' && typeof initGraphCanvas === 'function') initGraphCanvas();
    if (id === 'gates' && typeof renderGates === 'function') renderGates();
}

// ============ THEME ============
const themeBtn = document.getElementById('btn-theme');
function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('dm-theme', t);
}
themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    setTheme(cur === 'dark' ? 'light' : 'dark');
});
setTheme(localStorage.getItem('dm-theme') || 'dark');

// ============ EXPORT ============
function exportSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    // Use html2canvas-like approach: create a printable window
    const w = window.open('', '_blank');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    w.document.write(`<!DOCTYPE html><html><head><style>
        body{font-family:'Inter',sans-serif;padding:40px;background:${isDark?'#0a0a0f':'#fff'};color:${isDark?'#e8e8f0':'#1a1a2e'}}
        table{border-collapse:collapse;width:100%}th,td{border:1px solid ${isDark?'#333':'#ddd'};padding:8px;text-align:center}
        th{background:${isDark?'#1a1a2e':'#f0f0f5'}} .val-true{color:#34d399;font-weight:700} .val-false{color:#f87171;font-weight:700}
        .badge{display:inline-block;padding:3px 10px;border-radius:16px;font-size:13px;font-weight:600;margin:2px}
        .badge-yes{background:rgba(52,211,153,0.2);color:#22c55e} .badge-no{background:rgba(248,113,113,0.2);color:#ef4444}
        .value{font-size:24px;font-weight:700;color:#22d3ee;margin:10px 0;font-family:monospace}
        h2,h3{margin-bottom:12px} .detail{color:${isDark?'#aaa':'#555'};line-height:1.7}
    </style></head><body>${el.innerHTML}<hr><p style="color:#888;font-size:12px;margin-top:20px">Exported from Discrete Math Studio — ${new Date().toLocaleString()}</p></body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
}

function exportCanvas() {
    const canvas = document.getElementById('graph-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'graph-export.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

document.getElementById('btn-export').addEventListener('click', () => {
    const activeSection = document.querySelector('.section.active');
    const exportable = activeSection?.querySelector('[id^="exportable"]');
    if (exportable) exportSection(exportable.id);
    else if (activeSection?.id === 'section-graph') exportCanvas();
    else alert('ไม่มีข้อมูลให้ Export ในหน้านี้');
});

// ============ LOGIC ============
function calcLogic() {
    const nv = parseInt(document.getElementById('logic-vars').value);
    const op = document.getElementById('logic-op').value;
    const vn = ['p','q','r'].slice(0, nv);
    const rows = 1 << nv;
    const labels = {AND:vn.join('∧'),OR:vn.join('∨'),NOT:'¬p',IMPLIES:'p→q',IFF:'p↔q',XOR:'p⊕q',NAND:'¬('+vn.join('∧')+')',NOR:'¬('+vn.join('∨')+')'};
    const lb = labels[op];
    let h = `<div class="result-card"><h3>Truth Table: ${lb}</h3><table class="result-table"><thead><tr>`;
    vn.forEach(v => h += `<th>${v}</th>`); h += `<th>${lb}</th></tr></thead><tbody>`;
    for (let i = 0; i < rows; i++) {
        const v = []; for (let j = nv-1; j >= 0; j--) v.push(!!(i >> j & 1));
        let r; switch(op) {
            case'AND':r=v.every(x=>x);break;case'OR':r=v.some(x=>x);break;case'NOT':r=!v[0];break;
            case'IMPLIES':r=!v[0]||v[1];break;case'IFF':r=v[0]===v[1];break;case'XOR':r=v[0]!==v[1];break;
            case'NAND':r=!v.every(x=>x);break;case'NOR':r=!v.some(x=>x);break;
        }
        h+='<tr>';v.forEach(x=>h+=`<td class="${x?'val-true':'val-false'}">${x?'T':'F'}</td>`);
        h+=`<td class="${r?'val-true':'val-false'}">${r?'T':'F'}</td></tr>`;
    }
    h+='</tbody></table></div>';
    document.getElementById('result-logic').innerHTML=h;
}

// ============ SETS ============
function parseSet(s){if(!s.trim())return[];return[...new Set(s.split(',').map(x=>x.trim()).filter(x=>x))];}
function powerSet(a){const r=[[]];for(const e of a){const l=r.length;for(let i=0;i<l;i++)r.push([...r[i],e]);}return r;}

function calcSets() {
    const A=parseSet(document.getElementById('set-a').value),B=parseSet(document.getElementById('set-b').value);
    const op=document.getElementById('set-op').value;let result='',detail='';
    switch(op){
        case'union':{const r=[...new Set([...A,...B])];result=`{${r.join(', ')}}`;detail=`|A∪B|=${r.length}`;break;}
        case'intersect':{const r=A.filter(x=>B.includes(x));result=`{${r.join(', ')}}`;detail=`|A∩B|=${r.length}`;break;}
        case'diff':{const r=A.filter(x=>!B.includes(x));result=`{${r.join(', ')}}`;detail=`|A−B|=${r.length}`;break;}
        case'symdiff':{const r=[...A.filter(x=>!B.includes(x)),...B.filter(x=>!A.includes(x))];result=`{${r.join(', ')}}`;detail=`|A△B|=${r.length}`;break;}
        case'cartesian':{const p=[];A.forEach(a=>B.forEach(b=>p.push(`(${a},${b})`)));result=`{${p.join(', ')}}`;detail=`|A×B|=${p.length}`;break;}
        case'powerset':{const ps=powerSet(A);result='{'+ps.map(s=>'{'+s.join(',')+'}').join(', ')+'}';detail=`|P(A)|=2^${A.length}=${ps.length}`;break;}
        case'subset':{const is=A.every(x=>B.includes(x));result=is?'YES ✅':'NO ❌';detail=is?'A⊆B':'ไม่อยู่ใน B: {'+A.filter(x=>!B.includes(x)).join(',')+'}';break;}
    }
    document.getElementById('result-sets').innerHTML=`<div class="result-card"><h3>ผลลัพธ์</h3><div class="value">${result}</div><div class="detail">${detail}</div></div>`;
}

// ============ COMBINATORICS ============
function factorial(n){if(n<=1)return 1;let r=1;for(let i=2;i<=n;i++)r*=i;return r;}

function calcCombinatorics() {
    const n=parseInt(document.getElementById('comb-n').value),r=parseInt(document.getElementById('comb-r').value);
    const op=document.getElementById('comb-op').value;let res='',det='';
    switch(op){
        case'factorial':res=factorial(n).toLocaleString();det=`${n}!`;break;
        case'perm':{const v=factorial(n)/factorial(n-r);res=v.toLocaleString();det=`P(${n},${r})=${n}!/(${n}-${r})!=${v}`;break;}
        case'comb':{const v=factorial(n)/(factorial(r)*factorial(n-r));res=v.toLocaleString();det=`C(${n},${r})=${v}`;break;}
        case'binomial':{let t=[];for(let k=0;k<=n;k++){const c=factorial(n)/(factorial(k)*factorial(n-k));const xp=n-k;let s='';if(c!==1||xp===0)s+=c;if(xp>0)s+='x'+(xp>1?'^'+xp:'');t.push(s);}res=t.join(' + ');det=`(1+x)^${n}`;break;}
    }
    document.getElementById('result-comb').innerHTML=`<div class="result-card"><h3>ผลลัพธ์</h3><div class="value">${res}</div><div class="detail">${det}</div></div>`;
}

// ============ NUMBER THEORY ============
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;}
function isPrime(n){if(n<2)return false;if(n<4)return true;if(n%2===0||n%3===0)return false;for(let i=5;i*i<=n;i+=6)if(n%i===0||n%(i+2)===0)return false;return true;}
function primeFactors(n){const f=[];let d=2;while(d*d<=n){while(n%d===0){f.push(d);n/=d;}d++;}if(n>1)f.push(n);return f;}
function eulerTotient(n){let r=n,m=n;for(let p=2;p*p<=m;p++){if(m%p===0){while(m%p===0)m/=p;r-=r/p;}}if(m>1)r-=r/m;return Math.round(r);}

function calcNumberTheory() {
    const a=parseInt(document.getElementById('nt-a').value),b=parseInt(document.getElementById('nt-b').value);
    const op=document.getElementById('nt-op').value;let res='',det='';
    switch(op){
        case'gcd':{let x=Math.abs(a),y=Math.abs(b);const steps=[];while(y){steps.push(`${x}=${Math.floor(x/y)}×${y}+${x%y}`);[x,y]=[y,x%y];}res=x.toString();det='<ol class="step-list">'+steps.map(s=>'<li>'+s+'</li>').join('')+'</ol>';break;}
        case'lcm':res=(Math.abs(a*b)/gcd(a,b)).toString();det=`|${a}×${b}|/GCD=${res}`;break;
        case'mod':res=((a%b+b)%b).toString();det=`${a} mod ${b}`;break;
        case'totient':{const t=eulerTotient(a);const cp=[];for(let i=1;i<=a;i++)if(gcd(i,a)===1)cp.push(i);res=t.toString();det=`Coprimes: {${cp.join(',')}}`;break;}
        case'prime':res=isPrime(a)?'YES ✅ Prime':'NO ❌ Not Prime';if(!isPrime(a)&&a>1)det=primeFactors(a).join('×');break;
        case'factor':{const f=primeFactors(a);res=f.join('×');const c={};f.forEach(p=>c[p]=(c[p]||0)+1);det=Object.entries(c).map(([p,n])=>n>1?p+'^'+n:p).join('×');break;}
    }
    document.getElementById('result-nt').innerHTML=`<div class="result-card"><h3>ผลลัพธ์</h3><div class="value">${res}</div><div class="detail">${det}</div></div>`;
}

// ============ RELATIONS ============
function calcRelations() {
    const setA=parseSet(document.getElementById('rel-set').value);
    const pairs=document.getElementById('rel-pairs').value.trim().split(';').map(p=>{const[a,b]=p.split(',').map(s=>s.trim());return[a,b];}).filter(p=>p[0]&&p[1]);
    const ps=new Set(pairs.map(p=>p[0]+','+p[1]));
    const refl=setA.every(a=>ps.has(a+','+a));
    const sym=pairs.every(([a,b])=>ps.has(b+','+a));
    let trans=true;for(const[a,b]of pairs)for(const[c,d]of pairs)if(b===c&&!ps.has(a+','+d))trans=false;
    const anti=pairs.every(([a,b])=>a===b||!ps.has(b+','+a));
    const eq=refl&&sym&&trans,po=refl&&anti&&trans;
    const badge=(v,l)=>`<span class="badge ${v?'badge-yes':'badge-no'}">${v?'✅':'❌'} ${l}</span>`;
    document.getElementById('result-rel').innerHTML=`<div class="result-card"><h3>Properties</h3>
        <p>${badge(refl,'Reflexive')}</p><p>${badge(sym,'Symmetric')}</p><p>${badge(trans,'Transitive')}</p><p>${badge(anti,'Antisymmetric')}</p>
        <hr style="border-color:var(--border);margin:12px 0"><p>${badge(eq,'Equivalence Relation')}</p><p>${badge(po,'Partial Order')}</p></div>`;
}

// ============ BOOLEAN ============
function calcBoolean() {
    const nv=parseInt(document.getElementById('bool-vars').value);
    const expr=document.getElementById('bool-expr').value.trim();if(!expr)return;
    const vn=['x','y','z'].slice(0,nv);const rows=1<<nv;
    let h=`<div class="result-card"><h3>Truth Table</h3><table class="result-table"><thead><tr>`;
    vn.forEach(v=>h+=`<th>${v}</th>`);h+='<th>Result</th></tr></thead><tbody>';
    for(let i=0;i<rows;i++){
        const vals={};for(let j=nv-1;j>=0;j--)vals[vn[nv-1-j]]=(i>>j)&1?true:false;
        let ev=expr;vn.forEach(v=>ev=ev.replace(new RegExp('\\b'+v+'\\b','g'),vals[v]?'true':'false'));
        ev=ev.replace(/&/g,'&&').replace(/\|/g,'||').replace(/\^/g,'!==');
        let r;try{r=Boolean(eval(ev));}catch(e){document.getElementById('result-bool').innerHTML='<div class="result-card"><h3>❌ Error</h3></div>';return;}
        h+='<tr>';vn.forEach(v=>{const x=vals[v];h+=`<td class="${x?'val-true':'val-false'}">${x?1:0}</td>`;});
        h+=`<td class="${r?'val-true':'val-false'}">${r?1:0}</td></tr>`;
    }
    h+='</tbody></table></div>';document.getElementById('result-bool').innerHTML=h;
}

// ============ INIT ============
calcLogic();
