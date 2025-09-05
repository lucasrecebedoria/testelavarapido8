
import { auth, onAuthStateChanged, signOut, colRelatorios, query, where, getDocs } from './firebase.js';

onAuthStateChanged(auth, (user)=>{ if(!user) location.href='index.html'; });
document.getElementById('btnLogout')?.addEventListener('click', ()=> signOut(auth));

function toYMD(dt){
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,'0');
  const d = String(dt.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function setDefaultMonth(){
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const el = document.getElementById('mesInput');
  if(el) el.value = ym;
}

async function loadMonthly(){
  const ym = document.getElementById('mesInput').value;
  const [y,m] = ym.split('-').map(n=>parseInt(n,10));
  const from = new Date(y, m-1, 1);
  const to = new Date(y, m-0, 1);
  const q1 = query(colRelatorios, where('data','>=', toYMD(from)), where('data','<', toYMD(to)));
  const snap = await getDocs(q1);
  const tbody = document.querySelector('#tabelaMensal tbody');
  tbody.innerHTML = '';
  snap.forEach(docsnap=>{
    const d = docsnap.data();
    const created = d.created_at ? (typeof d.created_at.toDate === 'function' ? d.created_at.toDate() : new Date(d.created_at)) : new Date();
    const tr = document.createElement('tr');
    const tipoHTML = d.tipo === 'Lavagem Simples' ? '<span class="badge badge-yellow">Simples</span>'
                    : (d.tipo==='Higienização' ? '<span class="badge badge-lightgreen">Higienização</span>'
                    : '<span class="badge badge-pink">Exceções</span>');
    tr.innerHTML = `<td>${d.data}</td><td>${created.toLocaleTimeString('pt-BR',{hour12:false})}</td><td>${d.prefixo}</td><td>${tipoHTML}</td><td>${d.user_matricula||''}</td>`;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{ setDefaultMonth(); loadMonthly(); });
document.getElementById('mesInput').addEventListener('change', loadMonthly);

// Export helpers
document.getElementById('btnMonthlyPdf')?.addEventListener('click', async ()=>{
  const el = document.querySelector('#tabelaMensal');
  const { jsPDF } = window.jspdf;
  const canvas = await html2canvas(el);
  const pdf = new jsPDF('p','pt','a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 40;
  const imgHeight = canvas.height * imgWidth / canvas.width;
  pdf.addImage(canvas.toDataURL('image/png'),'PNG',20,20,imgWidth,imgHeight);
  pdf.save('relatorio-mensal.pdf');
});
document.getElementById('btnMonthlyExcel')?.addEventListener('click', ()=>{
  const el = document.querySelector('#tabelaMensal');
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(el);
  XLSX.utils.book_append_sheet(wb, ws, 'Mensal');
  XLSX.writeFile(wb, 'relatorio-mensal.xlsx');
});
