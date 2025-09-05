
import { auth, onAuthStateChanged, colRelatorios, query, where, getDocs } from './firebase.js';

onAuthStateChanged(auth, (user)=>{ if(!user) location.href='index.html'; });

function toYMD(dt){
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,'0');
  const d = String(dt.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function setDefaultMonth(){
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const el = document.getElementById('mesInputMes');
  if(el) el.value = ym;
}

async function fetchMonthData(ym){
  const [y,m] = ym.split('-').map(n=>parseInt(n,10));
  const from = new Date(y, m-1, 1);
  const to = new Date(y, m-0, 1);
  const q1 = query(colRelatorios, where('data','>=', toYMD(from)), where('data','<', toYMD(to)));
  const snap = await getDocs(q1);
  let simples=0,hig=0,exc=0,total=0;
  snap.forEach(doc=>{
    const t = doc.data().tipo;
    if(t==='Lavagem Simples') simples++;
    else if(t==='Higienização') hig++;
    else exc++;
    total++;
  });
  return { simples, hig, exc, total };
}

let chart;
async function drawChart(){
  const ym = document.getElementById('mesInputMes').value;
  const data = await fetchMonthData(ym);
  const ctx = document.getElementById('chartMes');
  const totalLbl = document.getElementById('totalLavagensMes');
  if(totalLbl) totalLbl.textContent = `Total de lavagens no mês: ${data.total}`;
  if(window.Chart && ctx){
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Simples','Higienização','Exceções'],
        datasets: [{
          label: 'Lavagens',
          data: [data.simples, data.hig, data.exc],
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'start',
            formatter: (v)=> v>0 ? v : '',
            font: { weight: 'bold' }
          },
          legend: { display:false }
        },
        scales: { y:{ beginAtZero:true, ticks:{ precision:0 } } }
      },
      plugins: [ChartDataLabels]
    });
  }
  // attach export handler with latest data
  const btn = document.getElementById('btnExportPptMes');
  if(btn){
    btn.onclick = async ()=>{
      const pptx = new PptxGenJS();
      const slide = pptx.addSlide();
      slide.addText(`Lavagens – ${ym}`, { x:0.5, y:0.5, fontSize:22, bold:true });
      const chartData = [
        { name:'Simples', labels:['Simples','Higienização','Exceções'], values:[data.simples, data.hig, data.exc] }
      ];
      slide.addChart(pptx.ChartType.bar, chartData, { x:0.5, y:1.2, w:9, h:4 });
      slide.addText(`Total: ${data.total}`, { x:0.5, y:5.3, fontSize:16, bold:true });
      await pptx.writeFile({ fileName: `lavagens-${ym}.pptx` });
    };
  }
}

document.getElementById('btnAtualizarMes').addEventListener('click', drawChart);
document.addEventListener('DOMContentLoaded', ()=>{ setDefaultMonth(); drawChart(); });
