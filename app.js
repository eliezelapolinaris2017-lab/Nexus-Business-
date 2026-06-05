import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = { apiKey:"AIzaSyDGoSNKi1wapE1SpHxTc8wNZGGkJ2nQj7s", authDomain:"nexus-transport-2887b.firebaseapp.com", projectId:"nexus-transport-2887b", storageBucket:"nexus-transport-2887b.firebasestorage.app", messagingSenderId:"972915419764", appId:"1:972915419764:web:7d61dfb03bbe56df867f21" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);
const money = n => Number(n || 0).toLocaleString('en-US', { style:'currency', currency:'USD' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const today = () => new Date().toISOString().slice(0,10);
const daysAgo = n => new Date(Date.now() - n*86400000).toISOString().slice(0,10);
const plusDays = n => new Date(Date.now() + n*86400000).toISOString().slice(0,10);
const links = () => window.NEXUS_PAYMENT_LINKS || {};
const ownerEmail = () => window.NEXUS_OWNER_EMAIL || 'eliezelapolinaris@icloud.com';
const uid = () => auth.currentUser?.uid;

const COLS = ['clients','services','team','assets','suppliers','supplierPayments','payroll','invoices','payments','cashflow','planRequests'];

const INDUSTRIES = {
  hvac:{name:'HVAC',logo:'HV',color:'#0ea5e9',client:'Cliente',clients:'Clientes',service:'Servicio HVAC',services:'Servicios HVAC',team:'Técnicos',payroll:'Nómina técnicos',assets:'Activos',suppliers:'Suplidores HVAC',supplierPayments:'Pagos a suplidores',hero:'Diagnósticos, mantenimientos, garantías, facturas, nómina, suplidores y cobros.',nav:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de servicio','Equipo / Marca','BTU / Modelo','Diagnóstico','Garantía'],assetFields:['Marca','Modelo','BTU','Serial','Ubicación'],supplierFields:['Categoría','Marca principal','Términos','Notas']},
  salon:{name:'Salón / Barbería',logo:'SB',color:'#a855f7',client:'Cliente',clients:'Clientes',service:'Cita',services:'Agenda y Citas',team:'Estilistas',payroll:'Pagos estilistas',assets:'Activos',suppliers:'Suplidores belleza',supplierPayments:'Pagos a suplidores',hero:'Agenda, servicios de belleza, productos, comisiones, cobros y reportes.',nav:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Servicio','Profesional','Hora','Duración','Notas de estilo'],assetFields:['Área','Silla / Estación','Estado','Notas'],supplierFields:['Categoría','Producto principal','Términos','Notas']},
  transport:{name:'Transporte',logo:'TR',color:'#2563eb',client:'Cliente',clients:'Clientes',service:'Servicio',services:'Servicios de Transporte',team:'Choferes',payroll:'Pagos a choferes',assets:'Activos',suppliers:'Suplidores / Talleres',supplierPayments:'Pagos a suplidores',hero:'Rutas, millas, facturación, cobros, comisiones, retenciones, flota y suplidores.',nav:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de carga','Evidencia / referencia'],assetFields:['Unidad','Tablilla','VIN','Marbete','Seguro'],supplierFields:['Categoría','Servicio principal','Términos','Notas']},
  handyman:{name:'Handyman',logo:'HM',color:'#f97316',client:'Cliente',clients:'Clientes',service:'Trabajo',services:'Trabajos',team:'Personal',payroll:'Pagos personal',assets:'Activos',suppliers:'Suplidores materiales',supplierPayments:'Pagos a suplidores',hero:'Trabajos livianos, materiales, evidencias, cobros, nómina y suplidores.',nav:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Categoría','Área','Materiales','Prioridad','Observaciones'],assetFields:['Herramienta','Estado','Costo','Asignado a'],supplierFields:['Categoría','Material principal','Términos','Notas']},
  cleaning:{name:'Limpieza',logo:'CL',color:'#14b8a6',client:'Cliente',clients:'Clientes',service:'Limpieza',services:'Servicios de Limpieza',team:'Personal',payroll:'Nómina personal',assets:'Activos',suppliers:'Suplidores productos',supplierPayments:'Pagos a suplidores',hero:'Limpiezas residenciales/comerciales, productos, nómina, suplidores, cobros y reportes.',nav:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de limpieza','Área','Frecuencia','Productos','Notas'],assetFields:['Producto / Equipo','Cantidad','Costo','Ubicación'],supplierFields:['Categoría','Producto principal','Términos','Notas']},
  construction:{name:'Construcción',logo:'CO',color:'#64748b',client:'Cliente',clients:'Clientes',service:'Proyecto',services:'Proyectos',team:'Equipo',payroll:'Pagos de obra',assets:'Activos',suppliers:'Suplidores construcción',supplierPayments:'Pagos a suplidores',hero:'Proyectos, etapas, materiales, pagos de obra, suplidores, evidencias y reportes.',nav:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de proyecto','Dirección','Etapa','Materiales','Notas técnicas'],assetFields:['Material / Equipo','Cantidad','Costo','Proveedor'],supplierFields:['Categoría','Material principal','Términos','Notas']}
};

const DEMOS = {
  hvac:{
    business:'Oasis Demo HVAC', color:'#0ea5e9', slogan:'Gestión administrativa para servicios HVAC.',
    clients:[['Condominio Brisas del Mar','787-555-1101','admin@brisasdemo.com','San Juan','Ave. Isla Verde #100'],['Café Miramar','787-555-1102','operaciones@cafemiramar.demo','Miramar','Calle Cerra #55'],['Residencia Santiago','787-555-1103','santiago@demo.com','Trujillo Alto','Urb. Encantada']],
    team:[['Luis Técnico','787-555-2101',18,5,'Técnico'],['Carlos Ayudante','787-555-2102',10,0,'Ayudante'],['Marta Coordinadora','787-555-2103',0,0,'Coordinación']],
    assets:[['Mini Split Sala 24k','Equipo','Lobby principal','Activo',1250,plusDays(330),'AirMax Inverter R32'],['Wallpack Oficina 15k','Equipo','Oficina administrativa','En garantía',1450,plusDays(520),'Unidad comercial'],['Condensador 36k','Equipo','Techo área norte','Requiere revisión',2200,plusDays(90),'Carrier 36k']],
    suppliers:[['AirMax Puerto Rico','787-555-3101','ventas@airmax.demo',850],['Refrigeración PR Supply','787-555-3102','orders@rpr.demo',420]],
    services:[['Mantenimiento profundo',275,'Lavado de evaporador y condensador',[{description:'Mantenimiento profundo 24k',qty:1,price:175},{description:'Filtro y desinfección',qty:1,price:100}]],['Diagnóstico HVAC',95,'Verificación de presiones y amperaje',[{description:'Diagnóstico técnico',qty:1,price:95}]],['Instalación mini split',750,'Instalación equipo inverter',[{description:'Mano de obra instalación',qty:1,price:600},{description:'Materiales básicos',qty:1,price:150}]]]
  },
  salon:{
    business:'Cynthia Demo Salón', color:'#a855f7', slogan:'Agenda, cobros y administración para salón.',
    clients:[['María López','787-555-1201','maria@demo.com','Carolina','Urb. Villa Fontana'],['Jessica Rivera','787-555-1202','jessica@demo.com','San Juan','Calle Loíza #88'],['Ana Morales','787-555-1203','ana@demo.com','Bayamón','Santa Rosa Mall']],
    team:[['Cynthia González','787-555-2201',45,0,'Estilista'],['Natalia Colorista','787-555-2202',35,0,'Colorista'],['Andrea Nails','787-555-2203',30,0,'Técnica uñas']],
    assets:[['Silla principal #1','Mobiliario','Estación frontal','Activo',900,plusDays(700),'Silla hidráulica'],['Lavacabezas negro','Mobiliario','Área shampoo','Activo',650,plusDays(420),'Unidad principal'],['Secadora profesional','Equipo','Área styling','En garantía',480,plusDays(280),'Secadora pedestal']],
    suppliers:[['Beauty Supply PR','787-555-3201','ventas@beauty.demo',300],['Color Pro Distributor','787-555-3202','color@demo.com',180]],
    services:[['Color y blower',125,'Servicio de color completo',[{description:'Color raíz',qty:1,price:75},{description:'Blower',qty:1,price:50}]],['Uñas gel',55,'Manicura gel',[{description:'Manicura gel',qty:1,price:55}]],['Tratamiento hidratante',85,'Tratamiento y secado',[{description:'Tratamiento',qty:1,price:60},{description:'Secado',qty:1,price:25}]]]
  },
  transport:{
    business:'Nexus Demo Transport', color:'#2563eb', slogan:'Rutas, cobros y control administrativo de transporte.',
    clients:[['Distribuidora Norte','787-555-1301','logistica@norte.demo','Arecibo','PR-2 Km 70'],['Farmacia Central','787-555-1302','compras@farmacia.demo','Caguas','Ave. Gautier Benítez'],['Almacén Metro','787-555-1303','metro@demo.com','Guaynabo','Zona Industrial']],
    team:[['Pedro Chofer','787-555-2301',22,0,'Chofer'],['Ángel Ruta','787-555-2302',20,0,'Chofer'],['Sofía Despacho','787-555-2303',0,0,'Despacho']],
    assets:[['Van Ford Transit','Vehículo','Base Bayamón','Activo',28500,plusDays(250),'Unidad TR-01'],['Camión pequeño','Vehículo','Base Caguas','Activo',42000,plusDays(180),'Unidad TR-02'],['Hand Truck','Herramienta','Van TR-01','Activo',220,plusDays(800),'Equipo carga']],
    suppliers:[['Taller Rápido PR','787-555-3301','servicio@taller.demo',650],['Gasolina Fleet','787-555-3302','fleet@fuel.demo',1200]],
    services:[['Ruta local',180,'Entrega zona metro',[{description:'Ruta local metro',qty:1,price:180}]],['Carga liviana',240,'Recogido y entrega',[{description:'Servicio carga liviana',qty:1,price:240}]],['Ruta larga',475,'San Juan a Mayagüez',[{description:'Ruta larga',qty:1,price:425},{description:'Peaje y manejo',qty:1,price:50}]]]
  },
  handyman:{
    business:'Axis Demo Property Solutions', color:'#f97316', slogan:'Trabajos livianos, materiales, cobros y equipo.',
    clients:[['Residencia Colón','787-555-1401','colon@demo.com','Guaynabo','Urb. Garden Hills'],['Oficina Legal Ríos','787-555-1402','admin@rioslegal.demo','Hato Rey','Milla de Oro'],['Apartamento Vega','787-555-1403','vega@demo.com','Carolina','Torres del Parque']],
    team:[['José Handyman','787-555-2401',25,0,'Técnico general'],['Raúl Auxiliar','787-555-2402',15,0,'Auxiliar'],['Lina Admin','787-555-2403',0,0,'Administración']],
    assets:[['Taladro inalámbrico','Herramienta','Vehículo HM-01','Activo',180,plusDays(400),'Milwaukee'],['Escalera 8 pies','Herramienta','Almacén','Activo',120,plusDays(900),'Fibra'],['Kit plomería básica','Herramienta','Vehículo HM-01','Activo',250,plusDays(350),'Servicio campo']],
    suppliers:[['Ferretería Central','787-555-3401','ventas@ferreteria.demo',275],['Pinturas Pro','787-555-3402','ordenes@pinturas.demo',150]],
    services:[['Plomería liviana',165,'Cambio de mezcladora',[{description:'Cambio mezcladora',qty:1,price:115},{description:'Materiales',qty:1,price:50}]],['Electricidad liviana',95,'Cambio receptáculos',[{description:'Cambio receptáculos',qty:3,price:25},{description:'Visita',qty:1,price:20}]],['Pintura',350,'Retoque oficina',[{description:'Mano de obra pintura',qty:1,price:275},{description:'Materiales',qty:1,price:75}]]]
  },
  cleaning:{
    business:'Clean Pro Demo Services', color:'#14b8a6', slogan:'Limpieza residencial y comercial con control financiero.',
    clients:[['Airbnb Ocean View','787-555-1501','host@ocean.demo','Luquillo','Condominio Playa Azul'],['Clínica Dental Sol','787-555-1502','admin@dental.demo','Bayamón','Ave. Main #10'],['Oficina Caribe','787-555-1503','office@caribe.demo','San Juan','Centro Internacional']],
    team:[['Rosa Supervisora','787-555-2501',18,0,'Supervisora'],['Marcos Limpieza','787-555-2502',14,0,'Personal'],['Diana Limpieza','787-555-2503',14,0,'Personal']],
    assets:[['Aspiradora comercial','Equipo','Almacén','Activo',450,plusDays(300),'Uso diario'],['Máquina vapor','Equipo','Van CL-01','Activo',750,plusDays(500),'Desinfección'],['Carrito productos','Equipo','Clínica Dental','Activo',180,plusDays(200),'Asignado cliente']],
    suppliers:[['Janitorial Supply PR','787-555-3501','ventas@janitorial.demo',390],['Eco Clean Products','787-555-3502','eco@clean.demo',210]],
    services:[['Limpieza profunda',325,'Limpieza inicial comercial',[{description:'Limpieza profunda',qty:1,price:275},{description:'Productos especiales',qty:1,price:50}]],['Mantenimiento recurrente',180,'Servicio semanal',[{description:'Limpieza semanal',qty:1,price:180}]],['Post-construcción',520,'Limpieza final obra',[{description:'Post-construcción',qty:1,price:520}]]]
  },
  construction:{
    business:'Build Demo Contractors', color:'#64748b', slogan:'Proyectos, suplidores, nómina y reportes de obra.',
    clients:[['Proyecto Terra Lugo','787-555-1601','terra@demo.com','Trujillo Alto','Solar 12'],['Local Comercial Plaza','787-555-1602','plaza@demo.com','Caguas','Plaza Central'],['Residencia Rivera','787-555-1603','rivera@demo.com','Dorado','Urb. Dorado Beach']],
    team:[['Miguel Maestro','787-555-2601',30,0,'Maestro obra'],['Ernesto Ayudante','787-555-2602',18,0,'Ayudante'],['Nadia Proyecto','787-555-2603',0,0,'Administración']],
    assets:[['Mezcladora cemento','Equipo','Obra Terra Lugo','Activo',900,plusDays(600),'Equipo obra'],['Andamio modular','Equipo','Almacén','Activo',1500,plusDays(400),'6 secciones'],['Generador obra','Equipo','Obra Plaza','En garantía',2200,plusDays(700),'Generador 6500W']],
    suppliers:[['Materiales del Este','787-555-3601','ventas@materiales.demo',1850],['Hormigón Express','787-555-3602','ordenes@hormigon.demo',2400]],
    services:[['Supervisión de obra',950,'Semana de supervisión',[{description:'Supervisión semanal',qty:1,price:950}]],['Electricidad',1250,'Instalación circuito comercial',[{description:'Mano de obra electricidad',qty:1,price:900},{description:'Materiales',qty:1,price:350}]],['Terminaciones',2100,'Fase de terminaciones',[{description:'Mano de obra terminaciones',qty:1,price:1600},{description:'Materiales',qty:1,price:500}]]]
  }
};

const PLANS = {
  free:{name:'Free',price:'$0',badge:'Básico',limits:{clients:5,services:10,team:1,assets:0,suppliers:0,supplierPayments:0,payroll:0,invoices:3,payments:3,cashflow:5},modules:['dashboard','clients','services','billing','plans','settings'],features:['5 clientes','10 servicios','3 facturas','Sin nómina','Sin suplidores','Sin reportes avanzados']},
  pro:{name:'Pro',price:'$19.99/mes',badge:'Profesional',limits:{clients:500,services:1000,team:10,assets:100,suppliers:25,supplierPayments:100,payroll:100,invoices:500,payments:500,cashflow:1000},modules:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],features:['Nómina básica','Suplidores','Logo en facturas','Reportes PDF','500 clientes']},
  business:{name:'Business',price:'$39.99/mes',badge:'Premium',limits:{clients:5000,services:10000,team:50,assets:1000,suppliers:500,supplierPayments:2000,payroll:2000,invoices:5000,payments:5000,cashflow:10000},modules:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],features:['White-label completo','Nómina avanzada','Control de suplidores','Firma digital','Reportes ejecutivos']},
  enterprise:{name:'Enterprise',price:'Custom',badge:'Corporativo',limits:{clients:Infinity,services:Infinity,team:Infinity,assets:Infinity,suppliers:Infinity,supplierPayments:Infinity,payroll:Infinity,invoices:Infinity,payments:Infinity,cashflow:Infinity},modules:['dashboard','clients','services','team','payroll','assets','suppliers','supplierPayments','billing','payments','cashflow','reports','plans','settings'],features:['Ilimitado','Dominio personalizado','Roles futuros','Soporte corporativo']}
};

const TITLES = {dashboard:'Dashboard',clients:'Clientes',services:'Servicios',team:'Equipo',payroll:'Nómina',assets:'Activos',suppliers:'Suplidores',supplierPayments:'Pagos suplidores',billing:'Facturación',payments:'Cobros',cashflow:'Flujo de caja',reports:'Reportes',plans:'Planes',settings:'Configuración'};
let mode = 'login', unsub = [];
let state = {profile:null,clients:[],services:[],team:[],assets:[],suppliers:[],supplierPayments:[],payroll:[],invoices:[],payments:[],cashflow:[],planRequests:[],previewHtml:'',activeView:'dashboard'};

function defaultProfile(){return {businessName:'Mi Negocio',industry:'hvac',plan:'free',planStatus:'active',planChangeMode:'manual',pendingPlan:'',pendingPlanStatus:'none',phone:'',whatsapp:'',email:auth.currentUser?.email||'',address:'',web:'',tax:'11.5',merchant:'',representative:'',slogan:'',logoDashboard:'',logoPdf:'',favicon:'',signature:'',primaryColor:'#2563eb',secondaryColor:'#0f172a',customServices:{},transportRatePerMile:'2.50',transportBaseCharge:'0',createdAt:new Date().toISOString()};}
function profile(){return state.profile || defaultProfile();}
function industry(){return INDUSTRIES[profile().industry] || INDUSTRIES.hvac;}
function normalizePlanId(value){
  const v = String(value || 'free').toLowerCase().trim();
  const map = { gratis:'free', basico:'free', básico:'free', basic:'free', premium:'business' };
  return PLANS[v] ? v : (map[v] || 'free');
}
function currentPlanId(){ return normalizePlanId(profile().plan); }
function plan(){return PLANS[currentPlanId()] || PLANS.free;}
function colPath(c){return collection(db,'users',uid(),c);}
function docPath(c,id){return doc(db,'users',uid(),c,id);}
function profRef(){return doc(db,'users',uid());}
function limit(c){return plan().limits[c] ?? Infinity;}
function unlimited(v){return v === Infinity;}
function lockedModule(v){return !plan().modules.includes(v);}
function canCreate(c){const l=limit(c); return unlimited(l) || (state[c]||[]).length < l;}
function sum(a,k){return (a||[]).reduce((t,x)=>t+Number(x[k]||0),0);}
function teamBy(id){return state.team.find(x=>x.id===id)||{};}
function supplierBy(id){return state.suppliers.find(x=>x.id===id)||{};}
function clientBy(id){return state.clients.find(x=>x.id===id)||{};}
function assetBy(id){return state.assets.find(x=>x.id===id)||{};}
function assetName(a){return a?.name || (a?.fields?.[0]) || 'Activo';}
function assetCategory(a){return a?.category || (a?.fields?.[1]) || 'General';}
function assetLocation(a){return a?.location || (a?.fields?.[4]) || ''; }
function assetStatus(a){return a?.status || (a?.fields?.[2]) || 'Activo';}
function assetLabel(a){const client=a?.clientName?` · ${a.clientName}`:'';return `${assetName(a)}${client}`;}
function invoiceBalance(inv){const paid=state.payments.filter(p=>p.invoiceId===inv.id).reduce((t,p)=>t+Number(p.amount||0),0);return Math.max(0,Number(inv.total||0)-paid);}
function teamCommission(tid){const t=teamBy(tid);return state.services.filter(s=>s.teamId===tid).reduce((a,s)=>a+(serviceAmount(s)*Number(t.rate||0)/100),0);}
function teamRetention(tid){const t=teamBy(tid);return state.services.filter(s=>s.teamId===tid).reduce((a,s)=>a+(serviceAmount(s)*Number(t.retention||0)/100),0);}
function payrollPaid(tid){return state.payroll.filter(p=>p.teamId===tid).reduce((a,p)=>a+Number(p.net||0),0);}
function teamBalance(tid){return Math.max(0,teamCommission(tid)-teamRetention(tid)-payrollPaid(tid));}
function supplierPaid(sid){return state.supplierPayments.filter(p=>p.supplierId===sid).reduce((a,p)=>a+Number(p.amount||0),0);}
function supplierBalance(sid){const s=supplierBy(sid);return Math.max(0,Number(s.openingBalance||0)-supplierPaid(sid));}
function imgOrText(data,text){return data?`<img src="${data}" alt="Logo" class="logo-img">`:esc(text);}

function isTransport(){return (profile().industry||'')==='transport';}
function mapsRouteUrl(origin='',destination=''){
  const o=String(origin||'').trim(), d=String(destination||'').trim();
  if(!o || !d) return '';
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
}
function routeLink(origin='',destination='',label='Abrir ruta'){
  const url=mapsRouteUrl(origin,destination);
  return url?`<a class="route-link" href="${url}" target="_blank" rel="noopener">${esc(label)}</a>`:'';
}
function transportRouteFromForm(){
  if(!isTransport()) return null;
  const miles=Number($('sRouteMiles')?.value||0);
  const rate=Number($('sRouteRate')?.value||0);
  const base=Number($('sRouteBase')?.value||0);
  return {origin:$('sOrigin')?.value||'',destination:$('sDestination')?.value||'',miles,rate,base,total:base+(miles*rate)};
}
function transportRouteFromService(s){
  if(s?.route) return s.route;
  const f=s?.fields||[];
  return {origin:f[0]||'',destination:f[1]||'',miles:Number(f[2]||0),rate:Number(f[3]||0),base:Number(f[4]||0),total:Number(s?.amount||0)};
}
function updateTransportTotal(){
  if(!isTransport()) return;
  const r=transportRouteFromForm();
  const amount=$('sAmount');
  if(amount && r) amount.value=(r.total||0).toFixed(2);
  const preview=$('routeCalcPreview');
  if(preview && r) preview.textContent=`${Number(r.miles||0).toFixed(2)} mi × ${money(r.rate)} + ${money(r.base)} = ${money(r.total)}`;
  const open=$('openRouteBtn');
  if(open && r){
    const url=mapsRouteUrl(r.origin,r.destination);
    open.disabled=!url;
    open.onclick=()=>{ if(url) window.open(url,'_blank','noopener'); };
  }
}
function transportRouteFormHtml(){
  if(!isTransport()) return '';
  const p=profile();
  return `<div class="wide route-box"><div class="route-grid">${input('Origen','sOrigin','text','','wide')}${input('Destino','sDestination','text','','wide')}${input('Millas Google','sRouteMiles','number','')}${input('Tarifa por milla','sRouteRate','number',p.transportRatePerMile||'2.50')}${input('Cargo base','sRouteBase','number',p.transportBaseCharge||'0')}<div><label>Ruta</label><button id="openRouteBtn" type="button" class="ghost" disabled>Abrir ruta</button></div></div><small id="routeCalcPreview" class="muted"></small></div>`;
}
function defaultServiceOptions(indId=profile().industry){
  const map={
    hvac:['Diagnóstico HVAC','Mantenimiento preventivo','Mantenimiento profundo','Instalación mini split','Reparación','Garantía','Carga de refrigerante','Limpieza de evaporador','Limpieza de condensador'],
    salon:['Corte','Blower','Color','Tratamiento','Uñas','Barbería','Cejas','Peinado'],
    transport:['Recogido','Entrega','Ruta local','Ruta larga','Carga liviana','Servicio especial'],
    handyman:['Plomería liviana','Electricidad liviana','Construcción liviana','Pintura','Reparación menor','Instalación'],
    cleaning:['Limpieza residencial','Limpieza comercial','Limpieza profunda','Mantenimiento recurrente','Cristales','Post-construcción'],
    construction:['Estimado','Demolición','Plomería','Electricidad','Pisos','Hormigón','Terminaciones','Supervisión']
  };
  return map[indId]||['Servicio general'];
}
function serviceOptions(){
  const p=profile(), id=p.industry||'hvac';
  const custom=p.customServices?.[id];
  const arr=Array.isArray(custom)?custom:[];
  return (arr.length?arr:defaultServiceOptions(id)).filter(Boolean);
}

function enforceModuleView(){const active=state.activeView||'dashboard';document.querySelectorAll('.main > section.view').forEach(view=>{const ok=view.id===active;view.classList.toggle('active',ok);view.hidden=!ok;view.setAttribute('aria-hidden',ok?'false':'true');view.style.display=ok?'block':'none';view.style.visibility=ok?'visible':'hidden';view.style.height=ok?'auto':'0px';view.style.overflow=ok?'visible':'hidden';});}
function show(v){state.activeView=lockedModule(v)?'plans':(v||'dashboard');render();if(innerWidth<921)document.querySelector('.sidebar')?.classList.remove('open');}
function latestPlanRequest(){
  return [...(state.planRequests||[])]
    .filter(r => r.status === 'pending' && normalizePlanId(r.planId) !== currentPlanId())
    .sort((a,b)=>String(b.createdAt?.seconds||b.createdAt||'').localeCompare(String(a.createdAt?.seconds||a.createdAt||'')))[0]||null;
}
function pendingPlanRequest(planId){
  const target = normalizePlanId(planId);
  if(target === currentPlanId()) return null;
  return (state.planRequests||[]).find(r=>normalizePlanId(r.planId)===target && r.status==='pending') || null;
}
function hasAnyPendingPlanRequest(){return !!latestPlanRequest();}
function activePlanName(){return plan().name;}
function planRequestStatusText(){const r=latestPlanRequest();if(!r)return 'Sin solicitudes pendientes';return `Solicitud pendiente: ${PLANS[normalizePlanId(r.planId)]?.name||r.planName||r.planId}`;}
function notifyOwnerByEmail(req){const subject=encodeURIComponent(`Solicitud de plan ${req.planName} - ${profile().businessName||'Cliente Nexus'}`);const body=encodeURIComponent(`Nueva solicitud de cambio de plan.

Negocio: ${profile().businessName||''}
Email usuario: ${auth.currentUser?.email||profile().email||''}
Plan actual: ${activePlanName()}
Plan solicitado: ${req.planName}
Modo: ${req.paymentMode}
UID: ${uid()}

Acción requerida: confirma el pago y activa el plan desde admin.html.`);window.open(`mailto:${ownerEmail()}?subject=${subject}&body=${body}`,'_blank');}
async function requestPlanChange(planId){
  const targetId = normalizePlanId(planId);
  const target = PLANS[targetId];
  if(!target) return;
  if(targetId === currentPlanId()){
    alert('Ese plan ya está activo.');
    return;
  }
  if(hasAnyPendingPlanRequest()){
    alert('Ya existe una solicitud pendiente. Espera aprobación o rechazo antes de solicitar otro plan.');
    return;
  }
  const paymentUrl = links()[targetId] || '';
  const req = {
    planId:targetId,
    planName:target.name,
    fromPlan:currentPlanId(),
    fromPlanName:activePlanName(),
    businessName:profile().businessName||'',
    userEmail:auth.currentUser?.email||profile().email||'',
    uid:uid(),
    status:'pending',
    paymentMode:paymentUrl?'stripe_or_manual':'manual_review',
    paymentUrl,
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  };
  await setDoc(profRef(),{pendingPlan:targetId,pendingPlanName:target.name,pendingPlanStatus:'pending',pendingPlanRequestedAt:serverTimestamp()},{merge:true});
  await addDoc(colPath('planRequests'),req);
  if(paymentUrl){window.open(paymentUrl,'_blank');}
  notifyOwnerByEmail({...req, planName:target.name});
  alert(paymentUrl?'Solicitud registrada. Se abrió el enlace de pago. El plan se activa después de confirmarse el pago.':'Solicitud registrada. El dueño activará el plan después de confirmar el pago.');
}
function setVisuals(){const p=profile(), ind=industry(); if(p.plan!==currentPlanId()) p.plan=currentPlanId(); document.documentElement.style.setProperty('--brand',p.primaryColor||ind.color);document.documentElement.style.setProperty('--brand2',p.secondaryColor||'#0f172a');$('sideLogo').innerHTML=imgOrText(p.logoDashboard,ind.logo);$('dashboardLogo').innerHTML=imgOrText(p.logoDashboard,ind.logo);$('sideLogo').classList.toggle('has-logo',!!p.logoDashboard);$('dashboardLogo').classList.toggle('has-logo',!!p.logoDashboard);$('authLogo').textContent=ind.logo;$('sideName').textContent=p.businessName||'Nexus Business';$('sideIndustry').textContent=ind.name;$('dashboardTitle').textContent=p.businessName||ind.name;$('dashboardText').textContent=p.slogan||'';$('faviconLink').href=p.favicon||$('faviconLink').href;$('planBadge').textContent=plan().name;$('sidePlan').innerHTML=plan().name;$('sideQuota').textContent=`${state.clients.length}/${unlimited(limit('clients'))?'∞':limit('clients')} clientes`;}
function nav(){const ind=industry();$('sideNav').innerHTML=ind.nav.map(v=>`<button type="button" data-view="${v}" class="${state.activeView===v?'active':''} ${lockedModule(v)?'locked':''}">${TITLES[v]||v}<span>${lockedModule(v)?'🔒':''}</span></button>`).join('');document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));}
function input(label,id,type='text',val='',cls=''){return `<div class="${cls}"><label>${esc(label)}</label><input id="${id}" type="${type}" value="${esc(val)}" placeholder="${esc(label)}"></div>`;}
function select(label,id,opts,val='',cls=''){return `<div class="${cls}"><label>${esc(label)}</label><select id="${id}">${opts.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(val)?'selected':''}>${esc(o.label)}</option>`).join('')}</select></div>`;}
function table(head,rows){return `<div class="table-wrap"><table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${head.length}" class="muted">Sin registros.</td></tr>`}</tbody></table></div>`;}
function action(c,id){return `<div class="actions"><button data-edit="${c}:${id}" type="button">Editar</button><button class="danger" data-del="${c}:${id}" type="button">Borrar</button></div>`;}

function serviceTitle(s){
  return s?.title || (Array.isArray(s?.items) && s.items[0]?.description) || industry().service;
}
function serviceItemsTotal(items){
  return (items || []).reduce((a,it)=>a+(Number(it.qty||1)*Number(it.price||0)),0);
}
function taxPercent(){
  return Math.max(0, Number(profile().tax || 0));
}
function taxRate(){
  return taxPercent() / 100;
}
function serviceSubtotal(s){
  const itemsTotal = serviceItemsTotal(s.items || []);
  return itemsTotal > 0 ? itemsTotal : Number(s.amount || 0);
}
function invoiceTotalsFromService(s){
  const subtotal = serviceSubtotal(s);
  const ivu = subtotal * taxRate();
  return { subtotal, ivu, total: subtotal + ivu, taxPercent: taxPercent() };
}
function invoiceTotals(inv){
  const subtotal = Number(inv.subtotal ?? ((inv.items && inv.items.length) ? serviceItemsTotal(inv.items) : Number(inv.total || 0)));
  const ivu = Number(inv.ivu ?? 0);
  const total = Number(inv.total ?? (subtotal + ivu));
  return { subtotal, ivu, total, taxPercent: Number(inv.taxPercent ?? profile().tax ?? 0) };
}
function serviceAmount(s){
  return serviceSubtotal(s);
}
function itemRowsHtml(items){
  const arr = (items && items.length) ? items : [{description:'',qty:1,price:''}];
  return arr.map((it,idx)=>`<div class="service-line" data-service-line>
    <div class="line-number">${idx+1}</div>
    <input class="svc-desc" placeholder="Descripción del servicio / partida" value="${esc(it.description||'')}">
    <input class="svc-qty" type="number" step="0.01" min="0" placeholder="Cant." value="${esc(it.qty ?? 1)}">
    <input class="svc-price" type="number" step="0.01" min="0" placeholder="Precio" value="${esc(it.price ?? '')}">
    <button class="danger mini" data-remove-line type="button">×</button>
  </div>`).join('');
}
function getServiceItems(){
  return [...document.querySelectorAll('[data-service-line]')].map(row=>({
    description: row.querySelector('.svc-desc')?.value.trim() || '',
    qty: Number(row.querySelector('.svc-qty')?.value || 1),
    price: Number(row.querySelector('.svc-price')?.value || 0)
  })).filter(it=>it.description || it.price > 0);
}
function updateServiceTotal(){
  const total = serviceItemsTotal(getServiceItems());
  const amount = $('sAmount');
  const badge = $('sItemsTotal');
  if (badge) badge.textContent = money(total);
  if (amount && total > 0) amount.value = total.toFixed(2);
}
function bindServiceItems(){
  const addBtn = $('addServiceLine');
  if (!addBtn) return;
  addBtn.onclick = () => {
    const box = $('serviceItemsBox');
    box.insertAdjacentHTML('beforeend', itemRowsHtml([{description:'',qty:1,price:''}]));
    bindServiceItems();
    updateServiceTotal();
  };
  document.querySelectorAll('[data-remove-line]').forEach(btn=>btn.onclick=()=>{
    const rows = document.querySelectorAll('[data-service-line]');
    if(rows.length > 1) btn.closest('[data-service-line]').remove();
    else btn.closest('[data-service-line]').querySelectorAll('input').forEach((i,idx)=>i.value=idx===1?'1':'');
    updateServiceTotal();
  });
  document.querySelectorAll('.svc-desc,.svc-qty,.svc-price').forEach(el=>el.oninput=updateServiceTotal);
  updateServiceTotal();
}
function serviceItemsText(s){
  const items = s.items || [];
  if(items.length) return items.map(it=>`${it.qty || 1} × ${it.description || 'Servicio'} · ${money(it.price || 0)}`).join('<br>');
  return (s.fields||[]).map(esc).join(' · ');
}
function limitText(c){const l=limit(c);return unlimited(l)?`${(state[c]||[]).length}/∞`:`${(state[c]||[]).length}/${l}`;}
function limits(){['clients','services','team','assets','suppliers','supplierPayments','payroll','invoices','payments','cashflow'].forEach(c=>{const el=$(c+'Limit');if(el)el.textContent=`Uso: ${limitText(c)}`;});}


let currentDemoIndustry='';
async function addDemoRecord(col, data){
  return await addDoc(colPath(col), {...data, demo:true, demoIndustry:currentDemoIndustry, createdAt:serverTimestamp(), updatedAt:serverTimestamp()});
}
async function clearDemoData(industryId=''){
  if(!uid()) return;
  const demoCols = ['clients','services','team','assets','suppliers','supplierPayments','payroll','invoices','payments','cashflow','planRequests'];
  const id=String(industryId||'').toLowerCase();
  for(const c of demoCols){
    const snap = await getDocs(colPath(c));
    await Promise.all(snap.docs.filter(d=>{
      const x=d.data()||{};
      const docIndustry=String(x.demoIndustry||x.industry||'').toLowerCase();
      const num=String(x.number||'').toLowerCase();
      if(!id) return x.demo===true || num.includes('demo');
      return (x.demo===true && docIndustry===id) || num.includes(`demo-${id}`);
    }).map(d=>deleteDoc(d.ref)));
  }
}
function demoTotals(items){
  const subtotal = serviceItemsTotal(items || []);
  const ivu = subtotal * taxRate();
  return {subtotal, ivu, total:subtotal+ivu, taxPercent:taxPercent()};
}
async function loadIndustryDemo(industryId){
  const demo = DEMOS[industryId];
  if(!demo) return alert('Demo no disponible.');
  currentDemoIndustry=industryId;
  const selectedPlan = currentPlanId();
  await setDoc(profRef(),{
    businessName:demo.business,
    slogan:demo.slogan,
    industry:industryId,
    primaryColor:demo.color,
    plan:selectedPlan,
    demoIndustryLoaded:industryId,
    demoLoadedAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  },{merge:true});

  const clients=[];
  for(const c of demo.clients){
    const ref=await addDemoRecord('clients',{name:c[0],phone:c[1],email:c[2],city:c[3],address:c[4]});
    clients.push({id:ref.id,name:c[0]});
  }
  const team=[];
  for(const t of demo.team){
    const ref=await addDemoRecord('team',{name:t[0],phone:t[1],rate:t[2],retention:t[3],role:t[4]});
    team.push({id:ref.id,name:t[0],rate:t[2]});
  }
  const assets=[];
  for(let i=0;i<demo.assets.length;i++){
    const a=demo.assets[i], c=clients[i%clients.length];
    const ref=await addDemoRecord('assets',{clientId:c.id,clientName:c.name,industry:industryId,name:a[0],category:a[1],location:a[2],status:a[3],value:a[4],date:today(),warranty:a[5],notes:a[6]});
    assets.push({id:ref.id,name:a[0],clientId:c.id,clientName:c.name});
  }
  const suppliers=[];
  for(const sp of demo.suppliers){
    const ref=await addDemoRecord('suppliers',{name:sp[0],phone:sp[1],email:sp[2],openingBalance:sp[3],fields:['Demo','Activo','30 días','']});
    suppliers.push({id:ref.id,name:sp[0],openingBalance:sp[3]});
  }
  const services=[];
  for(let i=0;i<demo.services.length;i++){
    const sv=demo.services[i], c=clients[i%clients.length], t=team[i%team.length], a=assets[i%assets.length];
    const demoRoute = industryId==='transport' ? [
      {origin:'San Juan, Puerto Rico',destination:'Caguas, Puerto Rico',miles:22.4,rate:Number(profile().transportRatePerMile||2.50),base:Number(profile().transportBaseCharge||0)},
      {origin:'Bayamón, Puerto Rico',destination:'Arecibo, Puerto Rico',miles:45.8,rate:Number(profile().transportRatePerMile||2.50),base:Number(profile().transportBaseCharge||0)},
      {origin:'Guaynabo, Puerto Rico',destination:'Ponce, Puerto Rico',miles:73.6,rate:Number(profile().transportRatePerMile||2.50),base:Number(profile().transportBaseCharge||0)}
    ][i%3] : null;
    if(demoRoute) demoRoute.total = demoRoute.base + (demoRoute.miles * demoRoute.rate);
    const ref=await addDemoRecord('services',{clientId:c.id,clientName:c.name,assetId:a.id,assetName:a.name,teamId:t.id,teamName:t.name,date:daysAgo(18-i*4),serviceType:sv[0],title:sv[2],amount:demoRoute?demoRoute.total:sv[1],items:sv[3],fields:industryId==='transport'?[sv[0],'Demo']: [sv[0],a.name,'Demo','Completado','Notas administrativas'],route:demoRoute});
    services.push({id:ref.id,clientId:c.id,clientName:c.name,title:sv[2],items:sv[3]});
  }
  const invoices=[];
  for(let i=0;i<services.length;i++){
    const sv=services[i], totals=demoTotals(sv.items), number=`INV-DEMO-${industryId.toUpperCase()}-${String(i+1).padStart(3,'0')}`;
    const ref=await addDemoRecord('invoices',{number,date:daysAgo(15-i*3),serviceId:sv.id,clientId:sv.clientId,clientName:sv.clientName,serviceTitle:sv.title,items:sv.items,fields:[],subtotal:totals.subtotal,ivu:totals.ivu,taxPercent:totals.taxPercent,total:totals.total,status:i===0?'Pagada':'Pendiente'});
    invoices.push({id:ref.id,number,total:totals.total});
  }
  for(let i=0;i<invoices.length;i++){
    const inv=invoices[i];
    const amount=i===0?inv.total:Math.round(inv.total*0.45*100)/100;
    await addDemoRecord('payments',{invoiceId:inv.id,invoiceNumber:inv.number,date:daysAgo(10-i*2),method:i===0?'Tarjeta':'ATH Móvil',amount,note:'Cobro demo'});
    await addDemoRecord('cashflow',{date:daysAgo(10-i*2),type:'Ingreso',concept:`Cobro ${inv.number}`,amount});
  }
  for(let i=0;i<suppliers.length;i++){
    const sp=suppliers[i], amount=Math.round(sp.openingBalance*0.55*100)/100;
    await addDemoRecord('supplierPayments',{supplierId:sp.id,supplierName:sp.name,date:daysAgo(7+i),method:'Transferencia',amount,note:'Pago demo suplidor'});
    await addDemoRecord('cashflow',{date:daysAgo(7+i),type:'Gasto',concept:`Pago suplidor ${sp.name}`,amount});
  }
  for(let i=0;i<team.length;i++){
    const gross=team[i].rate?320+i*80:0;
    if(gross>0){
      const deductions=Math.round(gross*0.05*100)/100, net=gross-deductions;
      await addDemoRecord('payroll',{teamId:team[i].id,teamName:team[i].name,date:daysAgo(5+i),period:'Semana demo',gross,deductions,net,method:'ATH Móvil',note:'Pago demo'});
      await addDemoRecord('cashflow',{date:daysAgo(5+i),type:'Gasto',concept:`Nómina ${team[i].name}`,amount:net});
    }
  }
  currentDemoIndustry='';
  alert('Demo cargado.');
  show('dashboard');
}
async function cleanDemoFromSettings(){
  const id=profile().industry||'hvac';
  if(!confirm('¿Borrar demo?')) return;
  await clearDemoData(id);
  await setDoc(profRef(),{demoIndustryLoaded:'',demoLoadedAt:null,updatedAt:serverTimestamp()},{merge:true});
  alert('Demo borrado.');
}
function bindDemoSettings(){
  const load=$('loadDemoBtn'); if(load) load.onclick=async()=>{
    const id=profile().industry||'hvac';
    await clearDemoData(id);
    await loadIndustryDemo(id);
  };
  const clean=$('cleanDemoBtn'); if(clean) clean.onclick=cleanDemoFromSettings;
}

function forms(){const i=industry();
  $('clientsTitle').textContent=i.clients;$('servicesTitle').textContent=i.services;$('teamTitle').textContent=i.team;$('assetsTitle').textContent=i.assets;$('payrollTitle').textContent=i.payroll;$('suppliersTitle').textContent=i.suppliers;$('supplierPaymentsTitle').textContent=i.supplierPayments;
  $('clientForm').innerHTML=input('Nombre','cName')+input('Teléfono','cPhone')+input('Email','cEmail')+input('Municipio','cCity')+input('Dirección','cAddress','text','','wide')+'<button class="primary" type="submit">Guardar</button>';
  $('serviceForm').innerHTML=select(i.client,'sClient',state.clients.map(c=>({value:c.id,label:c.name})))+select('Activo relacionado','sAsset',[{value:'',label:'Sin activo'}].concat(state.assets.map(a=>({value:a.id,label:assetLabel(a)}))),'')+select(i.team,'sTeam',state.team.map(t=>({value:t.id,label:t.name})))+input('Fecha','sDate','date',today())+select('Servicio','sServiceType',serviceOptions().map(x=>({value:x,label:x})))+input('Descripción principal','sTitle','text','','wide')+input('Monto facturado','sAmount','number')+transportRouteFormHtml()+i.serviceFields.map((f,n)=>input(f,'sF'+n,'text','','wide')).join('')+`<div class="wide service-lines-card"><div class="line-head"><div><b>Partidas</b></div><strong id="sItemsTotal">$0.00</strong></div><div id="serviceItemsBox">${itemRowsHtml()}</div><button id="addServiceLine" class="ghost" type="button">+ Añadir servicio</button></div><button class="primary" type="submit">Guardar</button>`;
  $('teamForm').innerHTML=input('Nombre','tName')+input('Teléfono','tPhone')+input('Puesto / Rol','tRole')+input('% Comisión','tRate','number','0')+input('% Retención','tRetention','number','0')+'<button class="primary" type="submit">Guardar</button>';
  $('assetForm').innerHTML=select('Cliente asignado','aClient',[{value:'',label:'Sin cliente'}].concat(state.clients.map(c=>({value:c.id,label:c.name}))))+input('Nombre del activo','aName')+select('Categoría','aCategory',['Equipo','Vehículo','Herramienta','Mobiliario','Infraestructura','Tecnología','Inventario Especial','Otro'].map(x=>({value:x,label:x})))+input('Ubicación','aLocation')+select('Estado','aStatus',['Activo','En uso','En garantía','Inactivo','Baja'].map(x=>({value:x,label:x})))+input('Valor estimado','aValue','number')+input('Fecha de registro','aDate','date',today())+input('Garantía / vigencia','aWarranty','text','','wide')+input('Notas administrativas','aNotes','text','','wide')+'<button class="primary" type="submit">Guardar activo</button>';
  $('supplierForm').innerHTML=input('Nombre suplidor','supName')+input('Teléfono','supPhone')+input('Email','supEmail')+input('Balance inicial / deuda','supOpening','number','0')+i.supplierFields.map((f,n)=>input(f,'supF'+n,'text','','wide')).join('')+'<button class="primary" type="submit">Guardar suplidor</button>';
  $('supplierPaymentForm').innerHTML=select('Suplidor','spSupplier',state.suppliers.map(s=>({value:s.id,label:`${s.name} · balance ${money(supplierBalance(s.id))}`})))+input('Fecha','spDate','date',today())+input('Método','spMethod','text','Transferencia')+input('Monto','spAmount','number')+input('Nota','spNote','text','','wide')+'<button class="primary" type="submit">Registrar pago</button>';
  $('payrollForm').innerHTML=select(i.team,'prTeam',state.team.map(t=>({value:t.id,label:`${t.name} · balance ${money(teamBalance(t.id))}`})))+input('Fecha','prDate','date',today())+input('Periodo','prPeriod','text')+input('Bruto','prGross','number')+input('Deducciones adicionales','prDeductions','number','0')+input('Método','prMethod','text','Transferencia')+input('Nota','prNote','text','','wide')+'<button class="primary" type="submit">Registrar pago de nómina</button>';
  $('paymentForm').innerHTML=select('Factura','pInvoice',state.invoices.map(inv=>({value:inv.id,label:`${inv.number} · ${inv.clientName} · balance ${money(invoiceBalance(inv))}`})))+input('Fecha','pDate','date',today())+input('Método','pMethod','text','ATH / Efectivo / Tarjeta')+input('Monto','pAmount','number')+input('Nota','pNote','text','','wide')+'<button class="primary" type="submit">Registrar cobro</button>';
  $('cashForm').innerHTML=input('Fecha','xDate','date',today())+select('Tipo','xType',[{value:'Ingreso',label:'Ingreso'},{value:'Gasto',label:'Gasto'}])+input('Concepto','xConcept')+input('Monto','xAmount','number')+'<button class="primary" type="submit">Guardar movimiento</button>';
  const p=profile();$('settingsForm').innerHTML=`<div><label>Industria</label><select id="set_industry">${Object.entries(INDUSTRIES).map(([id,x])=>`<option value="${id}" ${p.industry===id?'selected':''}>${x.name}</option>`).join('')}</select></div><div><label>Plan activo</label><input value="${esc(activePlanName())}" disabled></div><div><label>Estado</label><input value="${esc(planRequestStatusText())}" disabled></div><div class="wide"><label>Servicios de esta industria</label><textarea id="set_services" rows="5" placeholder="Un servicio por línea">${esc(serviceOptions().join('\n'))}</textarea></div>`+input('Nombre comercial','set_businessName','text',p.businessName)+input('Eslogan','set_slogan','text',p.slogan)+input('Teléfono','set_phone','text',p.phone)+input('WhatsApp','set_whatsapp','text',p.whatsapp)+input('Email','set_email','text',p.email)+input('Website','set_web','text',p.web)+input('Dirección','set_address','text',p.address,'wide')+input('Registro comerciante','set_merchant','text',p.merchant)+input('Representante','set_representative','text',p.representative)+input('IVU %','set_tax','number',p.tax)+(p.industry==='transport'?input('Tarifa por milla','set_transportRatePerMile','number',p.transportRatePerMile||'2.50')+input('Cargo base ruta','set_transportBaseCharge','number',p.transportBaseCharge||'0'):'')+input('Color primario','set_primaryColor','color',p.primaryColor)+input('Color secundario','set_secondaryColor','color',p.secondaryColor)+`<div><label>Logo Dashboard</label><input id="set_logoDashboard" type="file" accept="image/*"><small class="muted">Actual: ${p.logoDashboard?'cargado':'sin logo'}</small></div><div><label>Logo PDF</label><input id="set_logoPdf" type="file" accept="image/*"><small class="muted">Actual: ${p.logoPdf?'cargado':'sin logo'}</small></div><div><label>Favicon</label><input id="set_favicon" type="file" accept="image/*"><small class="muted">Actual: ${p.favicon?'cargado':'sin favicon'}</small></div><div><label>Firma digital</label><input id="set_signature" type="file" accept="image/*"><small class="muted">Actual: ${p.signature?'cargada':'sin firma'}</small></div><div class="wide demo-settings"><h3>Demo</h3><div class="demo-buttons"><button id="loadDemoBtn" type="button" class="primary">Cargar demo</button><button id="cleanDemoBtn" type="button" class="danger">Borrar demo</button></div></div>`;
  limits();
  bindDemoSettings();
}

function kpis(){const billed=sum(state.invoices,'total'), collected=sum(state.payments,'amount'), expenses=state.cashflow.filter(x=>x.type==='Gasto').reduce((a,x)=>a+Number(x.amount||0),0), payroll=sum(state.payroll,'net'), supp=sum(state.supplierPayments,'amount');$('kpis').innerHTML=[['Clientes',state.clients.length],['Servicios',state.services.length],['Facturado',money(billed)],['Cobrado',money(collected)],['Nómina pagada',money(payroll)],['Suplidores pagados',money(supp)],['Gastos caja',money(expenses)],['Caja neta',money(collected-expenses)]].map(([a,b])=>`<div class="kpi"><span>${a}</span><strong>${b}</strong></div>`).join('');$('planExperience').innerHTML=`<div class="experience"><b>${plan().badge}: ${plan().name}</b><span>${plan().features.join(' · ')}</span><div class="quota"><i style="width:${Math.min(100,(state.clients.length/(unlimited(limit('clients'))?Math.max(1,state.clients.length):limit('clients')))*100)}%"></i></div><button id="upgradeBtn" type="button">Ver planes</button></div>`;$('recentList').innerHTML=[...state.services.slice(-3).map(x=>`Servicio: ${x.clientName} · ${money(x.amount)}`),...state.payroll.slice(-2).map(x=>`Nómina: ${x.teamName} · ${money(x.net)}`),...state.supplierPayments.slice(-2).map(x=>`Suplidor: ${x.supplierName} · ${money(x.amount)}`)].map(x=>`<div class="list-item">${esc(x)}</div>`).join('')||'<p class="muted">Sin actividad.</p>'; $('upgradeBtn')&&($('upgradeBtn').onclick=()=>show('plans'));}

function tables(){const i=industry();
  $('clientsTable').innerHTML=table(['Nombre','Teléfono','Municipio','Activos','Acción'],state.clients.map(c=>{const ac=state.assets.filter(a=>a.clientId===c.id).length;return `<tr><td><b>${esc(c.name)}</b><br><span class="muted">${esc(c.email)}</span></td><td>${esc(c.phone)}</td><td>${esc(c.city)}</td><td>${ac}</td><td>${action('clients',c.id)}</td></tr>`;}));
  $('teamTable').innerHTML=table([i.team,'Comisión generada','Retención','Nómina pagada','Balance por pagar','Acción'],state.team.map(t=>`<tr><td><b>${esc(t.name)}</b><br><span class="muted">${esc(t.role)} · ${Number(t.rate||0)}% comisión</span></td><td>${money(teamCommission(t.id))}</td><td>${money(teamRetention(t.id))}</td><td>${money(payrollPaid(t.id))}</td><td><b>${money(teamBalance(t.id))}</b></td><td>${action('team',t.id)}</td></tr>`));
  $('payrollTable').innerHTML=table(['Fecha',i.team,'Periodo','Bruto','Deducciones','Neto','Método','Acción'],state.payroll.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.teamName)}</td><td>${esc(p.period)}</td><td>${money(p.gross)}</td><td>${money(p.deductions)}</td><td><b>${money(p.net)}</b></td><td>${esc(p.method)}</td><td>${action('payroll',p.id)}</td></tr>`));
  $('assetsTable').innerHTML=table(['Activo','Cliente','Categoría','Ubicación','Estado','Garantía','Acción'],state.assets.map(a=>`<tr><td><b>${esc(assetName(a))}</b><br><span class="muted">${esc(a.notes||'')}</span></td><td>${esc(a.clientName||'Sin cliente')}</td><td>${esc(assetCategory(a))}</td><td>${esc(assetLocation(a))}</td><td>${esc(assetStatus(a))}</td><td>${esc(a.warranty||'')}</td><td>${action('assets',a.id)}</td></tr>`));
  $('suppliersTable').innerHTML=table(['Suplidor','Contacto','Balance inicial','Pagado','Balance','Acción'],state.suppliers.map(s=>`<tr><td><b>${esc(s.name)}</b><br><span class="muted">${(s.fields||[]).map(esc).join(' · ')}</span></td><td>${esc(s.phone)}<br><span class="muted">${esc(s.email)}</span></td><td>${money(s.openingBalance)}</td><td>${money(supplierPaid(s.id))}</td><td><b>${money(supplierBalance(s.id))}</b></td><td>${action('suppliers',s.id)}</td></tr>`));
  $('supplierPaymentsTable').innerHTML=table(['Fecha','Suplidor','Método','Monto','Nota','Acción'],state.supplierPayments.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.supplierName)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${esc(p.note)}</td><td>${action('supplierPayments',p.id)}</td></tr>`));
  $('servicesTable').innerHTML=table(['ID','Fecha',i.client,'Activo',i.team,'Detalle','Monto','Comisión','Factura','Acción'],state.services.map(s=>{const t=teamBy(s.teamId),inv=state.invoices.find(x=>x.serviceId===s.id),amount=serviceAmount(s),comm=amount*Number(t.rate||0)/100;return `<tr><td><code>${esc(String(s.id).slice(0,7))}</code></td><td>${esc(s.date)}</td><td>${esc(s.clientName)}</td><td>${esc(s.assetName||'')}</td><td>${esc(s.teamName)}</td><td><b>${esc(serviceTitle(s))}</b><br>${isTransport()?(()=>{const r=transportRouteFromService(s);return `<span class="muted">${esc(r.origin||'')} → ${esc(r.destination||'')} ${r.miles?`· ${Number(r.miles).toFixed(2)} mi`:''}</span><br>${routeLink(r.origin,r.destination,'Abrir ruta')}`})():`<span class="muted">${esc((s.fields||[]).filter(Boolean).slice(0,3).join(' · '))}</span>`}</td><td>${money(amount)}</td><td>${money(comm)}</td><td>${inv?esc(inv.number):`<button data-invoice="${s.id}" type="button">Facturar</button>`}</td><td>${action('services',s.id)}</td></tr>`}));
  document.querySelectorAll('[data-invoice]').forEach(b=>b.onclick=()=>createInvoice(b.dataset.invoice));
  $('invoiceTable').innerHTML=table(['Factura','Cliente','Servicio','Total','Pagado','Balance','Estado','Acción'],state.invoices.map(inv=>{const bal=invoiceBalance(inv),paid=Number(inv.total||0)-bal;return `<tr><td><b>${esc(inv.number)}</b></td><td>${esc(inv.clientName)}</td><td>${esc(inv.serviceTitle)}</td><td>${money(inv.total)}</td><td>${money(paid)}</td><td>${money(bal)}</td><td>${bal<=0?'Pagada':paid>0?'Parcial':'Pendiente'}</td><td><div class="actions"><button data-prev-inv="${inv.id}" type="button">Preview</button>${action('invoices',inv.id)}</div></td></tr>`}));
  document.querySelectorAll('[data-prev-inv]').forEach(b=>b.onclick=()=>previewInvoice(b.dataset.prevInv));
  $('paymentsTable').innerHTML=table(['Fecha','Factura','Método','Monto','Nota','Acción'],state.payments.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.invoiceNumber)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${esc(p.note)}</td><td>${action('payments',p.id)}</td></tr>`));
  $('cashTable').innerHTML=table(['Fecha','Tipo','Concepto','Monto','Acción'],state.cashflow.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.type)}</td><td>${esc(x.concept)}</td><td>${money(x.amount)}</td><td>${action('cashflow',x.id)}</td></tr>`));
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>remove(...b.dataset.del.split(':')));
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editRecord(...b.dataset.edit.split(':')));
}

