import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const APP_VERSION = 'v52';
let deferredInstallPrompt = null;
let updateWaiting = null;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = id => document.getElementById(id);
const money = n => Number(n||0).toLocaleString('es-PR',{style:'currency',currency:'USD'});
const esc = v => String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const today = () => new Date().toISOString().slice(0,10);
const plusDays = n => {const d=new Date(); d.setDate(d.getDate()+Number(n||0)); return d.toISOString().slice(0,10);};
const plusMonths = (date,months=6) => {const d=new Date((date||today())+'T12:00:00'); d.setMonth(d.getMonth()+Number(months||6)); return d.toISOString().slice(0,10);};

let unsub=[];
let currentFilter='all';
let state={profile:null,clients:[],services:[],quotes:[],followups:[],invoices:[],payments:[],assets:[]};
const COLS=['clients','services','quotes','followups','invoices','payments','assets'];
function uid(){return auth.currentUser?.uid || '';}
function colRef(c){return collection(db,'users',uid(),c);}
function docRef(c,id){return doc(db,'users',uid(),c,id);}
function clientBy(id){return state.clients.find(c=>c.id===id)||{};}
function taxRate(){return Number(state.profile?.tax || 11.5)/100;}
function invoicePaid(inv){return state.payments.filter(p=>p.invoiceId===inv.id).reduce((a,p)=>a+Number(p.amount||0),0);}
function invoiceBalance(inv){return Math.max(0,Number(inv.total||0)-invoicePaid(inv));}
function invoiceStatus(inv){const bal=invoiceBalance(inv), paid=invoicePaid(inv); if(String(inv.status||'')==='Cancelada') return 'Cancelada'; if(bal<=0) return 'Pagada'; if(inv.dueDate && inv.dueDate<today()) return 'Vencida'; return paid>0?'Parcial':'Pendiente';}
function statusBadge(status){const s=String(status||'Pendiente'); const cls=s==='Pagada'||s==='Completado'?'ok':(s==='Vencida'||s==='Urgente'||s==='Vencido'?'danger':(s==='Próximo'||s==='Parcial'?'warn':'')); return `<span class="badge ${cls}">${esc(s)}</span>`;}
function sorted(arr,key='date'){return [...(arr||[])].sort((a,b)=>String(b[key]||'').localeCompare(String(a[key]||'')));}
function phoneLink(c){const raw=String(c.phone||c.whatsapp||'').replace(/\D/g,''); if(!raw) return ''; const normalized=raw.length===10?'1'+raw:raw.replace(/^1?/,'1'); return `https://wa.me/${normalized}`;}


function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;}
function setupPwaInstall(){
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault(); deferredInstallPrompt=e; renderSyncDetails();});
  window.addEventListener('online',()=>{setSync('Online · sincronizando'); renderSyncDetails();});
  window.addEventListener('offline',()=>{setSync('Offline · datos en caché'); renderSyncDetails();});
  if('serviceWorker' in navigator){
    navigator.serviceWorker.ready.then(reg=>{
      updateWaiting=reg.waiting || null;
      if(updateWaiting) showUpdateToast();
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker) return;
        worker.addEventListener('statechange',()=>{if(worker.state==='installed' && navigator.serviceWorker.controller){updateWaiting=worker; showUpdateToast();}});
      });
    }).catch(()=>{});
    let refreshing=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing) return; refreshing=true; location.reload();});
  }
}
function showUpdateToast(){
  if(document.querySelector('.update-toast')) return;
  const box=document.createElement('div');
  box.className='update-toast';
  box.innerHTML='<span>Nueva versión móvil disponible.</span><button type="button" id="applyUpdateBtn">Actualizar</button>';
  document.body.appendChild(box);
}
function applyWaitingUpdate(){
  if(updateWaiting) updateWaiting.postMessage({type:'SKIP_WAITING'});
  else location.reload();
}

