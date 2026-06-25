import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);
const money = n => Number(n || 0).toLocaleString('en-US', { style:'currency', currency:'USD' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const today = () => new Date().toISOString().slice(0,10);
const daysAgo = n => new Date(Date.now() - n*86400000).toISOString().slice(0,10);
const plusDays = n => new Date(Date.now() + n*86400000).toISOString().slice(0,10);
const monthsFromToday = n => { const d = new Date(); d.setMonth(d.getMonth() + Number(n||0)); return d.toISOString().slice(0,10); };
const links = () => window.NEXUS_PAYMENT_LINKS || {};
const ownerEmail = () => window.NEXUS_OWNER_EMAIL || 'nexustoolspr@gmail.com';
const uid = () => auth.currentUser?.uid;



const I18N_EN = {
  'Gestiona tu negocio de forma simple y eficiente':'Manage your business with clarity and speed',
  'Entrar':'Sign in','Crear cuenta':'Create account','Nombre del negocio':'Business name','Contraseña':'Password','Email':'Email','Procesando...':'Processing...','Salir':'Sign out','Conectando...':'Connecting...','Sincronizado':'Synced','Firebase bloqueado':'Firebase blocked','Buscar...':'Search...','Plan':'Plan','Mejorar':'Upgrade','Centro de Control':'Control Center','Home':'Home','Bienvenido a Nexus':'Welcome to Nexus','Configura tu operación inicial.':'Set up your initial operation.','Configurar':'Configure','Comenzar':'Start','Negocio':'Business','Logo':'Logo','Primer cliente':'First customer','Primera factura':'First invoice','Completo':'Complete','Pendiente':'Pending','Resumen operativo':'Operational summary','Dashboard':'Dashboard','Alertas':'Alerts','Acciones rápidas':'Quick actions','Agenda empresarial':'Business agenda','Búsqueda global':'Global search','Experiencia del plan':'Plan experience','Actividad reciente':'Recent activity',
  'Clientes':'Customers','clientes':'customers','Cliente':'Customer','Servicios':'Services','Servicio':'Service','Equipo':'Team','Nómina':'Payroll','Nómina / Pagos equipo':'Payroll / Team payments','Activos':'Assets','Suplidores':'Vendors','Pagos suplidores':'Vendor payments','Pagos a suplidores':'Vendor payments','Compras':'Purchases','Facturación':'Invoicing','Cobros':'Payments','Flujo de caja':'Cash Flow','Reportes':'Reports','Planes':'Plans','Configuración':'Settings','Guardar':'Save','Guardado.':'Saved.',
  'Industria':'Industry','Idioma':'Language','Español':'Spanish','Inglés':'English','Plan activo':'Active plan','Estado':'Status','Servicios de esta industria':'Services for this industry','Un servicio por línea':'One service per line','Nombre comercial':'Business name','Eslogan':'Tagline','Teléfono':'Phone','WhatsApp':'WhatsApp','Website':'Website','Dirección':'Address','Registro comerciante':'Merchant registry','Representante':'Representative','IVU %':'Tax %','Tarifa por milla':'Rate per mile','Cargo base ruta':'Route base charge','Color primario':'Primary color','Color secundario':'Secondary color','Logo Dashboard':'Dashboard logo','Logo PDF':'PDF logo','Favicon':'Favicon','Firma digital':'Digital signature','Actual: cargado':'Current: uploaded','Actual: sin logo':'Current: no logo','Actual: sin favicon':'Current: no favicon','Actual: cargada':'Current: uploaded','Actual: sin firma':'Current: no signature','Demo':'Demo','Cargar demo':'Load demo','Borrar demo':'Delete demo',
  'Hoy':'Today','Semana':'Week','Mes':'Month','Año':'Year','Fecha':'Date','Vence':'Due','Monto':'Amount','Balance':'Balance','Total':'Total','Subtotal':'Subtotal','Pagado':'Paid','Pendiente':'Pending','Parcial':'Partial','Pagada':'Paid','Vencida':'Overdue','Cancelada':'Canceled','Cancelada':'Canceled','Acción':'Action','Método':'Method','Nota':'Note','Notas':'Notes','Condiciones':'Terms','Descripción':'Description','Cant.':'Qty','Precio Unit.':'Unit Price','No. de Factura:':'Invoice No.:','FACTURA':'INVOICE','ESTADO':'STATUS','CLIENTE':'CUSTOMER','Teléfono:':'Phone:','Dirección:':'Address:','NOTAS':'NOTES','CONDICIONES':'TERMS','PAGADO':'PAID','BALANCE':'BALANCE','SUBTOTAL':'SUBTOTAL','TOTAL':'TOTAL','¡Gracias por su preferencia!':'Thank you for your business!','Gracias por su preferencia':'Thank you for your business','Pago según acuerdo.':'Payment according to agreement.','Pago a través del método acordado.':'Payment through the agreed method.',
  'Facturar próximo servicio sin factura':'Invoice next unbilled service','Preview Ejecutivo':'Executive Preview','Financiero':'Financial','Cuentas por cobrar':'Accounts receivable','Preview Facturas':'Invoice Preview','Preview Servicios':'Service Preview','Preview Cobros':'Payment Preview','Preview Nómina':'Payroll Preview','Preview Suplidores':'Vendor Preview','Compras / CxP':'Purchases / A/P','Operacional':'Operational','Activos por Cliente':'Assets by Customer','Activos por Estado':'Assets by Status','Imprimir':'Print','Descargar PDF':'Download PDF',
  'Límite alcanzado en plan':'Plan limit reached','Mejora tu plan.':'Upgrade your plan.','Límite de servicios alcanzado.':'Service limit reached.','Límite de facturas alcanzado.':'Invoice limit reached.','¿Cancelar esta factura?':'Cancel this invoice?','¿Borrar registro?':'Delete record?','Editar nombre/título/concepto principal:':'Edit main name/title/concept:','Selecciona suplidor.':'Select vendor.','Selecciona empleado/equipo.':'Select employee/team.','Selecciona factura.':'Select invoice.','No se puede cobrar una factura cancelada.':'Cannot collect a canceled invoice.','Monto inválido.':'Invalid amount.','El cobro excede el balance. ¿Registrar de todos modos?':'Payment exceeds balance. Register anyway?','No hay servicios pendientes de facturar.':'There are no unbilled services.','Reportes es premium.':'Reports are premium.',
  'Plan actual':'Current plan','Solicitud pendiente':'Pending request','Solicitud en revisión':'Request under review','Solicitar / pagar':'Request / pay','Solicitar revisión':'Request review','PLAN MÁXIMO':'MAX PLAN','PLAN EMPRESARIAL':'ENTERPRISE PLAN','Pendiente de activación':'Pending activation','Activación':'Activation','Ilimitado':'Unlimited','Soporte corporativo':'Corporate support','Dominio personalizado':'Custom domain','Roles futuros':'Future roles','White-label completo':'Full white-label','Nómina avanzada':'Advanced payroll','Control de suplidores':'Vendor control','Firma digital':'Digital signature','Reportes ejecutivos':'Executive reports','Nómina básica':'Basic payroll','Logo en facturas':'Logo on invoices','Reportes PDF':'PDF reports','Sin nómina':'No payroll','Sin suplidores':'No vendors','Sin reportes avanzados':'No advanced reports',
  'Servicios Hoy':'Today’s Services','Cobros Pendientes':'Pending Payments','Facturas Vencidas':'Overdue Invoices','Compras Pendientes':'Pending Purchases','Nómina Pendiente':'Pending Payroll','Clientes Nuevos':'New Customers','Resumen operativo, financiero y alertas':'Operational, financial and alert summary',
  'Servicio HVAC':'HVAC Service','Servicios HVAC':'HVAC Services','Técnicos':'Technicians','Nómina técnicos':'Technician payroll','Suplidores HVAC':'HVAC Vendors','Diagnósticos, mantenimientos, garantías, facturas, nómina, suplidores y cobros.':'Diagnostics, maintenance, warranties, invoices, payroll, vendors and payments.','Tipo de servicio':'Service type','Equipo / Marca':'Equipment / Brand','BTU / Modelo':'BTU / Model','Diagnóstico':'Diagnosis','Garantía':'Warranty','Marca':'Brand','Modelo':'Model','Serial':'Serial','Ubicación':'Location','Categoría':'Category','Marca principal':'Main brand','Términos':'Terms',
  'Salón / Barbería':'Salon / Barbershop','Cita':'Appointment','Agenda y Citas':'Schedule & Appointments','Estilistas':'Stylists','Pagos estilistas':'Stylist payments','Suplidores belleza':'Beauty Vendors','Agenda, servicios de belleza, productos, comisiones, cobros y reportes.':'Schedule, beauty services, products, commissions, payments and reports.','Profesional':'Professional','Hora':'Time','Duración':'Duration','Notas de estilo':'Style notes','Área':'Area','Silla / Estación':'Chair / Station','Producto principal':'Main product',
  'Transporte':'Transport','Servicios de Transporte':'Transport Services','Choferes':'Drivers','Pagos a choferes':'Driver payments','Suplidores / Talleres':'Vendors / Shops','Rutas, millas, facturación, cobros, comisiones, retenciones, flota y suplidores.':'Routes, miles, invoicing, payments, commissions, deductions, fleet and vendors.','Tipo de carga':'Cargo type','Evidencia / referencia':'Proof / reference','Unidad':'Unit','Tablilla':'Plate','Marbete':'Registration sticker','Seguro':'Insurance','Servicio principal':'Main service',
  'Trabajo':'Job','Trabajos':'Jobs','Personal':'Staff','Pagos personal':'Staff payments','Suplidores materiales':'Material vendors','Trabajos livianos, materiales, evidencias, cobros, nómina y suplidores.':'Light jobs, materials, proof, payments, payroll and vendors.','Materiales':'Materials','Prioridad':'Priority','Observaciones':'Observations','Herramienta':'Tool','Costo':'Cost','Asignado a':'Assigned to','Material principal':'Main material',
  'Limpieza':'Cleaning','Servicios de Limpieza':'Cleaning Services','Nómina personal':'Staff payroll','Suplidores productos':'Product vendors','Limpiezas residenciales/comerciales, productos, nómina, suplidores, cobros y reportes.':'Residential/commercial cleaning, products, payroll, vendors, payments and reports.','Tipo de limpieza':'Cleaning type','Frecuencia':'Frequency','Productos':'Products','Producto / Equipo':'Product / Equipment','Cantidad':'Quantity',
  'Construcción':'Construction','Proyecto':'Project','Proyectos':'Projects','Pagos de obra':'Jobsite payments','Suplidores construcción':'Construction vendors','Proyectos, etapas, materiales, pagos de obra, suplidores, evidencias y reportes.':'Projects, stages, materials, jobsite payments, vendors, proof and reports.','Tipo de proyecto':'Project type','Etapa':'Stage','Notas técnicas':'Technical notes','Material / Equipo':'Material / Equipment','Proveedor':'Vendor',
  'Nombre':'Name','Ciudad':'City','Contacto':'Contact','Cargo':'Role','Salario':'Salary','Activo':'Active','Inactivo':'Inactive','Normal':'Normal','Alta':'High','Baja':'Low','Nuevo':'New','Buscar':'Search','Duplicar':'Duplicate','Eliminar':'Delete','PDF':'PDF'
};
function lang(){return (profile().language||'es').toLowerCase()==='en'?'en':'es';}
function T(s){s=String(s ?? '');return lang()==='en'?(I18N_EN[s]||s):s;}
function tSub(s){s=String(s ?? '');if(lang()!=='en')return s;let out=s;Object.entries(I18N_EN).sort((a,b)=>b[0].length-a[0].length).forEach(([a,b])=>{out=out.split(a).join(b);});return out;}
function applyLanguage(){
  const en=lang()==='en'; document.documentElement.lang=en?'en':'es';
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||['SCRIPT','STYLE','TEXTAREA'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  const nodes=[]; while(walk.nextNode())nodes.push(walk.currentNode);
  nodes.forEach(n=>{const raw=n.nodeValue,trim=raw.trim();const translated=T(trim);if(translated!==trim)n.nodeValue=raw.replace(trim,translated);});
  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{if(el.placeholder)el.placeholder=T(el.placeholder);});
  document.querySelectorAll('option').forEach(el=>{const trim=el.textContent.trim();const translated=T(trim);if(translated!==trim)el.textContent=translated;});
}
function setHtml(el,html){ if(!el)return; el.innerHTML = lang()==='en' ? tSub(html) : html; }

const COLS = ['clients','services','quotes','followups','team','assets','suppliers','supplierPayments','payroll','payrollRetentions','purchases','invoices','payments','cashflow','planRequests'];

const INDUSTRIES = {
  hvac:{name:'HVAC',logo:'HV',color:'#0ea5e9',client:'Cliente',clients:'Clientes',service:'Servicio HVAC',services:'Servicios HVAC',team:'Técnicos',payroll:'Nómina técnicos',assets:'Activos',suppliers:'Suplidores HVAC',supplierPayments:'Pagos a suplidores',hero:'Diagnósticos, mantenimientos, garantías, facturas, nómina, suplidores y cobros.',nav:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de servicio','Equipo / Marca','BTU / Modelo','Diagnóstico','Garantía'],assetFields:['Marca','Modelo','BTU','Serial','Ubicación'],supplierFields:['Categoría','Marca principal','Términos','Notas']},
  salon:{name:'Salón / Barbería',logo:'SB',color:'#a855f7',client:'Cliente',clients:'Clientes',service:'Cita',services:'Agenda y Citas',team:'Estilistas',payroll:'Pagos estilistas',assets:'Activos',suppliers:'Suplidores belleza',supplierPayments:'Pagos a suplidores',hero:'Agenda, servicios de belleza, productos, comisiones, cobros y reportes.',nav:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Servicio','Profesional','Hora','Duración','Notas de estilo'],assetFields:['Área','Silla / Estación','Estado','Notas'],supplierFields:['Categoría','Producto principal','Términos','Notas']},
  transport:{name:'Transporte',logo:'TR',color:'#2563eb',client:'Cliente',clients:'Clientes',service:'Servicio',services:'Servicios de Transporte',team:'Choferes',payroll:'Pagos a choferes',assets:'Activos',suppliers:'Suplidores / Talleres',supplierPayments:'Pagos a suplidores',hero:'Rutas, millas, facturación, cobros, comisiones, retenciones, flota y suplidores.',nav:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de carga','Evidencia / referencia'],assetFields:['Unidad','Tablilla','VIN','Marbete','Seguro'],supplierFields:['Categoría','Servicio principal','Términos','Notas']},
  handyman:{name:'Handyman',logo:'HM',color:'#f97316',client:'Cliente',clients:'Clientes',service:'Trabajo',services:'Trabajos',team:'Personal',payroll:'Pagos personal',assets:'Activos',suppliers:'Suplidores materiales',supplierPayments:'Pagos a suplidores',hero:'Trabajos livianos, materiales, evidencias, cobros, nómina y suplidores.',nav:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Categoría','Área','Materiales','Prioridad','Observaciones'],assetFields:['Herramienta','Estado','Costo','Asignado a'],supplierFields:['Categoría','Material principal','Términos','Notas']},
  cleaning:{name:'Limpieza',logo:'CL',color:'#14b8a6',client:'Cliente',clients:'Clientes',service:'Limpieza',services:'Servicios de Limpieza',team:'Personal',payroll:'Nómina personal',assets:'Activos',suppliers:'Suplidores productos',supplierPayments:'Pagos a suplidores',hero:'Limpiezas residenciales/comerciales, productos, nómina, suplidores, cobros y reportes.',nav:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de limpieza','Área','Frecuencia','Productos','Notas'],assetFields:['Producto / Equipo','Cantidad','Costo','Ubicación'],supplierFields:['Categoría','Producto principal','Términos','Notas']},
  construction:{name:'Construcción',logo:'CO',color:'#64748b',client:'Cliente',clients:'Clientes',service:'Proyecto',services:'Proyectos',team:'Equipo',payroll:'Pagos de obra',assets:'Activos',suppliers:'Suplidores construcción',supplierPayments:'Pagos a suplidores',hero:'Proyectos, etapas, materiales, pagos de obra, suplidores, evidencias y reportes.',nav:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de proyecto','Dirección','Etapa','Materiales','Notas técnicas'],assetFields:['Material / Equipo','Cantidad','Costo','Proveedor'],supplierFields:['Categoría','Material principal','Términos','Notas']}
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
  free:{name:'Free',price:'$0',badge:'Básico',limits:{clients:5,services:10,quotes:10,followups:25,team:1,assets:0,suppliers:0,supplierPayments:0,payroll:0,purchases:0,invoices:3,payments:3,cashflow:5},modules:['dashboard','clients','services','quotes','followups','billing','plans','settings'],features:['5 clientes','10 servicios','3 facturas','Sin nómina','Sin suplidores','Sin reportes avanzados']},
  pro:{name:'Pro',price:'$19.99/mes',badge:'Profesional',limits:{clients:500,services:1000,quotes:1000,followups:5000,team:10,assets:100,suppliers:25,supplierPayments:100,payroll:100,purchases:100,invoices:500,payments:500,cashflow:1000},modules:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],features:['Nómina básica','Suplidores','Logo en facturas','Reportes PDF','500 clientes']},
  business:{name:'Business',price:'$39.99/mes',badge:'Premium',limits:{clients:5000,services:10000,quotes:10000,followups:50000,team:50,assets:1000,suppliers:500,supplierPayments:2000,payroll:2000,purchases:2000,invoices:5000,payments:5000,cashflow:10000},modules:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],features:['White-label completo','Nómina avanzada','Control de suplidores','Firma digital','Reportes ejecutivos']},
  enterprise:{name:'Enterprise',price:'Custom',badge:'Corporativo',limits:{clients:Infinity,services:Infinity,quotes:Infinity,followups:Infinity,team:Infinity,assets:Infinity,suppliers:Infinity,supplierPayments:Infinity,payroll:Infinity,purchases:Infinity,invoices:Infinity,payments:Infinity,cashflow:Infinity},modules:['dashboard','clients','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],features:['Ilimitado','Dominio personalizado','Roles futuros','Soporte corporativo']}
};

const TITLES = {dashboard:'Home',clients:'Clientes',services:'Servicios',quotes:'Cotizaciones Pro',followups:'Seguimiento',team:'Equipo',payroll:'Nómina',assets:'Activos',suppliers:'Suplidores',supplierPayments:'Pagos suplidores',purchases:'Compras',billing:'Facturación',payments:'Cobros',cashflow:'Flujo de caja',reports:'Reportes',plans:'Planes',settings:'Configuración'};
let mode = 'login', unsub = [];
let state = {profile:null,clients:[],services:[],quotes:[],followups:[],team:[],assets:[],suppliers:[],supplierPayments:[],payroll:[],payrollRetentions:[],purchases:[],invoices:[],payments:[],cashflow:[],planRequests:[],previewHtml:'',activeView:'dashboard',editingServiceId:null,editingQuoteId:null};

function defaultProfile(){return {businessName:'Mi Negocio',industry:'hvac',language:'es',plan:'free',planStatus:'active',planChangeMode:'manual',pendingPlan:'',pendingPlanStatus:'none',phone:'',whatsapp:'',email:auth.currentUser?.email||'',address:'',web:'',tax:'11.5',merchant:'',representative:'',slogan:'',logoDashboard:'',logoPdf:'',favicon:'',signature:'',primaryColor:'#2563eb',secondaryColor:'#0f172a',customServices:{},transportRatePerMile:'2.50',transportBaseCharge:'0',dailyGoal:'1000',onboardingComplete:false,onboardingSkipped:false,createdAt:new Date().toISOString()};}
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
function clientTagOptions(){return ['VIP','Corporativo','Residencial','Comercial','Moroso','Garantía','Contrato','Prospecto','Recurrente','Prioridad','Inactivo','Otro'];}
function clientTagsArray(v){return String(v||'').split(',').map(x=>x.trim()).filter(Boolean);}
function clientTagsSelectHtml(id,val=''){
  const selected=clientTagsArray(val);
  return `<div><label>Etiquetas</label><select id="${id}" class="tag-scroll-select" multiple size="5">${clientTagOptions().map(x=>`<option value="${esc(x)}" ${selected.includes(x)?'selected':''}>${esc(x)}</option>`).join('')}</select><small class="muted">Selecciona una o varias etiquetas.</small></div>`;
}
function readClientTags(id){const el=$(id); return el ? [...el.selectedOptions].map(o=>o.value).join(', ') : '';}
function cleanSSN(value){return String(value||'').replace(/\D/g,'').slice(0,9);}
function formatSSNInput(value){const d=cleanSSN(value); if(!d)return ''; if(d.length<=3)return d; if(d.length<=5)return `${d.slice(0,3)}-${d.slice(3)}`; return `${d.slice(0,3)}-${d.slice(3,5)}-${d.slice(5)}`;}
function maskSSN(value){const d=cleanSSN(value); return d.length>=4 ? `***-**-${d.slice(-4)}` : '***-**-****';}
function vehicleAssetOptions(){return state.assets.filter(a=>String(assetCategory(a)).toLowerCase().includes('veh') || String(assetName(a)).toLowerCase().includes('veh'))}

function invoicePaid(inv){return state.payments.filter(p=>p.invoiceId===inv.id).reduce((t,p)=>t+Number(p.amount||0),0);}
function invoiceBalance(inv){return Math.max(0,Number(inv.total||0)-invoicePaid(inv));}
function dateValue(d){return d ? new Date(String(d)+'T00:00:00').getTime() : 0;}
function invoiceStatus(inv){
  if(String(inv.status||'').toLowerCase()==='cancelada') return 'Cancelada';
  const bal=invoiceBalance(inv), paid=invoicePaid(inv), due=dateValue(inv.dueDate);
  if(bal<=0) return 'Pagada';
  if(due && due < dateValue(today())) return 'Vencida';
  if(paid>0) return 'Parcial';
  return 'Pendiente';
}
function statusChip(st){const cls=String(st||'').toLowerCase().replace(/\s+/g,'-');return `<span class="status-chip status-${cls}">${esc(st)}</span>`;}
function financialSummary(){
  const startMonth=today().slice(0,7);
  const paid=sum(state.payments,'amount');
  const invoiced=sum(state.invoices,'total');
  const receivable=state.invoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const overdue=state.invoices.filter(inv=>invoiceStatus(inv)==='Vencida').reduce((a,inv)=>a+invoiceBalance(inv),0);
  const expenses=sum(state.payroll,'net')+sum(state.supplierPayments,'amount')+state.cashflow.filter(x=>x.type==='Gasto' && !String(x.concept||'').startsWith('Nómina ') && !String(x.concept||'').startsWith('Pago suplidor ')).reduce((a,x)=>a+Number(x.amount||0),0);
  const monthIncome=state.payments.filter(p=>String(p.date||'').startsWith(startMonth)).reduce((a,p)=>a+Number(p.amount||0),0);
  const monthExpenses=state.cashflow.filter(x=>String(x.date||'').startsWith(startMonth) && x.type==='Gasto').reduce((a,x)=>a+Number(x.amount||0),0);
  return {paid,invoiced,receivable,overdue,expenses,net:paid-expenses,monthIncome,monthExpenses,monthNet:monthIncome-monthExpenses};
}
function teamCommission(tid){const t=teamBy(tid);return state.services.filter(s=>s.teamId===tid).reduce((a,s)=>a+(serviceAmount(s)*Number(t.rate||0)/100),0);}
function teamRetention(tid){const t=teamBy(tid);return state.services.filter(s=>s.teamId===tid).reduce((a,s)=>a+(serviceAmount(s)*Number(t.retention||0)/100),0);}
function payrollRetention(p){return Number(p.retention ?? p.retenciones ?? 0);}
function payrollOtherDeductions(p){return Number(p.deductions||0);}
function payrollAdvance(p){return Number(p.advance||0);}
function payrollTotalDeductions(p){return payrollRetention(p)+payrollOtherDeductions(p)+payrollAdvance(p);}
function payrollGrossTotal(p){return Number(p.gross||0)+Number(p.bonus||0);}
function payrollNet(p){const stored=Number(p.net); if(!Number.isNaN(stored) && (p.net!==undefined && p.net!=='')) return stored; return Math.max(0,payrollGrossTotal(p)-payrollTotalDeductions(p));}

function retentionAmount(r){return Number(r.amount||0);}
function retentionStatus(r){return r.status || (r.paidAt ? 'Pagada' : 'Pendiente');}
function retentionPendingAmount(){return state.payrollRetentions.filter(r=>retentionStatus(r)!=='Pagada' && retentionStatus(r)!=='Aplicada').reduce((a,r)=>a+retentionAmount(r),0);}
function retentionPaidAmount(){return state.payrollRetentions.filter(r=>retentionStatus(r)==='Pagada').reduce((a,r)=>a+retentionAmount(r),0);}
function retentionDestinationOptions(){return ['Departamento de Hacienda','Seguro Social / Medicare','SINOT','Fondo del Seguro del Estado','ASUME','Empleado','Descuento interno','Otro'];}
function retentionTypeOptions(){return ['Hacienda','Seguro Social / Medicare','SINOT','Fondo del Seguro del Estado','ASUME','Adelanto al empleado','Descuento interno','Embargo','Otro'];}
function retentionLabel(r){return `${r.type||'Retención'} · ${r.destination||'Sin destino'}`;}
function payrollPaid(tid){return state.payroll.filter(p=>p.teamId===tid).reduce((a,p)=>a+payrollNet(p),0);}
function teamBalance(tid){return Math.max(0,teamCommission(tid)-teamRetention(tid)-payrollPaid(tid));}
function supplierPaid(sid){return state.supplierPayments.filter(p=>p.supplierId===sid).reduce((a,p)=>a+Number(p.amount||0),0);}
function supplierPurchasesTotal(sid){return state.purchases.filter(p=>p.supplierId===sid).reduce((a,p)=>a+Number(p.total||0),0);}
function purchasePaid(pid){return state.supplierPayments.filter(p=>p.purchaseId===pid).reduce((a,p)=>a+Number(p.amount||0),0);}
function purchaseBalance(p){return Math.max(0,Number(p.total||0)-purchasePaid(p.id));}
function purchaseStatus(p){if(String(p.status||'')==='Cancelada')return 'Cancelada';const bal=purchaseBalance(p), paid=purchasePaid(p.id);if(bal<=0)return 'Pagada';if(p.dueDate && p.dueDate<today())return 'Vencida';return paid>0?'Parcial':'Pendiente';}
function supplierBalance(sid){const s=supplierBy(sid);return Math.max(0,Number(s.openingBalance||0)+supplierPurchasesTotal(sid)-supplierPaid(sid));}
function operationalSummary(){const payrollDue=state.team.reduce((a,t)=>a+teamBalance(t.id),0);const purchaseDebt=state.purchases.reduce((a,p)=>a+purchaseBalance(p),0);const overduePurchases=state.purchases.filter(p=>purchaseStatus(p)==='Vencida').reduce((a,p)=>a+purchaseBalance(p),0);return {employees:state.team.filter(t=>String(t.status||'Activo')!=='Inactivo').length,payrollDue,purchaseDebt,overduePurchases,purchases:state.purchases.length,suppliers:state.suppliers.length};}

function obligationItems(){
  const items=[];
  state.payrollRetentions
    .filter(r=>retentionStatus(r)!=='Pagada' && retentionStatus(r)!=='Aplicada')
    .forEach(r=>items.push({date:r.dueDate||r.date||today(),type:'Retención',title:`${r.destination||'Destino'} · ${r.type||'Retención'} · ${r.teamName||''}`,amount:retentionAmount(r),view:'payroll',status:retentionStatus(r)}));
  state.purchases
    .filter(p=>purchaseBalance(p)>0 && purchaseStatus(p)!=='Cancelada')
    .forEach(p=>items.push({date:p.dueDate||p.date||today(),type:'Compra',title:`${p.supplierName||'Suplidor'} · ${p.concept||p.number||'Compra'}`,amount:purchaseBalance(p),view:'purchases',status:purchaseStatus(p)}));
  state.team
    .map(t=>({team:t,amount:teamBalance(t.id)}))
    .filter(x=>x.amount>0)
    .forEach(x=>items.push({date:today(),type:'Nómina',title:x.team.name||'Empleado',amount:x.amount,view:'payroll',status:'Pendiente'}));
  state.suppliers
    .map(s=>({supplier:s,amount:supplierBalance(s.id),hasPurchases:state.purchases.some(p=>p.supplierId===s.id)}))
    .filter(x=>x.amount>0 && !x.hasPurchases)
    .forEach(x=>items.push({date:today(),type:'Suplidor',title:x.supplier.name||'Suplidor',amount:x.amount,view:'suppliers',status:'Pendiente'}));
  return items.sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')) || String(b.amount-a.amount));
}
function obligationSummary(){
  const items=obligationItems();
  const t=today(), week=plusDays(7), month=plusDays(30);
  const total=items.reduce((a,x)=>a+Number(x.amount||0),0);
  const dueToday=items.filter(x=>String(x.date||'')<=t).reduce((a,x)=>a+Number(x.amount||0),0);
  const dueWeek=items.filter(x=>String(x.date||'')<=week).reduce((a,x)=>a+Number(x.amount||0),0);
  const dueMonth=items.filter(x=>String(x.date||'')<=month).reduce((a,x)=>a+Number(x.amount||0),0);
  const overdue=items.filter(x=>String(x.date||'')<t).reduce((a,x)=>a+Number(x.amount||0),0);
  return {items,total,dueToday,dueWeek,dueMonth,overdue,count:items.length};
}
function financialHubSummary(){
  const f=financialSummary(), o=obligationSummary();
  const receivableToday=state.invoices.filter(inv=>invoiceBalance(inv)>0 && String(inv.dueDate||'')<=today()).reduce((a,inv)=>a+invoiceBalance(inv),0);
  const projectedIncome=f.receivable;
  const projectedOut=o.total;
  const projectedNet=f.net + projectedIncome - projectedOut;
  return {f,o,receivableToday,projectedIncome,projectedOut,projectedNet};
}
function renderFinancialHub(){
  const hub=$('financialHub');
  if(!hub) return;
  const h=financialHubSummary();
  const next=h.o.items.slice(0,6);
  const dueClass=h.o.overdue>0?'danger':h.o.dueWeek>0?'warn':'ok';
  hub.innerHTML=`
    <div class="financial-hub-head">
      <div><h3>Financial Hub</h3><p>Qué debes cobrar y qué debes pagar.</p></div>
      <span class="health-badge ${dueClass}">${h.o.overdue>0?'🔴 Vencido':h.o.dueWeek>0?'🟡 Próximo':'🟢 Al día'}</span>
    </div>
    <div class="financial-hub-grid">
      <button type="button" class="finance-tile" data-finance-view="billing"><span>Debes cobrar</span><b>${money(h.f.receivable)}</b><small>Hoy / vencido: ${money(h.receivableToday)}</small></button>
      <button type="button" class="finance-tile" data-finance-view="payroll"><span>Debes pagar</span><b>${money(h.o.total)}</b><small>${h.o.count} obligaciones</small></button>
      <button type="button" class="finance-tile" data-finance-view="cashflow"><span>Flujo proyectado</span><b>${money(h.projectedNet)}</b><small>Caja + cobros - pagos</small></button>
      <button type="button" class="finance-tile" data-finance-view="purchases"><span>Esta semana</span><b>${money(h.o.dueWeek)}</b><small>Próximos vencimientos</small></button>
    </div>
    <div class="obligation-box">
      <div class="section-head mini"><h4>Próximas obligaciones</h4><span>${money(h.o.dueMonth)}</span></div>
      <div class="obligation-list">${next.length?next.map(x=>`<button type="button" class="obligation-row" data-obligation-view="${esc(x.view)}"><span><b>${esc(x.date||'—')}</b><small>${esc(x.type)} · ${esc(x.title)}</small></span><strong>${money(x.amount)}</strong></button>`).join(''):'<p class="muted">Sin obligaciones pendientes.</p>'}</div>
    </div>`;
  document.querySelectorAll('[data-finance-view]').forEach(b=>b.onclick=()=>show(b.dataset.financeView));
  document.querySelectorAll('[data-obligation-view]').forEach(b=>b.onclick=()=>show(b.dataset.obligationView));
}
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


function serviceTemplates(indId=profile().industry){
  const map={
    hvac:[
      {name:'Diagnóstico',items:[['Diagnóstico técnico',1,75]],fields:['Diagnóstico HVAC','','','','']},
      {name:'Mantenimiento',items:[['Mantenimiento profundo',1,75],['Tratamiento drenaje',1,0]],fields:['Mantenimiento profundo','','','','']},
      {name:'Instalación',items:[['Mano de obra instalación',1,600],['Materiales básicos',1,150]],fields:['Instalación mini split','','','','']}
    ],
    salon:[
      {name:'Corte / Blower',items:[['Corte',1,25],['Blower',1,35]],fields:['Corte y blower','','','','']},
      {name:'Color',items:[['Color',1,75],['Secado',1,35]],fields:['Color','','','','']},
      {name:'Uñas',items:[['Manicura gel',1,55]],fields:['Uñas gel','','','','']}
    ],
    transport:[
      {name:'Ruta local',items:[['Ruta local',1,180]],fields:['Ruta local','']},
      {name:'Carga liviana',items:[['Carga liviana',1,240]],fields:['Carga liviana','']},
      {name:'Ruta larga',items:[['Ruta larga',1,425],['Peajes / manejo',1,50]],fields:['Ruta larga','']}
    ],
    handyman:[
      {name:'Plomería',items:[['Plomería liviana',1,115],['Materiales',1,50]],fields:['Plomería liviana','','','','']},
      {name:'Electricidad',items:[['Electricidad liviana',1,95]],fields:['Electricidad liviana','','','','']},
      {name:'Pintura',items:[['Mano de obra pintura',1,275],['Materiales',1,75]],fields:['Pintura','','','','']}
    ],
    cleaning:[
      {name:'Limpieza profunda',items:[['Limpieza profunda',1,275],['Productos especiales',1,50]],fields:['Limpieza profunda','','','','']},
      {name:'Recurrente',items:[['Limpieza recurrente',1,180]],fields:['Mantenimiento recurrente','','','','']},
      {name:'Post-construcción',items:[['Limpieza post-construcción',1,520]],fields:['Post-construcción','','','','']}
    ],
    construction:[
      {name:'Estimado',items:[['Visita / estimado',1,75]],fields:['Estimado','','','','']},
      {name:'Supervisión',items:[['Supervisión de obra',1,950]],fields:['Supervisión','','','','']},
      {name:'Terminaciones',items:[['Mano de obra terminaciones',1,1600],['Materiales',1,500]],fields:['Terminaciones','','','','']}
    ]
  };
  return map[indId]||map.hvac;
}
function clientTagHtml(c){
  const tags=String(c.tags||'').split(',').map(x=>x.trim()).filter(Boolean);
  return tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('');
}
function clientSummary(c){
  const services=state.services.filter(s=>s.clientId===c.id);
  const invoices=state.invoices.filter(i=>i.clientId===c.id);
  const paid=invoices.reduce((a,inv)=>a+(Number(inv.total||0)-invoiceBalance(inv)),0);
  const balance=invoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const assets=state.assets.filter(a=>a.clientId===c.id).length;
  return {services:services.length,invoices:invoices.length,paid,balance,assets};
}
function dashboardAlerts(){
  const pendingInvoices=state.invoices.filter(inv=>invoiceBalance(inv)>0);
  const overdueInvoices=state.invoices.filter(inv=>invoiceStatus(inv)==='Vencida');
  const unpaid=pendingInvoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const pendingPlans=latestPlanRequest()?1:0;
  const servicesToday=state.services.filter(s=>s.date===today()).length;
  const payrollBalance=state.team.reduce((a,t)=>a+teamBalance(t.id),0);
  const q=quoteSummary();
  const fu=followupSummary();
  const alerts=[];
  if(q.open>0) alerts.push(`Cotizaciones abiertas: ${q.open} · ${money(q.openValue)}`);
  if(q.approved>0) alerts.push(`Cotizaciones aprobadas sin facturar: ${q.approved} · ${money(q.approvedValue)}`);
  if(q.expired>0) alerts.push(`Cotizaciones vencidas: ${q.expired}`);
  if(fu.overdue>0) alerts.push(`Seguimientos vencidos: ${fu.overdue}`);
  if(fu.dueWeek>0) alerts.push(`Seguimientos próximos 7 días: ${fu.dueWeek}`);
  if(unpaid>0) alerts.push(`Facturas con balance: ${pendingInvoices.length} · ${money(unpaid)}`);
  if(overdueInvoices.length) alerts.push(`Facturas vencidas: ${overdueInvoices.length} · ${money(overdueInvoices.reduce((a,inv)=>a+invoiceBalance(inv),0))}`);
  if(servicesToday>0) alerts.push(`Servicios para hoy: ${servicesToday}`);
  if(payrollBalance>0) alerts.push(`Nómina pendiente: ${money(payrollBalance)}`);
  const ops=operationalSummary();
  if(ops.purchaseDebt>0) alerts.push(`Cuentas por pagar: ${money(ops.purchaseDebt)}`);
  const retPend=retentionPendingAmount();
  if(retPend>0) alerts.push(`Retenciones pendientes: ${money(retPend)}`);
  if(ops.overduePurchases>0) alerts.push(`Compras vencidas: ${money(ops.overduePurchases)}`);
  if(pendingPlans) alerts.push('Solicitud de plan pendiente');
  return alerts;
}


function businessDayStats(){
  const t=today();
  const tomorrow=plusDays(1);
  const f=financialSummary();
  const o=operationalSummary();
  const q=quoteSummary();
  const todayServices=state.services.filter(s=>String(s.date||'')===t);
  const tomorrowServices=state.services.filter(s=>String(s.date||'')===tomorrow);
  const weekServices=state.services.filter(s=>String(s.date||'')>=t && String(s.date||'')<=plusDays(7));
  const pendingInvoices=state.invoices.filter(i=>invoiceBalance(i)>0 && invoiceStatus(i)!=='Cancelada');
  const overdueInvoices=state.invoices.filter(i=>invoiceStatus(i)==='Vencida');
  const pendingPurchases=state.purchases.filter(p=>purchaseBalance(p)>0);
  const overduePurchases=state.purchases.filter(p=>purchaseStatus(p)==='Vencida');
  const paymentsToday=state.payments.filter(p=>String(p.date||'')===t).reduce((a,p)=>a+Number(p.amount||0),0);
  const invoicesDueToday=state.invoices.filter(i=>invoiceBalance(i)>0 && String(i.dueDate||'')===t);
  const purchasesDueToday=state.purchases.filter(p=>purchaseBalance(p)>0 && String(p.dueDate||'')===t);
  return {t,tomorrow,f,o,q,todayServices,tomorrowServices,weekServices,pendingInvoices,overdueInvoices,pendingPurchases,overduePurchases,paymentsToday,invoicesDueToday,purchasesDueToday};
}
function greetingText(){
  const h=new Date().getHours();
  if(h<12) return 'Buenos días.';
  if(h<18) return 'Buenas tardes.';
  return 'Buenas noches.';
}
function businessHealth(stats){
  let score=100;
  score-=Math.min(40,stats.overdueInvoices.length*12);
  score-=Math.min(25,stats.overduePurchases.length*10);
  if(stats.o.payrollDue>0) score-=15;
  if(stats.f.receivable>0 && stats.f.paid>0 && stats.f.receivable>stats.f.paid) score-=10;
  if(score>=80) return {label:'Excelente',icon:'🟢',className:'ok'};
  if(score>=55) return {label:'Atención',icon:'🟡',className:'warn'};
  return {label:'Crítico',icon:'🔴',className:'danger'};
}
function industryQuickActions(){
  const base=[['clients','+ Cliente'],['services','+ Servicio'],['quotes','+ Cotización'],['billing','+ Factura'],['payments','+ Cobro'],['purchases','+ Compra'],['team','+ Empleado']];
  const specific={
    hvac:[['services','Nuevo mantenimiento'],['services','Nueva instalación']],
    transport:[['services','Nueva ruta'],['services','Nuevo viaje']],
    salon:[['services','Nueva cita'],['clients','Nuevo cliente']],
    construction:[['services','Nuevo proyecto'],['purchases','Nueva compra']],
    cleaning:[['services','Nueva limpieza'],['clients','Nuevo cliente']],
    handyman:[['services','Nuevo trabajo'],['purchases','Nueva compra']]
  }[profile().industry]||[];
  return [...specific,...base].filter(([v])=>!lockedModule(v)).slice(0,8);
}
function recentActivity(){
  const rows=[];
  state.clients.slice(-3).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Cliente creado: ${x.name}`,view:'clients'}));
  state.services.slice(-4).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Servicio: ${x.clientName} · ${serviceTitle(x)} · ${money(serviceAmount(x))}`,view:'services'}));
  state.quotes.slice(-4).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Cotización: ${x.number} · ${x.clientName} · ${money(quoteTotals(x).total)}`,view:'quotes'}));
  state.invoices.slice(-4).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Factura: ${x.number} · ${x.clientName} · ${money(x.total)}`,view:'billing'}));
  state.payments.slice(-4).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Cobro recibido: ${x.invoiceNumber} · ${money(x.amount)}`,view:'payments'}));
  state.purchases.slice(-3).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Compra: ${x.supplierName||''} · ${money(x.total)}`,view:'purchases'}));
  return rows.slice(-8).reverse();
}
function renderNexusDaily(){
  const s=businessDayStats();
  const h=businessHealth(s);
  const p=profile();
  const goal=Number(p.dailyGoal||1000);
  const progress=goal>0?Math.min(100,(s.paymentsToday/goal)*100):0;
  if($('coachGreeting')) $('coachGreeting').textContent=T(greetingText());
  if($('coachSummary')) $('coachSummary').textContent=`${p.businessName||'Nexus'} · ${new Date().toLocaleDateString('es-PR',{weekday:'long',month:'short',day:'numeric'})}`;
  if($('businessHealth')){$('businessHealth').className=`health-badge ${h.className}`;$('businessHealth').textContent=`${h.icon} ${T(h.label)}`;}
  if($('dailyDate')) $('dailyDate').textContent=new Date().toLocaleDateString('es-PR');
  if($('dailyStrip')) $('dailyStrip').innerHTML=[
    ['Servicios',s.todayServices.length,'services'],['Cotizaciones',s.q.open,'quotes'],['Potencial COT',money(s.q.openValue),'quotes'],['Cobros',money(s.paymentsToday),'payments'],['Facturas',s.pendingInvoices.length,'billing'],['Compras',s.pendingPurchases.length,'purchases'],['Nómina',money(s.o.payrollDue),'payroll']
  ].filter(([_,__,v])=>!lockedModule(v)).map(([a,b,v])=>`<button class="daily-card" type="button" data-daily-view="${v}"><span>${T(a)}</span><b>${esc(b)}</b></button>`).join('');
  document.querySelectorAll('[data-daily-view]').forEach(b=>b.onclick=()=>show(b.dataset.dailyView));
  if($('myDayList')) $('myDayList').innerHTML=[
    ['Servicios de hoy',`${s.todayServices.length}`,s.todayServices.length?'services':''],
    ['Cotizaciones abiertas',`${s.q.open} · ${money(s.q.openValue)}`,s.q.open?'quotes':''],
    ['Facturas vencidas',`${s.overdueInvoices.length}`,s.overdueInvoices.length?'billing':''],
    ['Cobros recibidos hoy',money(s.paymentsToday),'payments'],
    ['Compras por pagar',`${s.pendingPurchases.length}`,s.pendingPurchases.length?'purchases':''],
    ['Nómina pendiente',money(s.o.payrollDue),s.o.payrollDue>0?'payroll':'']
  ].map(([a,b,v])=>`<button class="day-row" type="button" ${v?`data-day-view="${v}"`:''}><span>${T(a)}</span><b>${esc(b)}</b></button>`).join('');
  document.querySelectorAll('[data-day-view]').forEach(b=>b.onclick=()=>show(b.dataset.dayView));
  if($('dailyGoalBox')) $('dailyGoalBox').innerHTML=`<div class="goal-main"><span>${T('Meta')}</span><strong>${money(goal)}</strong></div><div class="goal-main"><span>${T('Cobrado')}</span><strong>${money(s.paymentsToday)}</strong></div><div class="goal-bar"><i style="width:${progress}%"></i></div><small>${Math.round(progress)}% ${T('completado')}</small>`;
  if($('goalStatus')) $('goalStatus').textContent=progress>=100?T('Completado'):T('En progreso');
  if($('priorityList')){
    const priorities=[];
    if(s.overdueInvoices.length) priorities.push(['danger','Facturas vencidas',`${s.overdueInvoices.length} · ${money(s.overdueInvoices.reduce((a,i)=>a+invoiceBalance(i),0))}`,'billing']);
    if(s.invoicesDueToday.length) priorities.push(['warn','Facturas vencen hoy',`${s.invoicesDueToday.length}`,'billing']);
    if(s.overduePurchases.length) priorities.push(['danger','Compras vencidas',`${s.overduePurchases.length}`,'purchases']);
    if(s.o.payrollDue>0) priorities.push(['warn','Nómina pendiente',money(s.o.payrollDue),'payroll']);
    if(!priorities.length) priorities.push(['ok','Operación al día','Sin pendientes críticos','dashboard']);
    $('priorityList').innerHTML=priorities.map(([cls,a,b,v])=>`<button class="priority-item ${cls}" type="button" data-priority-view="${v}"><span>${T(a)}</span><b>${esc(b)}</b></button>`).join('');
    document.querySelectorAll('[data-priority-view]').forEach(b=>b.onclick=()=>show(b.dataset.priorityView));
  }
  if($('quickActions')) $('quickActions').innerHTML=industryQuickActions().map(([v,l])=>`<button type="button" data-quick-view="${v}">${T(l)}</button>`).join('');
  document.querySelectorAll('[data-quick-view]').forEach(b=>b.onclick=()=>show(b.dataset.quickView));
  if($('recentList')){const r=recentActivity();$('recentList').innerHTML=r.length?r.map(x=>`<button class="activity-item" type="button" data-activity-view="${x.view}">${esc(T(x.text))}</button>`).join(''):'<p class="muted">Sin actividad.</p>';document.querySelectorAll('[data-activity-view]').forEach(b=>b.onclick=()=>show(b.dataset.activityView));}
}


