let registros = JSON.parse(localStorage.getItem("horasExtras")) || [];

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
  const container = document.getElementById("cards-container");
  const card = container.children[index];
  card.classList.add("remove");
  setTimeout(() => {
    registros.splice(index,1);
    salvarLocal();
    mostrarRegistros();
  }, 400);
}

function limparTudo() {
  if(confirm("Tem certeza que deseja apagar todos os registros?")) {
    const container = document.getElementById("cards-container");
    const cards = Array.from(container.children);
    cards.forEach(card => card.classList.add("limpar"));
    setTimeout(() => {
      registros = [];
      salvarLocal();
      mostrarRegistros();
    }, 400);
  }
}

function atualizarTotalAnimado() {
  const totalHoras = registros.reduce((a, b) => a + b.horas, 0);
  const totalDiv = document.getElementById("total");

  let start = parseFloat(totalDiv.getAttribute("data-valor") || 0);
  const end = totalHoras;
  const duration = 400;
  const stepTime = 20;
  const steps = duration / stepTime;
  let currentStep = 0;

  const increment = (end - start) / steps;

  clearInterval(totalDiv._interval);
  totalDiv._interval = setInterval(() => {
    start += increment;
    currentStep++;
    totalDiv.innerHTML = `🕒 Total de ${start.toFixed(2)}h`;
    if (currentStep >= steps) {
      totalDiv.innerHTML = `🕒 Total de ${end.toFixed(2)}h`;
      totalDiv.setAttribute("data-valor", end);
      clearInterval(totalDiv._interval);
    }
  }, stepTime);
}

function mostrarRegistros() {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  registros.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = `card ${r.tipo}`;
    card.innerHTML = `
      <h3>${r.data} ${r.tipo === "domingo" ? "🌞" : "⏰"}</h3>
      <p><strong>Natureza:</strong> ${r.natureza}</p>
      <p><strong>Tipo:</strong> ${r.tipo === "domingo" ? "Domingo/Feriado" : "Dia normal"}</p>
      <p><strong>Horário:</strong> ${r.inicio} - ${r.fim}</p>
      <p><strong>Horas:</strong> ${r.horas.toFixed(2)}h</p>
      <button class="remove-btn" onclick="remover(${i})">🗑️</button>
    `;
    container.appendChild(card);
    setTimeout(() => card.classList.add("show"), 50);
  });

  if (registros.length) {
    atualizarTotalAnimado();
  } else {
    document.getElementById("total").innerHTML = "";
  }
}

mostrarRegistros();