function switchTab(id){
  document.querySelectorAll('.mobile-view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
  window.scrollTo({top:0,behavior:'smooth'});
}

document.addEventListener('click',async e=>{
  const tab=e.target.closest('[data-tab]'); if(tab){switchTab(tab.dataset.tab); return;}
  const f=e.target.closest('[data-follow-filter]'); if(f){currentFilter=f.dataset.followFilter; document.querySelectorAll('[data-follow-filter]').forEach(b=>b.classList.toggle('active',b===f)); renderFollowups(); return;}
  const complete=e.target.closest('[data-complete-follow]'); if(complete){await completeFollowup(complete.dataset.completeFollow); return;}
  const del=e.target.closest('[data-delete-follow]'); if(del && confirm('¿Borrar seguimiento?')){await deleteDoc(docRef('followups',del.dataset.deleteFollow)); return;}
  const shareInv=e.target.closest('[data-share-invoice]'); if(shareInv){shareInvoice(shareInv.dataset.shareInvoice); return;}
  const pay=e.target.closest('[data-mark-paid]'); if(pay){await markInvoicePaid(pay.dataset.markPaid); return;}
  if(e.target.id==='applyUpdateBtn'){applyWaitingUpdate(); return;}
});

$('mobileAuthForm')?.addEventListener('submit',async e=>{
  e.preventDefault(); $('mobileAuthMsg').textContent='Conectando…';
  try{await signInWithEmailAndPassword(auth,$('mobileEmail').value,$('mobilePassword').value); $('mobileAuthMsg').textContent='';}
  catch(err){$('mobileAuthMsg').textContent=err.message||'No se pudo entrar.';}
});
$('mobileLogout')?.addEventListener('click',()=>signOut(auth));
$('mForceReload')?.addEventListener('click',async()=>{
  if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.getRegistration().catch(()=>null); await reg?.update?.().catch(()=>{}); if(reg?.waiting){updateWaiting=reg.waiting; applyWaitingUpdate(); return;}}
  location.reload();
});
$('mClientSearch')?.addEventListener('input',renderClients);
$('mHistorySearch')?.addEventListener('input',renderHistory);
$('mRefreshInvoices')?.addEventListener('click',()=>renderAll());
$('mInstallBtn')?.addEventListener('click',async()=>{
  if(deferredInstallPrompt){deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice.catch(()=>{}); deferredInstallPrompt=null; renderSyncDetails(); return;}
  alert('En iPhone/iPad: abre Safari, toca Compartir y selecciona Añadir a pantalla de inicio.');
});

setupPwaInstall();
onAuthStateChanged(auth,async user=>{
  unsub.forEach(fn=>fn()); unsub=[];
  if(!user){$('mobileAuth').classList.remove('hidden'); $('mobileApp').classList.add('hidden'); return;}
  $('mobileAuth').classList.add('hidden'); $('mobileApp').classList.remove('hidden');
  await loadProfile();
  COLS.forEach(c=>unsub.push(onSnapshot(colRef(c),snap=>{state[c]=snap.docs.map(d=>({id:d.id,...d.data()})); renderAll(); setSync('Sincronizado');},err=>setSync('Error sync'))));
});