function agendaItems(){
  const items=[];
  state.services.filter(x=>x.date && x.date>=today()).forEach(x=>items.push({date:x.date,type:'Servicio',title:`${x.clientName||'Cliente'} · ${serviceTitle(x)}`,view:'services'}));
  state.invoices.filter(x=>invoiceBalance(x)>0 && x.dueDate).forEach(x=>items.push({date:x.dueDate,type:'Factura',title:`${x.number} · ${x.clientName} · ${money(invoiceBalance(x))}`,view:'billing'}));
  state.purchases.filter(x=>purchaseBalance(x)>0 && x.dueDate).forEach(x=>items.push({date:x.dueDate,type:'Compra',title:`${x.number||x.concept} · ${x.supplierName} · ${money(purchaseBalance(x))}`,view:'purchases'}));
  state.payrollRetentions.filter(x=>retentionStatus(x)==='Pendiente' && x.dueDate).forEach(x=>items.push({date:x.dueDate,type:'Retención',title:`${x.destination||x.type} · ${money(retentionAmount(x))}`,view:'payroll'}));
  state.payroll.filter(x=>x.date).slice(-8).forEach(x=>items.push({date:x.date,type:'Nómina',title:`${x.teamName} · ${money(x.net)}`,view:'payroll'}));
  return items.sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,8);
}
function globalSearchResults(q){
  const term=String(q||'').toLowerCase().trim();
  if(!term) return [];
  const hit=(...v)=>v.join(' ').toLowerCase().includes(term);
  const rows=[];
  state.clients.forEach(x=>hit(x.name,x.phone,x.email,x.city,x.tags)&&rows.push({type:'Cliente',title:x.name,meta:[x.phone,x.city].filter(Boolean).join(' · '),view:'clients'}));
  state.services.forEach(x=>hit(x.clientName,serviceTitle(x),x.assetName,x.status)&&rows.push({type:'Servicio',title:`${x.clientName} · ${serviceTitle(x)}`,meta:[x.date,money(serviceAmount(x))].join(' · '),view:'services'}));
  state.quotes.forEach(x=>hit(x.number,x.clientName,x.title,quoteStatus(x))&&rows.push({type:'Cotización',title:`${x.number} · ${x.clientName}`,meta:`${quoteStatus(x)} · ${money(quoteTotals(x).total)}`,view:'quotes'}));
  state.invoices.forEach(x=>hit(x.number,x.clientName,x.serviceTitle,invoiceStatus(x))&&rows.push({type:'Factura',title:`${x.number} · ${x.clientName}`,meta:`${invoiceStatus(x)} · ${money(invoiceBalance(x))}`,view:'billing'}));
  state.assets.forEach(x=>hit(assetName(x),x.clientName,assetCategory(x),assetLocation(x),assetStatus(x))&&rows.push({type:'Activo',title:assetName(x),meta:[x.clientName,assetStatus(x)].filter(Boolean).join(' · '),view:'assets'}));
  state.team.forEach(x=>hit(x.name,x.role,x.phone,x.email,x.personalId,cleanSSN(x.ssn).slice(-4))&&rows.push({type:'Empleado',title:x.name,meta:[x.role,x.status,maskSSN(x.ssn)].filter(Boolean).join(' · '),view:'team'}));
  state.suppliers.forEach(x=>hit(x.name,x.phone,x.email,x.category)&&rows.push({type:'Suplidor',title:x.name,meta:[x.category,money(supplierBalance(x.id))].join(' · '),view:'suppliers'}));
  return rows.slice(0,10);
}
function renderGlobalSearch(){
  const input=$('globalSearch');
  const box=$('globalResults');
  if(!input || !box) return;
  const q=input.value||'';
  const rows=globalSearchResults(q);
  box.innerHTML=q.trim()? (rows.length?rows.map(r=>`<button class="search-hit" type="button" data-search-view="${esc(r.view)}"><b>${esc(r.type)}</b><span>${esc(r.title)}</span><small>${esc(r.meta||'')}</small></button>`).join(''):'<p class="muted">Sin resultados.</p>') : '<p class="muted">Busca clientes, facturas, servicios, activos, empleados o suplidores.</p>';
  document.querySelectorAll('[data-search-view]').forEach(b=>b.onclick=()=>show(b.dataset.searchView));
}
function controlCenter(){
  const f=financialSummary(), o=operationalSummary(), q=quoteSummary();
  if($('controlStrip')) $('controlStrip').innerHTML=[
    ['Cotizaciones abiertas',q.open,'quotes'],
    ['Seguimientos vencidos',fu.overdue,'followups'],
    ['Mant. próximos',fu.dueWeek,'followups'],
    ['Potencial COT',money(q.openValue+q.approvedValue),'quotes'],
    ['Por cobrar',money(f.receivable),'billing'],
    ['Vencido',money(f.overdue),'billing'],
    ['Por pagar',money(o.purchaseDebt),'purchases'],
    ['Nómina',money(o.payrollDue),'payroll'],
    ['Obligaciones',money(obligationSummary().total),'payroll']
  ].map(([a,b,v])=>`<button class="control-card" type="button" data-control-view="${v}"><span>${T(a)}</span><b>${b}</b></button>`).join('');
  document.querySelectorAll('[data-control-view]').forEach(b=>b.onclick=()=>show(b.dataset.controlView));
  if($('agendaList')){const ag=agendaItems();$('agendaList').innerHTML=ag.length?ag.map(x=>`<button class="agenda-item" type="button" data-agenda-view="${esc(x.view)}"><b>${esc(x.date)}</b><span>${esc(x.type)}</span><small>${esc(x.title)}</small></button>`).join(''):'<p class="muted">Sin eventos próximos.</p>';document.querySelectorAll('[data-agenda-view]').forEach(b=>b.onclick=()=>show(b.dataset.agendaView));}
  renderGlobalSearch();
  renderFinancialHub();
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
function setVisuals(){const p=profile(), ind=industry(); if(p.plan!==currentPlanId()) p.plan=currentPlanId(); document.documentElement.style.setProperty('--brand',p.primaryColor||ind.color);document.documentElement.style.setProperty('--brand2',p.secondaryColor||'#0f172a');$('sideLogo').innerHTML=imgOrText(p.logoDashboard,ind.logo);$('dashboardLogo').innerHTML=imgOrText(p.logoDashboard,ind.logo);$('sideLogo').classList.toggle('has-logo',!!p.logoDashboard);$('dashboardLogo').classList.toggle('has-logo',!!p.logoDashboard);const authLogoEl=$('authLogo'); if(authLogoEl){authLogoEl.innerHTML='<img src="assets/logo.png" alt="Nexus Business PR">';}$('sideName').textContent=p.businessName||'Nexus Business';$('sideIndustry').textContent=ind.name;$('dashboardTitle').textContent=p.businessName||ind.name;$('dashboardText').textContent=p.slogan||'';$('faviconLink').href=p.favicon||$('faviconLink').href;$('planBadge').textContent=plan().name;$('sidePlan').innerHTML=plan().name;$('sideQuota').textContent=`${state.clients.length}/${unlimited(limit('clients'))?'∞':limit('clients')} ${T('clientes')}`;}
function nav(){const ind=industry();$('sideNav').innerHTML=ind.nav.map(v=>`<button type="button" data-view="${v}" class="${state.activeView===v?'active':''} ${lockedModule(v)?'locked':''}">${T(TITLES[v]||v)}<span>${lockedModule(v)?'🔒':''}</span></button>`).join('');document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));}
function input(label,id,type='text',val='',cls='',step=''){const extra=type==='number'?(step?` step="${step}" min="0"`:' step="0.01" min="0"'):'';return `<div class="${cls}"><label>${esc(label)}</label><input id="${id}" type="${type}" value="${esc(val)}" placeholder="${esc(label)}"${extra}></div>`;}
function select(label,id,opts,val='',cls=''){return `<div class="${cls}"><label>${esc(label)}</label><select id="${id}">${opts.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(val)?'selected':''}>${esc(o.label)}</option>`).join('')}</select></div>`;}
function table(head,rows){return `<div class="table-wrap"><table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${head.length}" class="muted">Sin registros.</td></tr>`}</tbody></table></div>`;}
function action(c,id){return `<div class="actions"><button data-edit="${c}:${id}" type="button">Editar</button><button class="danger" data-del="${c}:${id}" type="button">Borrar</button></div>`;}


