import{initializeApp}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import{getDatabase,ref,set,get,onValue}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import{getAuth,onAuthStateChanged,signOut}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

// ── PATCH: import engine rekomendasi ──
import { initRekomendasi, updateTicketOptions } from './rekomendasi.js';

// ── PATCH: terima NODES & CONNS dari iframe mapUser.html, lalu init Floyd-Warshall ──
window.addEventListener('message', e => {
  if (e.data?.type !== 'MAP_DATA') return;
  window._NODES = e.data.NODES;
  window._CONNS = e.data.CONNS;
  initRekomendasi(window._NODES, window._CONNS);
});

const cfg={
  apiKey:'AIzaSyDZohweBiGofXFd2HD-VH5w3BsUc2zaFqc',
  authDomain:'ticketing-project-3bcf6.firebaseapp.com',
  databaseURL:'https://ticketing-project-3bcf6-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId:'ticketing-project-3bcf6',
  storageBucket:'ticketing-project-3bcf6.firebasestorage.app',
  messagingSenderId:'682939255204',
  appId:'1:682939255204:web:65d2ba7efb2baf665c5931',
};
const app=initializeApp(cfg);
const auth=getAuth(app);
const db=getDatabase(app);

/* ── STATE ── */
let me=null,profile=null,tickets=[],selPkg=null,adultN=2,childN=1;

/* ── PACKAGES ── */
const PKGS={
  SOLO:          {name:'Solo',          priority:false,price:250000,minA:1,maxA:1, kids:false},
  SOLO_PRIORITY: {name:'Solo Priority', priority:true, price:750000,minA:1,maxA:1, kids:false},
  GROUP:         {name:'Group',         priority:false,price:220000,minA:2,maxA:10,kids:false},
  GROUP_PRIORITY:{name:'Group Priority',priority:true, price:600000,minA:2,maxA:10,kids:false},
  GROUP_FAMILY:  {name:'Family',        priority:false,price:200000,minA:1,maxA:4, kids:true},
};
const PKG_CLR={
  SOLO:'#bbe70e',SOLO_PRIORITY:'#fbbf24',
  GROUP:'#ec4899',GROUP_PRIORITY:'#f97316',GROUP_FAMILY:'#38bdf8',
};

/* ── LOADING ── */
function hideLoading(){
  const el=document.getElementById('loading-screen');
  el.classList.add('hide');
  setTimeout(()=>el.remove(),500);
}

/* ── AUTH ── */
onAuthStateChanged(auth,async user=>{
  if(!user){hideLoading();location.href='login.html';return;}
  me=user;
  try{
    const snap=await get(ref(db,`users/${user.uid}`));
    if(snap.exists())profile=snap.val();
  }catch(e){console.warn(e)}
  applyProfile();
  listenTickets(user.uid);
  hideLoading();
});

/* ── PROFILE ── */
function applyProfile(){
  const name=profile?.name?.trim()
    || me?.displayName?.trim()
    || 'Pengunjung';
  document.getElementById('g-name').textContent=name;
  document.getElementById('chip-name').textContent=name;
}

/* ── TICKETS ── */
function listenTickets(uid){
  onValue(ref(db,`users/${uid}/tickets`),async snap=>{
    if(!snap.exists()){tickets=[];renderTickets();return;}
    const ids=Object.keys(snap.val());
    const res=await Promise.all(ids.map(id=>get(ref(db,`tickets/${id}`))));
    tickets=res.filter(s=>s.exists()).map(s=>s.val());
    window._tickets = tickets; // ── PATCH: expose ke rekomendasi.js
    renderTickets();
    updateStats();
    updateTicketOptions(tickets); // ── PATCH: isi dropdown pilih tiket
  });
}

function renderTickets(){
  const grid=document.getElementById('ticket-grid');
  if(!tickets.length){
    grid.innerHTML=`
      <div class="empty-state">
        <div class="empty-icon">🎟️</div>
        <div class="empty-title">BELUM ADA TIKET</div>
        <div class="empty-desc">Yuk beli tiket dan rasakan serunya wahana-wahana di Dufan Ancol!</div>
        <button class="btn-primary" onclick="openBuyModal()">🎡 &nbsp;BELI TIKET SEKARANG</button>
      </div>`;
    return;
  }
  grid.innerHTML=tickets.map(tcHTML).join('');
}