async function loadProfile(){
  const ref=doc(db,'users',uid()); const snap=await getDoc(ref);
  state.profile=snap.exists()?snap.data():{businessName:'Nexus Business',tax:'11.5'};
  $('mobileBusiness').textContent=state.profile.businessName||'Nexus Business';
}
function setSync(text){$('mobileSync').textContent=text;}
function renderAll(){renderSelects();renderDashboard();renderInvoices();renderFollowups();renderClients();renderHistory();renderSyncDetails();}
function renderSelects(){
  const opts=state.clients.map(c=>`<option value="${esc(c.id)}">${esc(c.name||'Cliente')}</option>`).join('');
  ['mInvClient','mFollowClient'].forEach(id=>{const el=$(id); if(el){const prev=el.value; el.innerHTML=`<option value="">Seleccionar cliente</option>${opts}`; if(prev) el.value=prev;}});
  if($('mInvDate')&&!$('mInvDate').value) $('mInvDate').value=today();
  if($('mInvDue')&&!$('mInvDue').value) $('mInvDue').value=plusDays(15);
  if($('mFollowDue')&&!$('mFollowDue').value) $('mFollowDue').value=plusMonths(today(),6);
}
function renderDashboard(){
  const month=today().slice(0,7);
  const monthInvoices=state.invoices.filter(i=>String(i.date||'').startsWith(month));
  const monthPayments=state.payments.filter(p=>String(p.date||'').startsWith(month));
  const invoiced=monthInvoices.reduce((a,i)=>a+Number(i.total||0),0);
  const paid=monthPayments.reduce((a,p)=>a+Number(p.amount||0),0);
  const receivable=state.invoices.reduce((a,i)=>a+invoiceBalance(i),0);
  const overdue=state.invoices.filter(i=>invoiceStatus(i)==='Vencida').reduce((a,i)=>a+invoiceBalance(i),0);
  $('mMonthNet').textContent=money(paid);
  $('mBillingKpis').innerHTML=[['Facturado mes',invoiced],['Cobrado mes',paid],['Por cobrar',receivable],['Vencido',overdue]].map(x=>`<div class="metric"><small>${x[0]}</small><b>${money(x[1])}</b></div>`).join('');
  renderInvoiceTypeKpis(monthInvoices);
  const critical=followupRows().filter(f=>followStatus(f)!=='Completado').slice(0,4);
  $('mCriticalFollowups').innerHTML=critical.length?critical.map(followCard).join(''):'<div class="empty">Sin seguimientos críticos.</div>';
}

function renderInvoiceTypeKpis(monthInvoices){
  const target=$('mTypeKpis'); if(!target) return;
  const grouped={};
  (monthInvoices||[]).forEach(inv=>{const key=inv.invoiceType||inv.type||'Servicio'; if(!grouped[key]) grouped[key]={count:0,total:0}; grouped[key].count++; grouped[key].total+=Number(inv.total||0);});
  const preferred=['Servicio','Mantenimiento','Instalación','Diagnóstico','Cotización','Otro'];
  const rows=preferred.filter(k=>grouped[k]).concat(Object.keys(grouped).filter(k=>!preferred.includes(k)));
  target.innerHTML=rows.length?rows.map(k=>`<div class="type-chip"><small>${esc(k)} · ${grouped[k].count}</small><b>${money(grouped[k].total)}</b></div>`).join(''):'<div class="empty">Sin facturas este mes.</div>';
}