function quoteSummary(){
  const quotes=state.quotes||[];
  const ym=today().slice(0,7);
  const converted=quotes.filter(q=>q.convertedInvoiceId || q.convertedServiceId || String(q.status||'')==='Convertida');
  const open=quotes.filter(q=>['Borrador','Enviada'].includes(quoteStatus(q)));
  const approved=quotes.filter(q=>quoteStatus(q)==='Aprobada' && !q.convertedInvoiceId);
  const expired=quotes.filter(q=>quoteStatus(q)==='Vencida');
  const rejected=quotes.filter(q=>quoteStatus(q)==='Rechazada');
  const month=quotes.filter(q=>String(q.date||q.createdAt?.seconds||'').slice(0,7)===ym);
  const value=quotes.reduce((a,q)=>a+quoteTotals(q).total,0);
  const monthValue=month.reduce((a,q)=>a+quoteTotals(q).total,0);
  const openValue=open.reduce((a,q)=>a+quoteTotals(q).total,0);
  const approvedValue=approved.reduce((a,q)=>a+quoteTotals(q).total,0);
  const convertedValue=converted.reduce((a,q)=>a+quoteTotals(q).total,0);
  const conversionRate=quotes.length?Math.round((converted.length/quotes.length)*100):0;
  return {total:quotes.length,month:month.length,open:open.length,approved:approved.length,expired:expired.length,rejected:rejected.length,converted:converted.length,value,monthValue,openValue,approvedValue,convertedValue,conversionRate};
}

