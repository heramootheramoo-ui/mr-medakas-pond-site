const META={"youkihi": {"w": 276, "h": 452, "head": 53, "eyeY": 92.1, "eyeX": 21.2, "er": 10.54, "ir": 14}, "miyuki": {"w": 276, "h": 452, "head": 53, "eyeY": 92.1, "eyeX": 21.2, "er": 10.54, "ir": 14}, "sanshoku": {"w": 276, "h": 452, "head": 53, "eyeY": 92.1, "eyeX": 21.2, "er": 10.54, "ir": 14}, "shirohikari": {"w": 276, "h": 466, "head": 53, "eyeY": 92.1, "eyeX": 21.2, "er": 10.54, "ir": 14}, "wild": {"w": 276, "h": 452, "head": 53, "eyeY": 92.1, "eyeX": 21.2, "er": 10.54, "ir": 14}, "youkihihirenaga": {"w": 276, "h": 500, "head": 53, "eyeY": 92.1, "eyeX": 21.2, "er": 10.54, "ir": 14}, "kurotsubame": {"w": 276, "h": 527, "head": 53, "eyeY": 92.1, "eyeX": 21.2, "er": 10.54, "ir": 14}, "youkihidaruma": {"w": 276, "h": 350, "head": 53, "eyeY": 92.1, "eyeX": 26.7, "er": 11.07, "ir": 15}};
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W=1600,H=1000,scale=1,dpr=1;
function resize(){dpr=Math.min(window.devicePixelRatio||1,1);const cw=cv.clientWidth,ch=cv.clientHeight;cv.width=cw*dpr;cv.height=ch*dpr;scale=Math.max(0.5,Math.min(cw/1400,ch/900,1.3));W=cw/scale;H=ch/scale;}
addEventListener('resize',resize);resize();
const rnd=(a,b)=>a+Math.random()*(b-a);
const names=Object.keys(META).slice(0,5);
const NATURE_OF={youkihi:'loving',miyuki:'zippy',sanshoku:'playful',shirohikari:'shy',wild:'curious',youkihihirenaga:'leader',kurotsubame:'feisty',youkihidaruma:'gentle'};const DEFAULTS={"burst": 190, "beats": 3.5, "rest": 2.8, "drag": 1.8, "turn": 14.5, "wander": 2.15, "twitch": 2.1, "swing": 0.42, "sway": 0.165, "beatHz": 7, "idleHz": 2.4, "flex": 0.18, "wave": 4.4, "finFlick": 0.8, "curl": 0.2, "space": 250, "avoid": 1.4, "align": 0.12, "regroupDist": 310, "regroup": 0.11, "size": 0.48, "ripple": 1.0};const P=Object.assign({},DEFAULTS);
const fish=names.map((n,i)=>({n,img:document.getElementById('f-'+n),sh:document.getElementById('s-'+n),m:META[n],
  x:rnd(250,W-250),y:rnd(200,H-200),a:rnd(0,Math.PI*2),v:0,tv:0,av:0,ph:rnd(0,6),thrust:0,
  nature:NATURE_OF[n]||'loving',state:'hover',timer:rnd(0.1,1.5),hunger:rnd(0.6,1),excite:0,bend:0,amp:0.05,des:0,vt:0,beats:3,beatT:0,turnT:0}));
const food=[],rip=[];
const plants={hornwort:document.getElementById('p-hornwort')};
const hornPlot=[];for(let i=0;i<4;i++)hornPlot.push({x:rnd(160,W-160),y:rnd(H*0.55,H-30),s:rnd(0.7,1.1),ph:rnd(0,6)});
// ---- surface water: a small wave-equation heightfield disturbed by the fish ----
const CELL=18;let wdirty=true;let GW=0,GH=0,wcur=null,wprev=null,wc=null,wctx=null,wimg=null,wacc=0;
function initWater(){GW=Math.ceil(W/CELL)+2;GH=Math.ceil(H/CELL)+2;wcur=new Float32Array(GW*GH);wprev=new Float32Array(GW*GH);
  wc=document.createElement('canvas');wc.width=GW;wc.height=GH;wctx=wc.getContext('2d');wimg=wctx.createImageData(GW,GH);}