function tcHTML(t){
  const clr=PKG_CLR[t.paket]||'var(--cyan)';
  const pkg=PKGS[t.paket]||{};
  const date=t.date
    ?new Date(t.date+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})
    :'—';
  const st=(t.status||'VALID').toLowerCase();
  return `
  <div class="tc${t.fastTrack?' is-ft':''}" style="--tc-clr:${clr}">
    <div class="tc-head">
      <div class="tc-id">${t.id}</div>
      <div class="tc-badges">
        ${t.fastTrack?'<span class="badge badge-ft">⚡ FT</span>':''}
        <span class="badge badge-${st}">${(t.status||'VALID')}</span>
      </div>
    </div>
    <div class="tc-body">
      <div class="tc-name">${t.name||'—'}</div>
      <div class="tc-email">${t.email||'—'}</div>
      <div class="tc-metas">
        <div class="tc-meta">
          <div class="lbl">TANGGAL</div>
          <div class="val">${date}</div>
        </div>
        <div class="tc-meta">
          <div class="lbl">ANGGOTA</div>
          <div class="val">${t.numAdults||1} dewasa${t.numChildren?' + '+t.numChildren+' anak':''}</div>
        </div>
      </div>
    </div>
    <div class="tc-foot">
      <div class="pkg-pill"><div class="pkg-dot"></div>&nbsp;${pkg.name||t.paket||'—'}</div>
      <button class="btn-sm" onclick="showQR('${t.id}')">QR CODE</button>
    </div>
  </div>`;
}

function updateStats(){
  document.getElementById('s-total').textContent=tickets.length;
  document.getElementById('s-valid').textContent=tickets.filter(t=>t.status==='VALID').length;
  document.getElementById('s-ft').textContent=tickets.filter(t=>t.fastTrack).length;
  document.getElementById('s-used').textContent=tickets.filter(t=>t.status==='USED').length;
}

/* ── BUY MODAL ── */
window.openBuyModal=function(){
  selPkg=null;adultN=2;childN=1;
  document.querySelectorAll('.pkg').forEach(c=>c.classList.remove('sel'));
  document.getElementById('buy-detail').style.display='none';
  document.getElementById('visit-date').value=new Date().toISOString().slice(0,10);
  document.getElementById('buy-modal').classList.add('show');
};
window.closeBuy=function(){document.getElementById('buy-modal').classList.remove('show')};
window.closeBuyOverlay=function(e){if(e.target===document.getElementById('buy-modal'))window.closeBuy()};

window.pickPkg=function(id){
  selPkg=id;
  document.querySelectorAll('.pkg').forEach(c=>c.classList.remove('sel'));
  document.getElementById('pkg-'+id).classList.add('sel');
  const pkg=PKGS[id];
  document.getElementById('buy-detail').style.display='block';
  const aw=document.getElementById('adult-wrap');
  const cw=document.getElementById('child-wrap');
  const hw=document.getElementById('height-wrap');
  aw.style.display=pkg.maxA>1?'block':'none';
  cw.style.display=pkg.kids?'block':'none';
  hw.style.display=pkg.kids?'block':'none';
  if(pkg.maxA===1){adultN=1;}
  else{adultN=pkg.minA;document.getElementById('adult-count').textContent=adultN;}
  document.getElementById('adult-range').textContent='('+pkg.minA+'–'+pkg.maxA+' orang)';
  updateSummary();
};

window.changeCount=function(type,delta){
  if(!selPkg)return;
  const pkg=PKGS[selPkg];
  if(type==='adult'){
    adultN=Math.max(pkg.minA,Math.min(pkg.maxA,adultN+delta));
    document.getElementById('adult-count').textContent=adultN;
  }else{
    childN=Math.max(1,Math.min(6,childN+delta));
    document.getElementById('child-count').textContent=childN;
  }
  updateSummary();
};

function updateSummary(){
  if(!selPkg)return;
  const pkg=PKGS[selPkg];
  const a=pkg.maxA===1?1:adultN;
  const c=pkg.kids?childN:0;
  const tot=(a+c)*pkg.price;
  document.getElementById('os-pkg').textContent=pkg.name;
  document.getElementById('os-qty').textContent=`${a+c} tiket (${a} dewasa${c?' + '+c+' anak':''})`;
  document.getElementById('os-ft').textContent=pkg.priority?'⚡ Ya':'Tidak';
  document.getElementById('os-total').textContent='Rp '+tot.toLocaleString('id-ID');
}

