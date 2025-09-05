
import { auth, onAuthStateChanged, colRelatorios, query, where, getDocs } from './firebase.js';

onAuthStateChanged(auth, (user)=>{ if(!user) location.href='index.html'; });

function setDefaultMonth(){
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const el = document.getElementById('mesInputCmp');
  if(el) el.value = ym;
}

function toYMD(dt){
  const y=dt.getFullYear(), m=String(dt.getMonth()+1).padStart(2,'0'), d=String(dt.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function weekOfMonth(dateStr){
  const [y,m,d] = dateStr.split('-').map(n=>parseInt(n,10));
  const dt = new Date(y, m-1, d);
  const firstDay = new Date(y, m-1, 1).getDay(); // 0..6
  // Convert Sunday=0 to Monday-based index
  const offset = (firstDay+6)%7;
  return Math.floor((d + offset - 1)/7) + 1; // 1..6
}

async function loadChart(){
  const ym = document.getElementById('mesInputCmp').value;
  const [y,m] = ym.split('-').map(n=>parseInt(n,10));
  const from = new Date(y, m-1, 1);
  const to = new Date(y, m-0, 1);
  const q1 = query(colRelatorios, where('data','>=', toYMD(from)), where('data','<', toYMD(to)));
  const snap = await getDocs(q1);
  const byWeek = new Map(); // week -> {simples,hig,exc}
  let totalAll = 0;
  snap.forEach(doc=>{
    const d = doc.data();
    const w = weekOfMonth(d.data);
    if(!byWeek.has(w)) byWeek.set(w, { simples:0, hig:0, exc:0 });
    if(d.tipo==='Lavagem Simples') byWeek.get(w).simples++;
    else if(d.tipo==='Higienização') byWeek.get(w).hig++;
    else byWeek.get(w).exc++;
    totalAll++;
  });
  const weeks = Array.from(byWeek.keys()).sort((a,b)=>a-b);
  const labels = weeks.map(w=>`Semana ${w}`);
  const simples = weeks.map(w=>byWeek.get(w).simples);
  const hig = weeks.map(w=>byWeek.get(w).hig);
  const exc = weeks.map(w=>byWeek.get(w).exc);

  const ctx = document.getElementById('chartCmp');
  if(window._cmpChart) window._cmpChart.destroy();
  window._cmpChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels,
      datasets:[
        { label:'Simples', data: simples, barThickness: 16 },
        { label:'Higienização', data: hig, barThickness: 16 },
        { label:'Exceções', data: exc, barThickness: 16 }
      ]
    },
    options:{
      responsive:true,
      plugins:{ 
        datalabels:{ anchor:'end', align:'start', formatter:(v)=> v>0?v:"", font:{weight:'bold'} } 
      },
      scales:{ y:{ beginAtZero:true, ticks:{ precision:0 } } }
    },
    plugins:[ChartDataLabels]
  });
  const totalEl = document.getElementById('totalLavagensCmp');
  if(totalEl) totalEl.textContent = `Total de lavagens no mês: ${totalAll}`;
}

document.getElementById('mesInputCmp').addEventListener('change', loadChart);
document.addEventListener('DOMContentLoaded', ()=>{ setDefaultMonth(); loadChart(); });