initWater();addEventListener('resize',initWater);
function disturb(x,y,r,amt){const cx=x/CELL+1,cy=y/CELL+1,rr=Math.max(1,r/CELL);
  const x0=Math.max(1,Math.floor(cx-rr)),x1=Math.min(GW-2,Math.ceil(cx+rr)),y0=Math.max(1,Math.floor(cy-rr)),y1=Math.min(GH-2,Math.ceil(cy+rr));
  for(let j=y0;j<=y1;j++)for(let i=x0;i<=x1;i++){const d=Math.hypot(i-cx,j-cy)/rr;if(d<1)wcur[j*GW+i]+=amt*(1-d*d)}}
function waterStep(){const c=wcur,p=wprev,gw=GW;
  for(let j=1;j<GH-1;j++){const row=j*gw;for(let i=1;i<gw-1;i++){const k=row+i;
    p[k]=((c[k-1]+c[k+1]+c[k-gw]+c[k+gw])*0.5-p[k])*0.95}}
  wprev=c;wcur=p;}
function waterGrad(x,y){const i=Math.min(GW-2,Math.max(1,Math.round(x/CELL+1))),j=Math.min(GH-2,Math.max(1,Math.round(y/CELL+1))),k=j*GW+i;
  return [wcur[k+1]-wcur[k-1],wcur[k+GW]-wcur[k-GW]]}
function drawWater(){if(P.ripple<=0)return;if(!wdirty){ctx.imageSmoothingEnabled=true;ctx.drawImage(wc,-CELL*0.5,-CELL*0.5,GW*CELL,GH*CELL);return}wdirty=false;const c=wcur,d=wimg.data,gw=GW;
  for(let j=1;j<GH-1;j++)for(let i=1;i<gw-1;i++){const k=j*gw+i;const gx=c[k+1]-c[k-1],gy=c[k+gw]-c[k-gw];
    const l=(-gx*0.62-gy*0.78);const o=k*4;
    if(l>0){d[o]=225;d[o+1]=242;d[o+2]=236;d[o+3]=Math.min(150,Math.pow(l*P.ripple,1.35)*32)}
    else{d[o]=0;d[o+1]=8;d[o+2]=6;d[o+3]=Math.min(90,-l*P.ripple*16)}}
  wctx.putImageData(wimg,0,0);ctx.imageSmoothingEnabled=true;
  ctx.drawImage(wc,-CELL*0.5,-CELL*0.5,GW*CELL,GH*CELL);}
