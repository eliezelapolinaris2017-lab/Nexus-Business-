import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGoSNKi1wapE1SpHxTc8wNZGGkJ2nQj7s",
  authDomain: "nexus-transport-2887b.firebaseapp.com",
  projectId: "nexus-transport-2887b",
  storageBucket: "nexus-transport-2887b.firebasestorage.app",
  messagingSenderId: "972915419764",
  appId: "1:972915419764:web:7d61dfb03bbe56df867f21"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);
const money = (n) => Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
const uid = () => auth.currentUser?.uid;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const today = () => new Date().toISOString().slice(0, 10);
const paymentLinks = window.NEXUS_PAYMENT_LINKS || {};

const INDUSTRIES = {
  hvac: { name: "HVAC", logo: "HV", color: "#0ea5e9", client: "Cliente", clients: "Clientes", service: "Servicio HVAC", services: "Servicios HVAC", team: "Técnicos", assets: "Equipos", hero: "Control de servicios HVAC, diagnósticos, mantenimientos, facturas y cobros.", fields: { service: ["Tipo de servicio", "Equipo / Marca", "BTU / Modelo", "Diagnóstico", "Garantía"], asset: ["Marca", "Modelo", "BTU", "Serial", "Ubicación"] }, nav: ["dashboard", "clients", "services", "team", "assets", "billing", "payments", "cashflow", "reports", "plans", "settings"] },
  salon: { name: "Salón / Barbería", logo: "SB", color: "#a855f7", client: "Cliente", clients: "Clientes", service: "Cita", services: "Agenda y Citas", team: "Estilistas", assets: "Cabinas / Sillas", hero: "Agenda, servicios de belleza, clientes, cobros y reportes del salón.", fields: { service: ["Servicio", "Profesional", "Hora", "Duración", "Notas de estilo"], asset: ["Área", "Silla / Estación", "Estado", "Notas"] }, nav: ["dashboard", "clients", "services", "team", "billing", "payments", "cashflow", "reports", "plans", "settings"] },
  transport: { name: "Transporte", logo: "TR", color: "#2563eb", client: "Cliente", clients: "Clientes", service: "Viaje / Servicio", services: "Servicios de Transporte", team: "Choferes", assets: "Flota", hero: "Servicios, rutas, millas, facturación, cobros y pagos operacionales.", fields: { service: ["Origen", "Destino", "Millas reales", "Tipo de carga", "Evidencia"], asset: ["Unidad", "Tablilla", "VIN", "Marbete", "Seguro"] }, nav: ["dashboard", "clients", "services", "team", "assets", "billing", "payments", "cashflow", "reports", "plans", "settings"] },
  handyman: { name: "Handyman", logo: "HM", color: "#f97316", client: "Cliente", clients: "Clientes", service: "Trabajo", services: "Trabajos", team: "Personal", assets: "Herramientas", hero: "Trabajos livianos, materiales, evidencias, cobros y seguimiento.", fields: { service: ["Categoría", "Área", "Materiales", "Prioridad", "Observaciones"], asset: ["Herramienta", "Estado", "Costo", "Asignado a"] }, nav: ["dashboard", "clients", "services", "team", "assets", "billing", "payments", "cashflow", "reports", "plans", "settings"] },
  cleaning: { name: "Limpieza", logo: "CL", color: "#14b8a6", client: "Cliente", clients: "Clientes", service: "Limpieza", services: "Servicios de Limpieza", team: "Personal", assets: "Inventario", hero: "Limpiezas residenciales/comerciales, personal, productos, facturas y reportes.", fields: { service: ["Tipo de limpieza", "Área", "Frecuencia", "Productos", "Notas"], asset: ["Producto / Equipo", "Cantidad", "Costo", "Ubicación"] }, nav: ["dashboard", "clients", "services", "team", "assets", "billing", "payments", "cashflow", "reports", "plans", "settings"] },
  construction: { name: "Construcción", logo: "CO", color: "#64748b", client: "Cliente", clients: "Clientes", service: "Proyecto", services: "Proyectos", team: "Equipo", assets: "Materiales / Equipo", hero: "Control de proyectos, materiales, pagos, avances, evidencias y reportes.", fields: { service: ["Tipo de proyecto", "Dirección", "Etapa", "Materiales", "Notas técnicas"], asset: ["Material / Equipo", "Cantidad", "Costo", "Proveedor"] }, nav: ["dashboard", "clients", "services", "team", "assets", "billing", "payments", "cashflow", "reports", "plans", "settings"] }
};