function quoteTotals(q){
  const subtotal = Number(q?.subtotal ?? serviceItemsTotal(q?.items||[]) ?? 0);
  const taxPercentValue = Number(q?.taxPercent ?? profile().tax ?? 0);
  const ivu = Number(q?.ivu ?? (subtotal * (taxPercentValue/100)));
  const total = Number(q?.total ?? (subtotal + ivu));
  return {subtotal, ivu, total, taxPercent:taxPercentValue};
}
function quoteStatus(q){
  if(!q) return 'Borrador';
  if(q.convertedInvoiceId || q.convertedServiceId || String(q.status||'')==='Convertida') return 'Convertida';
  if(q.validUntil && String(q.validUntil)<today() && !['Aprobada','Rechazada'].includes(String(q.status||''))) return 'Vencida';
  if(q.status) return q.status;
  return 'Borrador';
}
function quoteNumber(){return 'COT-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6);}
function quoteCanConvert(q){return q && !q.convertedServiceId && !q.convertedInvoiceId && ['Aprobada','Enviada','Borrador'].includes(quoteStatus(q));}
function quoteCanInvoice(q){return q && !q.convertedInvoiceId && ['Aprobada','Enviada','Borrador','Convertida'].includes(quoteStatus(q));}
function quoteItemsFallback(q){return (q?.items&&q.items.length)?q.items:[{description:q?.title||'Servicio profesional',qty:1,price:Number(q?.subtotal||0)}];}

function normalizePhoneForWhatsApp(v){return String(v||'').replace(/\D/g,'');}
function serviceNeedsMaintenanceFollowup(s){const txt=String([s?.serviceType,s?.title,...(s?.items||[]).map(i=>i.description)].join(' ')).toLowerCase();return txt.includes('mantenimiento') || txt.includes('preventivo') || txt.includes('limpieza');}
function serviceIsInstallation(s){const txt=String([s?.serviceType,s?.title,...(s?.items||[]).map(i=>i.description)].join(' ')).toLowerCase();return txt.includes('instalaci') || txt.includes('mini split');}
function followupStatus(f){if(String(f?.status||'')==='Completado') return 'Completado';const d=String(f?.dueDate||'');if(!d)return f?.status||'Pendiente';if(d<today())return 'Vencido';if(d<=plusDays(14))return 'Próximo';return f?.status||'Programado';}
function followupKindLabel(k){return ({maintenance:'Mantenimiento 6 meses',quote:'Seguimiento cotización',installation:'Post-instalación',general:'Seguimiento'})[k]||'Seguimiento';}
function followupSummary(){const items=state.followups||[];const week=plusDays(7);const month=plusDays(30);return {total:items.length,open:items.filter(x=>followupStatus(x)!=='Completado').length,dueWeek:items.filter(x=>followupStatus(x)!=='Completado'&&String(x.dueDate||'')<=week).length,dueMonth:items.filter(x=>followupStatus(x)!=='Completado'&&String(x.dueDate||'')<=month).length,overdue:items.filter(x=>followupStatus(x)==='Vencido').length,maintenance:items.filter(x=>x.kind==='maintenance'&&followupStatus(x)!=='Completado').length,quotes:items.filter(x=>x.kind==='quote'&&followupStatus(x)!=='Completado').length,installations:items.filter(x=>x.kind==='installation'&&followupStatus(x)!=='Completado').length};}
function followupWhatsAppUrl(f){const c=clientBy(f.clientId)||{};const phone=normalizePhoneForWhatsApp(c.whatsapp||c.phone||f.phone);if(!phone)return'';const msg=f.kind==='maintenance'?`Hola ${f.clientName||''}, le saludamos de Oasis Services. Según nuestro registro, ya corresponde el mantenimiento preventivo de su equipo de aire acondicionado. Nos gustaría coordinar su cita para mantener el rendimiento del equipo.`:f.kind==='quote'?`Hola ${f.clientName||''}, le saludamos de Oasis Services. Le damos seguimiento a su cotización ${f.referenceNumber||''}. Quedamos atentos para coordinar el próximo paso.`:`Hola ${f.clientName||''}, le saludamos de Oasis Services. Estamos dando seguimiento a su servicio/instalación para confirmar que todo esté funcionando correctamente.`;return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;}
async function createFollowupFromService(s,refId=''){
  if(!s || String(s.status||'')!=='Completado') return;
  const serviceId=refId||s.id||'';
  if(serviceId && state.followups.some(f=>f.relatedServiceId===serviceId && (f.kind==='maintenance'||f.kind==='installation'))) return;
  if(serviceNeedsMaintenanceFollowup(s) || serviceIsInstallation(s)){
    const kind=serviceIsInstallation(s)?'installation':'maintenance';
    await add('followups',{kind,clientId:s.clientId||'',clientName:s.clientName||'',assetId:s.assetId||'',assetName:s.assetName||'',teamId:s.teamId||'',teamName:s.teamName||'',relatedServiceId:serviceId,referenceNumber:s.number||'',title:kind==='installation'?'Seguimiento post-instalación + mantenimiento 6 meses':'Próximo mantenimiento preventivo',dueDate:monthsFromToday(6),frequencyMonths:6,status:'Programado',source:'servicio completado',notes:'Generado automático por estándar de mantenimiento cada 6 meses.'});
  }
}
async function createFollowupFromQuote(q){if(!q?.id)return;if(state.followups.some(f=>f.relatedQuoteId===q.id))return;await add('followups',{kind:'quote',clientId:q.clientId||'',clientName:q.clientName||'',assetId:q.assetId||'',assetName:q.assetName||'',teamId:q.teamId||'',teamName:q.teamName||'',relatedQuoteId:q.id,referenceNumber:q.number||'',title:'Seguimiento de cotización',dueDate:plusDays(3),frequencyMonths:0,status:'Pendiente',source:'cotización',notes:'Seguimiento comercial automático.'});}
async function completeFollowup(id){const f=state.followups.find(x=>x.id===id);if(!f)return;await updateDoc(docPath('followups',id),{status:'Completado',completedAt:today(),updatedAt:serverTimestamp()});if(f.kind==='maintenance' && Number(f.frequencyMonths||0)>0){const {id:oldId,completedAt,createdAt,updatedAt,...next}=f;await add('followups',{...next,status:'Programado',dueDate:monthsFromToday(Number(f.frequencyMonths||6)),previousFollowupId:id,notes:next.notes||'Seguimiento recurrente automático cada 6 meses.'});}}
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
  const box=$('serviceItemsBox');
  if(!box) return [];
  return [...box.querySelectorAll('[data-service-line]')].map(row=>({
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
  $('serviceItemsBox')?.querySelectorAll('[data-remove-line]').forEach(btn=>btn.onclick=()=>{
    const rows = $('serviceItemsBox')?.querySelectorAll('[data-service-line]') || [];
    if(rows.length > 1) btn.closest('[data-service-line]').remove();
    else btn.closest('[data-service-line]').querySelectorAll('input').forEach((i,idx)=>i.value=idx===1?'1':'');
    updateServiceTotal();
  });
  $('serviceItemsBox')?.querySelectorAll('.svc-desc,.svc-qty,.svc-price').forEach(el=>el.oninput=updateServiceTotal);
  updateServiceTotal();
}


function getQuoteItems(){
  const box=$('quoteItemsBox'); if(!box) return [];
  return [...box.querySelectorAll('[data-service-line]')].map(row=>({description:row.querySelector('.svc-desc')?.value.trim()||'',qty:Number(row.querySelector('.svc-qty')?.value||1),price:Number(row.querySelector('.svc-price')?.value||0)})).filter(it=>it.description || it.price>0);
}
function updateQuoteTotal(){
  const subtotal=serviceItemsTotal(getQuoteItems());
  const badge=$('qItemsTotal');
  if(badge) badge.textContent=money(subtotal + subtotal*taxRate());
}
function bindQuoteItems(){
  const addBtn=$('addQuoteLine'), box=$('quoteItemsBox');
  if(!addBtn || !box) return;
  addBtn.onclick=()=>{box.insertAdjacentHTML('beforeend', itemRowsHtml([{description:'',qty:1,price:''}])); bindQuoteItems(); updateQuoteTotal();};
  box.querySelectorAll('[data-remove-line]').forEach(btn=>btn.onclick=()=>{const rows=box.querySelectorAll('[data-service-line]'); if(rows.length>1) btn.closest('[data-service-line]').remove(); else btn.closest('[data-service-line]').querySelectorAll('input').forEach((i,idx)=>i.value=idx===1?'1':''); updateQuoteTotal();});
  box.querySelectorAll('.svc-desc,.svc-qty,.svc-price').forEach(el=>el.oninput=updateQuoteTotal);
  updateQuoteTotal();
}
function normalizeLineItems(items){
  return (items&&items.length?items:[{description:'',qty:1,price:''}]).map(it=>{
    if(Array.isArray(it)){ const [description,qty,price]=it; return {description,qty,price}; }
    return {description:it?.description||'', qty:it?.qty ?? 1, price:it?.price ?? ''};
  });
}
function setServiceItems(items){
  const box=$('serviceItemsBox');
  if(!box) return;
  box.innerHTML=itemRowsHtml(normalizeLineItems(items));
  bindServiceItems();
}
function setQuoteItems(items){
  const box=$('quoteItemsBox');
  if(!box) return;
  box.innerHTML=itemRowsHtml(normalizeLineItems(items));
  bindQuoteItems();
}

function resetServiceEditMode(){
  state.editingServiceId=null;
  const btn=$('serviceSubmitBtn'); if(btn) btn.textContent='Guardar';
  const cancel=$('cancelServiceEdit'); if(cancel) cancel.classList.add('hidden');
  const banner=$('serviceEditBanner'); if(banner) banner.classList.add('hidden');
}

function resetQuoteEditMode(){
  state.editingQuoteId=null;
  const btn=$('quoteSubmitBtn'); if(btn) btn.textContent='Guardar cotización';
  const cancel=$('cancelQuoteEdit'); if(cancel) cancel.classList.add('hidden');
  const banner=$('quoteEditBanner'); if(banner) banner.classList.add('hidden');
}
function fillQuoteForm(q){
  if(!q) return;
  if($('qClient')) $('qClient').value=q.clientId||'';
  if($('qAsset')) $('qAsset').value=q.assetId||'';
  if($('qTeam')) $('qTeam').value=q.teamId||'';
  if($('qDate')) $('qDate').value=q.date||today();
  if($('qValid')) $('qValid').value=q.validUntil||plusDays(15);
  if($('qStatus')){
    const st=quoteStatus(q)||'Borrador';
    if(![...$('qStatus').options].some(o=>o.value===st)) $('qStatus').insertAdjacentHTML('beforeend',`<option value="${esc(st)}">${esc(st)}</option>`);
    $('qStatus').value=st;
  }
  if($('qPriority')) $('qPriority').value=q.priority||'Normal';
  if($('qServiceType')){
    const val=q.serviceType||q.title||serviceOptions()[0]||'';
    if(val && ![...$('qServiceType').options].some(o=>o.value===val)) $('qServiceType').insertAdjacentHTML('beforeend',`<option value="${esc(val)}">${esc(val)}</option>`);
    $('qServiceType').value=val;
  }
  if($('qTitle')) $('qTitle').value=q.title||'';
  if($('qNotes')) $('qNotes').value=q.notes||'';
  if($('qTerms')) $('qTerms').value=q.terms||'Precios válidos hasta la fecha indicada. Aprobación requerida para iniciar servicio.';
  setQuoteItems(quoteItemsFallback(q));
}
function startQuoteEdit(id){
  const q=state.quotes.find(x=>x.id===id);
  if(!q) return alert('No se encontró la cotización.');
  show('quotes');
  state.editingQuoteId=id;
  fillQuoteForm(q);
  const btn=$('quoteSubmitBtn'); if(btn) btn.textContent='Actualizar cotización';
  const cancel=$('cancelQuoteEdit'); if(cancel) cancel.classList.remove('hidden');
  const banner=$('quoteEditBanner');
  if(banner){ banner.classList.remove('hidden'); banner.innerHTML=`Editando <b>${esc(q.number||'Cotización')}</b>. Puedes cambiar cliente, estado, partidas, notas y términos.`; }
  $('quoteForm')?.scrollIntoView({behavior:'smooth',block:'start'});
}
async function editQuoteRecord(id){
  startQuoteEdit(id);
}

function fillServiceForm(s){
  if(!s) return;
  if($('sClient')) $('sClient').value=s.clientId||'';
  if($('sAsset')) $('sAsset').value=s.assetId||'';
  if($('sTeam')) $('sTeam').value=s.teamId||'';
  if($('sDate')) $('sDate').value=s.date||today();
  if($('sStatus')) $('sStatus').value=s.status||'Pendiente';
  if($('sPriority')) $('sPriority').value=s.priority||'Normal';
  if($('sServiceType')){
    const val=s.serviceType||serviceTitle(s)||serviceOptions()[0]||'';
    if(val && ![...$('sServiceType').options].some(o=>o.value===val)){
      $('sServiceType').insertAdjacentHTML('beforeend',`<option value="${esc(val)}">${esc(val)}</option>`);
    }
    $('sServiceType').value=val;
  }
  if($('sTitle')) $('sTitle').value=s.title||serviceTitle(s)||'';
  if($('sAmount')) $('sAmount').value=Number(s.amount ?? serviceSubtotal(s) ?? 0).toFixed(2);
  (s.fields||[]).forEach((v,n)=>{ const el=$('sF'+n); if(el) el.value=v||''; });
  if(isTransport()){
    const r=s.route||transportRouteFromService(s)||{};
    if($('sOrigin')) $('sOrigin').value=r.origin||'';
    if($('sDestination')) $('sDestination').value=r.destination||'';
    if($('sRouteMiles')) $('sRouteMiles').value=r.miles??'';
    if($('sRouteRate')) $('sRouteRate').value=r.rate??(profile().transportRatePerMile||'2.50');
    if($('sRouteBase')) $('sRouteBase').value=r.base??(profile().transportBaseCharge||'0');
    updateTransportTotal();
  }
  setServiceItems((s.items&&s.items.length)?s.items:[{description:serviceTitle(s),qty:1,price:s.amount||0}]);
  updateServiceTotal();
}
function startServiceEdit(id){
  const s=state.services.find(x=>x.id===id);
  if(!s) return;
  state.editingServiceId=id;
  show('services');
  setTimeout(()=>{
    fillServiceForm(s);
    const btn=$('serviceSubmitBtn'); if(btn) btn.textContent='Actualizar servicio';
    const cancel=$('cancelServiceEdit'); if(cancel) cancel.classList.remove('hidden');
    const banner=$('serviceEditBanner'); if(banner){ banner.textContent=`Editando: ${serviceTitle(s)} · ${s.clientName||''}`; banner.classList.remove('hidden'); }
    $('serviceForm')?.scrollIntoView({behavior:'smooth',block:'start'});
  },0);
}
function bindServiceProductivity(){
  document.querySelectorAll('[data-service-template]').forEach(btn=>btn.onclick=()=>{
    const tpl=serviceTemplates()[Number(btn.dataset.serviceTemplate)]||{};
    if($('sServiceType') && tpl.name) $('sServiceType').value = serviceOptions().includes(tpl.name)?tpl.name:($('sServiceType').value||serviceOptions()[0]);
    if($('sTitle')) $('sTitle').value = tpl.name||'';
    (tpl.fields||[]).forEach((v,n)=>{const el=$('sF'+n); if(el) el.value=v||'';});
    setServiceItems(tpl.items||[]);
  });
  const dup=$('duplicateLastService');
  if(dup) dup.onclick=()=>{
    const last=[...state.services].sort((a,b)=>String(b.createdAt?.seconds||b.date||'').localeCompare(String(a.createdAt?.seconds||a.date||'')))[0];
    if(!last) return alert('No hay servicios para duplicar.');
    if($('sClient')) $('sClient').value=last.clientId||'';
    if($('sAsset')) $('sAsset').value=last.assetId||'';
    if($('sTeam')) $('sTeam').value=last.teamId||'';
    if($('sServiceType')) $('sServiceType').value=last.serviceType||serviceOptions()[0];
    if($('sTitle')) $('sTitle').value=serviceTitle(last);
    if($('sStatus')) $('sStatus').value='Pendiente';
    if($('sPriority')) $('sPriority').value=last.priority||'Normal';
    (last.fields||[]).forEach((v,n)=>{const el=$('sF'+n); if(el) el.value=v||'';});
    if(last.route){['Origin','Destination','RouteMiles','RouteRate','RouteBase'].forEach(k=>{}); if($('sOrigin')) $('sOrigin').value=last.route.origin||''; if($('sDestination')) $('sDestination').value=last.route.destination||''; if($('sRouteMiles')) $('sRouteMiles').value=last.route.miles||''; if($('sRouteRate')) $('sRouteRate').value=last.route.rate||''; if($('sRouteBase')) $('sRouteBase').value=last.route.base||'';}
    setServiceItems((last.items||[]).map(it=>[it.description,it.qty,it.price]));
    updateTransportTotal();
  };
}

function serviceItemsText(s){
  const items = s.items || [];
  if(items.length) return items.map(it=>`${it.qty || 1} × ${it.description || 'Servicio'} · ${money(it.price || 0)}`).join('<br>');
  return (s.fields||[]).map(esc).join(' · ');
}
function limitText(c){const l=limit(c);return unlimited(l)?`${(state[c]||[]).length}/∞`:`${(state[c]||[]).length}/${l}`;}
function limits(){['clients','services','quotes','followups','team','assets','suppliers','supplierPayments','payroll','invoices','payments','cashflow'].forEach(c=>{const el=$(c+'Limit');if(el)el.textContent=`Uso: ${limitText(c)}`;});}


let currentDemoIndustry='';
async function addDemoRecord(col, data){
  return await addDoc(colPath(col), {...data, demo:true, demoIndustry:currentDemoIndustry, createdAt:serverTimestamp(), updatedAt:serverTimestamp()});
}
async function clearDemoData(industryId=''){
  if(!uid()) return;
  const demoCols = ['clients','services','quotes','followups','team','assets','suppliers','supplierPayments','payroll','payrollRetentions','purchases','invoices','payments','cashflow','planRequests'];
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
  for(let i=0;i<suppliers.length;i++){
    const sp=suppliers[i], subtotal=Math.round(Number(sp.openingBalance||0)*0.75*100)/100, tax=Math.round(subtotal*0.115*100)/100, total=subtotal+tax;
    await addDemoRecord('purchases',{supplierId:sp.id,supplierName:sp.name,date:daysAgo(14+i),dueDate:plusDays(10+i),concept:'Compra demo operacional',reference:`PO-DEMO-${industryId.toUpperCase()}-${String(i+1).padStart(3,'0')}`,number:`PO-DEMO-${industryId.toUpperCase()}-${String(i+1).padStart(3,'0')}`,subtotal,tax,total,status:i===0?'Parcial':'Pendiente',note:'Compra demo'});
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
    const ref=await addDemoRecord('invoices',{number,date:daysAgo(15-i*3),dueDate:plusDays(15-i*3),serviceId:sv.id,clientId:sv.clientId,clientName:sv.clientName,serviceTitle:sv.title,items:sv.items,fields:[],subtotal:totals.subtotal,ivu:totals.ivu,taxPercent:totals.taxPercent,total:totals.total,status:i===0?'Pagada':'Pendiente'});
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
      await addDemoRecord('payroll',{teamId:team[i].id,teamName:team[i].name,date:daysAgo(5+i),period:'Semana demo',gross,bonus:0,retention:deductions,advance:0,deductions:0,totalDeductions:deductions,net,method:'ATH Móvil',note:'Pago demo'});
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
  $('clientsTitle').textContent=i.clients;$('servicesTitle').textContent=i.services;if($('quotesTitle'))$('quotesTitle').textContent='Cotizaciones Pro';$('teamTitle').textContent=i.team;$('assetsTitle').textContent=i.assets;$('payrollTitle').textContent=i.payroll;$('suppliersTitle').textContent=i.suppliers;$('supplierPaymentsTitle').textContent=i.supplierPayments;
  $('clientForm').innerHTML=input('Nombre','cName')+input('Teléfono','cPhone')+input('Email','cEmail')+input('Municipio','cCity')+input('Dirección','cAddress','text','','wide')+input('Contacto alterno','cAltName')+input('Tel. alterno','cAltPhone')+input('Email alterno','cAltEmail')+clientTagsSelectHtml('cTags','VIP')+input('Notas administrativas','cNotes','text','','wide')+'<button class="primary" type="submit">Guardar</button>';
  $('serviceForm').innerHTML=`<div class="wide quick-template-bar"><label>Plantillas rápidas</label><div>${serviceTemplates().map((t,n)=>`<button type="button" class="ghost" data-service-template="${n}">${esc(t.name)}</button>`).join('')}<button type="button" class="ghost" id="duplicateLastService">Duplicar último</button></div></div>`+select(i.client,'sClient',state.clients.map(c=>({value:c.id,label:c.name})))+select('Activo relacionado','sAsset',[{value:'',label:'Sin activo'}].concat(state.assets.map(a=>({value:a.id,label:assetLabel(a)}))),'')+select(i.team,'sTeam',state.team.map(t=>({value:t.id,label:t.name})))+input('Fecha','sDate','date',today())+select('Estado','sStatus',[{value:'Pendiente',label:'Pendiente'},{value:'En proceso',label:'En proceso'},{value:'Completado',label:'Completado'},{value:'Facturado',label:'Facturado'}],'Pendiente')+select('Prioridad','sPriority',[{value:'Normal',label:'Normal'},{value:'Alta',label:'Alta'},{value:'Urgente',label:'Urgente'}],'Normal')+select('Servicio','sServiceType',serviceOptions().map(x=>({value:x,label:x})))+input('Descripción principal','sTitle','text','','wide')+input('Monto facturado','sAmount','number')+transportRouteFormHtml()+i.serviceFields.map((f,n)=>input(f,'sF'+n,'text','','wide')).join('')+`<div id="serviceEditBanner" class="wide edit-banner hidden"></div><div class="wide service-lines-card"><div class="line-head"><div><b>Partidas</b></div><strong id="sItemsTotal">$0.00</strong></div><div id="serviceItemsBox">${itemRowsHtml()}</div><button id="addServiceLine" class="ghost" type="button">+ Añadir servicio</button></div><div class="wide form-actions"><button id="serviceSubmitBtn" class="primary" type="submit">Guardar</button><button id="cancelServiceEdit" class="ghost hidden" type="button">Cancelar edición</button></div>`;
  if($('quoteForm')) $('quoteForm').innerHTML=select(i.client,'qClient',state.clients.map(c=>({value:c.id,label:c.name})))+select('Activo relacionado','qAsset',[{value:'',label:'Sin activo'}].concat(state.assets.map(a=>({value:a.id,label:assetLabel(a)}))),'')+select(i.team,'qTeam',[{value:'',label:'Sin asignar'}].concat(state.team.map(t=>({value:t.id,label:t.name}))))+input('Fecha','qDate','date',today())+input('Válida hasta','qValid','date',plusDays(15))+select('Estado','qStatus',['Borrador','Enviada','Aprobada','Rechazada','Convertida'].map(x=>({value:x,label:x})),'Borrador')+select('Prioridad','qPriority',['Normal','Alta','Urgente'].map(x=>({value:x,label:x})),'Normal')+select('Servicio','qServiceType',serviceOptions().map(x=>({value:x,label:x})))+input('Descripción profesional','qTitle','text','','wide')+input('Notas','qNotes','text','','wide')+input('Términos','qTerms','text','Precios válidos hasta la fecha indicada. Aprobación requerida para iniciar servicio.','wide')+`<div id="quoteEditBanner" class="wide edit-banner hidden"></div><div class="wide service-lines-card quote-lines-card"><div class="line-head"><div><b>Partidas de cotización</b><small class="muted">Servicio, materiales, mano de obra y extras.</small></div><strong id="qItemsTotal">$0.00</strong></div><div id="quoteItemsBox">${itemRowsHtml()}</div><button id="addQuoteLine" class="ghost" type="button">+ Añadir partida</button></div><div class="wide form-actions"><button id="quoteSubmitBtn" class="primary" type="submit">Guardar cotización</button><button id="cancelQuoteEdit" class="ghost hidden" type="button">Cancelar edición</button></div>`;
  $('teamForm').innerHTML=input('Nombre','tName')+input('Teléfono','tPhone')+input('Email','tEmail')+input('Identificación personal ID','tPersonalId')+input('Seguro Social','tSsn','text','','','')+input('Licencia de conducir','tDriverLicense')+select('Vehículo asignado','tAssignedVehicle',[{value:'',label:'Sin vehículo'}].concat(vehicleAssetOptions().map(a=>({value:a.id,label:assetLabel(a)}))))+input('Puesto / Rol','tRole')+select('Estado','tStatus',['Activo','Inactivo','Contratista'].map(x=>({value:x,label:x})))+input('Salario base','tSalary','number','0')+input('% Comisión','tRate','number','0')+input('% Retención','tRetention','number','0')+input('Fecha ingreso','tStart','date',today())+'<button class="primary" type="submit">Guardar</button>';
  $('assetForm').innerHTML=select('Cliente asignado','aClient',[{value:'',label:'Sin cliente'}].concat(state.clients.map(c=>({value:c.id,label:c.name}))))+input('Nombre del activo','aName')+select('Categoría','aCategory',['Equipo','Vehículo','Herramienta','Mobiliario','Infraestructura','Tecnología','Inventario Especial','Otro'].map(x=>({value:x,label:x})))+input('Ubicación','aLocation')+select('Estado','aStatus',['Activo','En uso','En garantía','Inactivo','Baja'].map(x=>({value:x,label:x})))+input('Valor estimado','aValue','number')+input('Fecha de registro','aDate','date',today())+input('Garantía / vigencia','aWarranty','text','','wide')+input('Notas administrativas','aNotes','text','','wide')+'<button class="primary" type="submit">Guardar activo</button>';
  $('supplierForm').innerHTML=input('Nombre suplidor','supName')+input('Teléfono','supPhone')+input('WhatsApp','supWhatsapp')+input('Email','supEmail')+input('Contacto','supContact')+input('Categoría','supCategory')+input('Límite crédito','supCredit','number','0')+input('Balance inicial / deuda','supOpening','number','0')+i.supplierFields.map((f,n)=>input(f,'supF'+n,'text','','wide')).join('')+'<button class="primary" type="submit">Guardar suplidor</button>';
  $('supplierPaymentForm').innerHTML=select('Suplidor','spSupplier',state.suppliers.map(s=>({value:s.id,label:`${s.name} · balance ${money(supplierBalance(s.id))}`})))+select('Compra relacionada','spPurchase',[{value:'',label:'Pago general'}].concat(state.purchases.filter(p=>purchaseBalance(p)>0).map(p=>({value:p.id,label:`${p.number||p.concept} · ${p.supplierName} · ${money(purchaseBalance(p))}`}))))+input('Fecha','spDate','date',today())+select('Método','spMethod',['ATH Móvil','Stripe','PayPal','Transferencia','Cheque','Efectivo','Tarjeta'].map(x=>({value:x,label:x})))+input('Monto','spAmount','number')+input('Nota','spNote','text','','wide')+'<button class="primary" type="submit">Registrar pago</button>';
  $('payrollForm').innerHTML=select(i.team,'prTeam',state.team.map(t=>({value:t.id,label:`${t.name} · balance ${money(teamBalance(t.id))} · ret. ${money(teamRetention(t.id))}`})))+input('Fecha','prDate','date',today())+input('Periodo','prPeriod','text')+input('Horas','prHours','number','0')+input('Horas extra','prOvertime','number','0')+input('Bruto','prGross','number')+input('Bonos / comisiones','prBonus','number','0')+input('Retenciones','prRetention','number','0')+select('Tipo retención','prRetentionType',retentionTypeOptions().map(x=>({value:x,label:x})))+input('Entidad / destino retención','prRetentionDest','text','Departamento de Hacienda')+input('Fecha límite retención','prRetentionDue','date',plusDays(15))+input('Adelantos','prAdvance','number','0')+input('Otros descuentos','prDeductions','number','0')+select('Método','prMethod',['ATH Móvil','Transferencia','Cheque','Efectivo','Tarjeta'].map(x=>({value:x,label:x})))+input('Nota','prNote','text','','wide')+'<button class="primary" type="submit">Registrar pago de nómina</button>';
  $('purchaseForm').innerHTML=select('Suplidor','puSupplier',state.suppliers.map(s=>({value:s.id,label:s.name})))+input('Fecha','puDate','date',today())+input('Vence','puDue','date',plusDays(15))+input('Concepto','puConcept')+input('Referencia / factura','puRef')+input('Subtotal','puSubtotal','number')+input('IVU / impuestos','puTax','number','0')+select('Estado','puStatus',['Pendiente','Parcial','Pagada','Vencida','Cancelada'].map(x=>({value:x,label:x})))+input('Notas','puNote','text','','wide')+'<button class="primary" type="submit">Registrar compra</button>';
  $('paymentForm').innerHTML=select('Factura','pInvoice',state.invoices.filter(inv=>invoiceStatus(inv)!=='Cancelada' && invoiceBalance(inv)>0).map(inv=>({value:inv.id,label:`${inv.number} · ${inv.clientName} · balance ${money(invoiceBalance(inv))}`})))+input('Fecha','pDate','date',today())+select('Método','pMethod',['ATH Móvil','Stripe','PayPal','Transferencia','Cheque','Efectivo','Tarjeta'].map(x=>({value:x,label:x})))+input('Monto','pAmount','number')+input('Nota','pNote','text','','wide')+'<button class="primary" type="submit">Registrar cobro</button>';
  $('cashForm').innerHTML=input('Fecha','xDate','date',today())+select('Tipo','xType',[{value:'Ingreso',label:'Ingreso'},{value:'Gasto',label:'Gasto'}])+input('Concepto','xConcept')+input('Monto','xAmount','number')+'<button class="primary" type="submit">Guardar movimiento</button>';

  if($('followupForm')) $('followupForm').innerHTML=select('Cliente','fClient',state.clients.map(c=>({value:c.id,label:c.name})))+select('Activo / equipo','fAsset',[{value:'',label:'Sin activo'}].concat(state.assets.map(a=>({value:a.id,label:assetLabel(a)}))))+select('Tipo','fKind',[{value:'maintenance',label:'Mantenimiento 6 meses'},{value:'quote',label:'Seguimiento cotización'},{value:'installation',label:'Post-instalación'},{value:'general',label:'Seguimiento general'}])+input('Fecha próxima','fDue','date',monthsFromToday(6))+select('Estado','fStatus',['Programado','Pendiente','Próximo','Completado'].map(x=>({value:x,label:x})),'Programado')+input('Título','fTitle','text','Próximo mantenimiento preventivo','wide')+input('Notas','fNotes','text','','wide')+'<button class="primary" type="submit">Guardar seguimiento</button>';
  const p=profile();$('settingsForm').innerHTML=`<div><label>${T('Industria')}</label><select id="set_industry">${Object.entries(INDUSTRIES).map(([id,x])=>`<option value="${id}" ${p.industry===id?'selected':''}>${T(x.name)}</option>`).join('')}</select></div><div><label>${T('Idioma')}</label><select id="set_language"><option value="es" ${(p.language||'es')==='es'?'selected':''}>Español</option><option value="en" ${(p.language||'es')==='en'?'selected':''}>English</option></select></div><div><label>${T('Plan activo')}</label><input value="${esc(activePlanName())}" disabled></div><div><label>Estado</label><input value="${esc(planRequestStatusText())}" disabled></div><div class="wide"><label>Servicios de esta industria</label><textarea id="set_services" rows="5" placeholder="Un servicio por línea">${esc(serviceOptions().join('\n'))}</textarea></div>`+input('Nombre comercial','set_businessName','text',p.businessName)+input('Eslogan','set_slogan','text',p.slogan)+input('Teléfono','set_phone','text',p.phone)+input('WhatsApp','set_whatsapp','text',p.whatsapp)+input('Email','set_email','text',p.email)+input('Website','set_web','text',p.web)+input('Dirección','set_address','text',p.address,'wide')+input('Registro comerciante','set_merchant','text',p.merchant)+input('Representante','set_representative','text',p.representative)+input('IVU %','set_tax','number',p.tax)+input('Meta diaria','set_dailyGoal','number',p.dailyGoal||'1000')+(p.industry==='transport'?input('Tarifa por milla','set_transportRatePerMile','number',p.transportRatePerMile||'2.50')+input('Cargo base ruta','set_transportBaseCharge','number',p.transportBaseCharge||'0'):'')+input('Color primario','set_primaryColor','color',p.primaryColor)+input('Color secundario','set_secondaryColor','color',p.secondaryColor)+`<div><label>Logo Dashboard</label><input id="set_logoDashboard" type="file" accept="image/*"><small class="muted">Actual: ${p.logoDashboard?'cargado':'sin logo'}</small></div><div><label>Logo PDF</label><input id="set_logoPdf" type="file" accept="image/*"><small class="muted">Actual: ${p.logoPdf?'cargado':'sin logo'}</small></div><div><label>Favicon</label><input id="set_favicon" type="file" accept="image/*"><small class="muted">Actual: ${p.favicon?'cargado':'sin favicon'}</small></div><div><label>Firma digital</label><input id="set_signature" type="file" accept="image/*"><small class="muted">Actual: ${p.signature?'cargada':'sin firma'}</small></div><div class="wide demo-settings"><h3>Demo</h3><div class="demo-buttons"><button id="loadDemoBtn" type="button" class="primary">Cargar demo</button><button id="cleanDemoBtn" type="button" class="danger">Borrar demo</button></div></div>`;
  limits();
  bindDemoSettings();
}

function kpis(){
  const billed=sum(state.invoices,'total'), collected=sum(state.payments,'amount'), expenses=state.cashflow.filter(x=>x.type==='Gasto').reduce((a,x)=>a+Number(x.amount||0),0), payroll=sum(state.payroll,'net'), supp=sum(state.supplierPayments,'amount');
  const balances=state.invoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const todayServices=state.services.filter(s=>s.date===today()).length;
  const completed=state.services.filter(s=>String(s.status||'').toLowerCase()==='completado').length;
  const ops=operationalSummary();
  const q=quoteSummary();
  const fu=followupSummary();
  $('kpis').innerHTML=[
    ['Clientes',state.clients.length],
    ['Servicios hoy',todayServices],
    ['Cotizaciones',q.total],
    ['COT mes',q.month],
    ['COT abiertas',q.open],
    ['COT aprobadas',q.approved],
    ['Seguimientos',fu.open],
    ['Mant. semana',fu.dueWeek],
    ['Vencidos seg.',fu.overdue],
    ['Potencial COT',money(q.openValue+q.approvedValue)],
    ['Conversión COT',q.conversionRate+'%'],
    ['Facturado',money(billed)],
    ['Cobrado',money(collected)],
    ['Balance por cobrar',money(balances)],
    ['Caja neta',money(collected-expenses)]
  ].map(([a,b])=>`<div class="kpi"><span>${T(a)}</span><strong>${b}</strong></div>`).join('');
  const alerts=dashboardAlerts();
  if($('alertList')) $('alertList').innerHTML=alerts.length?alerts.map(x=>`<div class="alert-item">${esc(x)}</div>`).join(''):'<p class="muted">Sin alertas.</p>';
  if($('planExperience')) $('planExperience').innerHTML=`<div class="experience"><b>${plan().badge}: ${plan().name}</b><span>${plan().features.map(T).join(' · ')}</span><div class="quota"><i style="width:${Math.min(100,(state.clients.length/(unlimited(limit('clients'))?Math.max(1,state.clients.length):limit('clients')))*100)}%"></i></div><button id="upgradeBtn" type="button">${T('Ver planes')}</button></div>`;
  $('upgradeBtn')&&($('upgradeBtn').onclick=()=>show('plans'));
  controlCenter();
}


function renderQuotesTable(){
  const box=$('quotesTable'); if(!box) return;
  box.innerHTML=table(['Cotización','Cliente','Válida','Total','Estado','Acción'],state.quotes.map(q=>{const t=quoteTotals(q), st=quoteStatus(q);return `<tr><td><b>${esc(q.number||'')}</b><br><span class="muted">${esc(q.title||q.serviceType||'')}</span></td><td>${esc(q.clientName||'')}</td><td>${esc(q.validUntil||'—')}</td><td>${money(t.total)}</td><td>${statusChip(st)}</td><td><div class="actions"><button data-prev-quote="${q.id}" type="button">Preview</button><button data-edit-quote="${q.id}" type="button">Editar</button>${quoteCanInvoice(q)?`<button data-invoice-quote="${q.id}" type="button">Convertir a factura</button>`:''}${quoteCanConvert(q)?`<button data-convert-quote="${q.id}" type="button">Crear servicio</button>`:''}<button class="danger" data-del="quotes:${q.id}" type="button">Borrar</button></div></td></tr>`;}));
  document.querySelectorAll('[data-prev-quote]').forEach(b=>b.onclick=()=>previewQuote(b.dataset.prevQuote));
  document.querySelectorAll('[data-edit-quote]').forEach(b=>b.onclick=()=>editQuoteRecord(b.dataset.editQuote));
  document.querySelectorAll('[data-convert-quote]').forEach(b=>b.onclick=()=>convertQuoteToService(b.dataset.convertQuote));
  document.querySelectorAll('[data-invoice-quote]').forEach(b=>b.onclick=()=>convertQuoteToInvoice(b.dataset.invoiceQuote));
}
async function convertQuoteToService(id){
  const q=state.quotes.find(x=>x.id===id); if(!q)return;
  if(!quoteCanConvert(q)) return alert('Esta cotización ya fue convertida o no está disponible.');
  if(!canCreate('services')){alert('Límite de servicios alcanzado.');show('plans');return;}
  const t=quoteTotals(q);
  const ref=await add('services',{clientId:q.clientId||'',clientName:q.clientName||'',assetId:q.assetId||'',assetName:q.assetName||'',teamId:q.teamId||'',teamName:q.teamName||'',date:today(),status:'Pendiente',priority:q.priority||'Normal',serviceType:q.serviceType||'',title:q.title||q.serviceType||'Servicio aprobado',amount:t.subtotal,items:quoteItemsFallback(q),fields:q.fields||[],quoteId:q.id,quoteNumber:q.number||''});
  if(ref?.id) await updateDoc(docPath('quotes',id),{status:'Convertida',convertedServiceId:ref.id,approvedAt:q.approvedAt||today(),updatedAt:serverTimestamp()});
  show('services');
}
async function convertQuoteToInvoice(id){
  const q=state.quotes.find(x=>x.id===id); if(!q)return;
  if(!quoteCanInvoice(q)) return alert('Esta cotización ya tiene factura o no está disponible.');
  if(!canCreate('invoices')){alert('Límite de facturas alcanzado.');show('plans');return;}
  const existing=state.invoices.find(inv=>inv.quoteId===q.id || inv.quoteNumber===q.number);
  if(existing){
    await updateDoc(docPath('quotes',id),{status:'Convertida',convertedInvoiceId:existing.id,updatedAt:serverTimestamp()});
    show('billing');
    alert('Esta cotización ya tenía factura. Te llevé a Facturación.');
    return;
  }
  const t=quoteTotals(q);
  const number='INV-'+String(Date.now()).slice(-7);
  const ref=await add('invoices',{
    number,
    date:today(),
    quoteId:q.id,
    quoteNumber:q.number||'',
    sourceType:'quote',
    serviceId:q.convertedServiceId||'',
    clientId:q.clientId||'',
    clientName:q.clientName||'',
    serviceTitle:q.title||q.serviceType||'Servicio cotizado',
    items:quoteItemsFallback(q),
    fields:q.fields||[],
    subtotal:t.subtotal,
    ivu:t.ivu,
    taxPercent:t.taxPercent,
    total:t.total,
    status:'Pendiente',
    dueDate:plusDays(15),
    notes:q.notes||'Factura generada desde cotización aprobada.',
    terms:q.terms||'Pago según acuerdo.'
  });
  if(ref?.id){
    await updateDoc(docPath('quotes',id),{status:'Convertida',convertedInvoiceId:ref.id,approvedAt:q.approvedAt||today(),updatedAt:serverTimestamp()});
    show('billing');
    alert('Factura creada desde la cotización. Ya está en Facturación lista para cobrar.');
  }else{
    show('billing');
  }
}
function previewQuote(id){
  const q=state.quotes.find(x=>x.id===id); if(!q)return;
  const p=profile(), c=clientBy(q.clientId), t=quoteTotals(q), logo=p.logoPdf||p.logoDashboard;
  const rows=quoteItemsFallback(q).map(it=>`<tr><td>${esc(it.description||'Servicio')}</td><td>${esc(it.qty||1)}</td><td>${money(it.price||0)}</td><td>${money(Number(it.qty||1)*Number(it.price||0))}</td></tr>`).join('');
  const html=`<div class="doc-page invoice-pro quote-pro"><div class="doc-body"><div class="invoice-top"><div class="invoice-brand">${logo?`<img class="invoice-logo" src="${logo}">`:''}<div><h1>${esc(p.businessName||'Empresa')}</h1>${p.email?`<p>${esc(p.email)}</p>`:''}</div></div><div class="invoice-contact"><p>${esc(p.address||'')}</p>${p.phone?`<p>${esc(p.phone)}</p>`:''}${p.web?`<p>${esc(p.web)}</p>`:''}</div></div><div class="invoice-title-row"><div class="invoice-number"><p><b>No. Cotización:</b> ${esc(q.number||'')}</p><p><b>Fecha:</b> ${esc(niceDate(q.date||today()))}</p><p><b>Válida hasta:</b> ${esc(q.validUntil?niceDate(q.validUntil):'—')}</p></div><h2>COTIZACIÓN</h2><div class="status-card"><b>ESTADO</b><span>${esc(quoteStatus(q)).toUpperCase()}</span></div></div><div class="invoice-line"></div><div class="invoice-client-grid"><div class="invoice-box"><b>CLIENTE</b><p>${esc(q.clientName||c.name||'')}</p></div><div class="invoice-box"><p><b>Teléfono:</b> ${esc(c.phone||'—')}</p><p><b>Dirección:</b> ${esc(c.address||c.city||'—')}</p></div></div><table class="doc-table invoice-items"><tr><th>Descripción</th><th>Cant.</th><th>Precio Unit.</th><th>Total</th></tr>${rows}</table><div class="invoice-lower"><div><div class="invoice-box note-box"><b>NOTAS</b><p>${esc(q.notes||'Cotización profesional sujeta a evaluación final y disponibilidad.')}</p></div><div class="invoice-box note-box"><b>CONDICIONES</b><p>${esc(q.terms||'Precios válidos hasta la fecha indicada. Aprobación requerida para iniciar servicio.')}</p></div>${p.signature?`<div class="invoice-sign"><img src="${p.signature}"><br>Firma autorizada</div>`:''}</div><div class="invoice-totals"><div><b>SUBTOTAL</b><span>${money(t.subtotal)}</span></div><div><b>IVU (${t.taxPercent}%)</b><span>${money(t.ivu)}</span></div><div class="total-row"><b>TOTAL</b><span>${money(t.total)}</span></div></div></div>`+invoiceDocFooter();
  state.previewHtml=html;$('reportPreview').innerHTML=html;show('reports');
}
function tables(){const i=industry();
  $('clientsTable').innerHTML=table(['Cliente','Contacto','Etiquetas','Historial','Acción'],state.clients.map(c=>{const cs=clientSummary(c);return `<tr><td><b>${esc(c.name)}</b><br><span class="muted">${esc(c.email)} · ${esc(c.city)}</span><br>${clientTagHtml(c)}</td><td>${esc(c.phone)}<br><span class="muted">${esc(c.altName||'')} ${c.altPhone?'· '+esc(c.altPhone):''}</span></td><td>${clientTagHtml(c)||'<span class="muted">Sin etiquetas</span>'}</td><td><b>${cs.assets}</b> activos · <b>${cs.services}</b> servicios<br><span class="muted">Balance ${money(cs.balance)}</span></td><td><div class="actions"><button data-client-summary="${c.id}" type="button">Ver historial</button>${action('clients',c.id)}</div></td></tr>`;}));
  $('teamTable').innerHTML=table([i.team,'Información personal','Vehículo','Estado','Comisión','Nómina pagada','Balance','Acción'],state.team.map(t=>`<tr><td><b>${esc(t.name)}</b><br><span class="muted">${esc(t.role)} · ${esc(t.phone||'')}</span></td><td><span class="muted">ID: ${esc(t.personalId||'—')}</span><br><span class="muted">SSN: ${esc(maskSSN(t.ssn||t.socialSecurity||''))}</span><br><span class="muted">Lic.: ${esc(t.driverLicense||'—')}</span></td><td>${esc(t.assignedVehicleName||'Sin vehículo')}</td><td>${statusChip(t.status||'Activo')}</td><td>${money(teamCommission(t.id))}<br><span class="muted">Ret. ${money(teamRetention(t.id))}</span></td><td>${money(payrollPaid(t.id))}</td><td><b>${money(teamBalance(t.id))}</b></td><td>${action('team',t.id)}</td></tr>`));
  $('payrollTable').innerHTML=table(['Fecha',i.team,'Periodo','Bruto','Bonos','Retención / salida','Adelantos / otros','Neto','Acción'],state.payroll.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.teamName)}</td><td>${esc(p.period)}<br><span class="muted">${Number(p.hours||0)}h + ${Number(p.overtime||0)}h extra</span></td><td>${money(p.gross)}</td><td>${money(p.bonus)}</td><td>${money(payrollRetention(p))}<br><span class="muted">${esc(p.retentionType||'')} ${p.retentionDestination?'→ '+esc(p.retentionDestination):''}</span></td><td>${money(payrollAdvance(p)+payrollOtherDeductions(p))}</td><td><b>${money(payrollNet(p))}</b><br><span class="muted">${esc(p.method)}</span></td><td><div class="actions"><button data-paystub="${p.id}" type="button">PDF</button>${action('payroll',p.id)}</div></td></tr>`));
  if($('retentionsTable')) $('retentionsTable').innerHTML=`<div class="section-head"><h3>Retenciones por pagar</h3><span class="limit-chip">Pendiente ${money(retentionPendingAmount())}</span></div>`+table(['Fecha','Empleado','Tipo','Destino','Monto','Estado','Fecha límite','Pagado','Acción'],state.payrollRetentions.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.teamName)}</td><td>${esc(r.type)}</td><td>${esc(r.destination)}</td><td><b>${money(r.amount)}</b></td><td>${statusChip(retentionStatus(r))}</td><td>${esc(r.dueDate||'—')}</td><td>${esc(r.paidAt||'—')}</td><td><div class="actions">${retentionStatus(r)==='Pendiente'?`<button data-pay-retention="${r.id}" type="button">Marcar pagada</button>`:''}${action('payrollRetentions',r.id)}</div></td></tr>`));
  $('assetsTable').innerHTML=table(['Activo','Cliente','Categoría','Ubicación','Estado','Garantía','Acción'],state.assets.map(a=>`<tr><td><b>${esc(assetName(a))}</b><br><span class="muted">${esc(a.notes||'')}</span></td><td>${esc(a.clientName||'Sin cliente')}</td><td>${esc(assetCategory(a))}</td><td>${esc(assetLocation(a))}</td><td>${esc(assetStatus(a))}</td><td>${esc(a.warranty||'')}</td><td>${action('assets',a.id)}</td></tr>`));
  $('suppliersTable').innerHTML=table(['Suplidor','Contacto','Crédito','Compras','Pagado','Balance','Acción'],state.suppliers.map(s=>`<tr><td><b>${esc(s.name)}</b><br><span class="muted">${esc(s.category||'')} ${(s.fields||[]).filter(Boolean).map(esc).join(' · ')}</span></td><td>${esc(s.phone)}<br><span class="muted">${esc(s.email)}</span><br>${s.whatsapp?`<a href="https://wa.me/${String(s.whatsapp).replace(/\D/g,'')}" target="_blank">WhatsApp</a>`:''}</td><td>${money(s.creditLimit)}</td><td>${money(supplierPurchasesTotal(s.id))}</td><td>${money(supplierPaid(s.id))}</td><td><b>${money(supplierBalance(s.id))}</b></td><td>${action('suppliers',s.id)}</td></tr>`));
  $('supplierPaymentsTable').innerHTML=table(['Fecha','Suplidor','Compra','Método','Monto','Nota','Acción'],state.supplierPayments.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.supplierName)}</td><td>${esc(p.purchaseNumber||'General')}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${esc(p.note)}</td><td>${action('supplierPayments',p.id)}</td></tr>`));
  $('purchasesTable').innerHTML=table(['Fecha','Suplidor','Concepto','Vence','Total','Pagado','Balance','Estado','Acción'],state.purchases.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.supplierName)}</td><td><b>${esc(p.number||p.reference||'')}</b><br><span class="muted">${esc(p.concept)}</span></td><td>${esc(p.dueDate||'—')}</td><td>${money(p.total)}</td><td>${money(purchasePaid(p.id))}</td><td><b>${money(purchaseBalance(p))}</b></td><td>${statusChip(purchaseStatus(p))}</td><td>${action('purchases',p.id)}</td></tr>`));
  renderQuotesTable();

  if($('followupsTable')) $('followupsTable').innerHTML=table(['Fecha','Tipo','Cliente','Equipo','Estado','Acción'],(state.followups||[]).sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||''))).map(f=>{const wa=followupWhatsAppUrl(f);return `<tr><td><b>${esc(f.dueDate||'—')}</b></td><td>${esc(followupKindLabel(f.kind))}<br><span class="muted">${esc(f.title||'')}</span></td><td>${esc(f.clientName||'')}</td><td>${esc(f.assetName||'')}</td><td>${statusChip(followupStatus(f))}</td><td><div class="actions">${wa?`<a class="button" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>`:''}<button data-complete-followup="${f.id}" type="button">Completar</button>${action('followups',f.id)}</div></td></tr>`;}));
  document.querySelectorAll('[data-complete-followup]').forEach(b=>b.onclick=()=>completeFollowup(b.dataset.completeFollowup));
  $('servicesTable').innerHTML=table(['Fecha',i.client,'Activo','Servicio','Estado','Monto','Factura','Acción'],state.services.map(s=>{const inv=state.invoices.find(x=>x.serviceId===s.id),amount=serviceAmount(s);return `<tr><td>${esc(s.date)}<br><span class="tag">${esc(s.priority||'Normal')}</span></td><td>${esc(s.clientName)}</td><td>${esc(s.assetName||'')}</td><td><b>${esc(serviceTitle(s))}</b><br>${isTransport()?(()=>{const r=transportRouteFromService(s);return `<span class="muted">${esc(r.origin||'')} → ${esc(r.destination||'')} ${r.miles?`· ${Number(r.miles).toFixed(2)} mi`:''}</span><br>${routeLink(r.origin,r.destination,'Abrir ruta')}`})():`<span class="muted">${esc((s.fields||[]).filter(Boolean).slice(0,3).join(' · '))}</span>`}</td><td><span class="status-chip">${esc(s.status||'Pendiente')}</span></td><td>${money(amount)}</td><td>${inv?esc(inv.number):`<button data-invoice="${s.id}" type="button">Facturar</button>`}</td><td><div class="actions"><button data-dup-service="${s.id}" type="button">Duplicar</button>${action('services',s.id)}</div></td></tr>`}));
  document.querySelectorAll('[data-invoice]').forEach(b=>b.onclick=()=>createInvoice(b.dataset.invoice));
  document.querySelectorAll('[data-client-summary]').forEach(b=>b.onclick=()=>showClientSummary(b.dataset.clientSummary));
  document.querySelectorAll('[data-dup-service]').forEach(b=>b.onclick=()=>duplicateService(b.dataset.dupService));
  document.querySelectorAll('[data-paystub]').forEach(b=>b.onclick=()=>previewPaystub(b.dataset.paystub));
  document.querySelectorAll('[data-pay-retention]').forEach(b=>b.onclick=()=>markRetentionPaid(b.dataset.payRetention));
  $('invoiceTable').innerHTML=table(['Factura','Cliente','Vence','Total','Pagado','Balance','Estado','Acción'],state.invoices.map(inv=>{const bal=invoiceBalance(inv),paid=invoicePaid(inv),st=invoiceStatus(inv);return `<tr><td><b>${esc(inv.number)}</b><br><span class="muted">${esc(inv.serviceTitle||'')}</span></td><td>${esc(inv.clientName)}</td><td>${esc(inv.dueDate||'—')}</td><td>${money(inv.total)}</td><td>${money(paid)}</td><td><b>${money(bal)}</b></td><td>${statusChip(st)}</td><td><div class="actions"><button data-prev-inv="${inv.id}" type="button">Preview</button><button data-dup-inv="${inv.id}" type="button">Duplicar</button>${st!=='Cancelada'?`<button class="danger" data-cancel-inv="${inv.id}" type="button">Cancelar</button>`:''}${action('invoices',inv.id)}</div></td></tr>`}));
  document.querySelectorAll('[data-prev-inv]').forEach(b=>b.onclick=()=>previewInvoice(b.dataset.prevInv));
  document.querySelectorAll('[data-dup-inv]').forEach(b=>b.onclick=()=>duplicateInvoice(b.dataset.dupInv));
  document.querySelectorAll('[data-cancel-inv]').forEach(b=>b.onclick=()=>cancelInvoice(b.dataset.cancelInv));
  $('paymentsTable').innerHTML=table(['Fecha','Factura','Método','Monto','Balance factura','Nota','Acción'],state.payments.map(p=>{const inv=state.invoices.find(x=>x.id===p.invoiceId)||{};return `<tr><td>${esc(p.date)}</td><td>${esc(p.invoiceNumber)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${inv.id?money(invoiceBalance(inv)):'—'}</td><td>${esc(p.note)}</td><td>${action('payments',p.id)}</td></tr>`;}));
  let running=0;
  const cashRows=[...state.cashflow].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).map(x=>{running += (x.type==='Gasto'?-1:1)*Number(x.amount||0);return `<tr><td>${esc(x.date)}</td><td>${esc(x.type)}</td><td>${esc(x.concept)}</td><td>${money(x.amount)}</td><td><b>${money(running)}</b></td><td>${action('cashflow',x.id)}</td></tr>`;});
  $('cashTable').innerHTML=table(['Fecha','Tipo','Concepto','Monto','Balance','Acción'],cashRows);
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