function renderInvoices(){
  const rows=sorted(state.invoices,'date').slice(0,30);
  $('mInvoiceList').innerHTML=rows.length?rows.map(inv=>{const c=clientBy(inv.clientId);return `<div class="row-card"><div class="top"><div><h4>${esc(inv.number||'Factura')}</h4><p>${esc(inv.clientName||c.name||'Cliente')} · ${esc(inv.serviceTitle||inv.invoiceType||'Servicio')}</p></div>${statusBadge(invoiceStatus(inv))}</div><p>Total ${money(inv.total)} · Balance ${money(invoiceBalance(inv))}</p><div class="actions"><button data-share-invoice="${esc(inv.id)}" type="button">Compartir</button>${invoiceBalance(inv)>0?`<button data-mark-paid="${esc(inv.id)}" type="button">Marcar pagada</button>`:''}</div></div>`;}).join(''):'<div class="empty">No hay facturas.</div>';
}
function followStatus(f){if(String(f.status||'')==='Completado') return 'Completado'; const d=String(f.dueDate||''); if(d && d<today()) return 'Vencida'; if(d && d<=plusDays(14)) return 'Próximo'; return f.status||'Programado';}
function followupRows(){return [...state.followups].sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||'')));}
function followCard(f){const c=clientBy(f.clientId); const phone=phoneLink(c); const text=`Hola ${f.clientName||c.name||''}, le saluda ${state.profile?.businessName||'Nexus Business'}. Tenemos pendiente coordinar: ${f.title||f.type||'seguimiento'} para ${f.dueDate||''}.`;return `<div class="row-card"><div class="top"><div><h4>${esc(f.title||f.type||'Seguimiento')}</h4><p>${esc(f.clientName||c.name||'Cliente')} · ${esc(f.dueDate||'Sin fecha')}</p></div>${statusBadge(followStatus(f))}</div><p>${esc(f.type||'')} · cada ${esc(f.intervalMonths||6)} meses</p><div class="actions">${phone?`<a href="${phone}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">WhatsApp</a>`:''}<button data-complete-follow="${esc(f.id)}" type="button">Completar</button><button class="danger" data-delete-follow="${esc(f.id)}" type="button">Borrar</button></div></div>`;}
function renderFollowups(){
  let rows=followupRows();
  if(currentFilter==='due') rows=rows.filter(f=>followStatus(f)==='Vencida');
  if(currentFilter==='next') rows=rows.filter(f=>followStatus(f)==='Próximo');
  if(currentFilter==='maint') rows=rows.filter(f=>String(f.type||'').toLowerCase().includes('mant'));
  $('mFollowupList').innerHTML=rows.length?rows.map(followCard).join(''):'<div class="empty">Sin seguimientos para este filtro.</div>';
}
function renderClients(){
  const q=String($('mClientSearch')?.value||'').toLowerCase();
  const rows=state.clients.filter(c=>[c.name,c.phone,c.email,c.address].join(' ').toLowerCase().includes(q)).slice(0,60);
  $('mClientCount').textContent=`${state.clients.length} clientes`;
  $('mClientList').innerHTML=rows.length?rows.map(c=>{const invs=state.invoices.filter(i=>i.clientId===c.id), fol=state.followups.filter(f=>f.clientId===c.id);return `<div class="row-card"><div class="top"><div><h4>${esc(c.name||'Cliente')}</h4><p>${esc(c.phone||'')} ${c.email?'· '+esc(c.email):''}</p></div><span class="badge">${invs.length} fac.</span></div><p>${esc(c.address||c.city||'')}</p><div class="actions"><button data-tab="mHistory" type="button">Historial</button>${phoneLink(c)?`<a href="${phoneLink(c)}" target="_blank" rel="noopener">WhatsApp</a>`:''}<span class="badge">${fol.length} seg.</span></div></div>`;}).join(''):'<div class="empty">Sin clientes.</div>';
}
function renderHistory(){
  const q=String($('mHistorySearch')?.value||'').toLowerCase();
  const items=[];
  state.invoices.forEach(i=>items.push({date:i.date,type:'Factura',title:i.number,client:i.clientName,detail:`${i.serviceTitle||'Servicio'} · ${money(i.total)} · ${invoiceStatus(i)}`}));
  state.payments.forEach(p=>items.push({date:p.date,type:'Cobro',title:p.invoiceNumber,client:'',detail:`${p.method||'Pago'} · ${money(p.amount)}`}));
  state.followups.forEach(f=>items.push({date:f.dueDate,type:'Seguimiento',title:f.title||f.type,client:f.clientName,detail:`${followStatus(f)} · ${f.type||''}`}));
  state.services.forEach(s=>items.push({date:s.date,type:'Servicio',title:s.title||s.serviceType||'Servicio',client:s.clientName,detail:`${s.status||''} · ${money(s.amount)}`}));
  const rows=items.filter(x=>[x.title,x.client,x.detail,x.type].join(' ').toLowerCase().includes(q)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,80);
  $('mHistoryList').innerHTML=rows.length?rows.map(x=>`<div class="timeline-item"><div><h4>${esc(x.date||'—')} · ${esc(x.type)}</h4><p><b>${esc(x.client||'')}</b> ${esc(x.title||'')}</p><p>${esc(x.detail||'')}</p></div></div>`).join(''):'<div class="empty">Sin historial.</div>';
}
function renderSyncDetails(){
  const installBox=$('mInstallBox');
  if(installBox){installBox.innerHTML=isStandalone()?'<b>Instalada:</b> Nexus Mobile está corriendo como app PWA.':'<b>Instalación iPhone/iPad:</b> abre en Safari → Compartir → Añadir a pantalla de inicio.';}
  const online=navigator.onLine?'Online':'Offline';
  const standalone=isStandalone()?'App instalada':'Navegador';
  $('mSyncDetails').innerHTML=[['Versión',APP_VERSION],['Estado',online],['Modo',standalone],['Clientes',state.clients.length],['Facturas',state.invoices.length],['Cobros',state.payments.length],['Seguimientos',state.followups.length],['Cotizaciones',state.quotes.length],['Servicios',state.services.length]].map(x=>`<div class="metric"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
}

$('mInvoiceForm')?.addEventListener('submit',async e=>{
  e.preventDefault(); const c=clientBy($('mInvClient').value); if(!c.id) return alert('Selecciona cliente.');
  const qty=Number($('mInvQty').value||1), price=Number($('mInvPrice').value||0), subtotal=qty*price, ivu=subtotal*taxRate(), total=subtotal+ivu;
  await addDoc(colRef('invoices'),{number:'INV-M-'+String(Date.now()).slice(-7),date:$('mInvDate').value,dueDate:$('mInvDue').value,clientId:c.id,clientName:c.name||'',invoiceType:$('mInvType').value,serviceTitle:$('mInvDesc').value,items:[{description:$('mInvDesc').value,qty,price}],subtotal,ivu,taxPercent:Number(state.profile?.tax||11.5),total,status:'Pendiente',notes:$('mInvNotes').value,terms:'Pago según acuerdo.',sourceType:'mobile',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  e.target.reset(); renderSelects(); switchTab('mDashboard');
});
$('mFollowupForm')?.addEventListener('submit',async e=>{
  e.preventDefault(); const c=clientBy($('mFollowClient').value); if(!c.id) return alert('Selecciona cliente.');
  await addDoc(colRef('followups'),{clientId:c.id,clientName:c.name||'',type:$('mFollowType').value,title:$('mFollowTitle').value,dueDate:$('mFollowDue').value,intervalMonths:Number($('mFollowInterval').value||6),status:'Programado',priority:$('mFollowPriority').value,channel:'WhatsApp',sourceType:'mobile',sourceId:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  e.target.reset(); renderSelects();
});
async function completeFollowup(id){
  const f=state.followups.find(x=>x.id===id); if(!f) return;
  await updateDoc(docRef('followups',id),{status:'Completado',completedAt:today(),updatedAt:serverTimestamp()});
  if(String(f.type||'').toLowerCase().includes('mant')){
    await addDoc(colRef('followups'),{clientId:f.clientId||'',clientName:f.clientName||'',assetId:f.assetId||'',assetName:f.assetName||'',type:'Mantenimiento',title:f.title||'Mantenimiento preventivo 6 meses',dueDate:plusMonths(today(),Number(f.intervalMonths||6)),intervalMonths:Number(f.intervalMonths||6),status:'Programado',priority:f.priority||'Normal',channel:f.channel||'WhatsApp',sourceType:'recurring-mobile',sourceId:id,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  }
}
async function markInvoicePaid(id){const inv=state.invoices.find(i=>i.id===id); if(!inv) return; const bal=invoiceBalance(inv); if(bal<=0) return; await addDoc(colRef('payments'),{invoiceId:inv.id,invoiceNumber:inv.number,date:today(),method:'Móvil',amount:bal,note:'Pago registrado desde Nexus Mobile',createdAt:serverTimestamp()}); await updateDoc(docRef('invoices',id),{status:'Pagada',updatedAt:serverTimestamp()});}
function shareInvoice(id){const inv=state.invoices.find(i=>i.id===id); if(!inv) return; const text=`${state.profile?.businessName||'Nexus Business'}\nFactura: ${inv.number}\nCliente: ${inv.clientName}\nTotal: ${money(inv.total)}\nBalance: ${money(invoiceBalance(inv))}`; if(navigator.share) navigator.share({title:`Factura ${inv.number}`,text}).catch(()=>{}); else navigator.clipboard?.writeText(text).then(()=>alert('Factura copiada.'));}