const PLANS = {
  free: {
    name: "Free", price: "$0", badge: "Prueba", skin: "plan-free",
    limits: { clients: 5, services: 10, team: 1, assets: 0, invoices: 3, payments: 3, cashflow: 5 },
    modules: ["dashboard", "clients", "services", "billing", "plans", "settings"],
    features: ["5 clientes", "10 servicios", "3 facturas", "Sin PDF profesional", "Sin caja avanzada"]
  },
  pro: {
    name: "Pro", price: "$19.99/mes", badge: "Operacional", skin: "plan-pro",
    limits: { clients: 75, services: 200, team: 5, assets: 25, invoices: 100, payments: 100, cashflow: 100 },
    modules: ["dashboard", "clients", "services", "team", "assets", "billing", "payments", "cashflow", "reports", "plans", "settings"],
    features: ["PDF profesional", "Cobros y caja", "Equipo y recursos", "Hasta 75 clientes", "Reportes sin marca Free"]
  },
  business: {
    name: "Business", price: "$39.99/mes", badge: "Premium", skin: "plan-business",
    limits: { clients: 99999, services: 99999, team: 99999, assets: 99999, invoices: 99999, payments: 99999, cashflow: 99999 },
    modules: ["dashboard", "clients", "services", "team", "assets", "billing", "payments", "cashflow", "reports", "plans", "settings"],
    features: ["Operación completa", "Reportes ejecutivos", "Sin límites prácticos", "Experiencia premium", "Marca profesional"]
  },
  enterprise: {
    name: "Enterprise", price: "Custom", badge: "Corporativo", skin: "plan-enterprise",
    limits: { clients: 999999, services: 999999, team: 999999, assets: 999999, invoices: 999999, payments: 999999, cashflow: 999999 },
    modules: ["dashboard", "clients", "services", "team", "assets", "billing", "payments", "cashflow", "reports", "plans", "settings"],
    features: ["Marca blanca", "Multiempresa listo", "Soporte premium", "Implementación", "Control corporativo"]
  }
};

let state = {
  profile: { businessName: "", industry: "hvac", plan: "free", phone: "", email: "", address: "", web: "", tax: 11.5 },
  clients: [], services: [], team: [], assets: [], invoices: [], payments: [], cashflow: []
};
let unsub = [];
let currentPreview = "";
let registerMode = false;
let currentView = "dashboard";

function industry() { return INDUSTRIES[state.profile.industry] || INDUSTRIES.hvac; }
function activePlan() { return PLANS[state.profile.plan || "free"] || PLANS.free; }
function planLimit(col) { return activePlan().limits[col] ?? 99999; }
function isUnlimited(n) { return Number(n) >= 99999; }
function moduleLocked(id) { return !activePlan().modules.includes(id); }
function locked(col) { return (state[col]?.length || 0) >= planLimit(col); }
function limitMsg(col) { alert(`Tu plan ${activePlan().name} alcanzó el límite de ${labelForCol(col)}. Mejora el plan para desbloquear más capacidad.`); }
function labelForCol(col) { return ({ clients: industry().clients, services: industry().services, team: industry().team, assets: industry().assets, invoices: "facturas", payments: "cobros", cashflow: "movimientos de caja" }[col] || col); }
function countLabel(col) { const l = planLimit(col); return `${state[col]?.length || 0} / ${isUnlimited(l) ? "∞" : l}`; }
function path(col) { return collection(db, "users", uid(), col); }
function docPath(col, id) { return doc(db, "users", uid(), col, id); }
function setSync(t) { if ($("syncStatus")) $("syncStatus").textContent = t; }
function sum(arr, key) { return arr.reduce((a, x) => a + Number(x[key] || 0), 0); }
function client(id) { return state.clients.find((x) => x.id === id) || {}; }
function team(id) { return state.team.find((x) => x.id === id) || {}; }
function balance(inv) { return Number(inv.total || 0) - state.payments.filter((p) => p.invoiceId === inv.id).reduce((a, p) => a + Number(p.amount || 0), 0); }