function onboardingSteps(){
  const p=profile();
  return [
    {icon:'🏢', title:'Negocio', done:!!p.businessName && p.businessName!=='Mi Negocio', text:p.businessName||'Mi Negocio'},
    {icon:'🏭', title:'Industria', done:!!p.industry, text:industry().name},
    {icon:'🌐', title:'Idioma', done:!!p.language, text:(p.language||'es')==='en'?'English':'Español'},
    {icon:'🖼', title:'Logo', done:!!(p.logoDashboard||p.logoPdf), text:(p.logoDashboard||p.logoPdf)?'Completo':'Pendiente'},
    {icon:'👥', title:'Primer cliente', done:state.clients.length>0, text:String(state.clients.length)},
    {icon:'🧾', title:'Primera factura', done:state.invoices.length>0, text:String(state.invoices.length)}
  ];
}
function onboardingProgress(){
  const steps=onboardingSteps();
  return Math.round((steps.filter(x=>x.done).length/steps.length)*100);
}
function shouldShowWelcome(){
  const p=profile();
  if(p.onboardingComplete || p.onboardingSkipped) return false;
  return onboardingProgress() < 100;
}
function renderWelcomeCenter(){
  const box=$('welcomeCenter'); if(!box) return;
  const steps=onboardingSteps();
  const pct=onboardingProgress();
  $('welcomeProgressBar') && ($('welcomeProgressBar').style.width=pct+'%');
  $('welcomeSteps') && ($('welcomeSteps').innerHTML=steps.map(s=>`<div class="welcome-step ${s.done?'done':''}"><span>${s.done?'✓':s.icon}</span><div><b>${T(s.title)}</b><small>${esc(T(s.text))}</small></div></div>`).join(''));
  box.classList.toggle('hidden',!shouldShowWelcome());
  box.setAttribute('aria-hidden',shouldShowWelcome()?'false':'true');
  const close=$('welcomeClose'); if(close) close.onclick=async()=>{await setDoc(profRef(),{onboardingSkipped:true,updatedAt:serverTimestamp()},{merge:true});};
  const settings=$('welcomeSettings'); if(settings) settings.onclick=()=>{box.classList.add('hidden');show('settings');};
  const demo=$('welcomeLoadDemo'); if(demo) demo.onclick=async()=>{await clearDemoData(profile().industry||'hvac'); await loadIndustryDemo(profile().industry||'hvac');};
  const finish=$('welcomeFinish'); if(finish) finish.onclick=async()=>{await setDoc(profRef(),{onboardingComplete:true,onboardingSkipped:false,updatedAt:serverTimestamp()},{merge:true});};
}
function renderHomePolish(){
  renderNexusDaily();
  const ct=$('controlStrip'); if(!ct) return;
  const f=financialSummary(), o=operationalSummary();
  const q=quoteSummary();
  const fu=followupSummary();
  ct.innerHTML=[
    ['Cotizaciones abiertas',q.open,'quotes'],
    ['Seguimientos vencidos',fu.overdue,'followups'],
    ['Mant. próximos',fu.dueWeek,'followups'],
    ['Potencial COT',money(q.openValue+q.approvedValue),'quotes'],
    ['Por cobrar',money(f.receivable),'billing'],
    ['Vencido',money(f.overdue),'billing'],
    ['Por pagar',money(o.purchaseDebt),'purchases'],
    ['Nómina',money(o.payrollDue),'payroll'],
    ['Obligaciones',money(obligationSummary().total),'payroll']
  ].map(([a,b,v])=>`<button class="control-card" type="button" data-control-view="${v}"><span>${T(a)}</span><b>${b}</b></button>`).join('');
  document.querySelectorAll('[data-control-view]').forEach(b=>b.onclick=()=>show(b.dataset.controlView));
}

