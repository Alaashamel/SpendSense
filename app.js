const categories = [
  {name:'Housing', color:'#9cff39'}, {name:'Food', color:'#76d9ff'}, {name:'Transport', color:'#ffd889'},
  {name:'Subscriptions', color:'#c39bff'}, {name:'Shopping', color:'#ff8db3'}, {name:'Health', color:'#7dffcc'}, {name:'Learning', color:'#ffb86b'}
];
const sample = [
  ['Rent','Housing',850,'2026-06-01','Monthly apartment rent'], ['Groceries','Food',96.75,'2026-06-02','Weekly market'],
  ['Uber rides','Transport',34.2,'2026-06-03','Meetings'], ['Frontend course','Learning',49.99,'2026-06-04','Skill investment'],
  ['Gym','Health',30,'2026-06-05','Monthly'], ['Coffee meetings','Food',18.5,'2026-06-07','Client meeting'],
  ['Cloud subscription','Subscriptions',24,'2026-06-09','Deployment'], ['New keyboard','Shopping',120,'2026-06-10','Work setup']
].map(([title,category,amount,date,note],i)=>({id:`sample-${i}`,title,category,amount,date,note}));
const KEY='spendsense.transactions.v1', BUDGET='spendsense.budget.v1';
let transactions = load(KEY, []);
const $ = id => document.getElementById(id);
function load(key, fallback){ try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback} }
function save(){ localStorage.setItem(KEY, JSON.stringify(transactions)); }
function money(n){ return `$${Number(n||0).toFixed(2)}`; }
function round(n){ return Number(Number(n||0).toFixed(2)); }
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000); }
function today(){ return new Date().toISOString().slice(0,10); }
function parseLocal(d){ return new Date(`${d}T00:00:00`); }
function filtered(){
  const period = $('periodFilter').value; const now = new Date();
  return transactions.filter(t=>{
    const d=parseLocal(t.date);
    if(period==='month') return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    if(period==='week'){ const diff=(now-d)/(1000*60*60*24); return diff>=0 && diff<=7; }
    return true;
  });
}
function aggregate(list){
  return list.reduce((acc,t)=>{ acc.total=round(acc.total+t.amount); acc.byCat[t.category]=round((acc.byCat[t.category]||0)+t.amount); return acc; },{total:0,byCat:{}});
}
function render(){
  const list = filtered(); const data=aggregate(list); const entries=Object.entries(data.byCat).sort((a,b)=>b[1]-a[1]);
  $('totalSpent').textContent=money(data.total); $('donutTotal').textContent=money(data.total); $('transactionCount').textContent=list.length;
  $('periodLabel').textContent = $('periodFilter').selectedOptions[0].textContent;
  $('topCategory').textContent = entries[0]?.[0] || '—'; $('topCategoryValue').textContent = entries[0] ? money(entries[0][1]) : 'No data yet';
  const days = Math.max(1, new Set(list.map(t=>t.date)).size); $('dailyAvg').textContent = money(data.total / days);
  renderBars(entries, data.total); renderDonut(entries, data.total); renderTable(); renderBudget(data.total); renderInsights(entries, data.total);
}
function colorFor(cat){ return categories.find(c=>c.name===cat)?.color || '#9cff39'; }
function renderBars(entries,total){
  $('categoryBars').innerHTML = entries.map(([cat,val])=>{ const p= total ? Math.round((val/total)*100) : 0; return `<div class="bar-row"><div class="bar-meta"><span>${cat}</span><span>${money(val)} • ${p}%</span></div><div class="track"><div class="fill" style="width:${p}%;background:linear-gradient(90deg,${colorFor(cat)},#76d9ff)"></div></div></div>`; }).join('') || `<p class="insight">Add transactions to build your report.</p>`;
}
function renderDonut(entries,total){
  const svg=$('donutChart'); svg.innerHTML=''; const cx=110, cy=110, r=76, c=2*Math.PI*r; let offset=0;
  const bg=document.createElementNS('http://www.w3.org/2000/svg','circle'); bg.setAttribute('cx',cx); bg.setAttribute('cy',cy); bg.setAttribute('r',r); bg.setAttribute('stroke','rgba(255,255,255,.08)'); svg.appendChild(bg);
  entries.forEach(([cat,val])=>{ const portion=total?val/total:0; const circle=document.createElementNS('http://www.w3.org/2000/svg','circle'); circle.setAttribute('cx',cx); circle.setAttribute('cy',cy); circle.setAttribute('r',r); circle.setAttribute('stroke',colorFor(cat)); circle.setAttribute('stroke-dasharray',`${portion*c} ${c}`); circle.setAttribute('stroke-dashoffset',-offset); svg.appendChild(circle); offset += portion*c; });
}
function renderTable(){
  const q=$('searchInput').value.toLowerCase();
  const rows = filtered().filter(t=>`${t.title} ${t.category} ${t.note}`.toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
  $('transactionsTable').innerHTML = rows.map(t=>`<tr><td><strong>${t.title}</strong><small>${t.note||'No note'}</small></td><td><span class="pill">${t.category}</span></td><td>${t.date}</td><td><strong>${money(t.amount)}</strong></td><td><button class="delete" data-id="${t.id}">Delete</button></td></tr>`).join('') || `<tr><td colspan="5">No transactions found.</td></tr>`;
}
function renderBudget(monthTotal){
  const budget=Number($('budgetInput').value||0); localStorage.setItem(BUDGET, JSON.stringify(budget));
  const percent=budget?Math.min(999,Math.round((monthTotal/budget)*100)):0; $('budgetPercent').textContent=`${percent}%`; $('budgetFill').style.width=`${Math.min(100,percent)}%`;
  $('budgetMessage').textContent = !budget ? 'Set a budget limit.' : percent < 70 ? 'Healthy spending zone.' : percent <= 100 ? 'Close to your limit.' : 'Budget exceeded. Review top categories.';
}
function renderInsights(entries,total){
  const top=entries[0]; const second=entries[1]; const food=entries.find(([c])=>c==='Food')?.[1]||0;
  const insights=[];
  if(top) insights.push(`Highest spending is <strong>${top[0]}</strong> at ${money(top[1])}, representing ${Math.round(top[1]/total*100)}% of the active period.`);
  if(second) insights.push(`${second[0]} is the second biggest category. Compare it against ${top[0]} before cutting smaller items.`);
  if(food>0) insights.push(`Food spending average impact is ${money(food)}. Meal planning can reduce this without damaging productivity.`);
  $('insights').innerHTML = insights.map(x=>`<div class="insight">${x}</div>`).join('') || `<div class="insight">Insights will appear after adding expenses.</div>`;
}
$('category').innerHTML = categories.map(c=>`<option>${c.name}</option>`).join(''); $('date').value=today(); $('budgetInput').value = load(BUDGET,1500);
$('expenseForm').addEventListener('submit',e=>{e.preventDefault(); transactions.unshift({id:Date.now().toString(36),title:$('title').value.trim(),amount:round($('amount').value),category:$('category').value,date:$('date').value,note:$('note').value.trim()}); save(); e.target.reset(); $('date').value=today(); render(); toast('Expense added');});
$('transactionsTable').addEventListener('click',e=>{const btn=e.target.closest('[data-id]'); if(!btn)return; transactions=transactions.filter(t=>t.id!==btn.dataset.id); save(); render(); toast('Transaction deleted');});
$('periodFilter').addEventListener('change',render); $('searchInput').addEventListener('input',render); $('budgetInput').addEventListener('input',()=>renderBudget(aggregate(filtered()).total));
$('sampleBtn').addEventListener('click',()=>{transactions=sample; save(); render(); toast('Sample data loaded');});
$('clearBtn').addEventListener('click',()=>{if(confirm('Clear all transactions?')){transactions=[]; save(); render(); toast('Data cleared');}});
$('exportBtn').addEventListener('click',()=>{const header='title,category,amount,date,note\n'; const csv=header+transactions.map(t=>[t.title,t.category,t.amount,t.date,t.note].map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='spendsense-expenses.csv'; a.click(); URL.revokeObjectURL(a.href);});
render();
