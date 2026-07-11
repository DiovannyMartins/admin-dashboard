/* ===== MENU MOBILE ===== */

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Fecha o menu ao clicar em um link
document.querySelectorAll(".sidebar-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });
});

/* ===== GRÁFICO DE BARRAS DINÂMICO ===== */

const dadosGrafico = [
  { dia: "Seg", vendas: 40, metas: 60 },
  { dia: "Ter", vendas: 65, metas: 35 },
  { dia: "Qua", vendas: 70, metas: 80 },
  { dia: "Qui", vendas: 45, metas: 50 },
  { dia: "Sex", vendas: 85, metas: 90 },
];

const graficoContainer = document.getElementById("grafico");

function renderizarGrafico() {
  graficoContainer.innerHTML = "";

  dadosGrafico.forEach((item) => {
    const grupo = document.createElement("div");
    grupo.classList.add("bar-group");
    grupo.innerHTML = `
      <div class="bars-wrapper">
        <div class="bar bar-green" style="height: ${item.vendas}%"></div>
        <div class="bar bar-blue" style="height: ${item.metas}%"></div>
      </div>
      <span class="label">${item.dia}</span>
    `;
    graficoContainer.appendChild(grupo);
  });
}

renderizarGrafico();

/* ===== TABELA DE USUÁRIOS (dinâmica, com localStorage) ===== */

const usuariosPadrao = [
  { nome: "João Silva", status: "Ativo", plano: "Premium" },
  { nome: "Maria Souza", status: "Inativo", plano: "Básico" },
  { nome: "Pedro Alves", status: "Ativo", plano: "Básico" },
  { nome: "Ana Dias", status: "Ativo", plano: "Premium" },
];

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || usuariosPadrao;

function salvarUsuarios() {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

const tabelaUsuarios = document.getElementById("tabelaUsuarios");

// Campo de busca (declarado aqui em cima para poder ser usado pela função de filtro)
const inputBuscaUsuario = document.getElementById("inputBuscaUsuario");

// Retorna a lista de usuários já filtrada conforme o texto digitado na busca
function obterListaFiltrada() {
  const termo = inputBuscaUsuario.value.trim().toLowerCase();

  if (termo === "") return usuarios;

  return usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(termo),
  );
}

