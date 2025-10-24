let registros = JSON.parse(localStorage.getItem("horasExtras")) || [];
const valorHoraBase = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--valorHora'));

function salvarLocal() {
  localStorage.setItem("horasExtras", JSON.stringify(registros));
}

function adicionar() {
  const data = document.getElementById("data").value;
  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;
  const natureza = document.getElementById("natureza").value.trim();
  const tipo = document.getElementById("tipoHora").value;

  if (!data || !inicio || !fim || !natureza) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  const horas = calcularHoras(inicio, fim);

  registros.push({ data, inicio, fim, natureza, tipo, horas });
  salvarLocal();
  mostrarRegistros();

  document.getElementById("data").value = "";
  document.getElementById("inicio").value = "";
  document.getElementById("fim").value = "";
  document.getElementById("natureza").value = "";
}

function calcularHoras(inicio, fim) {
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fim.split(":").map(Number);
  let total = (hf + mf/60) - (hi + mi/60);
  if(total<0) total+=24;
  return total;
}

function remover(index) {
  registros.splice(index,1);
  salvarLocal();
  mostrarRegistros();
}

function limparTudo() {
  if(confirm("Tem certeza que deseja apagar todos os registros?")) {
    registros = [];
    salvarLocal();
    mostrarRegistros();
  }
}

function mostrarRegistros() {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  const filtroTipo = document.getElementById("filtroTipo").value;
  const filtroData = document.getElementById("filtroData").value;

  const filtrados = registros.filter(r => {
    return (filtroTipo === "todos" || r.tipo === filtroTipo) &&
           (!filtroData || r.data === filtroData);
  });

  filtrados.forEach((r, i)=>{
    const card = document.createElement("div");
    card.className = `card ${r.tipo}`;
    const valor = r.tipo==='normal'?r.horas*valorHoraBase*0.5:r.horas*valorHoraBase;
    card.innerHTML = `
      <h3>${r.data} ${r.tipo==='domingo'?'🌞':'⏰'}</h3>
      <p><strong>Natureza:</strong> ${r.natureza}</p>
      <p><strong>Tipo:</strong> ${r.tipo==='domingo'?'Domingo/Feriado':'Dia normal'}</p>
      <p><strong>Horário:</strong> ${r.inicio} - ${r.fim}</p>
      <p><strong>Horas:</strong> ${r.horas.toFixed(2)}h</p>
      <p><strong>Valor:</strong> R$ ${valor.toFixed(2)}</p>
      <button class="remove-btn" onclick="remover(${i})">🗑️</button>
    `;
    container.appendChild(card);
    setTimeout(()=>card.classList.add("show"),50);
  });

  atualizarTotais();
  atualizarGrafico();
}

function atualizarTotais() {
  const totalHoras = registros.reduce((a,b)=>a+b.horas,0);
  const totalValor = registros.reduce((a,b)=>a+(b.tipo==='normal'?b.horas*valorHoraBase*0.5:b.horas*valorHoraBase),0);
  document.getElementById("totalHoras").innerText = `🕒 Total: ${totalHoras.toFixed(2)}h`;
  document.getElementById("totalValor").innerText = `💰 Valor: R$ ${totalValor.toFixed(2)}`;
}

/* EXPORTAÇÃO EXCEL */
function exportExcel(){
  if(!registros.length){ alert("Nenhum registro para exportar!"); return; }

  let csvContent = "data:text/csv;charset=utf-8,Data,Início,Fim,Natureza,Tipo,Horas,Valor\n";
  registros.forEach(r=>{
    const valor = r.tipo==='normal'?r.horas*valorHoraBase*0.5:r.horas*valorHoraBase;
    csvContent += `${r.data},${r.inicio},${r.fim},"${r.natureza}",${r.tipo},${r.horas.toFixed(2)},${valor.toFixed(2)}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "horas_extras_avancado.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* EXPORTAÇÃO PDF AVANÇADO */
function exportPDFAvancado(){
  if(!registros.length){ alert("Nenhum registro para exportar!"); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Controle de Horas Extras Avançado",105,15,{align:"center"});
  doc.setFontSize(12);

  let y=25;
  doc.text("Data  Início  Fim  Natureza  Tipo  Horas  Valor",12,y); y+=8;

  registros.forEach(r=>{
    const valor = r.tipo==='normal'?r.horas*valorHoraBase*0.5:r.horas*valorHoraBase;
    doc.text(`${r.data}  ${r.inicio}  ${r.fim}  ${r.natureza}  ${r.tipo==='domingo'?'Dom/Fer':'Normal'}  ${r.horas.toFixed(2)}  ${valor.toFixed(2)}`,12,y);
    y+=8;
    if(y>280){ doc.addPage(); y=20; }
  });

  const totalHoras = registros.reduce((a,b)=>a+b.horas,0);
  const totalValor = registros.reduce((a,b)=>a+(b.tipo==='normal'?b.horas*valorHoraBase*0.5:b.horas*valorHoraBase),0);
  y+=10;
  doc.text(`🕒 Total: ${totalHoras.toFixed(2)}h    💰 Valor: R$ ${totalValor.toFixed(2)}`,105,y,{align:"center"});
  doc.save("horas_extras_avancado.pdf");
}

/* GRÁFICO INTERATIVO */
let grafico;
function atualizarGrafico(){
  const ctx = document.getElementById('graficoHoras').getContext('2d');
  const normalHoras = registros.filter(r=>r.tipo==='normal').reduce((a,b)=>a+b.horas,0);
  const domingoHoras = registros.filter(r=>r.tipo==='domingo').reduce((a,b)=>a+b.horas,0);

  const data = {
    labels: ['Dia normal ⏰','Domingo/Feriado 🌞'],
    datasets:[{
      label:'Horas acumuladas',
      data:[normalHoras,domingoHoras],
      backgroundColor:['#4a90e2','#ff9800']
    }]
  };

  if(grafico) grafico.destroy();
  grafico = new Chart(ctx,{
    type:'bar',
    data:data,
    options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
  });
}

mostrarRegistros();