function render(){setVisuals();nav();forms();bindServiceItems();bindQuoteItems();bindServiceProductivity();if(isTransport()){['sOrigin','sDestination','sRouteMiles','sRouteRate','sRouteBase'].forEach(id=>$(id)&&($(id).oninput=updateTransportTotal));updateTransportTotal();}kpis();renderHomePolish();tables();plans();renderWelcomeCenter();enforceModuleView();$('pageTitle').textContent=T(TITLES[state.activeView]||state.activeView);$('pageSubtitle').textContent=state.activeView==='dashboard'?T('Resumen operativo, financiero y alertas'):' ';applyLanguage();}
async function add(c,data){if(!canCreate(c)){alert(`Límite alcanzado en plan ${plan().name}. Mejora tu plan.`);show('plans');return null;}return await addDoc(colPath(c),{...data,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}

function showClientSummary(id){
  const c=clientBy(id); if(!c.id) return;
  const cs=clientSummary(c);
  alert(`${c.name}\n\nServicios: ${cs.services}\nFacturas: ${cs.invoices}\nActivos: ${cs.assets}\nCobrado: ${money(cs.paid)}\nBalance: ${money(cs.balance)}\n\nContacto: ${c.phone||''}\n${c.email||''}\n${c.address||''}`);
}
async function duplicateService(id){
  const s=state.services.find(x=>x.id===id); if(!s) return;
  if(!canCreate('services')){alert('Límite de servicios alcanzado.');show('plans');return;}
  const copy={...s,date:today(),status:'Pendiente',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  delete copy.id; delete copy.createdAt; delete copy.updatedAt;
  await add('services',copy);
}
async function duplicateInvoice(id){
  const inv=state.invoices.find(x=>x.id===id); if(!inv) return;
  if(!canCreate('invoices')){alert('Límite de facturas alcanzado.');show('plans');return;}
  const copy={...inv,number:'INV-'+String(Date.now()).slice(-7),date:today(),dueDate:plusDays(15),status:'Pendiente',serviceId:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  delete copy.id; delete copy.createdAt; delete copy.updatedAt;
  await add('invoices',copy);
}
async function cancelInvoice(id){
  if(!confirm('¿Cancelar esta factura?')) return;
  await updateDoc(docPath('invoices',id),{status:'Cancelada',updatedAt:serverTimestamp()});
}


async function markRetentionPaid(id){
  const r=state.payrollRetentions.find(x=>x.id===id); if(!r) return;
  if(!confirm(`¿Marcar esta retención como pagada?\n${retentionLabel(r)}\n${money(r.amount)}`)) return;
  const paidAt=today();
  await updateDoc(docPath('payrollRetentions',id),{status:'Pagada',paidAt,updatedAt:serverTimestamp()});
  await add('cashflow',{date:paidAt,type:'Gasto',concept:`Pago retención ${r.type||''} · ${r.destination||''}`,amount:Number(r.amount||0),note:`Empleado: ${r.teamName||''} · Nómina: ${r.payrollId||''}`});
}

async function remove(c,id){if(confirm('¿Borrar registro?'))await deleteDoc(docPath(c,id));}

const EDIT_LABELS={
  name:'Nombre',phone:'Teléfono',email:'Email',city:'Ciudad',address:'Dirección',altName:'Contacto alterno',altPhone:'Teléfono alterno',altEmail:'Email alterno',tags:'Etiquetas',notes:'Notas',personalId:'Identificación personal ID',ssn:'Seguro Social',socialSecurity:'Seguro Social',driverLicense:'Licencia de conducir',assignedVehicleId:'Vehículo asignado',assignedVehicleName:'Vehículo asignado',
  clientId:'Cliente',clientName:'Cliente',assetId:'Activo',assetName:'Activo',teamId:'Empleado / Equipo',teamName:'Empleado / Equipo',date:'Fecha',dueDate:'Vencimiento',status:'Estado',priority:'Prioridad',serviceType:'Tipo de servicio',title:'Título / Descripción',amount:'Monto',subtotal:'Subtotal',tax:'Impuesto',total:'Total',
  role:'Cargo',salary:'Salario',rate:'Tarifa',retention:'Retención',startDate:'Fecha de ingreso',category:'Categoría',location:'Ubicación',value:'Valor',warranty:'Garantía',industry:'Industria',
  whatsapp:'WhatsApp',contact:'Contacto',creditLimit:'Límite de crédito',openingBalance:'Balance inicial',supplierId:'Suplidor',supplierName:'Suplidor',purchaseId:'Compra',purchaseNumber:'Compra',method:'Método',note:'Nota',
  period:'Periodo',hours:'Horas',overtime:'Horas extra',gross:'Bruto',bonus:'Bono',retention:'Retenciones',advance:'Adelanto',deductions:'Otros descuentos',net:'Neto',concept:'Concepto',reference:'Referencia',number:'Número',
  invoiceId:'Factura',invoiceNumber:'Factura',type:'Tipo',items:'Partidas / Items',fields:'Campos adicionales',route:'Ruta',terms:'Términos',serviceTitle:'Servicio',quoteId:'Cotización',quoteNumber:'Cotización',validUntil:'Válida hasta',approvedAt:'Aprobada el',convertedServiceId:'Servicio convertido',paid:'Pagado',balance:'Balance',destination:'Destino',dueDate:'Fecha límite',paidAt:'Fecha de pago',reference:'Referencia'
};
const EDIT_ORDER={
  clients:['name','phone','email','city','address','altName','altPhone','altEmail','tags','notes'],
  services:['clientId','assetId','teamId','date','status','priority','serviceType','title','amount','items','fields','route'],
  quotes:['number','clientId','assetId','teamId','date','validUntil','status','priority','serviceType','title','items','subtotal','ivu','taxPercent','total','notes','terms','convertedServiceId'],
  team:['name','phone','email','personalId','ssn','driverLicense','assignedVehicleId','role','status','salary','rate','retention','startDate'],
  assets:['clientId','industry','name','category','location','status','value','date','warranty','notes'],
  suppliers:['name','phone','whatsapp','email','contact','category','creditLimit','openingBalance','fields'],
  supplierPayments:['supplierId','purchaseId','date','method','amount','note'],
  payroll:['teamId','date','period','hours','overtime','gross','bonus','retention','advance','deductions','net','method','note'],
  purchases:['supplierId','date','dueDate','concept','reference','subtotal','tax','total','status','note'],
  invoices:['number','date','dueDate','clientId','clientName','serviceTitle','items','subtotal','ivu','taxPercent','total','status','notes','terms'],
  payments:['invoiceId','date','method','amount','note'],
  cashflow:['date','type','concept','amount'],
  payrollRetentions:['teamId','payrollId','date','type','destination','amount','status','dueDate','paidAt','reference','note']
};
function ensureEditModal(){
  let m=$('editModal');
  if(m) return m;
  const wrap=document.createElement('div');
  wrap.id='editModal';
  wrap.className='edit-modal hidden';
  wrap.innerHTML=`<div class="edit-backdrop" data-close-edit></div><div class="edit-panel card"><div class="edit-head"><div><span class="pill">Editar</span><h2 id="editTitle">Editar registro</h2></div><button class="icon-btn" data-close-edit type="button">×</button></div><form id="editForm" class="form-grid edit-form"></form><div class="edit-actions"><button type="button" data-close-edit>Cancelar</button><button id="editSave" class="primary" type="button">Guardar cambios</button></div></div>`;
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-close-edit]').forEach(b=>b.onclick=closeEditModal);
  return wrap;
}
function closeEditModal(){const m=$('editModal'); if(m)m.classList.add('hidden'); state.editing=null;}
function editType(k,v){
  if(['amount','subtotal','tax','total','ivu','taxPercent','salary','rate','retention','value','creditLimit','openingBalance','hours','overtime','gross','bonus','advance','deductions','net'].includes(k)) return 'number';
  if(String(k).toLowerCase().includes('date') || k==='date' || k==='dueDate' || k==='startDate') return 'date';
  if(['notes','note','address','items','fields','route'].includes(k)) return 'textarea';
  return 'text';
}
function editOptions(c,k,val){
  if(c==='followups' && k==='kind') return [{value:'maintenance',label:'Mantenimiento 6 meses'},{value:'quote',label:'Seguimiento cotización'},{value:'installation',label:'Post-instalación'},{value:'general',label:'Seguimiento general'}];
  if(c==='followups' && k==='status') return ['Programado','Pendiente','Próximo','Completado'].map(x=>({value:x,label:x}));
  if(k==='clientId') return state.clients.map(x=>({value:x.id,label:x.name}));
  if(k==='assetId') return [{value:'',label:'Sin activo'},...state.assets.map(x=>({value:x.id,label:assetName(x)}))];
  if(k==='teamId') return [{value:'',label:'Sin equipo'},...state.team.map(x=>({value:x.id,label:x.name}))];
  if(k==='assignedVehicleId') return [{value:'',label:'Sin vehículo'},...vehicleAssetOptions().map(x=>({value:x.id,label:assetLabel(x)}))];
  if(k==='supplierId') return state.suppliers.map(x=>({value:x.id,label:x.name}));
  if(k==='purchaseId') return [{value:'',label:'Sin compra'},...state.purchases.map(x=>({value:x.id,label:x.number||x.concept||x.id}))];
  if(k==='invoiceId') return state.invoices.map(x=>({value:x.id,label:x.number||x.id}));
  if(k==='status'){
    if(c==='quotes') return ['Borrador','Enviada','Aprobada','Rechazada','Convertida','Vencida'].map(x=>({value:x,label:x}));
    if(c==='payrollRetentions') return ['Pendiente','Pagada','Aplicada','Cancelada'].map(x=>({value:x,label:x}));
    if(c==='invoices') return ['Pendiente','Parcial','Pagada','Vencida','Cancelada'].map(x=>({value:x,label:x}));
    if(c==='team') return ['Activo','Inactivo','Suspendido'].map(x=>({value:x,label:x}));
    if(c==='assets') return ['Activo','Inactivo','En garantía','Fuera de servicio'].map(x=>({value:x,label:x}));
    return ['Pendiente','En proceso','Completado','Cancelado'].map(x=>({value:x,label:x}));
  }
  if(k==='priority') return ['Baja','Normal','Alta','Urgente'].map(x=>({value:x,label:x}));
  if(k==='method') return ['ATH Móvil','Stripe','PayPal','Transferencia','Cheque','Efectivo','Tarjeta'].map(x=>({value:x,label:x}));
  if(k==='type') return ['Ingreso','Gasto'].map(x=>({value:x,label:x}));
  if(k==='industry') return Object.entries(INDUSTRIES).map(([id,x])=>({value:id,label:x.name}));
  if(k==='serviceType') return servicesForCurrentIndustry().map(x=>({value:x,label:x}));
  return null;
}
function editSelectHtml(label,id,opts,val='',cls=''){
  const has=opts.some(o=>String(o.value)===String(val));
  const full=(!has && val!==undefined && val!==null && String(val)!=='') ? [{value:val,label:String(val)+' (actual)'} , ...opts] : opts;
  return select(label,id,full,val,cls);
}
function editFieldHtml(c,k,v){
  if(c==='clients' && k==='tags') return clientTagsSelectHtml('edit_tags',v);
  const label=EDIT_LABELS[k]||k;
  const opts=editOptions(c,k,v);
  if(opts) return editSelectHtml(label,'edit_'+k,opts,v,'');
  const type=editType(k,v);
  if(type==='textarea'){
    let out = (typeof v==='object' && v!==null) ? JSON.stringify(v,null,2) : (v??'');
    return `<div class="wide"><label>${esc(label)}</label><textarea id="edit_${esc(k)}" rows="${['items','fields','route'].includes(k)?6:3}" placeholder="${esc(label)}">${esc(out)}</textarea></div>`;
  }
  return input(label,'edit_'+k,type,v??'', type==='number'?'':'');
}
function normalizeEditRecord(c,r){
  const x={...r};
  if(!x.clientId && x.clientName){const cl=state.clients.find(c=>String(c.name||'').toLowerCase()===String(x.clientName||'').toLowerCase()); if(cl)x.clientId=cl.id;}
  if(!x.assetId && x.assetName){const a=state.assets.find(a=>assetName(a)===x.assetName || a.name===x.assetName); if(a)x.assetId=a.id;}
  if(!x.teamId && x.teamName){const t=state.team.find(t=>String(t.name||'').toLowerCase()===String(x.teamName||'').toLowerCase()); if(t)x.teamId=t.id;}
  if(!x.supplierId && x.supplierName){const sp=state.suppliers.find(s=>String(s.name||'').toLowerCase()===String(x.supplierName||'').toLowerCase()); if(sp)x.supplierId=sp.id;}
  if(!x.purchaseId && x.purchaseNumber){const pu=state.purchases.find(p=>String(p.number||p.reference||'')===String(x.purchaseNumber)); if(pu)x.purchaseId=pu.id;}
  if(!x.invoiceId && x.invoiceNumber){const inv=state.invoices.find(i=>String(i.number||'')===String(x.invoiceNumber)); if(inv)x.invoiceId=inv.id;}
  if(c==='services' && x.items===undefined) x.items=[];
  if(c==='quotes' && x.items===undefined) x.items=[];
  if(c==='services' && x.fields===undefined) x.fields=[];
  if(c==='invoices' && x.items===undefined) x.items=[];
  if(c==='invoices' && x.terms===undefined) x.terms='Pago según acuerdo.';
  return x;
}
function editKeys(c,r){
  const base=EDIT_ORDER[c]||[];
  const skip=['id','createdAt','updatedAt','uid','userId'];
  const extras=Object.keys(r).filter(k=>!skip.includes(k) && !base.includes(k));
  return [...base,...extras];
}
function readEditValue(k,original){
  if(k==='tags') return readClientTags('edit_tags');
  const el=$('edit_'+k); if(!el) return undefined;
  const type=editType(k,original);
  const raw=el.value;
  if(k==='ssn' || k==='socialSecurity') return formatSSNInput(raw);
  if(type==='number') return Number(raw||0);
  if(['items','fields','route'].includes(k)){
    try{return raw.trim()?JSON.parse(raw):(['items','fields'].includes(k)?[]:{});}catch(e){throw new Error(`El campo ${EDIT_LABELS[k]||k} debe tener formato JSON válido.`);}
  }
  return raw;
}

function editServiceItemsHtml(items){
  const arr=(Array.isArray(items) && items.length) ? items : [{description:'',qty:1,price:''}];
  return arr.map((it,idx)=>`<div class="service-line" data-edit-service-line>
    <div class="line-number">${idx+1}</div>
    <input class="edit-svc-desc" placeholder="Descripción del servicio / partida" value="${esc(it.description||'')}">
    <input class="edit-svc-qty" type="number" step="0.01" min="0" placeholder="Cant." value="${esc(it.qty ?? 1)}">
    <input class="edit-svc-price" type="number" step="0.01" min="0" placeholder="Precio" value="${esc(it.price ?? '')}">
    <button class="danger mini" data-edit-remove-line type="button">×</button>
  </div>`).join('');
}
function getEditServiceItems(){
  return [...document.querySelectorAll('[data-edit-service-line]')].map(row=>({
    description: row.querySelector('.edit-svc-desc')?.value.trim() || '',
    qty: Number(row.querySelector('.edit-svc-qty')?.value || 1),
    price: Number(row.querySelector('.edit-svc-price')?.value || 0)
  })).filter(it=>it.description || it.price > 0);
}
function updateEditServiceTotal(){
  const total=serviceItemsTotal(getEditServiceItems());
  const badge=$('edit_sItemsTotal');
  const amount=$('edit_amount');
  if(badge) badge.textContent=money(total);
  if(amount && total>0) amount.value=total.toFixed(2);
}
function bindEditServiceItems(){
  const addBtn=$('edit_addServiceLine');
  if(addBtn) addBtn.onclick=()=>{
    const box=$('editServiceItemsBox');
    if(!box) return;
    box.insertAdjacentHTML('beforeend',editServiceItemsHtml([{description:'',qty:1,price:''}]));
    bindEditServiceItems();
    updateEditServiceTotal();
  };
  document.querySelectorAll('[data-edit-remove-line]').forEach(btn=>btn.onclick=()=>{
    const rows=document.querySelectorAll('[data-edit-service-line]');
    const row=btn.closest('[data-edit-service-line]');
    if(rows.length>1) row.remove();
    else row.querySelectorAll('input').forEach((i,idx)=>i.value=idx===1?'1':'');
    updateEditServiceTotal();
  });
  document.querySelectorAll('.edit-svc-desc,.edit-svc-qty,.edit-svc-price').forEach(el=>el.oninput=updateEditServiceTotal);
  updateEditServiceTotal();
}
function editTransportRouteHtml(route){
  const r=route || {};
  if(!isTransport() && !r.origin && !r.destination) return '';
  return `<div class="wide route-box"><div class="route-grid">
    ${input('Origen','edit_route_origin','text',r.origin||'','wide')}
    ${input('Destino','edit_route_destination','text',r.destination||'','wide')}
    ${input('Millas Google','edit_route_miles','number',r.miles??'')}
    ${input('Tarifa por milla','edit_route_rate','number',r.rate??(profile().transportRatePerMile||'2.50'))}
    ${input('Cargo base','edit_route_base','number',r.base??(profile().transportBaseCharge||'0'))}
    <div><label>Ruta</label><button id="edit_openRouteBtn" type="button" class="ghost">Abrir ruta</button></div>
  </div><small id="editRouteCalcPreview" class="muted"></small></div>`;
}
function editRouteFromModal(){
  if(!$('edit_route_origin') && !$('edit_route_destination')) return null;
  const miles=Number($('edit_route_miles')?.value||0);
  const rate=Number($('edit_route_rate')?.value||0);
  const base=Number($('edit_route_base')?.value||0);
  return {origin:$('edit_route_origin')?.value||'',destination:$('edit_route_destination')?.value||'',miles,rate,base,total:base+(miles*rate)};
}
function updateEditRouteTotal(){
  const r=editRouteFromModal();
  if(!r) return;
  const amount=$('edit_amount');
  if(amount) amount.value=(r.total||0).toFixed(2);
  const preview=$('editRouteCalcPreview');
  if(preview) preview.textContent=`${Number(r.miles||0).toFixed(2)} mi × ${money(r.rate)} + ${money(r.base)} = ${money(r.total)}`;
  const open=$('edit_openRouteBtn');
  if(open){
    const url=mapsRouteUrl(r.origin,r.destination);
    open.disabled=!url;
    open.onclick=()=>{ if(url) window.open(url,'_blank','noopener'); };
  }
}
function bindEditTransportRoute(){
  ['edit_route_origin','edit_route_destination','edit_route_miles','edit_route_rate','edit_route_base'].forEach(id=>$(id)&&($(id).oninput=updateEditRouteTotal));
  updateEditRouteTotal();
}
async function editServiceRecord(id){
  // Services uses the main form for both New and Edit.
  // This keeps templates, partidas, industry-specific fields and route logic consistent.
  startServiceEdit(id);
}


async function editRecord(c,id){
  if(c==='services') return editServiceRecord(id);
  if(c==='quotes') return editQuoteRecord(id);
  const arr=state[c]||[],original=arr.find(x=>x.id===id); if(!original)return;
  const r=normalizeEditRecord(c,original);
  const m=ensureEditModal(); state.editing={c,id};
  $('editTitle').textContent=`Editar ${TITLES[c]||c}`;
  const keys=editKeys(c,r);
  $('editForm').innerHTML=keys.map(k=>editFieldHtml(c,k,r[k])).join('') || '<p class="muted">No hay campos editables.</p>';
  $('editSave').onclick=async()=>{
    try{
      const data={};
      for(const k of keys){const v=readEditValue(k,r[k]); if(v!==undefined)data[k]=v;}
      if(data.clientId){const cl=clientBy(data.clientId); data.clientName=cl.name||data.clientName||'';}
      if(data.assetId!==undefined){const a=assetBy(data.assetId); data.assetName=a.id?assetName(a):'';}
      if(data.teamId!==undefined){const t=teamBy(data.teamId); data.teamName=t.name||'';}
      if(data.assignedVehicleId!==undefined){const v=assetBy(data.assignedVehicleId); data.assignedVehicleName=v.id?assetName(v):'';}
      if(data.supplierId){const s=supplierBy(data.supplierId); data.supplierName=s.name||data.supplierName||'';}
      if(data.purchaseId){const p=state.purchases.find(x=>x.id===data.purchaseId)||{}; data.purchaseNumber=p.number||p.reference||'';}
      if(data.invoiceId){const inv=state.invoices.find(x=>x.id===data.invoiceId)||{}; data.invoiceNumber=inv.number||'';}
      data.updatedAt=serverTimestamp();
      await updateDoc(docPath(c,id),data);
      closeEditModal();
    }catch(err){alert(err.message||err);}
  };
  m.classList.remove('hidden');
}
async function createInvoice(serviceId){if(!canCreate('invoices')){alert('Límite de facturas alcanzado.');show('plans');return;}const s=state.services.find(x=>x.id===serviceId);if(!s)return;const totals=invoiceTotalsFromService(s);const number='INV-'+String(Date.now()).slice(-7);await add('invoices',{number,date:today(),serviceId:s.id,clientId:s.clientId,clientName:s.clientName,serviceTitle:serviceTitle(s),items:s.items||[],fields:s.fields||[],subtotal:totals.subtotal,ivu:totals.ivu,taxPercent:totals.taxPercent,total:totals.total,status:'Pendiente',dueDate:plusDays(15),notes:'',terms:'Pago según acuerdo.'});}
function docHeader(title){const p=profile(),logo=p.logoPdf||p.logoDashboard;return `<div class="doc-page"><div class="doc-body"><div class="doc-head">${logo?`<img class="doc-logo" src="${logo}">`:''}<div class="doc-title">${esc(p.businessName||'Empresa')}</div><div>${esc(p.address||'')}</div><div>${esc(p.phone||'')} ${p.email?' · '+esc(p.email):''} ${p.web?' · '+esc(p.web):''}</div><div>${p.merchant?'Registro: '+esc(p.merchant):''}</div></div><h2 style="text-align:center">${esc(title)}</h2>`;}
function docFooter(){const p=profile();return `</div><div class="doc-foot">${esc(p.businessName||'Empresa')}</div></div>`;}
function niceDate(v){if(!v)return'';const parts=String(v).split('-');if(parts.length===3){const d=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2]));return d.toLocaleDateString('es-PR',{year:'numeric',month:'long',day:'numeric'});}return String(v);}
function statusText(bal,paid){return bal<=0?'Pagada':paid>0?'Parcial':'Pendiente';}
function invoiceDocFooter(){const p=profile();return `</div><div class="invoice-thanks">¡Gracias por su preferencia!</div><div class="invoice-footer"><span>${esc(p.businessName||'Empresa')}</span><span>Gracias por su preferencia</span></div></div>`;}
function previewInvoice(id){const inv=state.invoices.find(x=>x.id===id);if(!inv)return;const p=profile(),c=clientBy(inv.clientId),totals=invoiceTotals(inv),bal=invoiceBalance(inv),paid=invoicePaid(inv),status=invoiceStatus(inv),logo=p.logoPdf||p.logoDashboard;const rows=(inv.items&&inv.items.length?inv.items:[{description:inv.serviceTitle||'Servicio',qty:1,price:totals.subtotal}]).map(it=>`<tr><td>${esc(it.description||'Servicio')}</td><td>${esc(it.qty||1)}</td><td>${money(it.price||0)}</td><td>${money(Number(it.qty||1)*Number(it.price||0))}</td></tr>`).join('');const note=esc(inv.notes||'Gracias por confiar en nuestros servicios.');const terms=esc(inv.terms||inv.conditions||'Pago a través del método acordado.');const html=`<div class="doc-page invoice-pro"><div class="doc-body"><div class="invoice-top"><div class="invoice-brand">${logo?`<img class="invoice-logo" src="${logo}">`:''}<div><h1>${esc(p.businessName||'Empresa')}</h1>${p.email?`<p>${esc(p.email)}</p>`:''}</div></div><div class="invoice-contact"><p>${esc(p.address||'')}</p>${p.phone?`<p>${esc(p.phone)}</p>`:''}${p.email?`<p>${esc(p.email)}</p>`:''}${p.web?`<p>${esc(p.web)}</p>`:''}</div></div><div class="invoice-title-row"><div class="invoice-number"><p><b>No. de Factura:</b> ${esc(inv.number)}</p><p><b>Fecha:</b> ${esc(niceDate(inv.date))}</p><p><b>Vence:</b> ${esc(inv.dueDate?niceDate(inv.dueDate):'—')}</p></div><h2>FACTURA</h2><div class="status-card"><b>ESTADO</b><span>${esc(status).toUpperCase()}</span></div></div><div class="invoice-line"></div><div class="invoice-client-grid"><div class="invoice-box"><b>CLIENTE</b><p>${esc(inv.clientName||c.name||'')}</p></div><div class="invoice-box"><p><b>Teléfono:</b> ${esc(c.phone||'—')}</p><p><b>Dirección:</b> ${esc(c.address||c.city||'—')}</p></div></div><table class="doc-table invoice-items"><tr><th>Descripción</th><th>Cant.</th><th>Precio Unit.</th><th>Total</th></tr>${rows}</table><div class="invoice-lower"><div><div class="invoice-box note-box"><b>NOTAS</b><p>${note}</p></div><div class="invoice-box note-box"><b>CONDICIONES</b><p>${terms}</p></div>${p.signature?`<div class="invoice-sign"><img src="${p.signature}"><br>Firma autorizada</div>`:''}</div><div class="invoice-totals"><div><b>SUBTOTAL</b><span>${money(totals.subtotal)}</span></div><div><b>IVU (${totals.taxPercent}%)</b><span>${money(totals.ivu)}</span></div><div class="total-row"><b>TOTAL</b><span>${money(totals.total)}</span></div><div><b>PAGADO</b><span>${money(paid)}</span></div><div class="balance-row"><b>BALANCE</b><span>${money(bal)}</span></div></div></div>`+invoiceDocFooter();state.previewHtml=html;$('reportPreview').innerHTML=html;show('reports');}

