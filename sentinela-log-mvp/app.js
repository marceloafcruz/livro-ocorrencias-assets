const USERS = [
  { id: "u-admin", name: "Administrador", email: "admin@sentinela.local", password: "123456", role: "Admin", unit: "Todas" },
  { id: "u-gestor", name: "Gestor Operacional", email: "gestor@sentinela.local", password: "123456", role: "Gestor", unit: "Portaria Principal" },
  { id: "u-seg", name: "Segurança Plantão", email: "seguranca@sentinela.local", password: "123456", role: "Segurança", unit: "Portaria Principal" }
];

const STORAGE_KEYS = {
  session: "sentinela.session",
  occurrences: "sentinela.occurrences"
};

let currentUser = null;
let currentGeo = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadOccurrences() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.occurrences) || "[]");
}

function saveOccurrences(items) {
  localStorage.setItem(STORAGE_KEYS.occurrences, JSON.stringify(items));
}

function makeId() {
  return "occ-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function audit(action, entityId) {
  const logs = JSON.parse(localStorage.getItem("sentinela.audit") || "[]");
  logs.push({
    id: "audit-" + Date.now(),
    action,
    entityId,
    userId: currentUser?.id,
    userName: currentUser?.name,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem("sentinela.audit", JSON.stringify(logs));
}

function login(email, password) {
  const user = USERS.find((item) => item.email === email && item.password === password);
  if (!user) return false;
  currentUser = user;
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ userId: user.id, startedAt: new Date().toISOString() }));
  showApp();
  return true;
}

function restoreSession() {
  const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
  if (!session) return;
  const user = USERS.find((item) => item.id === session.userId);
  if (user) {
    currentUser = user;
    showApp();
  }
}

function logout() {
  audit("logout", currentUser?.id);
  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.session);
  $("#appView").classList.add("hidden");
  $("#loginView").classList.remove("hidden");
}

function showApp() {
  $("#loginView").classList.add("hidden");
  $("#appView").classList.remove("hidden");
  $("#userRole").textContent = currentUser.role + " - " + currentUser.name;
  $("#unitLabel").textContent = "Unidade: " + currentUser.unit;
  renderUsers();
  renderAll();
}

function changeScreen(screen) {
  $$(".screen").forEach((item) => item.classList.add("hidden"));
  $("#" + screen).classList.remove("hidden");
  $$(".nav-btn").forEach((item) => item.classList.toggle("active", item.dataset.screen === screen));

  const titles = {
    dashboard: "Dashboard",
    newOccurrence: "Nova ocorrência",
    occurrences: "Ocorrências",
    users: "Usuários"
  };
  $("#screenTitle").textContent = titles[screen] || "Sentinela Log";
}

function createOccurrence(data) {
  const items = loadOccurrences();
  const occurrence = {
    id: makeId(),
    ...data,
    userId: currentUser.id,
    userName: currentUser.name,
    unit: currentUser.unit,
    createdAt: new Date().toISOString(),
    syncStatus: "local",
    latitude: currentGeo?.latitude || null,
    longitude: currentGeo?.longitude || null
  };
  items.unshift(occurrence);
  saveOccurrences(items);
  audit("create_occurrence", occurrence.id);
  return occurrence;
}

function renderAll() {
  const items = loadOccurrences();
  $("#totalCount").textContent = items.length;
  $("#criticalCount").textContent = items.filter((item) => item.priority === "critica").length;
  $("#openCount").textContent = items.filter((item) => item.status === "aberta").length;
  $("#localCount").textContent = items.filter((item) => item.syncStatus === "local").length;

  renderList("#latestList", items.slice(0, 5));
  renderList("#occurrenceList", items);
}

function renderList(selector, items) {
  const target = $(selector);
  if (!items.length) {
    target.innerHTML = '<div class="item"><p>Nenhuma ocorrência registrada.</p></div>';
    return;
  }

  target.innerHTML = items.map((item) => {
    const date = new Date(item.createdAt).toLocaleString("pt-BR");
    const gps = item.latitude ? `GPS: ${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}` : "GPS não capturado";
    return `
      <article class="item">
        <div class="item-head">
          <div>
            <h4>${item.type}</h4>
            <p>${item.description}</p>
          </div>
          <span class="badge ${item.priority}">${item.priority}</span>
        </div>
        <p><strong>Status:</strong> ${item.status} | <strong>Local:</strong> ${item.place}</p>
        <p><strong>Usuário:</strong> ${item.userName} | <strong>Data:</strong> ${date}</p>
        <p>${gps} | <strong>Sync:</strong> ${item.syncStatus}</p>
      </article>
    `;
  }).join("");
}

function renderUsers() {
  $("#usersList").innerHTML = USERS.map((user) => `
    <article class="item">
      <div class="item-head">
        <div>
          <h4>${user.name}</h4>
          <p>${user.email}</p>
        </div>
        <span class="badge">${user.role}</span>
      </div>
      <p>Unidade: ${user.unit}</p>
    </article>
  `).join("");
}

function exportJson() {
  const data = {
    exportedAt: new Date().toISOString(),
    occurrences: loadOccurrences(),
    audit: JSON.parse(localStorage.getItem("sentinela.audit") || "[]")
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sentinela-log-export.json";
  link.click();
  URL.revokeObjectURL(url);
}

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const ok = login($("#email").value.trim(), $("#password").value);
  $("#loginError").textContent = ok ? "" : "E-mail ou senha inválidos.";
});

$$("[data-login]").forEach((button) => {
  button.addEventListener("click", () => {
    $("#email").value = button.dataset.login;
    $("#password").value = "123456";
  });
});

$$(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => changeScreen(button.dataset.screen));
});

$$("[data-screen-jump]").forEach((button) => {
  button.addEventListener("click", () => changeScreen(button.dataset.screenJump));
});

$("#logoutBtn").addEventListener("click", logout);

$("#geoBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    $("#geoStatus").textContent = "GPS não suportado neste navegador";
    return;
  }

  $("#geoStatus").textContent = "Capturando GPS...";
  navigator.geolocation.getCurrentPosition((pos) => {
    currentGeo = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };
    $("#geoStatus").textContent = "GPS capturado";
  }, () => {
    $("#geoStatus").textContent = "Permissão de GPS negada";
  }, { enableHighAccuracy: true, timeout: 8000 });
});

$("#occurrenceForm").addEventListener("submit", (event) => {
  event.preventDefault();
  createOccurrence({
    type: $("#occType").value,
    priority: $("#priority").value,
    description: $("#description").value.trim(),
    place: $("#place").value.trim(),
    status: $("#status").value
  });
  event.target.reset();
  $("#place").value = "Portaria Principal";
  $("#geoStatus").textContent = "GPS não capturado";
  currentGeo = null;
  renderAll();
  changeScreen("occurrences");
});

$("#panicBtn").addEventListener("click", () => {
  createOccurrence({
    type: "Acionamento de pânico",
    priority: "critica",
    description: "Botão de pânico acionado pelo operador.",
    place: "Portaria Principal",
    status: "aberta"
  });
  renderAll();
  changeScreen("occurrences");
});

$("#exportBtn").addEventListener("click", exportJson);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}

restoreSession();