const weed=[];for(let i=0;i<34;i++){const cx=rnd(0,W),cy=rnd(0,H);for(let j=0;j<1+Math.floor(Math.random()*3);j++)weed.push({x:cx+j*9,y:cy+rnd(-4,4),r:rnd(6.5,8.5),a:rnd(0,3.14),vx:rnd(-3,3),vy:rnd(-2,2)});}
function adiff(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
const FLOAT=14,SINK=3;const STATS={eaten:0,wasted:0};
const PORTIONS={pinch:{n:2,spread:6},small:{n:5,spread:14},medium:{n:10,spread:24},large:{n:22,spread:40}};
let portion='small';
function drop(ev){const r=cv.getBoundingClientRect();const x=(ev.clientX-r.left)/scale,y=(ev.clientY-r.top)/scale;
  const pr=PORTIONS[portion];lastTap={x,y,t:performance.now()/1000};
  for(let i=0;i<pr.n;i++){const a=rnd(0,6.283),d=Math.sqrt(Math.random())*pr.spread;food.push({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,t:rnd(0,0.3),r:rnd(2.2,3.1),vx:Math.cos(a)*rnd(4,14),vy:Math.sin(a)*rnd(4,14)})}
  disturb(x,y,14+pr.spread*0.4,-3.2);for(const p of food.slice(-pr.n))disturb(p.x,p.y,7,-1.1);}
let statEl=null,lastStat='';
function updateStats(){if(!statEl)statEl=document.getElementById('stats');const floating=food.filter(p=>p.t<=FLOAT).length;
  const hungry=fish.filter(f=>f.hunger>0.12).length;
  const s=`Eaten ${STATS.eaten} · Wasted ${STATS.wasted} · Hungry fish ${hungry}/${fish.length}`;if(s!==lastStat){statEl.textContent=s;lastStat=s}}
cv.addEventListener('pointerdown',drop);
const M=150;
const N={
 loving:{},
 gentle:{burst:0.7,rest:1.5,turn:0.6,twitch:0.4,wander:0.7,beatHz:0.8,delay:0.7,food:0.75,eye:0.7},
 shy:{burst:0.9,rest:1.2,space:1.7,avoid:1.8,align:0.4,regroup:0.3,twitch:1.3,delay:1.2,food:0.9,eye:1.3},
 curious:{wander:1.3,rest:0.8,eye:1.9,delay:0.1},
 playful:{rest:0.45,burst:1.1,beats:0.7,wander:1.6,twitch:1.4,eye:1.2},
 zippy:{burst:1.7,rest:0.35,turn:1.5,twitch:1.6,beatHz:1.25,food:1.4,eye:1.3},
 leader:{beats:1.7,wander:0.45,align:0,regroup:0,rest:0.9},
 feisty:{turn:1.25,burst:1.15,space:0.8,eye:1.2}
};

function Q(f,k){const m=N[f.nature]||{};return P[k]*(m[k]===undefined?1:m[k])}
let lastTap=null;
function natureBout(f,hx,hy){const n=f.nature,now=performance.now()/1000;
  if(n==='curious'){
    if(lastTap&&now-lastTap.t<5){const dd=Math.hypot(lastTap.x-hx,lastTap.y-hy);if(dd>60){startBout(f,Math.atan2(lastTap.x-hx,-(lastTap.y-hy)),Math.min(Q(f,'burst')*1.3,dd*1.4));return true}}
    if(Math.random()<0.3){let tx,ty;if(Math.random()<0.5){tx=Math.random()<0.5?rnd(M,M+120):rnd(W-M-120,W-M);ty=rnd(M,H-M)}else{tx=rnd(M,W-M);ty=Math.random()<0.5?rnd(M,M+100):rnd(H-M-100,H-M)}
      startBout(f,avoidWalls(f,Math.atan2(tx-f.x,-(ty-f.y)),380),Q(f,'burst')*rnd(0.8,1.2));return true}}
  if(n==='playful'){
    if(!(f.chaseT>0)&&Math.random()<0.2){const others=fish.filter(o=>o!==f);f.playT=others[Math.floor(Math.random()*others.length)];f.chaseT=rnd(1.2,2.4)}
    if(f.chaseT>0&&f.playT){const o=f.playT;startBout(f,avoidWalls(f,Math.atan2(o.x-f.x,-(o.y-f.y)),300),Q(f,'burst')*rnd(0.9,1.3));return true}
    f.zig=-(f.zig||1);startBout(f,avoidWalls(f,f.a+f.zig*rnd(0.5,1.1),380),Q(f,'burst')*rnd(0.7,1.2));return true}
  if(n==='shy'&&Math.random()<0.5){
    const tx=f.x<W/2?rnd(M,M+140):rnd(W-M-140,W-M),ty=f.y<H/2?rnd(M,M+140):rnd(H-M-140,H-M);
    startBout(f,avoidWalls(f,Math.atan2(tx-f.x,-(ty-f.y)),300),Q(f,'burst')*rnd(0.5,0.9));return true}
  if(n==='leader'){startBout(f,avoidWalls(f,f.a+rnd(-0.5,0.5),420),Q(f,'burst')*rnd(0.9,1.2));return true}
  return false}
function natureTick(f,hx,hy,dt,seeking){const n=f.nature;f.chaseT=Math.max(0,(f.chaseT||0)-dt);f.cd=Math.max(0,(f.cd||0)-dt);
  if(n==='shy'&&f.cd<=0&&f.state!=='turn'&&f.state!=='burst'){
    let tx=null,ty=null;
    for(const o of fish){if(o===f)continue;if(Math.hypot(o.x-f.x,o.y-f.y)<Q(f,'space')*0.42){tx=o.x;ty=o.y;break}}
    if(tx===null&&lastTap&&performance.now()/1000-lastTap.t<0.35&&Math.hypot(lastTap.x-f.x,lastTap.y-f.y)<280){tx=lastTap.x;ty=lastTap.y}
    if(tx!==null){startBout(f,avoidWalls(f,Math.atan2(f.x-tx,-(f.y-ty))+rnd(-0.4,0.4),300),Q(f,'burst')*1.7);f.beats=2;f.cd=1.3}}
  if(n==='feisty'&&f.cd<=0&&f.state!=='turn'&&f.state!=='burst'&&Math.random()<(seeking?dt*1.2:dt*0.22)){
    let tgt=null,bd=230;for(const o of fish){if(o===f)continue;const d=Math.hypot(o.x-f.x,o.y-f.y);if(d<bd){bd=d;tgt=o}}
    if(tgt){startBout(f,Math.atan2(tgt.x-f.x,-(tgt.y-f.y)),Math.min(Q(f,'burst')*1.6,120+bd*3));f.beats=2;f.chase=tgt;f.chaseT=0.9;f.cd=rnd(2.5,5)}}
  if(n==='feisty'&&f.chase&&f.chaseT>0){const o=f.chase;
    if(Math.hypot(o.x-hx,o.y-hy)<50&&o.state!=='burst'&&o.state!=='turn'){startBout(o,avoidWalls(o,Math.atan2(o.x-f.x,-(o.y-f.y))+rnd(-0.5,0.5),300),Q(o,'burst')*1.8);o.beats=2;f.chase=null;o.cd=Math.max(o.cd||0,1.2)}}
}

function schoolHeading(f){
  // alignment + cohesion with neighbours, the way a loose medaka school holds together
  let ax=0,ay=0,cx=0,cy=0,n=0,rx=0,ry=0;
  for(const o of fish){if(o===f)continue;const dx=o.x-f.x,dy=o.y-f.y,d=Math.hypot(dx,dy);
    if(d<320){ax+=Math.sin(o.a);ay+=-Math.cos(o.a);n++}
    if(d<Q(f,'space')&&d>0){rx-=dx/d*(1-d/Q(f,'space'))*Q(f,'avoid');ry-=dy/d*(1-d/Q(f,'space'))*Q(f,'avoid')}
    cx+=o.x;cy+=o.y}
  let h=f.a+rnd(-Q(f,'wander'),Q(f,'wander'))*(Math.random()<0.2?2.4:1);
  cx/=fish.length-1;cy/=fish.length-1;
  const dist=Math.hypot(cx-f.x,cy-f.y);
  if(n){const al=Math.atan2(ax,-ay);h=f.a+adiff(h,f.a)*(1-Q(f,'align'))+adiff(al,f.a)*Q(f,'align')}
  if(dist>Q(f,'regroupDist')){const co=Math.atan2(cx-f.x,-(cy-f.y));h=f.a+adiff(h,f.a)*(1-Q(f,'regroup'))+adiff(co,f.a)*Q(f,'regroup')}
  if(rx||ry){const away=Math.atan2(rx,-ry);const w=Math.min(0.8,Math.hypot(rx,ry));h=f.a+adiff(h,f.a)*(1-w)+adiff(away,f.a)*w}
  const L=fish.find(o=>o!==f&&o.nature==='leader');
  if(L&&f.nature!=='loner'){const d=Math.hypot(L.x-f.x,L.y-f.y);if(d<650){h=f.a+adiff(h,f.a)*0.75+adiff(L.a,f.a)*0.15;if(d>200)h=f.a+adiff(h,f.a)*0.8+adiff(Math.atan2(L.x-f.x,-(L.y-f.y)),f.a)*0.2}}
  return h;
}
function avoidWalls(f,h,look){
  const px=f.x+Math.sin(h)*look,py=f.y-Math.cos(h)*look;
  if(px<M||px>W-M||py<M||py>H-M){let nx=0,ny=0;if(px<M)nx=1;if(px>W-M)nx=-1;if(py<M)ny=1;if(py>H-M)ny=-1;
    const hx=Math.sin(h),hy=-Math.cos(h);const dot=hx*nx+hy*ny;let rx2=hx-2*dot*nx,ry2=hy-2*dot*ny;
    return Math.atan2(rx2,-ry2)+rnd(-0.6,0.6)}
  return h;
}
function startBout(f,des,speed){
  f.des=des;f.state='turn';f.turnT=0;f.vt=speed;f.beats=Math.max(1,Math.round(Q(f,'beats')+rnd(-1,1)));
}
function step(dt,t){
  for(const f of fish){
    const body=f.m.h-72;
    let dir=[Math.sin(f.a),-Math.cos(f.a)];
    const reach=0.3*body*P.size;
    let hx=f.x+dir[0]*reach,hy=f.y+dir[1]*reach;
    f.hunger=Math.min(1,f.hunger+dt/75);
    // nearest floating pellet, only if still hungry
    let best=null,bd=1e9;
    if(f.hunger>0.12)for(const p of food){if(p.t>FLOAT||p.t<((N[f.nature]||{}).delay||0))continue;if(f.nature==='shy'&&fish.some(o=>o!==f&&Math.hypot(o.x-p.x,o.y-p.y)<75))continue;const d=Math.hypot(p.x-hx,p.y-hy);if(d<bd){bd=d;best=p}}
    const eatR=26*P.size/0.5;
    if(best&&bd<eatR){food.splice(food.indexOf(best),1);disturb(best.x,best.y,9,-1.8);
      f.hunger=Math.max(0,f.hunger-0.14);STATS.eaten++;best=null;f.excite=1.2;
      if(f.state==='burst'){f.state='coast'};f.v*=0.35;f.timer=rnd(0.05,0.35)}
    const seeking=best&&bd<750;
    // eyes: quick independent saccades, lead into turns, lock onto food
    if(!f.eyes)f.eyes=[{gx:0,gy:0,tx:0,ty:0,t:rnd(0.2,1.5)},{gx:0,gy:0,tx:0,ty:0,t:rnd(0.2,1.5)}];
    {const mo=f.m.er*0.34;const ca=Math.cos(-f.a),sa=Math.sin(-f.a);
     let fx=0,fy=0,look=false;
     if(seeking){const dx=best.x-hx,dy=best.y-hy;fx=ca*dx-sa*dy;fy=sa*dx+ca*dy;const n=Math.hypot(fx,fy)||1;fx=fx/n*mo;fy=fy/n*mo;look=true}
     const turnLead=Math.max(-1,Math.min(1,f.av*0.12))*mo;
     for(let e=0;e<2;e++){const E=f.eyes[e],sg=e?1:-1;E.t-=dt;
       if(look){E.tx=fx*0.9+sg*mo*0.15;E.ty=fy*0.9}
       else if(E.t<=0){const r=Math.sqrt(Math.random())*mo,an=rnd(0,6.283);
         E.tx=sg*mo*0.3+Math.cos(an)*r*0.8;E.ty=-mo*0.15+Math.sin(an)*r*0.8;E.t=rnd(0.4,2.6)/((N[f.nature]||{}).eye||1);
         if(Math.random()<0.45){const O=f.eyes[1-e];O.tx=-sg*mo*0.3+Math.cos(an)*r*0.8;O.ty=E.ty;O.t=E.t+rnd(-0.1,0.1)}}
       let tx=E.tx+turnLead,ty=E.ty;const l=Math.hypot(tx,ty);if(l>mo){tx*=mo/l;ty*=mo/l}
       const k=Math.min(1,dt*28);E.gx+=(tx-E.gx)*k;E.gy+=(ty-E.gy)*k;}}

    f.excite=Math.max(0,(f.excite||0)-dt);
    if(seeking){
      // home in on the pellet while gliding, like a fish lining up a bite
      const want=Math.atan2(best.x-hx,-(best.y-hy));
      if(f.state!=='turn'){const err=adiff(want,f.a);f.av+=(Math.max(-6,Math.min(6,err*8))-f.av)*Math.min(1,dt*12)}
      // brake as the mouth closes in so it doesn't overshoot
      if(bd<90&&f.state!=='turn')f.v=Math.min(f.v,60+bd*2.2);
    }
    if(f.state==='hover'||f.state==='coast'){
      f.timer-=dt;
      if(f.state==='hover'&&!seeking&&Math.random()<dt*Q(f,'twitch'))f.av+=rnd(-2.2,2.2);
      if(seeking&&f.timer>0.12)f.timer=rnd(0.02,0.12);
      if(f.timer<=0&&(f.state==='hover'||f.v<(seeking?160:90))){
        if(seeking){
          const d=Math.atan2(best.x-hx,-(best.y-hy));
          // pick a burst that carries it just to the pellet: burst distance + glide distance ~ gap
          const beats=bd<90?1:2;const tb=beats/Q(f,'beatHz');
          const v=Math.max(70,Math.min(900,bd/(tb+1/Math.max(P.drag,0.5))*1.05*((N[f.nature]||{}).food||1)));
          startBout(f,d,v);f.beats=beats;
        }else{
          if(natureBout(f,hx,hy)){}else{
          let h=schoolHeading(f);h=avoidWalls(f,h,380);
          const calm=f.excite>0?0.6:1;
          startBout(f,h,Q(f,'burst')*rnd(0.65,1.35)*calm);}
        }
      }
    }
    if(f.state==='turn'){
      const err=adiff(f.des,f.a);f.turnT+=dt;
      const tav=Math.max(-Q(f,'turn'),Math.min(Q(f,'turn'),err*22));
      f.av+=(tav-f.av)*Math.min(1,dt*30);
      if(Math.abs(err)<0.12||f.turnT>0.22){f.state='burst';f.beatT=0}
    }else if(!seeking){
      f.av+=(0-f.av)*Math.min(1,dt*10);
    }
    f.a+=f.av*dt;dir=[Math.sin(f.a),-Math.cos(f.a)];
    const freq=f.state==='burst'?Q(f,'beatHz'):(f.state==='turn'?Q(f,'beatHz')*0.8:(f.state==='coast'?P.idleHz*1.3:P.idleHz));
    f.ph+=dt*2*Math.PI*freq;
    let tamp=0.05;
    if(f.state==='burst'){
      f.v+=Math.max(0,f.vt-f.v)*Math.min(1,dt*14);tamp=P.swing;
      f.beatT+=dt;if(f.beatT>f.beats/freq){f.state='coast';f.timer=seeking?rnd(0.03,0.15):rnd(Q(f,'rest')*0.2,Q(f,'rest')*1.8)}
    }else if(f.state==='turn'){tamp=0.22;f.v*=1-dt*2}
    else{
      f.v*=Math.exp(-dt*(seeking?Math.max(P.drag,3):P.drag));if(f.state==='coast'&&f.v<18)f.state='hover';
      tamp=f.state==='coast'?P.sway*1.4:P.sway}
    f.amp=(f.amp||0.05)+(tamp-(f.amp||0.05))*Math.min(1,dt*18);
    f.bend+=(Math.max(-0.9,Math.min(0.9,f.av*P.curl))-f.bend)*Math.min(1,dt*20);
    f.x+=dir[0]*f.v*dt;f.y+=dir[1]*f.v*dt;
    // personal space (relaxed while competing for food)
    const pb=Q(f,'space')*(seeking?0.2:0.42);
    for(const o of fish){if(o===f)continue;const dx=f.x-o.x,dy=f.y-o.y,d=Math.hypot(dx,dy);
      if(d<pb&&d>0){f.x+=dx/d*(pb-d)*dt*2.5;f.y+=dy/d*(pb-d)*dt*2.5}}
    if(f.x<30||f.x>W-30||f.y<30||f.y>H-30){f.v*=0.5}
    f.x=Math.max(30,Math.min(W-30,f.x));f.y=Math.max(30,Math.min(H-30,f.y));
  }
  // fish stir the surface: tail wash, bow wave and gentle fin flutter
  for(const f of fish){const body=(f.m.h-72)*P.size,dir=[Math.sin(f.a),-Math.cos(f.a)],per=[Math.cos(f.a),Math.sin(f.a)];
    const sw=Math.sin(f.ph-P.wave)*f.amp*body*0.5;
    const tx=f.x-dir[0]*0.72*body+per[0]*sw,ty=f.y-dir[1]*0.72*body+per[1]*sw;
    const push=(f.state==='burst'?1:0.25)*Math.min(1.6,f.amp*3)*dt*60;
    disturb(tx,ty,10,-0.32*push*Math.sin(f.ph));
    if(f.v>60)disturb(f.x+dir[0]*0.32*body,f.y+dir[1]*0.32*body,12,Math.min(0.7,f.v*0.0014)*dt*60);
    if(f.state==='hover'&&Math.random()<dt*3)disturb(f.x+per[0]*body*0.12*(Math.random()<0.5?-1:1),f.y+per[1]*body*0.12,6,rnd(-0.18,0.18));}
  if(Math.random()<dt*0.6)disturb(rnd(0,W),rnd(0,H),8,rnd(-0.25,0.25));
  wacc+=dt;let ns=0;if(P.ripple>0){while(wacc>1/30&&ns<2){waterStep();wacc-=1/30;ns++;wdirty=true}if(ns===2)wacc=0}
  for(const w of weed){const g=waterGrad(w.x,w.y);w.vx+=-g[0]*dt*40;w.vy+=-g[1]*dt*40;w.vx*=1-dt*0.4;w.vy*=1-dt*0.4;w.a+=g[0]*dt*0.5}
  // pellets float, drift a little, then sink out of reach (wasted food fouls the water)
  for(const p of food){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=0.98;p.vy*=0.98}
  for(let i=food.length-1;i>=0;i--)if(food[i].t>FLOAT+SINK){food.splice(i,1);STATS.wasted++}
  for(const r of rip)r.t+=dt;for(let i=rip.length-1;i>=0;i--)if(rip[i].t>1.6)rip.splice(i,1);
  for(const w of weed){w.x+=w.vx*dt;w.y+=w.vy*dt;if(w.x<-20)w.x=W+20;if(w.x>W+20)w.x=-20;if(w.y<-20)w.y=H+20;if(w.y>H+20)w.y=-20}
  updateStats();
}
// spine-based drawing: each slice is placed along a bent spine and rotated to its tangent
function drawEyes(f,T,K,ca,sa,px,py){const m=f.m,sy=T[0],sx=T[1],syy=T[2],a=T[3];
  const wx=px+(ca*sx-sa*syy)*P.size, wy=py+(sa*sx+ca*syy)*P.size;
  const th=f.a-a, c=Math.cos(th)*K*P.size, s2=Math.sin(th)*K*P.size;
  ctx.setTransform(c,s2,-s2,c,wx*K,wy*K);
  const iris=f.iris||(f.iris=document.getElementById('i-'+f.n));
  const lx0=-0.55,ly0=-0.75,lc=Math.cos(-th),ls=Math.sin(-th),lx=lc*lx0-ls*ly0,ly=ls*lx0+lc*ly0;
  for(let e=0;e<2;e++){const sg=e?1:-1,cx=sg*m.eyeX,cy=m.eyeY-sy,E=f.eyes[e],er=m.er;
    ctx.drawImage(iris,cx-m.ir,cy-m.ir);
    const qx=cx+E.gx,qy=cy+E.gy;
    ctx.fillStyle='rgba(2,3,4,0.5)';ctx.beginPath();ctx.arc(qx,qy,er*0.58,0,6.283);ctx.fill();
    ctx.fillStyle='#020304';ctx.beginPath();ctx.arc(qx,qy,er*0.5,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.ellipse(cx+lx*er*0.38,cy+ly*er*0.38,er*0.14,er*0.1,0,0,6.283);ctx.fill();}
}

function drawFish(f,img,ox,oy,stp){
  const m=f.m,body=m.h-72,piv=m.head+0.3*body,st=stp||5;
  const A=f.amp,ph=f.ph,bend=f.bend;
  const ang=u=>{ if(u<0.12){return -A*0.3*Math.sin(ph+0.4)-bend*0.45}
    const k=(u-0.12)/0.88; const env=P.flex+(1-P.flex)*Math.pow(k,1.25);
    let a=A*env*Math.sin(ph-k*P.wave)-A*0.3*Math.sin(ph+0.4)*(1-k)+bend*(k*1.1-0.45*(1-k));
    if(u>0.8){a+=A*P.finFlick*((u-0.8)/0.2)*Math.sin(ph-P.wave-1.0)} return a};
  const K=dpr*scale, ca=Math.cos(f.a), sa=Math.sin(f.a), px=f.x+ox, py=f.y+oy;
  const put=(sy,sx,syy,a)=>{
    const wx=px+(ca*sx-sa*syy)*P.size, wy=py+(sa*sx+ca*syy)*P.size;
    const th=f.a-a, c=Math.cos(th)*K*P.size, s2=Math.sin(th)*K*P.size;
    ctx.setTransform(c,s2,-s2,c,wx*K,wy*K);
    ctx.drawImage(img,0,sy,m.w,st,-m.w/2,0,m.w,st+0.35);
  };
  let x=0,y=0;
  for(let sy=piv;sy<m.h;sy+=st){const u=(sy-m.head)/body;const a=ang(u);put(sy,x,y,a);x+=Math.sin(a)*st;y+=Math.cos(a)*st;}
  x=0;y=0;
  let eyeT=null;
  for(let sy=piv-st;sy>=0;sy-=st){const u=Math.max(0,(sy-m.head)/body);const a=ang(u);x-=Math.sin(a)*st;y-=Math.cos(a)*st;put(sy,x,y,a);if(!eyeT&&sy<=m.eyeY)eyeT=[sy,x,y,a];}
  if(img===f.img&&eyeT&&f.eyes)drawEyes(f,eyeT,K,ca,sa,px,py);
  ctx.setTransform(K,0,0,K,0,0);
}
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;step(dt,now/1000);
  ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0);
  const bg=document.getElementById('bg');
  const bs=Math.max(W/1600,H/1000);ctx.drawImage(bg,(W-1600*bs)/2,(H-1000*bs)/2,1600*bs,1000*bs);
  // moving caustic light on the tub floor
  {const t=now/1000;const c1=document.getElementById('c1'),c2=document.getElementById('c2');
   if(!window._p1){window._p1=ctx.createPattern(c1,'repeat');window._p2=ctx.createPattern(c2,'repeat')}
   ctx.save();ctx.globalCompositeOperation='lighter';
   ctx.globalAlpha=0.055;_p1.setTransform(new DOMMatrix([1.4,0,0,1.4,t*9%717,t*5%717]));ctx.fillStyle=_p1;ctx.fillRect(0,0,W,H);
   ctx.restore();}
  // hornwort: submerged, behind the fish
  for(const q of hornPlot){const h=148*q.s,w=h*plants.hornwort.width/plants.hornwort.height,swx=Math.sin(now/900+q.ph)*5;ctx.drawImage(plants.hornwort,q.x-w/2+swx,q.y-h,w,h);}
  // food (below surface slightly, with shadow)
  for(const p of food){const a=p.t<FLOAT?1:Math.max(0,1-(p.t-FLOAT)/SINK)*0.6;ctx.globalAlpha=0.35*a;ctx.fillStyle='#000';ctx.beginPath();ctx.arc(p.x+5,p.y+7,p.r+1.5,0,7);ctx.fill();
    ctx.globalAlpha=a;const g=ctx.createRadialGradient(p.x-1,p.y-1,0.3,p.x,p.y,p.r);g.addColorStop(0,'#d9a766');g.addColorStop(1,'#7a4a1c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
  ctx.globalAlpha=1;
  for(const f of fish)drawFish(f,f.sh,16,24,16);
  for(const f of fish)drawFish(f,f.img,0,0,11);
  drawWater();
  if(typeof SHOWNAT!=='undefined'&&SHOWNAT){ctx.font='11px Silkscreen, ui-monospace, monospace';ctx.textAlign='center';
    for(const f of fish){const lbl=f.nature[0].toUpperCase()+f.nature.slice(1);const y=f.y+58*P.size/0.5;
      ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillText(lbl,f.x+1,y+1);ctx.fillStyle='rgba(234,244,244,0.85)';ctx.fillText(lbl,f.x,y)}}
  // duckweed on surface
  for(const w of weed){ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.a);
    ctx.globalAlpha=0.35;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(6,9,w.r,w.r*0.72,0,0,7);ctx.fill();ctx.globalAlpha=1;
    const g=ctx.createRadialGradient(-w.r*0.3,-w.r*0.3,1,0,0,w.r);g.addColorStop(0,'#9fdc5a');g.addColorStop(1,'#3f7a22');
     ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,w.r,w.r*0.72,0,0,7);ctx.fill();ctx.restore()}
  requestAnimationFrame(frame);
}

