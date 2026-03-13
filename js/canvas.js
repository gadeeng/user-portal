(function(){
  const c=document.getElementById('bg-canvas'),cx=c.getContext('2d');
  let W,H;
  const particles=[];
  const NUM_P=80;
  function makeP(){return{x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3,vx:(Math.random()-.5)*.15,vy:-Math.random()*.4-.1,alpha:Math.random()*.5+.1,color:Math.random()<.6?'#00e5ff':Math.random()<.5?'#ffd566':'#ff4d6d'}}
  function initP(){particles.length=0;for(let i=0;i<NUM_P;i++)particles.push(makeP())}
  const FW={R:120,rot:0};
  const cityLights=Array.from({length:60},()=>({x:Math.random(),y:.85+Math.random()*.12,size:Math.random()*2+.5,color:['#00e5ff','#ffd566','#ff4d6d','#00ff87','#ffffff'][Math.floor(Math.random()*5)],blink:Math.random()*Math.PI*2,blinkSpeed:(Math.random()-.5)*.05}));
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;initP()}
  function drawFW(){
    const fx=W*.15,fy=H*.35,R=FW.R;
    cx.save();cx.globalAlpha=.6;
    cx.beginPath();cx.arc(fx,fy,R,0,Math.PI*2);cx.strokeStyle='rgba(0,229,255,.1)';cx.lineWidth=1.5;cx.stroke();
    cx.beginPath();cx.arc(fx,fy,R*.15,0,Math.PI*2);cx.strokeStyle='rgba(0,229,255,.18)';cx.lineWidth=1;cx.stroke();
    for(let i=0;i<8;i++){
      const a=FW.rot+(i/8)*Math.PI*2,ex=fx+Math.cos(a)*R,ey=fy+Math.sin(a)*R;
      cx.beginPath();cx.moveTo(fx,fy);cx.lineTo(ex,ey);cx.strokeStyle='rgba(0,229,255,.07)';cx.lineWidth=1;cx.stroke();
      const gc=['#00e5ff','#ffd566','#ff4d6d','#00ff87'][i%4];
      cx.save();cx.translate(ex,ey);
      cx.beginPath();cx.arc(0,0,5,0,Math.PI*2);cx.fillStyle=gc+'33';cx.fill();
      cx.strokeStyle=gc;cx.lineWidth=1;cx.stroke();
      cx.shadowColor=gc;cx.shadowBlur=8;cx.beginPath();cx.arc(0,0,2,0,Math.PI*2);cx.fillStyle=gc;cx.fill();
      cx.restore();
    }
    cx.save();cx.shadowColor='#00e5ff';cx.shadowBlur=20;cx.beginPath();cx.arc(fx,fy,4,0,Math.PI*2);cx.fillStyle='rgba(0,229,255,.6)';cx.fill();cx.restore();
    cx.restore();
  }
  function drawRC(){
    const pts=[];
    for(let i=0;i<=60;i++){
      const t=i/60,x=t*W,base=H*.88;
      const y=base-Math.sin(t*Math.PI*3)*H*.12-Math.sin(t*Math.PI*7+1)*H*.04
        -(t>.3&&t<.45?Math.sin((t-.3)/.15*Math.PI)*H*.22:0)
        -(t>.65&&t<.8?Math.sin((t-.65)/.15*Math.PI)*H*.14:0);
      pts.push([x,y]);
    }
    cx.save();cx.globalAlpha=.9;
    cx.beginPath();pts.forEach(([x,y],i)=>i===0?cx.moveTo(x,y):cx.lineTo(x,y));
    cx.lineTo(W,H);cx.lineTo(0,H);cx.closePath();cx.fillStyle='rgba(4,9,26,.7)';cx.fill();
    cx.beginPath();pts.forEach(([x,y],i)=>i===0?cx.moveTo(x,y):cx.lineTo(x,y));
    cx.strokeStyle='rgba(0,229,255,.12)';cx.lineWidth=1.5;cx.stroke();cx.restore();
  }
  let frame=0;
  function draw(){
    frame++;cx.clearRect(0,0,W,H);
    const sky=cx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#010510');sky.addColorStop(.5,'#030a1e');sky.addColorStop(1,'#070e23');
    cx.fillStyle=sky;cx.fillRect(0,0,W,H);
    const glow=cx.createRadialGradient(W*.5,H*.3,0,W*.5,H*.3,W*.7);
    glow.addColorStop(0,'rgba(0,229,255,.03)');glow.addColorStop(1,'transparent');
    cx.fillStyle=glow;cx.fillRect(0,0,W,H);
    cx.strokeStyle='rgba(0,229,255,.025)';cx.lineWidth=1;
    for(let x=0;x<W;x+=60){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}
    for(let y=0;y<H;y+=60){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()}
    FW.rot+=.002;drawFW();drawRC();
    cityLights.forEach(l=>{
      l.blink+=l.blinkSpeed;const a=.3+Math.sin(l.blink)*.25;
      cx.save();cx.globalAlpha=Math.max(0,a);cx.shadowColor=l.color;cx.shadowBlur=6;
      cx.beginPath();cx.arc(l.x*W,l.y*H,l.size,0,Math.PI*2);cx.fillStyle=l.color;cx.fill();cx.restore();
    });
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.y<-10){Object.assign(p,makeP());p.y=H+5}
      cx.save();cx.globalAlpha=p.alpha*(.6+Math.sin(frame*.05+p.x)*.3);
      cx.shadowColor=p.color;cx.shadowBlur=8;
      cx.beginPath();cx.arc(p.x,p.y,p.r,0,Math.PI*2);cx.fillStyle=p.color;cx.fill();cx.restore();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);resize();draw();
})();