function renderizarTabela(lista) {
  tabelaUsuarios.innerHTML = "";

  if (lista.length === 0) {
    tabelaUsuarios.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--gray-text);">Nenhum usuário encontrado.</td></tr>`;
    return;
  }

  lista.forEach((usuario, index) => {
    const statusClasse =
      usuario.status === "Ativo" ? "status-active" : "status-inactive";
    const planoClasse =
      usuario.plano === "Premium" ? "plan-premium" : "plan-basic";

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${usuario.nome}</td>
      <td><span class="badge ${statusClasse}">${usuario.status}</span></td>
      <td><span class="badge ${planoClasse}">${usuario.plano}</span></td>
      <td>
        <button class="btn-action btn-visualizar" data-index="${index}" aria-label="Visualizar">
          <img src="img/visualizar.png" alt="Ícone de Visualizar">
        </button>
        <button class="btn-action btn-editar" data-index="${index}" aria-label="Editar">
          <img src="img/editar.png" alt="Ícone de Editar">
        </button>
        <button class="btn-action btn-excluir" data-index="${index}" aria-label="Excluir">
          <img src="img/editar.png" alt="Ícone de Excluir">
        </button>
      </td>
    `;
    tabelaUsuarios.appendChild(linha);
  });

  ligarEventosAcoes();
}

renderizarTabela(obterListaFiltrada());

/* ===== BUSCA NA TABELA ===== */

inputBuscaUsuario.addEventListener("input", () => {
  renderizarTabela(obterListaFiltrada());
});

/* ===== ORDENAÇÃO DA TABELA ===== */

let ordemAtual = {};

document.querySelectorAll(".data-table th[data-campo]").forEach((cabecalho) => {
  cabecalho.addEventListener("click", () => {
    const campo = cabecalho.dataset.campo;
    const crescente = ordemAtual[campo] !== "asc";

    usuarios.sort((a, b) => {
      if (a[campo] < b[campo]) return crescente ? -1 : 1;
      if (a[campo] > b[campo]) return crescente ? 1 : -1;
      return 0;
    });

    ordemAtual = { [campo]: crescente ? "asc" : "desc" };
    renderizarTabela(obterListaFiltrada());
  });
});

/* ===== MODAL DE USUÁRIO (visualizar/editar/criar) ===== */

const modalOverlay = document.getElementById("modalOverlay");
const modalUsuario = document.getElementById("modalUsuario");
const btnFecharModal = document.getElementById("btnFecharModal");
const formUsuario = document.getElementById("formUsuario");
const modalTitulo = document.getElementById("modalTitulo");
const modalNome = document.getElementById("modalNome");
const modalStatus = document.getElementById("modalStatus");
const modalPlano = document.getElementById("modalPlano");
const btnSalvarModal = document.getElementById("btnSalvarModal");

let indexEditando = null;

function abrirModal() {
  modalOverlay.classList.add("active");
  modalUsuario.classList.add("active");
}

function fecharModal() {
  modalOverlay.classList.remove("active");
  modalUsuario.classList.remove("active");
}

btnFecharModal.addEventListener("click", fecharModal);
modalOverlay.addEventListener("click", fecharModal);

function ligarEventosAcoes() {
  document.querySelectorAll(".btn-visualizar").forEach((botao) => {
    botao.addEventListener("click", () => {
      const index = parseInt(botao.dataset.index);
      const usuario = usuarios[index];

      modalTitulo.textContent = "Visualizar Usuário";
      modalNome.value = usuario.nome;
      modalStatus.value = usuario.status;
      modalPlano.value = usuario.plano;

      modalNome.disabled = true;
      modalStatus.disabled = true;
      modalPlano.disabled = true;
      btnSalvarModal.style.display = "none";

      abrirModal();
    });
  });

  document.querySelectorAll(".btn-editar").forEach((botao) => {
    botao.addEventListener("click", () => {
      const index = parseInt(botao.dataset.index);
      const usuario = usuarios[index];

      modalTitulo.textContent = "Editar Usuário";
      modalNome.value = usuario.nome;
      modalStatus.value = usuario.status;
      modalPlano.value = usuario.plano;

      modalNome.disabled = false;
      modalStatus.disabled = false;
      modalPlano.disabled = false;
      btnSalvarModal.style.display = "block";

      indexEditando = index;
      abrirModal();
    });
  });

  document.querySelectorAll(".btn-excluir").forEach((botao) => {
    botao.addEventListener("click", () => {
      const index = parseInt(botao.dataset.index);

      if (confirm(`Remover o usuário "${usuarios[index].nome}"?`)) {
        usuarios.splice(index, 1);
        salvarUsuarios();
        renderizarTabela(obterListaFiltrada());
      }
    });
  });
}

// Botão "+ Novo Usuário" também usa o mesmo modal
document.getElementById("btnAdicionarUsuario").addEventListener("click", () => {
  modalTitulo.textContent = "Novo Usuário";
  formUsuario.reset();

  modalNome.disabled = false;
  modalStatus.disabled = false;
  modalPlano.disabled = false;
  btnSalvarModal.style.display = "block";

  indexEditando = null;
  abrirModal();
});

// Salva (edição ou criação)
formUsuario.addEventListener("submit", (event) => {
  event.preventDefault();

  const dadosUsuario = {
    nome: modalNome.value.trim(),
    status: modalStatus.value,
    plano: modalPlano.value,
  };

  if (indexEditando !== null) {
    usuarios[indexEditando] = dadosUsuario;
  } else {
    usuarios.unshift(dadosUsuario);
  }

  salvarUsuarios();
  renderizarTabela(obterListaFiltrada());
  fecharModal();
});

/* ===== NOTIFICAÇÕES ===== */

const notificacoes = [
  "Novo usuário cadastrado: Ana Dias",
  "Meta de vendas de Quarta atingida!",
  "Servidor com uso de disco em 80%",
];

const btnNotificacao = document.getElementById("btnNotificacao");
const notificationDropdown = document.getElementById("notificationDropdown");
const badgeNotificacao = document.getElementById("badgeNotificacao");
const listaNotificacoes = document.getElementById("listaNotificacoes");

badgeNotificacao.textContent = notificacoes.length;

listaNotificacoes.innerHTML = notificacoes
  .map((texto) => `<div class="notification-item">${texto}</div>`)
  .join("");

btnNotificacao.addEventListener("click", (event) => {
  event.stopPropagation();
  notificationDropdown.classList.toggle("active");
});

// Fecha ao clicar fora
document.addEventListener("click", () => {
  notificationDropdown.classList.remove("active");
});