function previewPaystub(id){
  const pmt=state.payroll.find(x=>x.id===id); if(!pmt) return;
  let html=docHeader('COMPROBANTE DE NÓMINA');
  html+=`<table class="doc-table"><tr><th>Empleado</th><td>${esc(pmt.teamName)}</td></tr><tr><th>Fecha</th><td>${esc(pmt.date)}</td></tr><tr><th>Periodo</th><td>${esc(pmt.period)}</td></tr><tr><th>Bruto</th><td>${money(pmt.gross)}</td></tr><tr><th>Bonos / comisiones</th><td>${money(pmt.bonus)}</td></tr><tr><th>Retenciones</th><td>${money(payrollRetention(pmt))}</td></tr><tr><th>Adelantos</th><td>${money(payrollAdvance(pmt))}</td></tr><tr><th>Otros descuentos</th><td>${money(payrollOtherDeductions(pmt))}</td></tr><tr><th>Total descuentos</th><td>${money(payrollTotalDeductions(pmt))}</td></tr><tr><th>Neto pagado</th><td><b>${money(payrollNet(pmt))}</b></td></tr><tr><th>Método</th><td>${esc(pmt.method)}</td></tr></table>`;
  html+=docFooter(); state.previewHtml=html; $('reportPreview')&&($('reportPreview').innerHTML=html); show('reports');
}
function preview(type){let title={executive:'REPORTE EJECUTIVO',finance:'REPORTE FINANCIERO',receivable:'CUENTAS POR COBRAR',invoices:'REPORTE DE FACTURAS',payments:'REPORTE DE COBROS',payroll:'REPORTE DE NÓMINA',retentions:'REPORTE DE RETENCIONES',suppliers:'REPORTE DE SUPLIDORES',services:'REPORTE DE SERVICIOS',quotes:'REPORTE DE COTIZACIONES',followups:'REPORTE DE SEGUIMIENTO',assetsClient:'ACTIVOS POR CLIENTE',assetsStatus:'ACTIVOS POR ESTADO',purchases:'COMPRAS Y CUENTAS POR PAGAR',ops:'REPORTE OPERACIONAL'}[type]||'REPORTE';let html=docHeader(title);if(type==='executive'){html+=`<table class="doc-table"><tr><th>Concepto</th><th>Total</th></tr><tr><td>Clientes</td><td>${state.clients.length}</td></tr><tr><td>Servicios</td><td>${state.services.length}</td></tr><tr><td>Facturado</td><td>${money(sum(state.invoices,'total'))}</td></tr><tr><td>Cobrado</td><td>${money(sum(state.payments,'amount'))}</td></tr><tr><td>Nómina pagada</td><td>${money(state.payroll.reduce((a,x)=>a+payrollNet(x),0))}</td></tr><tr><td>Suplidores pagados</td><td>${money(sum(state.supplierPayments,'amount'))}</td></tr></table>`;}else if(type==='finance'){const f=financialSummary();html+=`<table class="doc-table"><tr><th>Indicador</th><th>Total</th></tr><tr><td>Facturado</td><td>${money(f.invoiced)}</td></tr><tr><td>Cobrado</td><td>${money(f.paid)}</td></tr><tr><td>Por cobrar</td><td>${money(f.receivable)}</td></tr><tr><td>Vencido</td><td>${money(f.overdue)}</td></tr><tr><td>Gastos</td><td>${money(f.expenses)}</td></tr><tr><td>Caja neta</td><td>${money(f.net)}</td></tr><tr><td>Ingreso del mes</td><td>${money(f.monthIncome)}</td></tr><tr><td>Gasto del mes</td><td>${money(f.monthExpenses)}</td></tr><tr><td>Neto del mes</td><td>${money(f.monthNet)}</td></tr></table>`;}else if(type==='receivable'){const rows=state.invoices.filter(inv=>invoiceBalance(inv)>0 && invoiceStatus(inv)!=='Cancelada').map(inv=>`<tr><td>${esc(inv.number)}</td><td>${esc(inv.clientName)}</td><td>${esc(inv.dueDate||'—')}</td><td>${money(inv.total)}</td><td>${money(invoicePaid(inv))}</td><td>${money(invoiceBalance(inv))}</td><td>${esc(invoiceStatus(inv))}</td></tr>`).join('');html+=`<table class="doc-table"><tr><th>Factura</th><th>Cliente</th><th>Vence</th><th>Total</th><th>Pagado</th><th>Balance</th><th>Estado</th></tr>${rows}</table>`;}else if(type==='invoices'){html+=`<table class="doc-table"><tr><th>Factura</th><th>Cliente</th><th>Total</th><th>Pagado</th><th>Balance</th><th>Estado</th></tr>${state.invoices.map(x=>`<tr><td>${esc(x.number)}</td><td>${esc(x.clientName)}</td><td>${money(x.total)}</td><td>${money(invoicePaid(x))}</td><td>${money(invoiceBalance(x))}</td><td>${esc(invoiceStatus(x))}</td></tr>`).join('')}</table>`;}else if(type==='payments'){html+=`<table class="doc-table"><tr><th>Fecha</th><th>Factura</th><th>Método</th><th>Monto</th></tr>${state.payments.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.invoiceNumber)}</td><td>${esc(x.method)}</td><td>${money(x.amount)}</td></tr>`).join('')}</table>`;}else if(type==='payroll'){const bruto=sum(state.payroll,'gross'), bonos=sum(state.payroll,'bonus'), ret=state.payroll.reduce((a,x)=>a+payrollRetention(x),0), adv=state.payroll.reduce((a,x)=>a+payrollAdvance(x),0), desc=state.payroll.reduce((a,x)=>a+payrollOtherDeductions(x),0), neto=state.payroll.reduce((a,x)=>a+payrollNet(x),0);html+=`<table class="doc-table"><tr><th>Resumen</th><th>Total</th></tr><tr><td>Bruto</td><td>${money(bruto)}</td></tr><tr><td>Bonos / comisiones</td><td>${money(bonos)}</td></tr><tr><td>Retenciones</td><td>${money(ret)}</td></tr><tr><td>Adelantos</td><td>${money(adv)}</td></tr><tr><td>Otros descuentos</td><td>${money(desc)}</td></tr><tr><td>Neto pagado</td><td><b>${money(neto)}</b></td></tr></table><br><table class="doc-table"><tr><th>Fecha</th><th>Empleado</th><th>Periodo</th><th>Bruto</th><th>Retenciones</th><th>Otros desc.</th><th>Neto</th></tr>${state.payroll.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.teamName)}</td><td>${esc(x.period)}</td><td>${money(x.gross)}</td><td>${money(payrollRetention(x))}</td><td>${money(payrollAdvance(x)+payrollOtherDeductions(x))}</td><td>${money(payrollNet(x))}</td></tr>`).join('')}</table>`;}else if(type==='retentions'){const pending=retentionPendingAmount(), paid=retentionPaidAmount();html+=`<table class="doc-table"><tr><th>Resumen</th><th>Total</th></tr><tr><td>Retenciones pendientes</td><td>${money(pending)}</td></tr><tr><td>Retenciones pagadas</td><td>${money(paid)}</td></tr></table><br><table class="doc-table"><tr><th>Fecha</th><th>Empleado</th><th>Tipo</th><th>Destino</th><th>Monto</th><th>Estado</th><th>Fecha límite</th><th>Pagado</th></tr>${state.payrollRetentions.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.teamName)}</td><td>${esc(r.type)}</td><td>${esc(r.destination)}</td><td>${money(r.amount)}</td><td>${esc(retentionStatus(r))}</td><td>${esc(r.dueDate||'')}</td><td>${esc(r.paidAt||'')}</td></tr>`).join('')}</table>`;}else if(type==='retentions'){
    rows.push(['Fecha','Empleado','Tipo','Destino','Monto','Estado','Fecha límite','Pagado','Referencia']); state.payrollRetentions.forEach(r=>rows.push([r.date,r.teamName,r.type,r.destination,r.amount,retentionStatus(r),r.dueDate||'',r.paidAt||'',r.reference||'']));
  }else if(type==='suppliers'){html+=`<table class="doc-table"><tr><th>Suplidor</th><th>Compras</th><th>Pagado</th><th>Balance</th></tr>${state.suppliers.map(x=>`<tr><td>${esc(x.name)}</td><td>${money(supplierPurchasesTotal(x.id))}</td><td>${money(supplierPaid(x.id))}</td><td>${money(supplierBalance(x.id))}</td></tr>`).join('')}</table>`;}else if(type==='purchases'){html+=`<table class="doc-table"><tr><th>Fecha</th><th>Suplidor</th><th>Concepto</th><th>Total</th><th>Pagado</th><th>Balance</th><th>Estado</th></tr>${state.purchases.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.supplierName)}</td><td>${esc(x.concept)}</td><td>${money(x.total)}</td><td>${money(purchasePaid(x.id))}</td><td>${money(purchaseBalance(x))}</td><td>${esc(purchaseStatus(x))}</td></tr>`).join('')}</table>`;}else if(type==='ops'){const o=operationalSummary();html+=`<table class="doc-table"><tr><th>Indicador</th><th>Total</th></tr><tr><td>Empleados activos</td><td>${o.employees}</td></tr><tr><td>Nómina pendiente</td><td>${money(o.payrollDue)}</td></tr><tr><td>Suplidores</td><td>${o.suppliers}</td></tr><tr><td>Compras registradas</td><td>${o.purchases}</td></tr><tr><td>Cuentas por pagar</td><td>${money(o.purchaseDebt)}</td></tr><tr><td>Compras vencidas</td><td>${money(o.overduePurchases)}</td></tr></table>`;}else if(type==='followups'){const rows=(state.followups||[]).sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||''))).map(f=>`<tr><td>${esc(f.dueDate||'—')}</td><td>${esc(followupKindLabel(f.kind))}</td><td>${esc(f.clientName||'')}</td><td>${esc(f.assetName||'')}</td><td>${esc(followupStatus(f))}</td><td>${esc(f.notes||'')}</td></tr>`).join('');html+=`<table class="doc-table"><tr><th>Fecha</th><th>Tipo</th><th>Cliente</th><th>Equipo</th><th>Estado</th><th>Notas</th></tr>${rows}</table>`;}else if(type==='quotes'){const rows=state.quotes.map(q=>{const t=quoteTotals(q);return `<tr><td>${esc(q.number)}</td><td>${esc(q.clientName)}</td><td>${esc(q.validUntil||'—')}</td><td>${money(t.total)}</td><td>${esc(quoteStatus(q))}</td></tr>`;}).join('');html+=`<table class="doc-table"><tr><th>Cotización</th><th>Cliente</th><th>Válida</th><th>Total</th><th>Estado</th></tr>${rows}</table>`;}else if(type==='assetsClient'){html+=`<table class="doc-table"><tr><th>Cliente</th><th>Activo</th><th>Categoría</th><th>Ubicación</th><th>Estado</th></tr>${state.assets.map(a=>`<tr><td>${esc(a.clientName||'Sin cliente')}</td><td>${esc(assetName(a))}</td><td>${esc(assetCategory(a))}</td><td>${esc(assetLocation(a))}</td><td>${esc(assetStatus(a))}</td></tr>`).join('')}</table>`;}else if(type==='assetsStatus'){const groups={};state.assets.forEach(a=>{const st=assetStatus(a);groups[st]=(groups[st]||0)+1;});html+=`<table class="doc-table"><tr><th>Estado</th><th>Cantidad</th></tr>${Object.entries(groups).map(([st,c])=>`<tr><td>${esc(st)}</td><td>${c}</td></tr>`).join('')}</table>`;}else{html+=`<table class="doc-table"><tr><th>Fecha</th><th>Cliente</th><th>Activo</th><th>Servicio</th><th>Monto</th></tr>${state.services.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.clientName)}</td><td>${esc(x.assetName||'')}</td><td>${esc(serviceTitle(x))}</td><td>${money(serviceAmount(x))}</td></tr>`).join('')}</table>`;}html+=docFooter();state.previewHtml=html;$('reportPreview').innerHTML=html;}
function fileData(input){return new Promise(res=>{const f=input?.files?.[0];if(!f)return res('');const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(f);});}
async function saveSettings(){const p={...profile()};['businessName','slogan','phone','whatsapp','email','web','address','merchant','representative','tax','transportRatePerMile','transportBaseCharge','dailyGoal','primaryColor','secondaryColor','language'].forEach(k=>p[k]=$('set_'+k)?.value||'');p.industry=$('set_industry').value;p.customServices={...(p.customServices||{})};p.customServices[p.industry]=($('set_services')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);for(const k of ['logoDashboard','logoPdf','favicon','signature']){const v=await fileData($('set_'+k));if(v)p[k]=v;}if(onboardingProgress()>=50) p.onboardingSkipped=false; await setDoc(profRef(),p,{merge:true});alert(T('Guardado.'));}


function reportRows(type){
  const rows=[];
  if(type==='executive'){
    rows.push(['Concepto','Total'],['Clientes',state.clients.length],['Servicios',state.services.length],['Facturado',sum(state.invoices,'total')],['Cobrado',sum(state.payments,'amount')],['Nómina pagada',state.payroll.reduce((a,x)=>a+payrollNet(x),0)],['Suplidores pagados',sum(state.supplierPayments,'amount')]);
  }else if(type==='finance'){
    const f=financialSummary(); rows.push(['Indicador','Total'],['Facturado',f.invoiced],['Cobrado',f.paid],['Por cobrar',f.receivable],['Vencido',f.overdue],['Gastos',f.expenses],['Caja neta',f.net],['Ingreso del mes',f.monthIncome],['Gasto del mes',f.monthExpenses],['Neto del mes',f.monthNet]);
  }else if(type==='receivable'){
    rows.push(['Factura','Cliente','Vence','Total','Pagado','Balance','Estado']); state.invoices.filter(inv=>invoiceBalance(inv)>0 && invoiceStatus(inv)!=='Cancelada').forEach(inv=>rows.push([inv.number,inv.clientName,inv.dueDate||'',inv.total,invoicePaid(inv),invoiceBalance(inv),invoiceStatus(inv)]));
  }else if(type==='invoices'){
    rows.push(['Factura','Cliente','Total','Pagado','Balance','Estado']); state.invoices.forEach(x=>rows.push([x.number,x.clientName,x.total,invoicePaid(x),invoiceBalance(x),invoiceStatus(x)]));
  }else if(type==='payments'){
    rows.push(['Fecha','Factura','Método','Monto']); state.payments.forEach(x=>rows.push([x.date,x.invoiceNumber,x.method,x.amount]));
  }else if(type==='payroll'){
    rows.push(['Fecha','Empleado','Periodo','Bruto','Bonos','Retenciones','Adelantos','Otros descuentos','Neto']); state.payroll.forEach(x=>rows.push([x.date,x.teamName,x.period,x.gross,x.bonus,payrollRetention(x),payrollAdvance(x),payrollOtherDeductions(x),payrollNet(x)]));
  }else if(type==='retentions'){
    rows.push(['Fecha','Empleado','Tipo','Destino','Monto','Estado','Fecha límite','Pagado','Referencia']); state.payrollRetentions.forEach(r=>rows.push([r.date,r.teamName,r.type,r.destination,r.amount,retentionStatus(r),r.dueDate||'',r.paidAt||'',r.reference||'']));
  }else if(type==='suppliers'){
    rows.push(['Suplidor','Compras','Pagado','Balance']); state.suppliers.forEach(x=>rows.push([x.name,supplierPurchasesTotal(x.id),supplierPaid(x.id),supplierBalance(x.id)]));
  }else if(type==='purchases'){
    rows.push(['Fecha','Suplidor','Concepto','Total','Pagado','Balance','Estado']); state.purchases.forEach(x=>rows.push([x.date,x.supplierName,x.concept,x.total,purchasePaid(x.id),purchaseBalance(x),purchaseStatus(x)]));
  }else if(type==='ops'){
    const o=operationalSummary(); rows.push(['Indicador','Total'],['Empleados activos',o.employees],['Nómina pendiente',o.payrollDue],['Suplidores',o.suppliers],['Compras registradas',o.purchases],['Cuentas por pagar',o.purchaseDebt],['Compras vencidas',o.overduePurchases]);
  }else if(type==='followups'){
    rows.push(['Fecha','Tipo','Cliente','Equipo','Estado','Notas']); (state.followups||[]).forEach(f=>rows.push([f.dueDate||'',followupKindLabel(f.kind),f.clientName||'',f.assetName||'',followupStatus(f),f.notes||'']));
  }else if(type==='quotes'){
    rows.push(['Cotización','Cliente','Válida','Total','Estado']); state.quotes.forEach(q=>{const t=quoteTotals(q); rows.push([q.number,q.clientName,q.validUntil||'',t.total,quoteStatus(q)]);});
  }else if(type==='assetsClient'){
    rows.push(['Cliente','Activo','Categoría','Ubicación','Estado']); state.assets.forEach(a=>rows.push([a.clientName||'Sin cliente',assetName(a),assetCategory(a),assetLocation(a),assetStatus(a)]));
  }else if(type==='assetsStatus'){
    const groups={}; state.assets.forEach(a=>{const st=assetStatus(a); groups[st]=(groups[st]||0)+1;}); rows.push(['Estado','Cantidad']); Object.entries(groups).forEach(([st,c])=>rows.push([st,c]));
  }else{
    rows.push(['Fecha','Cliente','Activo','Servicio','Monto']); state.services.forEach(x=>rows.push([x.date,x.clientName,x.assetName||'',serviceTitle(x),serviceAmount(x)]));
  }
  return rows;
}
function csvEscape(v){return '"'+String(v??'').replace(/"/g,'""')+'"';}
function exportReport(type){
  if(lockedModule('reports')){alert('Reportes es premium.');show('plans');return;}
  const rows=reportRows(type); if(!rows.length)return;
  const csv=rows.map(r=>r.map(csvEscape).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`nexus-${type||'reporte'}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
