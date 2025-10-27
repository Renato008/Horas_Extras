let registros = JSON.parse(localStorage.getItem("horasExtras")) || [];
const valorHoraBase = 8.11;

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
  let total = (hf + mf / 60) - (hi + mi / 60);
  if (total < 0) total += 24;
  return total;
}

/* ✅ Data formato BR com dia da semana */
function formatarDataBR(dataISO) {
  const diasSemana = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"
  ];

  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const dataObj = new Date(ano, mes - 1, dia);

  const diaSemana = diasSemana[dataObj.getDay()];

  return `${diaSemana} — ${dia}/${mes}/${ano}`;
}

function remover(index) {
  registros.splice(index, 1);
  salvarLocal();
  mostrarRegistros();
}

function limparTudo() {
  if (confirm("Tem certeza que deseja apagar todos os registros?")) {
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

  filtrados.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = `card ${r.tipo}`;
    const valor = r.tipo === 'normal' ? r.horas * valorHoraBase * 0.5 : r.horas * valorHoraBase;

    card.innerHTML = `
      <h3>${r.tipo === 'domingo' ? '🌞 Domingo / Feriado' : '⏰ Dia Normal'}</h3>
      <p><strong> Data:</strong> ${formatarDataBR(r.data)}</p>
      <p><strong> Horário:</strong> ${r.inicio} - ${r.fim}</p>
      <p><strong>Horas:</strong> ${r.horas.toFixed(2)}h</p>
      <p><strong>Valor:</strong> R$ ${valor.toFixed(2)}</p>
      <button class="remove-btn" onclick="remover(${i})">🗑️</button>
    `;
    container.appendChild(card);
    setTimeout(() => card.classList.add("show"), 50);
  });

  atualizarTotais();
  atualizarGrafico();
}

function atualizarTotais() {
  const totalHoras = registros.reduce((a, b) => a + b.horas, 0);
  const totalValor = registros.reduce((a, b) => a + (b.tipo === 'normal' ? b.horas * valorHoraBase * 0.5 : b.horas * valorHoraBase), 0);
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
  link.click();
}

/* GRÁFICO */
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