function plans(){
  const pendingAny = latestPlanRequest();
  $('plansGrid').innerHTML=`<div class="plan full"><h3>Activación</h3><small class="muted">${esc(planRequestStatusText())}</small></div>`+
  Object.entries(PLANS).map(([id,p])=>{
    const active=currentPlanId()===id;
    const pending=pendingPlanRequest(id);
    const blockedByOtherPending=!!pendingAny && !pending && !active;
    const isEnterprise=id==='enterprise';
    const label=isEnterprise&&active?'PLAN MÁXIMO':active?'Plan actual':pending?'Solicitud pendiente':blockedByOtherPending?'Solicitud en revisión':(links()[id]?'Solicitar / pagar':'Solicitar revisión');
    const chip=isEnterprise?`<small class="ok-chip">👑 PLAN EMPRESARIAL</small>`:(active?`<small class="ok-chip">Plan actual</small>`:(pending?`<small class="pending-chip">Pendiente de activación</small>`:''));
    return `<div class="plan ${active?'featured':''} ${isEnterprise?'enterprise-plan':''}"><h3>${isEnterprise?'👑 '+p.name:p.name}</h3><div class="price">${p.price}</div><p>${p.features.join('<br>')}</p>${chip}<button type="button" data-plan="${id}" class="${active?'ghost':'primary'}" ${(active&&isEnterprise)||active||pending||blockedByOtherPending?'disabled':''}>${label}</button></div>`
  }).join('');
  document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>requestPlanChange(b.dataset.plan));
}
function render(){setVisuals();nav();forms();bindServiceItems();if(isTransport()){['sOrigin','sDestination','sRouteMiles','sRouteRate','sRouteBase'].forEach(id=>$(id)&&($(id).oninput=updateTransportTotal));updateTransportTotal();}kpis();tables();plans();enforceModuleView();$('pageTitle').textContent=TITLES[state.activeView]||state.activeView;$('pageSubtitle').textContent='';}
async function add(c,data){if(!canCreate(c)){alert(`Límite alcanzado en plan ${plan().name}. Mejora tu plan.`);show('plans');return null;}return await addDoc(colPath(c),{...data,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}
async function remove(c,id){if(confirm('¿Borrar registro?'))await deleteDoc(docPath(c,id));}
async function editRecord(c,id){const arr=state[c]||[],r=arr.find(x=>x.id===id);if(!r)return;const val=prompt('Editar nombre/título/concepto principal:',r.name||r.title||r.concept||r.supplierName||r.teamName||'');if(val===null)return;const field=r.name!==undefined?'name':r.title!==undefined?'title':r.concept!==undefined?'concept':r.supplierName!==undefined?'supplierName':'teamName';await updateDoc(docPath(c,id),{[field]:val,updatedAt:serverTimestamp()});}
async function createInvoice(serviceId){if(!canCreate('invoices')){alert('Límite de facturas alcanzado.');show('plans');return;}const s=state.services.find(x=>x.id===serviceId);if(!s)return;const totals=invoiceTotalsFromService(s);const number='INV-'+String(Date.now()).slice(-7);await add('invoices',{number,date:today(),serviceId:s.id,clientId:s.clientId,clientName:s.clientName,serviceTitle:serviceTitle(s),items:s.items||[],fields:s.fields||[],subtotal:totals.subtotal,ivu:totals.ivu,taxPercent:totals.taxPercent,total:totals.total,status:'Pendiente'});}
function docHeader(title){const p=profile(),logo=p.logoPdf||p.logoDashboard;return `<div class="doc-page"><div class="doc-body"><div class="doc-head">${logo?`<img class="doc-logo" src="${logo}">`:''}<div class="doc-title">${esc(p.businessName||'Empresa')}</div><div>${esc(p.address||'')}</div><div>${esc(p.phone||'')} ${p.email?' · '+esc(p.email):''} ${p.web?' · '+esc(p.web):''}</div><div>${p.merchant?'Registro: '+esc(p.merchant):''}</div></div><h2 style="text-align:center">${esc(title)}</h2>`;}
function docFooter(){const p=profile();return `</div><div class="doc-foot">${esc(p.businessName||'Empresa')}</div></div>`;}
function previewInvoice(id){const inv=state.invoices.find(x=>x.id===id);if(!inv)return;const totals=invoiceTotals(inv),bal=invoiceBalance(inv),paid=totals.total-bal;const rows=(inv.items&&inv.items.length)?inv.items.map(it=>`<tr><td>${esc(it.description||'Servicio')}</td><td>${esc(it.qty||1)}</td><td>${money(it.price||0)}</td><td>${money(Number(it.qty||1)*Number(it.price||0))}</td></tr>`).join(''):`<tr><td>${esc(inv.serviceTitle)}</td><td>1</td><td>${money(totals.subtotal)}</td><td>${money(totals.subtotal)}</td></tr>`;const html=docHeader('FACTURA')+`<div class="doc-meta"><div class="doc-box"><b>Factura:</b> ${esc(inv.number)}<br><b>Fecha:</b> ${esc(inv.date)}</div><div class="doc-box"><b>Cliente:</b> ${esc(inv.clientName)}<br><b>Estado:</b> ${bal<=0?'Pagada':paid>0?'Parcial':'Pendiente'}</div></div><table class="doc-table"><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>${rows}</table><div class="doc-total">Subtotal: ${money(totals.subtotal)}<br>IVU (${totals.taxPercent}%): ${money(totals.ivu)}<br>Total: ${money(totals.total)}<br>Pagado: ${money(paid)}<br>Balance: ${money(bal)}</div>${profile().signature?`<p style="margin-top:35px"><img src="${profile().signature}" style="max-height:70px"><br>Firma autorizada</p>`:''}`+docFooter();state.previewHtml=html;$('reportPreview').innerHTML=html;show('reports');}
function preview(type){let title={executive:'REPORTE EJECUTIVO',invoices:'REPORTE DE FACTURAS',payments:'REPORTE DE COBROS',payroll:'REPORTE DE NÓMINA',suppliers:'REPORTE DE SUPLIDORES',services:'REPORTE DE SERVICIOS',assetsClient:'ACTIVOS POR CLIENTE',assetsStatus:'ACTIVOS POR ESTADO'}[type]||'REPORTE';let html=docHeader(title);if(type==='executive'){html+=`<table class="doc-table"><tr><th>Concepto</th><th>Total</th></tr><tr><td>Clientes</td><td>${state.clients.length}</td></tr><tr><td>Servicios</td><td>${state.services.length}</td></tr><tr><td>Facturado</td><td>${money(sum(state.invoices,'total'))}</td></tr><tr><td>Cobrado</td><td>${money(sum(state.payments,'amount'))}</td></tr><tr><td>Nómina pagada</td><td>${money(sum(state.payroll,'net'))}</td></tr><tr><td>Suplidores pagados</td><td>${money(sum(state.supplierPayments,'amount'))}</td></tr></table>`;}else if(type==='invoices'){html+=`<table class="doc-table"><tr><th>Factura</th><th>Cliente</th><th>Total</th><th>Balance</th></tr>${state.invoices.map(x=>`<tr><td>${esc(x.number)}</td><td>${esc(x.clientName)}</td><td>${money(x.total)}</td><td>${money(invoiceBalance(x))}</td></tr>`).join('')}</table>`;}else if(type==='payments'){html+=`<table class="doc-table"><tr><th>Fecha</th><th>Factura</th><th>Método</th><th>Monto</th></tr>${state.payments.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.invoiceNumber)}</td><td>${esc(x.method)}</td><td>${money(x.amount)}</td></tr>`).join('')}</table>`;}else if(type==='payroll'){html+=`<table class="doc-table"><tr><th>Fecha</th><th>Empleado</th><th>Periodo</th><th>Neto</th></tr>${state.payroll.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.teamName)}</td><td>${esc(x.period)}</td><td>${money(x.net)}</td></tr>`).join('')}</table>`;}else if(type==='suppliers'){html+=`<table class="doc-table"><tr><th>Suplidor</th><th>Balance inicial</th><th>Pagado</th><th>Balance</th></tr>${state.suppliers.map(x=>`<tr><td>${esc(x.name)}</td><td>${money(x.openingBalance)}</td><td>${money(supplierPaid(x.id))}</td><td>${money(supplierBalance(x.id))}</td></tr>`).join('')}</table>`;}else if(type==='assetsClient'){html+=`<table class="doc-table"><tr><th>Cliente</th><th>Activo</th><th>Categoría</th><th>Ubicación</th><th>Estado</th></tr>${state.assets.map(a=>`<tr><td>${esc(a.clientName||'Sin cliente')}</td><td>${esc(assetName(a))}</td><td>${esc(assetCategory(a))}</td><td>${esc(assetLocation(a))}</td><td>${esc(assetStatus(a))}</td></tr>`).join('')}</table>`;}else if(type==='assetsStatus'){const groups={};state.assets.forEach(a=>{const st=assetStatus(a);groups[st]=(groups[st]||0)+1;});html+=`<table class="doc-table"><tr><th>Estado</th><th>Cantidad</th></tr>${Object.entries(groups).map(([st,c])=>`<tr><td>${esc(st)}</td><td>${c}</td></tr>`).join('')}</table>`;}else{html+=`<table class="doc-table"><tr><th>Fecha</th><th>Cliente</th><th>Activo</th><th>Servicio</th><th>Monto</th></tr>${state.services.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.clientName)}</td><td>${esc(x.assetName||'')}</td><td>${esc(serviceTitle(x))}</td><td>${money(serviceAmount(x))}</td></tr>`).join('')}</table>`;}html+=docFooter();state.previewHtml=html;$('reportPreview').innerHTML=html;}
function fileData(input){return new Promise(res=>{const f=input?.files?.[0];if(!f)return res('');const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(f);});}
async function saveSettings(){const p={...profile()};['businessName','slogan','phone','whatsapp','email','web','address','merchant','representative','tax','transportRatePerMile','transportBaseCharge','primaryColor','secondaryColor'].forEach(k=>p[k]=$('set_'+k)?.value||'');p.industry=$('set_industry').value;p.customServices={...(p.customServices||{})};p.customServices[p.industry]=($('set_services')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);for(const k of ['logoDashboard','logoPdf','favicon','signature']){const v=await fileData($('set_'+k));if(v)p[k]=v;}await setDoc(profRef(),p,{merge:true});alert('Guardado.');}
function bindForms(){
  $('clientForm').onsubmit=e=>{e.preventDefault();add('clients',{name:$('cName').value,phone:$('cPhone').value,email:$('cEmail').value,city:$('cCity').value,address:$('cAddress').value});e.target.reset();};
  $('serviceForm').onsubmit=e=>{e.preventDefault();const c=state.clients.find(x=>x.id===$('sClient').value)||{},t=state.team.find(x=>x.id===$('sTeam').value)||{},a=assetBy($('sAsset')?.value||'');const items=getServiceItems();const enteredTitle=($('sTitle')?.value||'').trim();const totalFromItems=serviceItemsTotal(items);const selectedService=$('sServiceType')?.value||industry().service;const title=enteredTitle || items[0]?.description || selectedService;const route=transportRouteFromForm();const serviceFields=industry().serviceFields.map((_,n)=>$('sF'+n)?.value||'');add('services',{clientId:c.id||'',clientName:c.name||'',assetId:a.id||'',assetName:a.id?assetName(a):'',teamId:t.id||'',teamName:t.name||'',date:$('sDate').value,serviceType:selectedService,title,amount:totalFromItems>0?totalFromItems:Number($('sAmount').value||0),items,fields:serviceFields,route});e.target.reset();bindServiceItems();if(isTransport())updateTransportTotal();};
  $('teamForm').onsubmit=e=>{e.preventDefault();add('team',{name:$('tName').value,phone:$('tPhone').value,rate:Number($('tRate').value||0),retention:Number($('tRetention').value||0),role:$('tRole').value});e.target.reset();};
  $('assetForm').onsubmit=e=>{e.preventDefault();const c=clientBy($('aClient')?.value||'');add('assets',{clientId:c.id||'',clientName:c.name||'',industry:profile().industry||'hvac',name:$('aName').value,category:$('aCategory').value,location:$('aLocation').value,status:$('aStatus').value,value:Number($('aValue').value||0),date:$('aDate').value,warranty:$('aWarranty').value,notes:$('aNotes').value});e.target.reset();};
  $('supplierForm').onsubmit=e=>{e.preventDefault();add('suppliers',{name:$('supName').value,phone:$('supPhone').value,email:$('supEmail').value,openingBalance:Number($('supOpening').value||0),fields:industry().supplierFields.map((_,n)=>$('supF'+n)?.value||'')});e.target.reset();};
  $('supplierPaymentForm').onsubmit=e=>{e.preventDefault();const s=supplierBy($('spSupplier').value);if(!s.id)return alert('Selecciona suplidor.');const amount=Number($('spAmount').value||0);add('supplierPayments',{supplierId:s.id,supplierName:s.name,date:$('spDate').value,method:$('spMethod').value,amount,note:$('spNote').value});add('cashflow',{date:$('spDate').value,type:'Gasto',concept:`Pago suplidor ${s.name}`,amount});e.target.reset();};
  $('payrollForm').onsubmit=e=>{e.preventDefault();const t=teamBy($('prTeam').value);if(!t.id)return alert('Selecciona empleado/equipo.');const gross=Number($('prGross').value||0),ded=Number($('prDeductions').value||0),net=Math.max(0,gross-ded);add('payroll',{teamId:t.id,teamName:t.name,date:$('prDate').value,period:$('prPeriod').value,gross,deductions:ded,net,method:$('prMethod').value,note:$('prNote').value});add('cashflow',{date:$('prDate').value,type:'Gasto',concept:`Nómina ${t.name}`,amount:net});e.target.reset();};
  $('paymentForm').onsubmit=e=>{e.preventDefault();const inv=state.invoices.find(x=>x.id===$('pInvoice').value);if(!inv)return alert('Selecciona factura.');const amount=Number($('pAmount').value||0);add('payments',{invoiceId:inv.id,invoiceNumber:inv.number,date:$('pDate').value,method:$('pMethod').value,amount,note:$('pNote').value});add('cashflow',{date:$('pDate').value,type:'Ingreso',concept:`Cobro ${inv.number}`,amount});e.target.reset();};
  $('cashForm').onsubmit=e=>{e.preventDefault();add('cashflow',{date:$('xDate').value,type:$('xType').value,concept:$('xConcept').value,amount:Number($('xAmount').value||0)});e.target.reset();};
  $('saveSettings').onclick=saveSettings;$('invoiceFromService').onclick=()=>{const s=state.services.find(s=>!state.invoices.some(i=>i.serviceId===s.id));if(s)createInvoice(s.id);else alert('No hay servicios pendientes de facturar.');};
  document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>{if(lockedModule('reports')){alert('Reportes es premium.');show('plans');return;}preview(b.dataset.preview);});
  $('printPreview').onclick=()=>{const html=state.previewHtml||$('reportPreview').innerHTML;const w=open('','_blank');w.document.write(`<html><head><title>Documento</title><link rel="stylesheet" href="styles.css"><style>@page{size:letter;margin:.45in;}html,body{margin:0!important;padding:0!important;background:#fff!important;}body{display:block!important;}.doc-page{width:100%!important;max-width:none!important;min-height:calc(11in - .9in)!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;transform:none!important;zoom:1!important;display:flex!important;flex-direction:column!important;}.doc-body{flex:1 1 auto!important;padding:0 0 .25in 0!important;}.doc-foot{position:static!important;margin-top:auto!important;text-align:center!important;}.doc-table{width:100%!important;}</style></head><body>${html}</body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print();},700);};
  $('downloadPreview').onclick=()=>{const {jsPDF}=window.jspdf;const docp=new jsPDF({unit:'pt',format:'a4'});docp.html(state.previewHtml||$('reportPreview').innerHTML,{callback:d=>{const pages=d.getNumberOfPages();for(let n=1;n<=pages;n++){d.setPage(n);d.setFontSize(8);d.setTextColor(100);d.text(`Página ${n} de ${pages}`,d.internal.pageSize.getWidth()/2,d.internal.pageSize.getHeight()-18,{align:'center'});}d.save('nexus-documento.pdf');},x:18,y:18,width:559,windowWidth:900,autoPaging:'text'});};
  $('sideUpgrade').onclick=()=>show('plans');$('mobileMenu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');$('logoutBtn').onclick=()=>signOut(auth);
}
function authUI(){$('authIndustry').innerHTML=Object.entries(INDUSTRIES).map(([id,x])=>`<option value="${id}">${x.name}</option>`).join('');$('showLogin').onclick=()=>{mode='login';document.querySelectorAll('.register-only').forEach(x=>x.classList.add('hidden'));$('authSubmit').textContent='Entrar';$('showLogin').classList.add('active');$('showRegister').classList.remove('active');};$('showRegister').onclick=()=>{mode='register';document.querySelectorAll('.register-only').forEach(x=>x.classList.remove('hidden'));$('authSubmit').textContent='Crear cuenta';$('showRegister').classList.add('active');$('showLogin').classList.remove('active');};$('authForm').onsubmit=async e=>{e.preventDefault();$('authMsg').textContent='Procesando...';try{if(mode==='register'){const cred=await createUserWithEmailAndPassword(auth,$('authEmail').value,$('authPassword').value);await setDoc(doc(db,'users',cred.user.uid),{...defaultProfile(),businessName:$('authBusiness').value||'Mi Negocio',industry:$('authIndustry').value,email:$('authEmail').value});}else await signInWithEmailAndPassword(auth,$('authEmail').value,$('authPassword').value);$('authMsg').textContent='';}catch(err){$('authMsg').textContent=err.message;}};}
async function load(){unsub.forEach(x=>x());unsub=[];const snap=await getDoc(profRef());if(!snap.exists())await setDoc(profRef(),defaultProfile());unsub.push(onSnapshot(profRef(),s=>{state.profile=s.data()||defaultProfile();render();}));COLS.forEach(c=>unsub.push(onSnapshot(colPath(c),s=>{state[c]=s.docs.map(d=>({id:d.id,...d.data()}));$('syncStatus').textContent='Sincronizado';render();},e=>{$('syncStatus').textContent='Firebase bloqueado';console.error(e);})));}
authUI();bindForms();onAuthStateChanged(auth,u=>{if(u){$('authScreen').classList.add('hidden');$('appShell').classList.remove('hidden');load();}else{$('authScreen').classList.remove('hidden');$('appShell').classList.add('hidden');}});