(function(){
  const out=document.getElementById('out'),panel=document.getElementById('panel'),btn=document.getElementById('tuneBtn');
  const fmt=v=>Math.abs(v)>=100?String(Math.round(v)):String(+v.toFixed(3));
  function sync(){const o={};for(const k in DEFAULTS)o[k]=+(+P[k]).toFixed(3);o.natures=Object.fromEntries(fish.map(f=>[f.n,f.nature]));out.value=JSON.stringify(o,null,1);}window.syncSettings=sync;
  for(const k in DEFAULTS){const el=document.getElementById('p-'+k),o=document.getElementById('o-'+k);
    el.addEventListener('input',()=>{P[k]=+el.value;o.textContent=fmt(P[k]);sync()});}
  function setAll(src){for(const k in DEFAULTS){P[k]=src[k];const el=document.getElementById('p-'+k);el.value=src[k];document.getElementById('o-'+k).textContent=fmt(src[k])}sync()}
  document.getElementById('resetBtn').onclick=()=>setAll(DEFAULTS);
  document.getElementById('copyBtn').onclick=async(e)=>{const b=e.currentTarget;out.select();let ok=false;
    try{await navigator.clipboard.writeText(out.value);ok=true}catch(_){try{ok=document.execCommand('copy')}catch(__){}}
    b.textContent=ok?'Copied':'Select the text above to copy';setTimeout(()=>b.textContent='Copy settings',1800)};
  const open=v=>{panel.hidden=!v;btn.hidden=v;btn.setAttribute('aria-expanded',String(v));if(v)document.getElementById('closeBtn').focus();else btn.focus()};
  btn.onclick=()=>open(true);document.getElementById('closeBtn').onclick=()=>open(false);
  sync();
})();

document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{portion=b.dataset.p;document.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-checked',String(x===b)))}));
let SHOWNAT=false;
document.getElementById('showNat').addEventListener('change',e=>{SHOWNAT=e.target.checked});
document.querySelectorAll('select[data-fish]').forEach(s=>s.addEventListener('change',()=>{const f=fish.find(x=>x.n===s.dataset.fish);if(f){f.nature=s.value;f.chase=null;f.playT=null}if(window.syncSettings)syncSettings()}));
if(window.syncSettings)syncSettings();
Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=r;i.onerror=r}))).then(()=>requestAnimationFrame(t=>{last=t;frame(t)}));