async function saveProfile() {
  await setDoc(docPath("meta", "profile"), { ...state.profile, updatedAt: serverTimestamp() }, { merge: true });
}
async function ensureProfile(user) {
  const ref = docPath("meta", "profile");
  const s = await getDoc(ref);
  if (!s.exists()) {
    await setDoc(ref, { businessName: user.displayName || "Mi Negocio", industry: "hvac", plan: "free", email: user.email || "", tax: 11.5, createdAt: serverTimestamp() });
  }
}
function listen() {
  unsub.forEach((u) => u()); unsub = [];
  ["clients", "services", "team", "assets", "invoices", "payments", "cashflow"].forEach((col) => {
    unsub.push(onSnapshot(path(col), (snap) => {
      state[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      render();
      setSync("Sincronizado");
    }, () => setSync("Firebase bloqueado")));
  });
  unsub.push(onSnapshot(docPath("meta", "profile"), (snap) => {
    if (snap.exists()) state.profile = { ...state.profile, ...snap.data() };
    render();
  }, () => {}));
}

function setTheme() {
  const i = industry();
  const plan = activePlan();
  document.documentElement.style.setProperty("--accent", i.color);
  document.body.classList.remove("plan-free", "plan-pro", "plan-business", "plan-enterprise");
  document.body.classList.add(plan.skin);
  $("brandLogo").textContent = i.logo;
  $("dashboardLogo").textContent = i.logo;
  $("authLogo").textContent = i.logo;
  $("brandName").textContent = state.profile.businessName || "Nexus Business PR";
  $("brandIndustry").textContent = `${i.name} · ${plan.name}`;
  $("dashboardTitle").textContent = state.profile.businessName || i.name;
  $("dashboardText").textContent = i.hero;
  $("planName").textContent = plan.name;
}
function nav() {
  const labels = { dashboard: "Dashboard", clients: industry().clients, services: industry().services, team: industry().team, assets: industry().assets, billing: "Facturación", payments: "Cobros", cashflow: "Caja", reports: "Reportes", plans: "Planes", settings: "Configuración" };
  $("sideNav").innerHTML = industry().nav.map((id) => {
    const lock = moduleLocked(id);
    return `<button data-view="${id}" class="${id === currentView ? "active" : ""} ${lock ? "nav-locked" : ""}"><span>${labels[id]}</span>${lock ? "<b>Pro</b>" : ""}</button>`;
  }).join("");
  document.querySelectorAll("[data-view]").forEach((b) => b.onclick = () => show(b.dataset.view));
}
function show(id) {
  currentView = id;
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  $(id).classList.add("active");
  document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === id));
  const titleMap = { dashboard: "Dashboard", billing: "Facturación", payments: "Cobros", cashflow: "Flujo de caja", reports: "Reportes", plans: "Planes", settings: "Configuración" };
  $("pageTitle").textContent = titleMap[id] || $(id)?.querySelector("h2")?.textContent || id;
  $("pageSubtitle").textContent = `${industry().name} · Plan ${activePlan().name}`;
  renderLocks();
}
function renderLocks() {
  document.querySelectorAll(".upgrade-overlay").forEach((x) => x.remove());
  Object.keys({ dashboard: 1, clients: 1, services: 1, team: 1, assets: 1, billing: 1, payments: 1, cashflow: 1, reports: 1, plans: 1, settings: 1 }).forEach((id) => {
    const view = $(id);
    if (!view) return;
    view.classList.toggle("is-locked", moduleLocked(id));
    if (moduleLocked(id)) {
      view.insertAdjacentHTML("afterbegin", `<div class="upgrade-overlay"><div><span class="lock-icon">🔒</span><h2>Módulo premium</h2><p>El plan ${activePlan().name} no incluye este módulo. Mejora tu plan para desbloquear ${$(id)?.querySelector("h2")?.textContent || id}.</p><button onclick="document.querySelector('[data-view=plans]').click()">Ver planes</button></div></div>`);
    }
  });
}
function quotaBar(col) {
  const current = state[col]?.length || 0;
  const limit = planLimit(col);
  const pct = isUnlimited(limit) ? 8 : Math.min(100, Math.round((current / Math.max(1, limit)) * 100));
  const danger = !isUnlimited(limit) && pct >= 85;
  return `<div class="quota ${danger ? "danger" : ""}"><div><b>${labelForCol(col)}</b><span>${current} de ${isUnlimited(limit) ? "Ilimitado" : limit}</span></div><i style="width:${pct}%"></i></div>`;
}
function planExperienceBanner() {
  const plan = activePlan();
  const next = state.profile.plan === "free" ? "Pro" : state.profile.plan === "pro" ? "Business" : state.profile.plan === "business" ? "Enterprise" : "Activo";
  return `<div class="experience-banner"><div><span class="plan-badge">${plan.badge}</span><h3>Experiencia ${plan.name}</h3><p>${plan.features.slice(0, 3).join(" · ")}</p></div><button onclick="document.querySelector('[data-view=plans]').click()">${next === "Activo" ? "Ver plan" : "Subir a " + next}</button></div>`;
}