function currentReportType(){
  const selected=document.querySelector('.report-option.selected:not(.report-hidden)') || document.querySelector('.report-option:not(.report-hidden)');
  return selected?.dataset.reportType || 'executive';
}
function selectReport(type){
  document.querySelectorAll('.report-option').forEach(btn=>btn.classList.toggle('selected', btn.dataset.reportType===type));
}
function filterReportCenter(){
  const q=($('reportSearch')?.value||'').toLowerCase().trim();
  document.querySelectorAll('.report-option').forEach(item=>{
    const hay=(item.dataset.reportName||item.textContent||'').toLowerCase();
    item.classList.toggle('report-hidden', !!q && !hay.includes(q));
  });
  const selected=document.querySelector('.report-option.selected');
  if(selected && selected.classList.contains('report-hidden')){
    const first=document.querySelector('.report-option:not(.report-hidden)');
    if(first) selectReport(first.dataset.reportType);
  }
}
function downloadCurrentPreview(){
  const btn=$('downloadPreview'); if(btn) btn.click();
}

function bindForms(){
  $('clientForm').onsubmit=e=>{e.preventDefault();add('clients',{name:$('cName').value,phone:$('cPhone').value,email:$('cEmail').value,city:$('cCity').value,address:$('cAddress').value,altName:$('cAltName')?.value||'',altPhone:$('cAltPhone')?.value||'',altEmail:$('cAltEmail')?.value||'',tags:readClientTags('cTags'),notes:$('cNotes')?.value||''});e.target.reset();};
  $('serviceForm').onsubmit=async e=>{
    e.preventDefault();
    const c=state.clients.find(x=>x.id===$('sClient').value)||{},t=state.team.find(x=>x.id===$('sTeam').value)||{},a=assetBy($('sAsset')?.value||'');
    const items=getServiceItems();
    const enteredTitle=($('sTitle')?.value||'').trim();
    const totalFromItems=serviceItemsTotal(items);
    const selectedService=$('sServiceType')?.value||industry().service;
    const title=enteredTitle || items[0]?.description || selectedService;
    const route=transportRouteFromForm();
    const serviceFields=industry().serviceFields.map((_,n)=>$('sF'+n)?.value||'');
    const payload={clientId:c.id||'',clientName:c.name||'',assetId:a.id||'',assetName:a.id?assetName(a):'',teamId:t.id||'',teamName:t.name||'',date:$('sDate').value,status:$('sStatus')?.value||'Pendiente',priority:$('sPriority')?.value||'Normal',serviceType:selectedService,title,amount:totalFromItems>0?totalFromItems:Number($('sAmount').value||0),items,fields:serviceFields,route};
    if(state.editingServiceId){
      await updateDoc(docPath('services',state.editingServiceId),{...payload,updatedAt:serverTimestamp()});
      await createFollowupFromService({...payload,id:state.editingServiceId},state.editingServiceId);
      resetServiceEditMode();
    }else{
      const ref=await add('services',payload);
      await createFollowupFromService({...payload,id:ref?.id||''},ref?.id||'');
    }
    e.target.reset();
    if($('sDate')) $('sDate').value=today();
    setServiceItems([]);
    if(isTransport()) updateTransportTotal();
  };
  $('cancelServiceEdit') && ($('cancelServiceEdit').onclick=()=>{ $('serviceForm').reset(); if($('sDate')) $('sDate').value=today(); setServiceItems([]); resetServiceEditMode(); if(isTransport()) updateTransportTotal(); });
  if($('quoteForm')) $('quoteForm').onsubmit=async e=>{e.preventDefault();const c=clientBy($('qClient')?.value||'');if(!c.id)return alert('Selecciona cliente.');const a=assetBy($('qAsset')?.value||'');const t=teamBy($('qTeam')?.value||'');const items=getQuoteItems();const subtotal=serviceItemsTotal(items);const ivu=subtotal*taxRate();const payload={clientId:c.id,clientName:c.name,assetId:a.id||'',assetName:a.id?assetName(a):'',teamId:t.id||'',teamName:t.name||'',date:$('qDate').value,validUntil:$('qValid').value,status:$('qStatus').value,priority:$('qPriority').value,serviceType:$('qServiceType').value,title:$('qTitle').value,items,subtotal,ivu,taxPercent:taxPercent(),total:subtotal+ivu,notes:$('qNotes').value,terms:$('qTerms').value,updatedAt:serverTimestamp()};if(state.editingQuoteId){await updateDoc(docPath('quotes',state.editingQuoteId),payload);resetQuoteEditMode();}else{const n=quoteNumber(); const ref=await add('quotes',{number:n,...payload}); await createFollowupFromQuote({id:ref?.id,number:n,...payload});}e.target.reset();setQuoteItems([{description:'',qty:1,price:''}]);};
  if($('cancelQuoteEdit')) $('cancelQuoteEdit').onclick=()=>{resetQuoteEditMode();$('quoteForm')?.reset();setQuoteItems([{description:'',qty:1,price:''}]);};

  if($('followupForm')) $('followupForm').onsubmit=async e=>{e.preventDefault();const c=clientBy($('fClient')?.value||'');if(!c.id)return alert('Selecciona cliente.');const a=assetBy($('fAsset')?.value||'');await add('followups',{kind:$('fKind').value,clientId:c.id,clientName:c.name,assetId:a.id||'',assetName:a.id?assetName(a):'',title:$('fTitle').value,dueDate:$('fDue').value,status:$('fStatus').value,frequencyMonths:$('fKind').value==='maintenance'?6:0,notes:$('fNotes').value});e.target.reset();if($('fDue'))$('fDue').value=monthsFromToday(6);};
  $('teamForm').onsubmit=e=>{e.preventDefault();const v=assetBy($('tAssignedVehicle')?.value||'');add('team',{name:$('tName').value,phone:$('tPhone').value,email:$('tEmail').value,personalId:$('tPersonalId')?.value||'',ssn:formatSSNInput($('tSsn')?.value||''),driverLicense:$('tDriverLicense')?.value||'',assignedVehicleId:v.id||'',assignedVehicleName:v.id?assetName(v):'',role:$('tRole').value,status:$('tStatus')?.value||'Activo',salary:Number($('tSalary').value||0),rate:Number($('tRate').value||0),retention:Number($('tRetention').value||0),startDate:$('tStart').value});e.target.reset();};
  $('assetForm').onsubmit=e=>{e.preventDefault();const c=clientBy($('aClient')?.value||'');add('assets',{clientId:c.id||'',clientName:c.name||'',industry:profile().industry||'hvac',name:$('aName').value,category:$('aCategory').value,location:$('aLocation').value,status:$('aStatus').value,value:Number($('aValue').value||0),date:$('aDate').value,warranty:$('aWarranty').value,notes:$('aNotes').value});e.target.reset();};
  $('supplierForm').onsubmit=e=>{e.preventDefault();add('suppliers',{name:$('supName').value,phone:$('supPhone').value,whatsapp:$('supWhatsapp')?.value||'',email:$('supEmail').value,contact:$('supContact')?.value||'',category:$('supCategory')?.value||'',creditLimit:Number($('supCredit')?.value||0),openingBalance:Number($('supOpening').value||0),fields:industry().supplierFields.map((_,n)=>$('supF'+n)?.value||'')});e.target.reset();};
  $('supplierPaymentForm').onsubmit=e=>{e.preventDefault();const s=supplierBy($('spSupplier').value);if(!s.id)return alert('Selecciona suplidor.');const pu=state.purchases.find(x=>x.id===($('spPurchase')?.value||''))||{};const amount=Number($('spAmount').value||0);add('supplierPayments',{supplierId:s.id,supplierName:s.name,purchaseId:pu.id||'',purchaseNumber:pu.number||pu.reference||'',date:$('spDate').value,method:$('spMethod').value,amount,note:$('spNote').value});add('cashflow',{date:$('spDate').value,type:'Gasto',concept:`Pago suplidor ${s.name}${pu.id?' · '+(pu.number||pu.concept):''}`,amount});e.target.reset();};
  $('payrollForm').onsubmit=async e=>{e.preventDefault();const t=teamBy($('prTeam').value);if(!t.id)return alert('Selecciona empleado/equipo.');const gross=Number($('prGross').value||0),bonus=Number($('prBonus')?.value||0),retention=Number($('prRetention')?.value||0),ded=Number($('prDeductions').value||0),adv=Number($('prAdvance')?.value||0),retType=$('prRetentionType')?.value||'Hacienda',retDest=$('prRetentionDest')?.value||'Departamento de Hacienda',retDue=$('prRetentionDue')?.value||plusDays(15),net=Math.max(0,gross+bonus-retention-ded-adv);const payrollRef=await add('payroll',{teamId:t.id,teamName:t.name,date:$('prDate').value,period:$('prPeriod').value,hours:Number($('prHours')?.value||0),overtime:Number($('prOvertime')?.value||0),gross,bonus,retention,retentionType:retType,retentionDestination:retDest,retentionDueDate:retDue,advance:adv,deductions:ded,totalDeductions:retention+ded+adv,net,method:$('prMethod').value,note:$('prNote').value});const payrollId=payrollRef?.id||'';if(retention>0){await add('payrollRetentions',{payrollId,teamId:t.id,teamName:t.name,date:$('prDate').value,type:retType,destination:retDest,amount:retention,status:'Pendiente',dueDate:retDue,note:$('prNote').value});}if(adv>0){await add('payrollRetentions',{payrollId,teamId:t.id,teamName:t.name,date:$('prDate').value,type:'Adelanto al empleado',destination:t.name,amount:adv,status:'Aplicada',dueDate:$('prDate').value,paidAt:$('prDate').value,note:'Adelanto descontado en nómina'});}if(ded>0){await add('payrollRetentions',{payrollId,teamId:t.id,teamName:t.name,date:$('prDate').value,type:'Descuento interno',destination:'Empresa',amount:ded,status:'Aplicada',dueDate:$('prDate').value,paidAt:$('prDate').value,note:'Descuento aplicado en nómina'});}await add('cashflow',{date:$('prDate').value,type:'Gasto',concept:`Nómina ${t.name}`,amount:net,note:`Bruto ${money(gross)} · Bonos ${money(bonus)} · Retenciones ${money(retention)} → ${retDest} · Adelantos ${money(adv)} · Otros descuentos ${money(ded)} · Neto ${money(net)}`});e.target.reset();};
  $('purchaseForm').onsubmit=e=>{e.preventDefault();const s=supplierBy($('puSupplier').value);if(!s.id)return alert('Selecciona suplidor.');const subtotal=Number($('puSubtotal').value||0),tax=Number($('puTax').value||0),total=subtotal+tax;add('purchases',{supplierId:s.id,supplierName:s.name,date:$('puDate').value,dueDate:$('puDue').value,concept:$('puConcept').value,reference:$('puRef').value,number:$('puRef').value||('PO-'+String(Date.now()).slice(-6)),subtotal,tax,total,status:$('puStatus').value,note:$('puNote').value});e.target.reset();};
  $('paymentForm').onsubmit=async e=>{e.preventDefault();const inv=state.invoices.find(x=>x.id===$('pInvoice').value);if(!inv)return alert('Selecciona factura.');if(invoiceStatus(inv)==='Cancelada')return alert('No se puede cobrar una factura cancelada.');const amount=Number($('pAmount').value||0);if(amount<=0)return alert('Monto inválido.');const bal=invoiceBalance(inv);if(amount>bal+0.01 && !confirm('El cobro excede el balance. ¿Registrar de todos modos?')) return;await add('payments',{invoiceId:inv.id,invoiceNumber:inv.number,date:$('pDate').value,method:$('pMethod').value,amount,note:$('pNote').value});await add('cashflow',{date:$('pDate').value,type:'Ingreso',concept:`Cobro ${inv.number}`,amount});const newBal=Math.max(0,bal-amount);await updateDoc(docPath('invoices',inv.id),{status:newBal<=0?'Pagada':amount>0?'Parcial':invoiceStatus(inv),updatedAt:serverTimestamp()});e.target.reset();};
  $('cashForm').onsubmit=e=>{e.preventDefault();add('cashflow',{date:$('xDate').value,type:$('xType').value,concept:$('xConcept').value,amount:Number($('xAmount').value||0)});e.target.reset();};
  $('saveSettings').onclick=saveSettings;$('invoiceFromService').onclick=()=>{const s=state.services.find(s=>!state.invoices.some(i=>i.serviceId===s.id));if(s)createInvoice(s.id);else alert('No hay servicios pendientes de facturar.');};
  document.querySelectorAll('.report-option').forEach(b=>b.onclick=()=>selectReport(b.dataset.reportType));
  if($('reportViewBtn')) $('reportViewBtn').onclick=()=>{if(lockedModule('reports')){alert('Reportes es premium.');show('plans');return;}preview(currentReportType());};
  if($('reportPdfBtn')) $('reportPdfBtn').onclick=()=>{if(lockedModule('reports')){alert('Reportes es premium.');show('plans');return;}preview(currentReportType());setTimeout(downloadCurrentPreview,250);};
  if($('reportExportBtn')) $('reportExportBtn').onclick=()=>exportReport(currentReportType());
  if($('reportSearch')) $('reportSearch').oninput=filterReportCenter;
  $('printPreview').onclick=()=>{const html=state.previewHtml||$('reportPreview').innerHTML;const w=open('','_blank');w.document.write(`<html><head><title>Documento</title><link rel="stylesheet" href="styles.css"><style>@page{size:letter;margin:.45in;}html,body{margin:0!important;padding:0!important;background:#fff!important;}body{display:block!important;}.doc-page{width:100%!important;max-width:none!important;min-height:calc(11in - .9in)!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;transform:none!important;zoom:1!important;display:flex!important;flex-direction:column!important;}.doc-body{flex:1 1 auto!important;padding:0 0 .25in 0!important;}.doc-foot{position:static!important;margin-top:auto!important;text-align:center!important;}.doc-table{width:100%!important;}</style></head><body>${html}</body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print();},700);};
  $('downloadPreview').onclick=()=>{const {jsPDF}=window.jspdf;const docp=new jsPDF({unit:'pt',format:'a4'});docp.html(state.previewHtml||$('reportPreview').innerHTML,{callback:d=>{const pages=d.getNumberOfPages();for(let n=1;n<=pages;n++){d.setPage(n);d.setFontSize(8);d.setTextColor(100);d.text(`Página ${n} de ${pages}`,d.internal.pageSize.getWidth()/2,d.internal.pageSize.getHeight()-18,{align:'center'});}d.save('nexus-documento.pdf');},x:18,y:18,width:559,windowWidth:900,autoPaging:'text'});};
  $('sideUpgrade').onclick=()=>show('plans');$('mobileMenu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');$('logoutBtn').onclick=()=>signOut(auth);if($('globalSearch')) $('globalSearch').oninput=renderGlobalSearch;
}
function authUI(){$('authIndustry').innerHTML=Object.entries(INDUSTRIES).map(([id,x])=>`<option value="${id}">${T(x.name)}</option>`).join('');$('showLogin').onclick=()=>{mode='login';document.querySelectorAll('.register-only').forEach(x=>x.classList.add('hidden'));$('authSubmit').textContent=T('Entrar');$('showLogin').classList.add('active');$('showRegister').classList.remove('active');};$('showRegister').onclick=()=>{mode='register';document.querySelectorAll('.register-only').forEach(x=>x.classList.remove('hidden'));$('authSubmit').textContent=T('Crear cuenta');$('showRegister').classList.add('active');$('showLogin').classList.remove('active');};$('authForm').onsubmit=async e=>{e.preventDefault();$('authMsg').textContent=T('Procesando...');try{if(mode==='register'){const cred=await createUserWithEmailAndPassword(auth,$('authEmail').value,$('authPassword').value);await setDoc(doc(db,'users',cred.user.uid),{...defaultProfile(),businessName:$('authBusiness').value||'Mi Negocio',industry:$('authIndustry').value,email:$('authEmail').value});}else await signInWithEmailAndPassword(auth,$('authEmail').value,$('authPassword').value);$('authMsg').textContent='';}catch(err){$('authMsg').textContent=err.message;}};}
async function load(){unsub.forEach(x=>x());unsub=[];const snap=await getDoc(profRef());if(!snap.exists())await setDoc(profRef(),defaultProfile());unsub.push(onSnapshot(profRef(),s=>{state.profile=s.data()||defaultProfile();render();}));COLS.forEach(c=>unsub.push(onSnapshot(colPath(c),s=>{state[c]=s.docs.map(d=>({...d.data(),id:d.id}));$('syncStatus').textContent=T('Sincronizado');render();},e=>{$('syncStatus').textContent=T('Firebase bloqueado');console.error(e);})));}
authUI();bindForms();onAuthStateChanged(auth,u=>{if(u){$('authScreen').classList.add('hidden');$('appShell').classList.remove('hidden');load();}else{$('authScreen').classList.remove('hidden');$('appShell').classList.add('hidden');}});
