import{initializeApp}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import{getDatabase,ref,set}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,onAuthStateChanged}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
const cfg={apiKey:'AIzaSyDZohweBiGofXFd2HD-VH5w3BsUc2zaFqc',authDomain:'ticketing-project-3bcf6.firebaseapp.com',databaseURL:'https://ticketing-project-3bcf6-default-rtdb.asia-southeast1.firebasedatabase.app',projectId:'ticketing-project-3bcf6',storageBucket:'ticketing-project-3bcf6.firebasestorage.app',messagingSenderId:'682939255204',appId:'1:682939255204:web:65d2ba7efb2baf665c5931'};
const _app=initializeApp(cfg),auth=getAuth(_app),db=getDatabase(_app);
let isRegistering=false;
onAuthStateChanged(auth,u=>{if(u&&!isRegistering)location.href='dashboard.html'});
window.gotoTab=function(t){
  const isL=t==='login';
  document.getElementById('tb-login').classList.toggle('active',isL);
  document.getElementById('tb-reg').classList.toggle('active',!isL);
  document.getElementById('pane-login').classList.toggle('hidden',!isL);
  document.getElementById('pane-reg').classList.toggle('hidden',isL);
  document.getElementById('tab-slider').classList.toggle('right',!isL);
};
window.pickAgent=function(v){
  document.querySelectorAll('.ac').forEach(c=>c.classList.remove('sel'));
  document.getElementById('ac-'+v).classList.add('sel');
  document.getElementById('r-agent').value=v;
};
window.togglePw=function(id,btn){const i=document.getElementById(id);const s=i.type==='password';i.type=s?'text':'password';btn.textContent=s?'🙈':'👁'};
let _tt;
function toast(type,icon,msg){const el=document.getElementById('toast');document.getElementById('t-icon').textContent=icon+' ';document.getElementById('t-msg').textContent=msg;el.className='toast '+type+' show';clearTimeout(_tt);_tt=setTimeout(()=>el.classList.remove('show'),3200)}
function err(id,msg){const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.classList.toggle('show',!!msg);const inp=el.previousElementSibling?.querySelector?.('.fi')||el.previousElementSibling;if(inp?.classList)inp.classList.toggle('err',!!msg)}
function clearErr(...ids){ids.forEach(id=>err(id,''))}
function setBtn(id,loading,txt){const b=document.getElementById(id);b.disabled=loading;b.innerHTML=loading?`<span class="ld"></span>${txt}...`:txt}
window.doLogin=async function(){
  clearErr('le-email','le-pw');
  const email=document.getElementById('l-email').value.trim(),pw=document.getElementById('l-pw').value;
  if(!email){err('le-email','Email tidak boleh kosong');return}
  if(!pw){err('le-pw','Password tidak boleh kosong');return}
  setBtn('btn-login',true,'MASUK');
  try{await signInWithEmailAndPassword(auth,email,pw);toast('success','✅','Login berhasil! Mengalihkan…');setTimeout(()=>location.href='dashboard.html',900)}
  catch(e){setBtn('btn-login',false,'MASUK');toast('error','⚠️',e.code==='auth/invalid-credential'?'Email atau password salah':e.code==='auth/too-many-requests'?'Terlalu banyak percobaan':e.message)}
};
window.doRegister=async function(){
  clearErr('re-name','re-email','re-phone','re-pw','re-conf');
  const name=document.getElementById('r-name').value.trim(),email=document.getElementById('r-email').value.trim(),phone=document.getElementById('r-phone').value.trim(),pw=document.getElementById('r-pw').value,conf=document.getElementById('r-conf').value;
  let ok=true;
  if(!name){err('re-name','Nama tidak boleh kosong');ok=false}
  if(!email){err('re-email','Email tidak boleh kosong');ok=false}
  if(!phone){err('re-phone','No. HP tidak boleh kosong');ok=false}
  if(pw.length<6){err('re-pw','Minimal 6 karakter');ok=false}
  if(pw!==conf){err('re-conf','Password tidak cocok');ok=false}
  if(!ok)return;
  setBtn('btn-reg',true,'BUAT AKUN');isRegistering=true;
  try{
    const cred=await createUserWithEmailAndPassword(auth,email,pw);
    await set(ref(db,`users/${cred.user.uid}`),{name,email,phone,createdAt:new Date().toISOString()});
    toast('success','🎉','Akun dibuat! Selamat datang di Dufan!');
    setTimeout(()=>{isRegistering=false;location.href='dashboard.html'},1000)
  }catch(e){isRegistering=false;setBtn('btn-reg',false,'BUAT AKUN');toast('error','⚠️',e.code==='auth/email-already-in-use'?'Email sudah terdaftar':e.message)}
};
window.doForgot=async function(){
  const email=document.getElementById('l-email').value.trim();
  if(!email){toast('error','⚠️','Isi email terlebih dahulu');return}
  try{await sendPasswordResetEmail(auth,email);toast('info','📧','Link reset dikirim ke emailmu')}
  catch(e){toast('error','⚠️',e.message)}
};