window.confirmBuy=async function(){
  if(!me)return;
  if(!selPkg){toast('error','⚠️','Pilih paket terlebih dahulu');return;}
  const pkg=PKGS[selPkg];
  const date=document.getElementById('visit-date').value;
  if(!date){toast('error','⚠️','Pilih tanggal kunjungan dulu');return;}
  const a=pkg.maxA===1?1:adultN;
  const c=pkg.kids?childN:0;
  const minH=pkg.kids?(parseInt(document.getElementById('min-height').value)||100):(profile?.height||160);
  const btn=document.getElementById('btn-confirm');
  btn.disabled=true;btn.innerHTML='<span class="spin"></span>&nbsp;MEMPROSES...';
  try{
    const total=a+c;
    const promises=[];
    // groupId: semua tiket dalam satu transaksi berbagi ID yang sama
    const groupId=Math.random().toString(36).substring(2,10).toUpperCase();
    for(let i=0;i<total;i++){
      const prefix=pkg.priority?'FT':'RG';
      const d=date.replace(/-/g,'').slice(2);
      const rand=Math.random().toString(36).substring(2,8).toUpperCase();
      const id=`${prefix}-${d}-${rand}`;
      const ticket={
        id,name:profile?.name?.trim()||me?.displayName?.trim()||'Pengunjung',phone:profile?.phone||'—',
        email:me.email,date,fastTrack:pkg.priority,
        paket:selPkg,priority:pkg.priority,
        numAdults:a,numChildren:c,minHeight:minH,
        status:'VALID',usedAt:null,userId:me.uid,
        createdAt:new Date().toISOString(),
        groupId,
        isGroupLeader: i === 0,
      };
      promises.push(set(ref(db,`tickets/${id}`),ticket));
      promises.push(set(ref(db,`users/${me.uid}/tickets/${id}`),true));
    }
    await Promise.all(promises);
    window.closeBuy();
    toast('success','🎉',`${total} tiket berhasil dibeli!`);
  }catch(e){
    toast('error','⚠️','Gagal: '+e.message);
  }finally{
    btn.disabled=false;btn.innerHTML='KONFIRMASI PEMBELIAN';
  }
};

/* ── QR ── */
window.showQR=function(id){
  const t=tickets.find(x=>x.id===id);if(!t)return;
  const pkg=PKGS[t.paket]||{};
  const date=t.date
    ?new Date(t.date+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})
    :'—';
  document.getElementById('qr-title').textContent=t.id;
  document.getElementById('qr-sub').textContent=(pkg.name||t.paket||'—')+' · '+(t.status||'VALID');
  document.getElementById('qr-id').textContent=t.id;
  const box=document.getElementById('qr-box');
  box.innerHTML='';
  new QRCode(box,{
    text:JSON.stringify({id:t.id,uid:t.userId,date:t.date,ft:t.fastTrack}),
    width:200,height:200,colorDark:'#04091a',colorLight:'#ffffff',
    correctLevel:QRCode.CorrectLevel.M,
  });
  document.getElementById('qr-deets').innerHTML=`
    <div class="qr-deet"><span class="k">📅 Tanggal</span><span class="v">${date}</span></div>
    <div class="qr-deet"><span class="k">👥 Anggota</span><span class="v">${t.numAdults||1} dewasa${t.numChildren?' + '+t.numChildren+' anak':''}</span></div>
    <div class="qr-deet"><span class="k">🎟️ Jenis</span><span class="v">${t.fastTrack?'⚡ Fast Track':'Reguler'}</span></div>
    <div class="qr-deet"><span class="k">📊 Status</span><span class="v">${t.status||'VALID'}</span></div>
  `;
  document.getElementById('qr-modal').classList.add('show');
};
window.closeQr=function(){document.getElementById('qr-modal').classList.remove('show')};
window.closeQrOverlay=function(e){if(e.target===document.getElementById('qr-modal'))window.closeQr()};

/* ── PETA WAHANA TOGGLE ── */
// Iframe langsung dimuat di background saat halaman load
// agar map.js bisa kirim postMessage (NODES, CONNS, qData) ke rekomendasi
// Iframe dimuat segera di background — pakai getAttribute bukan .src
// karena iframe.src="" di HTML dibaca sebagai URL halaman saat ini oleh JS
window.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('map-iframe');
  if (iframe && !iframe.getAttribute('src')) iframe.src = 'mapUser.html';
});

let mapOpen = false;
window.toggleMap = function(){
  const wrap   = document.getElementById('map-iframe-wrap');
  const btn    = document.getElementById('map-toggle-btn');
  const lbl    = document.getElementById('map-toggle-lbl');
  mapOpen      = !mapOpen;
  wrap.classList.toggle('open', mapOpen);
  btn.classList.toggle('open', mapOpen);
  lbl.textContent = mapOpen ? 'SEMBUNYIKAN PETA' : 'TAMPILKAN PETA';
};

/* ── LOGOUT ── */
window.doLogout=function(){
  document.getElementById('logout-modal').classList.add('show');
};
window.closeLogout=function(){
  document.getElementById('logout-modal').classList.remove('show');
};
window.confirmLogout=async function(){
  window.closeLogout();
  await signOut(auth);
  location.href='login.html';
};

/* ── TOAST ── */
let _tt;
function toast(type,icon,msg){
  const el=document.getElementById('toast');
  document.getElementById('t-icon').textContent=icon;
  document.getElementById('t-msg').textContent=msg;
  el.className='toast '+type+' show';
  clearTimeout(_tt);
  _tt=setTimeout(()=>el.classList.remove('show'),3200);
}
window.toast=toast;