function field(name, id, type = "text", val = "", cls = "") { return `<div class="${cls}"><label>${name}</label><input id="${id}" type="${type}" value="${esc(val)}" placeholder="${esc(name)}"></div>`; }
function select(name, id, opts, val = "") { return `<div><label>${name}</label><select id="${id}"><option value="">Seleccionar</option>${opts.map((o) => `<option value="${esc(o.id)}" ${o.id === val ? "selected" : ""}>${esc(o.name || o.title || o.clientName || o.label)}</option>`).join("")}</select></div>`; }
function table(headers, rows) { return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("") || `<tr><td colspan="${headers.length}" class="muted">Sin registros.</td></tr>`}</tbody></table></div>`; }
function act(col, id) { return `<div class="actions"><button class="danger" data-col="${col}" data-del="${id}">Borrar</button></div>`; }
async function del(col, id) { if (confirm("¿Borrar registro?")) await deleteDoc(docPath(col, id)); }

function forms() {
  const i = industry();
  $("clientsTitle").textContent = i.clients;
  $("servicesTitle").textContent = i.services;
  $("teamTitle").textContent = i.team;
  $("assetsTitle").textContent = i.assets;
  $("clientForm").innerHTML = quotaBar("clients") + field("Nombre", "cName") + field("Teléfono", "cPhone") + field("Email", "cEmail") + field("Municipio", "cCity") + field("Dirección", "cAddress", "text", "", "wide") + "<button class=\"primary\">Guardar cliente</button>";
  $("serviceForm").innerHTML = quotaBar("services") + select(i.client, "sClient", state.clients) + select(i.team.replace(/s$/, ""), "sTeam", state.team) + field("Fecha", "sDate", "date", today()) + field("Monto", "sAmount", "number") + i.fields.service.map((f, n) => field(f, `sF${n}`, "text", "", n > 2 ? "wide" : "")).join("") + "<button class=\"primary\">Guardar servicio</button>";
  $("teamForm").innerHTML = quotaBar("team") + field("Nombre", "tName") + field("Teléfono", "tPhone") + field("% Comisión", "tRate", "number") + field("% Retención", "tRetention", "number") + field("Rol / Especialidad", "tRole", "text", "", "wide") + "<button class=\"primary\">Guardar</button>";
  $("assetForm").innerHTML = quotaBar("assets") + i.fields.asset.map((f, n) => field(f, `aF${n}`)).join("") + "<button class=\"primary\">Guardar recurso</button>";
  $("paymentForm").innerHTML = quotaBar("payments") + select("Factura", "pInvoice", state.invoices.map((inv) => ({ id: inv.id, name: `${inv.number} - ${inv.clientName} - Balance ${money(balance(inv))}` }))) + field("Fecha", "pDate", "date", today()) + field("Método", "pMethod", "text", "ATH Móvil") + field("Monto", "pAmount", "number") + field("Nota", "pNote", "text", "", "wide") + "<button class=\"primary\">Registrar cobro</button>";
  $("cashForm").innerHTML = quotaBar("cashflow") + field("Fecha", "xDate", "date", today()) + `<div><label>Tipo</label><select id="xType"><option>Ingreso</option><option>Gasto</option></select></div>` + field("Concepto", "xConcept") + field("Monto", "xAmount", "number") + "<button class=\"primary\">Guardar movimiento</button>";
  $("settingsForm").innerHTML = Object.entries({ businessName: "Nombre del negocio", industry: "Industria", plan: "Plan activo", phone: "Teléfono", email: "Email", address: "Dirección", web: "Web", tax: "IVU %" }).map(([k, l]) => {
    if (k === "industry") return `<div><label>${l}</label><select id="set_${k}">${Object.entries(INDUSTRIES).map(([id, x]) => `<option value="${id}" ${state.profile.industry === id ? "selected" : ""}>${x.name}</option>`).join("")}</select></div>`;
    if (k === "plan") return `<div><label>${l}</label><select id="set_${k}">${Object.entries(PLANS).map(([id, x]) => `<option value="${id}" ${state.profile.plan === id ? "selected" : ""}>${x.name} — ${x.price}</option>`).join("")}</select><small class="muted">Producción: este campo debe actualizarse por Stripe/checkout o panel admin.</small></div>`;
    return field(l, `set_${k}`, k === "tax" ? "number" : "text", state.profile[k] || "", k === "address" ? "wide" : "");
  }).join("") + `<div class="full">${quotaBar("clients")}${quotaBar("services")}${quotaBar("invoices")}</div>`;
}

function render() { setTheme(); nav(); forms(); kpis(); tables(); plans(); renderLocks(); }
function kpis() {
  const billed = sum(state.invoices, "total");
  const paid = sum(state.payments, "amount");
  const pending = billed - paid;
  const net = state.cashflow.reduce((a, x) => a + (x.type === "Gasto" ? -1 : 1) * Number(x.amount || 0), 0);
  $("kpis").innerHTML = [
    ["Facturado", billed], ["Cobrado", paid], ["Pendiente", pending], ["Caja neta", net]
  ].map(([a, b]) => `<div class="kpi"><span>${a}</span><strong>${money(b)}</strong></div>`).join("");
  $("recentList").innerHTML = planExperienceBanner() + ([...state.services].slice(-5).reverse().map((s) => `<div class="list-item"><b>${esc(s.title)}</b><br><span class="muted">${esc(s.clientName)} · ${money(s.amount)}</span></div>`).join("") || "<p class=\"muted\">Sin actividad.</p>");
  $("quickActions").innerHTML = industry().nav.filter((x) => !["dashboard", "settings", "plans"].includes(x)).slice(0, 8).map((v) => `<button class="ghost ${moduleLocked(v) ? "soft-locked" : ""}" data-q="${v}">${moduleLocked(v) ? "🔒 " : ""}${v}</button>`).join("");
  document.querySelectorAll("[data-q]").forEach((b) => b.onclick = () => show(b.dataset.q));
  $("planName").innerHTML = `${activePlan().name}<small>${countLabel("clients")} clientes</small>`;
}
function tables() {
  $("clientsTable").innerHTML = table(["Nombre", "Teléfono", "Municipio", "Acción"], state.clients.map((c) => `<tr><td><b>${esc(c.name)}</b><br><span class="muted">${esc(c.email || "")}</span></td><td>${esc(c.phone || "")}</td><td>${esc(c.city || "")}</td><td>${act("clients", c.id)}</td></tr>`));
  $("teamTable").innerHTML = table([industry().team, "Comisión", "Retención", "Balance", "Acción"], state.team.map((t) => `<tr><td><b>${esc(t.name)}</b><br><span class="muted">${esc(t.role || "")}</span></td><td>${Number(t.rate || 0)}%</td><td>${Number(t.retention || 0)}%</td><td>${money(teamBalance(t.id))}</td><td>${act("team", t.id)}</td></tr>`));
  $("assetsTable").innerHTML = table(industry().fields.asset.concat("Acción"), state.assets.map((a) => `<tr>${(a.fields || []).map((f) => `<td>${esc(f)}</td>`).join("")}<td>${act("assets", a.id)}</td></tr>`));
  $("servicesTable").innerHTML = table(["Fecha", industry().client, industry().team, "Detalle", "Monto", "Comisión", "Factura", "Acción"], state.services.map((s) => {
    const t = team(s.teamId); const comm = Number(s.amount || 0) * Number(t.rate || 0) / 100; const inv = state.invoices.find((i) => i.serviceId === s.id);
    return `<tr><td>${esc(s.date || "")}</td><td>${esc(s.clientName)}</td><td>${esc(s.teamName)}</td><td><b>${esc(s.title)}</b><br><span class="muted">${(s.fields || []).map(esc).join(" · ")}</span></td><td>${money(s.amount)}</td><td>${money(comm)}</td><td>${inv ? esc(inv.number) : `<button data-invoice="${s.id}">Facturar</button>`}</td><td>${act("services", s.id)}</td></tr>`;
  }));
  document.querySelectorAll("[data-invoice]").forEach((b) => b.onclick = () => createInvoice(b.dataset.invoice));
  $("invoiceTable").innerHTML = quotaBar("invoices") + table(["Factura", "Cliente", "Servicio", "Total", "Pagado", "Balance", "Estado", "Acción"], state.invoices.map((inv) => { const paid = Number(inv.total || 0) - balance(inv); return `<tr><td><b>${esc(inv.number)}</b></td><td>${esc(inv.clientName)}</td><td>${esc(inv.serviceTitle)}</td><td>${money(inv.total)}</td><td>${money(paid)}</td><td>${money(balance(inv))}</td><td>${balance(inv) <= 0 ? "Pagada" : paid > 0 ? "Parcial" : "Pendiente"}</td><td><div class="actions"><button data-prev-inv="${inv.id}">Preview</button>${act("invoices", inv.id)}</div></td></tr>`; }));
  document.querySelectorAll("[data-prev-inv]").forEach((b) => b.onclick = () => previewInvoice(b.dataset.prevInv));
  $("paymentsTable").innerHTML = table(["Fecha", "Factura", "Método", "Monto", "Nota", "Acción"], state.payments.map((p) => `<tr><td>${esc(p.date)}</td><td>${esc(p.invoiceNumber)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${esc(p.note || "")}</td><td>${act("payments", p.id)}</td></tr>`));
  $("cashTable").innerHTML = table(["Fecha", "Tipo", "Concepto", "Monto", "Acción"], state.cashflow.map((x) => `<tr><td>${esc(x.date)}</td><td>${esc(x.type)}</td><td>${esc(x.concept)}</td><td>${money(x.amount)}</td><td>${act("cashflow", x.id)}</td></tr>`));
  document.querySelectorAll("[data-del]").forEach((b) => b.onclick = () => del(b.dataset.col, b.dataset.del));
}
function teamBalance(tid) {
  return state.services.filter((s) => s.teamId === tid).reduce((a, s) => {
    const t = team(tid); const c = Number(s.amount || 0) * Number(t.rate || 0) / 100; const r = c * Number(t.retention || 0) / 100; return a + c - r;
  }, 0);
}
function plans() {
  $("plansGrid").innerHTML = Object.entries(PLANS).map(([id, p]) => {
    const current = id === state.profile.plan;
    const link = paymentLinks[id] || "";
    return `<div class="plan plan-box-${id} ${id === "business" ? "featured" : ""} ${current ? "current" : ""}"><span class="plan-badge">${p.badge}</span><h3>${p.name}</h3><div class="price">${p.price}</div><div class="usage-mini"><span>${p.limits.clients >= 99999 ? "Clientes ilimitados" : p.limits.clients + " clientes"}</span><span>${p.limits.services >= 99999 ? "Servicios ilimitados" : p.limits.services + " servicios"}</span><span>${p.modules.includes("reports") ? "Reportes PDF" : "Reportes bloqueados"}</span></div><ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul><button data-plan="${id}">${current ? "Plan actual" : link ? "Pagar / Activar" : "Activar Free"}</button></div>`;
  }).join("");
  document.querySelectorAll("[data-plan]").forEach((b) => b.onclick = async () => {
    const id = b.dataset.plan;
    const link = paymentLinks[id] || "";
    if (id !== "free" && link) window.open(link, "_blank");
    state.profile.plan = id;
    await saveProfile();
    alert(`Plan ${PLANS[id].name} aplicado. La experiencia y límites se actualizaron.`);
    show("dashboard");
  });
}
async function createInvoice(serviceId) {
  if (moduleLocked("billing")) return show("billing");
  if (locked("invoices")) return limitMsg("invoices");
  const s = state.services.find((x) => x.id === serviceId); if (!s) return;
  if (state.invoices.some((i) => i.serviceId === serviceId)) return alert("Este servicio ya tiene factura.");
  const number = "INV-" + String(state.invoices.length + 1).padStart(5, "0");
  const total = Number(s.amount || 0) * (1 + Number(state.profile.tax || 0) / 100);
  await addDoc(path("invoices"), { serviceId: s.id, number, clientId: s.clientId, clientName: s.clientName, serviceTitle: s.title, total, date: today(), createdAt: serverTimestamp() });
}
function previewInvoice(id) {
  const inv = state.invoices.find((x) => x.id === id); if (!inv) return;
  currentPreview = "invoice";
  $("reportPreview").innerHTML = paper(`FACTURA ${inv.number}`, `<div class="doc-meta"><div class="doc-box"><b>Cliente</b><br>${esc(inv.clientName)}</div><div class="doc-box"><b>Fecha</b><br>${esc(inv.date)}</div></div><table class="doc-table"><tr><th>Descripción</th><th>Total</th></tr><tr><td>${esc(inv.serviceTitle)}</td><td>${money(inv.total)}</td></tr></table><div class="doc-total"><b>Balance: ${money(balance(inv))}</b></div>`);
  show("reports");
}
function paper(title, body) {
  const p = state.profile;
  const watermark = state.profile.plan === "free" ? `<div class="free-watermark">FREE PREVIEW</div>` : "";
  return `<div class="paper">${watermark}<div class="doc-head"><div class="doc-logo">${industry().logo}</div><h1>${esc(p.businessName || "Nexus Business PR")}</h1><p>${esc(p.address || "Puerto Rico")}<br>${esc(p.phone || "")} ${p.email ? " · " + esc(p.email) : ""}<br>${esc(p.web || "")}</p></div><h2>${title}</h2>${body}<p class="muted" style="text-align:center;margin-top:60px">Documento generado por Nexus Business PR</p></div>`;
}
function preview(type) {
  if (moduleLocked("reports")) return show("reports");
  currentPreview = type;
  if (type === "executive") $("reportPreview").innerHTML = paper("REPORTE EJECUTIVO", `<div class="doc-meta"><div class="doc-box">Facturado<br><b>${money(sum(state.invoices, "total"))}</b></div><div class="doc-box">Cobrado<br><b>${money(sum(state.payments, "amount"))}</b></div></div><table class="doc-table"><tr><th>Métrica</th><th>Valor</th></tr><tr><td>${industry().clients}</td><td>${state.clients.length}</td></tr><tr><td>${industry().services}</td><td>${state.services.length}</td></tr><tr><td>Facturas</td><td>${state.invoices.length}</td></tr></table>`);
  if (type === "services") $("reportPreview").innerHTML = paper(`REPORTE DE ${industry().services.toUpperCase()}`, `<table class="doc-table"><tr><th>Cliente</th><th>Detalle</th><th>Monto</th></tr>${state.services.map((s) => `<tr><td>${esc(s.clientName)}</td><td>${esc(s.title)}</td><td>${money(s.amount)}</td></tr>`).join("")}</table>`);
  if (type === "invoices") $("reportPreview").innerHTML = paper("REPORTE DE FACTURAS", `<table class="doc-table"><tr><th>Factura</th><th>Cliente</th><th>Total</th><th>Balance</th></tr>${state.invoices.map((i) => `<tr><td>${esc(i.number)}</td><td>${esc(i.clientName)}</td><td>${money(i.total)}</td><td>${money(balance(i))}</td></tr>`).join("")}</table>`);
}
async function add(col, data) { await addDoc(path(col), { ...data, createdAt: serverTimestamp() }); }

function bind() {
  Object.keys(INDUSTRIES).forEach((k) => $("authIndustry").insertAdjacentHTML("beforeend", `<option value="${k}">${INDUSTRIES[k].name}</option>`));
  $("showLogin").onclick = () => { registerMode = false; document.querySelectorAll(".register-only").forEach((x) => x.classList.add("hidden")); $("authSubmit").textContent = "Entrar"; $("showLogin").classList.add("active"); $("showRegister").classList.remove("active"); };
  $("showRegister").onclick = () => { registerMode = true; document.querySelectorAll(".register-only").forEach((x) => x.classList.remove("hidden")); $("authSubmit").textContent = "Crear cuenta"; $("showRegister").classList.add("active"); $("showLogin").classList.remove("active"); };
  $("authForm").onsubmit = async (e) => { e.preventDefault(); try { if (registerMode) { const c = await createUserWithEmailAndPassword(auth, $("authEmail").value, $("authPassword").value); await ensureProfile(c.user); await setDoc(doc(db, "users", c.user.uid, "meta", "profile"), { businessName: $("authName").value || "Mi Negocio", industry: $("authIndustry").value, plan: "free", email: $("authEmail").value, tax: 11.5, createdAt: serverTimestamp() }, { merge: true }); } else await signInWithEmailAndPassword(auth, $("authEmail").value, $("authPassword").value); } catch (err) { $("authMsg").textContent = err.message; } };
  $("logoutBtn").onclick = () => signOut(auth);
  $("upgradeBtn").onclick = () => show("plans");
  $("clientForm").onsubmit = (e) => { e.preventDefault(); if (moduleLocked("clients")) return show("clients"); if (locked("clients")) return limitMsg("clients"); add("clients", { name: $("cName").value, phone: $("cPhone").value, email: $("cEmail").value, city: $("cCity").value, address: $("cAddress").value }); e.target.reset(); };
  $("serviceForm").onsubmit = (e) => { e.preventDefault(); if (moduleLocked("services")) return show("services"); if (locked("services")) return limitMsg("services"); const c = client($("sClient").value), t = team($("sTeam").value), fields = industry().fields.service.map((f, n) => $(`sF${n}`).value); add("services", { clientId: c.id, clientName: c.name, teamId: t.id, teamName: t.name, date: $("sDate").value, amount: Number($("sAmount").value || 0), title: fields[0] || industry().service, fields }); e.target.reset(); };
  $("teamForm").onsubmit = (e) => { e.preventDefault(); if (moduleLocked("team")) return show("team"); if (locked("team")) return limitMsg("team"); add("team", { name: $("tName").value, phone: $("tPhone").value, rate: Number($("tRate").value || 0), retention: Number($("tRetention").value || 0), role: $("tRole").value }); e.target.reset(); };
  $("assetForm").onsubmit = (e) => { e.preventDefault(); if (moduleLocked("assets")) return show("assets"); if (locked("assets")) return limitMsg("assets"); add("assets", { fields: industry().fields.asset.map((f, n) => $(`aF${n}`).value) }); e.target.reset(); };
  $("paymentForm").onsubmit = async (e) => { e.preventDefault(); if (moduleLocked("payments")) return show("payments"); if (locked("payments")) return limitMsg("payments"); const inv = state.invoices.find((i) => i.id === $("pInvoice").value); if (!inv) return; const amount = Number($("pAmount").value || 0); await add("payments", { invoiceId: inv.id, invoiceNumber: inv.number, date: $("pDate").value, amount, method: $("pMethod").value, note: $("pNote").value }); await add("cashflow", { date: $("pDate").value, type: "Ingreso", concept: `Cobro ${inv.number}`, amount }); e.target.reset(); };
  $("cashForm").onsubmit = (e) => { e.preventDefault(); if (moduleLocked("cashflow")) return show("cashflow"); if (locked("cashflow")) return limitMsg("cashflow"); add("cashflow", { date: $("xDate").value, type: $("xType").value, concept: $("xConcept").value, amount: Number($("xAmount").value || 0) }); e.target.reset(); };
  $("saveSettings").onclick = async () => { ["businessName", "industry", "plan", "phone", "email", "address", "web", "tax"].forEach((k) => state.profile[k] = $(`set_${k}`).value); await saveProfile(); render(); alert(`Configuración guardada. Plan activo: ${activePlan().name}`); };
  $("invoiceFromService").onclick = () => { const s = state.services.find((x) => !state.invoices.some((i) => i.serviceId === x.id)); if (s) createInvoice(s.id); else alert("No hay servicios pendientes de facturar."); };
  document.querySelectorAll("[data-preview]").forEach((b) => b.onclick = () => preview(b.dataset.preview));
  $("printPreview").onclick = () => { if (moduleLocked("reports")) return show("reports"); const w = window.open("", "_blank"); w.document.write(`<html><head><title>Preview</title><link rel="stylesheet" href="styles.css"></head><body>${$("reportPreview").innerHTML}</body></html>`); w.print(); };
  $("downloadPreview").onclick = () => { if (moduleLocked("reports")) return show("reports"); const { jsPDF } = window.jspdf; const docp = new jsPDF({ unit: "pt", format: "a4" }); docp.html($("reportPreview").querySelector(".paper") || $("reportPreview"), { callback: (d) => d.save(`${currentPreview || "reporte"}.pdf`), x: 20, y: 20, width: 555, windowWidth: 816 }); };
}

bind();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    $("authScreen").classList.add("hidden");
    $("appShell").classList.remove("hidden");
    setSync("Conectando...");
    await ensureProfile(user);
    listen();
  } else {
    $("authScreen").classList.remove("hidden");
    $("appShell").classList.add("hidden");
  }
});
