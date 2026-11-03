/* Engine: layout, the dotted line, sound, story cards, the beacon. Content lives in story.js. */

/* ============================================================
   LAYOUT: stops alternate sides down a tall page
   ============================================================ */
const NS='http://www.w3.org/2000/svg';
const page=document.getElementById('page'), stage=document.getElementById('stage'), svg=document.getElementById('map');
const layer=document.getElementById('layer'), dashG=document.getElementById('dashes');
const card=document.getElementById('card'), hintEl=document.getElementById('hint'), dayEl=document.getElementById('day');
const el=(tag,attrs={},parent)=>{const n=document.createElementNS(NS,tag);for(const k in attrs)n.setAttribute(k,attrs[k]);if(parent)parent.appendChild(n);return n;};
let skipped=false;
const wait=ms=>new Promise(r=>setTimeout(()=>{ if(!skipped) r(); },ms));   /* after Skip to end, running sequences just stop */
/* The slow pacing is the film itself, so it ignores the system "reduce motion" setting. */
const reduced=false;
const dashes=[]; // {leg,s,node}
let legs=[];     // per stop index i: curve from stop i to i+1

function layout(){
  const w=page.clientWidth, vh=page.clientHeight, narrow=w<720;
  const xl=w*(narrow?.24:.2), xr=w*(narrow?.76:.8);
  const gap=Math.max(narrow?300:360, vh*.72);
  let y=Math.max(230, vh*.32);
  STOPS.forEach((s,i)=>{
    s.x=s.side==='left'?xl:xr; s.y=y;
    y+= (s.id==='lifeboats') ? gap*1.6 : s.dashesAfter ? gap*Math.max(.45,s.dashesAfter/10) : gap;   /* the drift gets extra room */
  });
  const h=STOPS[STOPS.length-1].y+vh*.6;
  stage.style.height=h+'px'; svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  legs=STOPS.slice(0,-1).map((a,i)=>{
    const b=STOPS[i+1], dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy);
    const bow=(i%2?1:-1)*Math.min(90,L*.12)*CURVE, nx=-dy/L, ny=dx/L;
    /* an S-shaped bend: a big swing one way, a smaller one back */
    const c1={x:a.x+dx/3+nx*bow, y:a.y+dy/3+ny*bow}, c2={x:a.x+dx*2/3-nx*bow*.55, y:a.y+dy*2/3-ny*bow*.55};
    const p0={x:a.x,y:a.y+84}, p1={x:b.x,y:b.y-72};  /* leave the label and icon clear */
    const pt=t=>{ const u=1-t, A=u*u*u, B=3*u*u*t, C=3*u*t*t, D=t*t*t;
      return {x:A*p0.x+B*c1.x+C*c2.x+D*p1.x, y:A*p0.y+B*c1.y+C*c2.y+D*p1.y}; };
    const lut=[0]; let prev=pt(0), tot=0;
    for(let k=1;k<=200;k++){const q=pt(k/200); tot+=Math.hypot(q.x-prev.x,q.y-prev.y); lut.push(tot); prev=q;}
    const at=s=>{ const target=s*tot; let k=lut.findIndex(v=>v>=target); if(k<=0) k=1;
      const t=((k-1)+(target-lut[k-1])/((lut[k]-lut[k-1])||1))/200, p=pt(t), q=pt(Math.min(1,t+.005));
      return {x:p.x,y:p.y,ang:Math.atan2(q.y-p.y,q.x-p.x)}; };
    return {at,len:tot};
  });
  STOPS.forEach(s=>s.g&&s.g.setAttribute('transform',`translate(${s.x} ${s.y})`));
  dashes.forEach(placeDash);
  placePlane();
  if(beaconG&&beaconAt) { const p=legs[beaconAt.leg].at(beaconAt.s); beaconG.setAttribute('transform',`translate(${p.x} ${p.y})`); }
}
function placeDash(d){
  const p=legs[d.leg].at(d.s);
  if(DASH_LEN>0){ const ux=Math.cos(p.ang)*DASH_LEN/2, uy=Math.sin(p.ang)*DASH_LEN/2;
    d.node.setAttribute('x1',p.x-ux); d.node.setAttribute('y1',p.y-uy); d.node.setAttribute('x2',p.x+ux); d.node.setAttribute('y2',p.y+uy); }
  else { d.node.setAttribute('cx',p.x); d.node.setAttribute('cy',p.y); d.node.setAttribute('r',2.6); }
}
function addDash(leg,s,cls=''){
  const node=el(DASH_LEN>0?'line':'circle',{class:'dash pop '+cls},dashG);
  const d={leg,s,node}; dashes.push(d); placeDash(d); return d;
}

/* Stops */
STOPS.forEach((s,i)=>{
  const g=el('g',{class:'stop',role:'button',tabindex:'-1','aria-label':s.label},layer);
  el('circle',{class:'ring',r:30},g); el('circle',{class:'ring r2',r:30},g);
  el('image',{href:s.art,x:-80,y:-64-(s.artLift||0),width:160,height:100},g);
  el('circle',{class:'hit',r:40},g);
  el('text',{class:'lbl',y:52},g).textContent=s.label;
  el('text',{class:'coord',y:68},g).textContent=s.coord;
  s.g=g;
  const go=()=>{ if(g.classList.contains('active')) openCard(i,true); else if(g.classList.contains('visited')) openCard(i,false); };
  g.addEventListener('click',e=>{e.stopPropagation();go();});
  g.addEventListener('keydown',e=>{if(openIdx>=0||mode==='beacon') return; if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();go();}});
});

/* Scrolling: follow the newest dash */
/* The page moves at the same pace as the dots: each new dash starts a steady
   glide that lasts exactly as long as the wait before the next dash. */
let followY=null, followRaf=null, camFrom=0, camTo=0, camT0=0, camMs=1;
function follow(y,ms=DASH_MS){
  const max=page.scrollHeight-page.clientHeight;
  if(followY==null) camTo=page.scrollTop;
  camFrom=page.scrollTop; camT0=performance.now(); camMs=reduced?1:ms;
  camTo=Math.max(camTo,Math.min(max,Math.max(0,y-page.clientHeight*.55)));  /* only ever moves down */
  followY=y; if(followRaf) return;
  const tick=now=>{ if(followY==null){followRaf=null;return;}
    const k=Math.min(1,(now-camT0)/camMs);
    page.scrollTop=camFrom+(camTo-camFrom)*k;
    followRaf=requestAnimationFrame(tick); };
  followRaf=requestAnimationFrame(tick); }
function stopFollow(){ followY=null; }
/* a slow, eased drift down the page (used between stops) */
function glideTo(y,frac=.5,ms=GLIDE_MS){
  const from=page.scrollTop, to=Math.max(0,Math.min(y-page.clientHeight*frac,page.scrollHeight-page.clientHeight));
  if(reduced||Math.abs(to-from)<2){ page.scrollTop=to; return Promise.resolve(); }
  return new Promise(res=>{ const t0=performance.now();
    const f=now=>{ const k=Math.min(1,(now-t0)/ms), e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
      page.scrollTop=from+(to-from)*e; if(k<1) requestAnimationFrame(f); else res(); };
    requestAnimationFrame(f); }); }
function scrollToY(y,frac=.42){ page.scrollTo({top:Math.max(0,y-page.clientHeight*frac),behavior:reduced?'auto':'smooth'}); }

/* ============================================================
   SOUND: quiet waves the whole time, only his voice when a card is open
   ============================================================ */
let soundOn=true, cardOpen=false, audioStarted=false, scene='calm';
const beds={calm:new Audio(SOUNDSCAPE_FILE), sea:new Audio(WAVES_FILE)}, bedLevel={calm:SOUNDSCAPE_LEVEL, sea:WAVES_LEVEL};
Object.values(beds).forEach(b=>{ b.loop=true; b.preload='auto'; b.volume=0; });
/* Ease every bed toward its target: the current scene at full level (ducked under a card), the rest silent. */
let fadeRaf=null;
function mix(){ if(fadeRaf) return;
  const tick=()=>{ let moving=false;
    for(const k in beds){ const bd=beds[k];
      const target=(audioStarted&&soundOn&&scene===k)?bedLevel[k]*(cardOpen?CARD_DUCK:1):0;
      let v=bd.volume+(target-bd.volume)*.02; if(Math.abs(target-v)<.003) v=target;
      bd.volume=Math.max(0,Math.min(1,v));
      if(target>0&&bd.paused) bd.play().catch(()=>{});
      if(v===0&&target===0&&!bd.paused) bd.pause();
      if(v!==target) moving=true; }
    fadeRaf=moving?requestAnimationFrame(tick):null; };
  fadeRaf=requestAnimationFrame(tick); }
function startAudio(){ if(audioStarted) return; audioStarted=true; mix(); }
function setScene(name){ scene=name; mix(); }   /* 'calm', 'sea', or 'drift' (no bed: only the sonar) */
/* Sonar ping, from sfx/sonar.mp3. vol scales SONAR_LEVEL; pings closer than half a second are skipped. */
let lastSonar=0;
function sonar(vol=1){ if(!soundOn||!audioStarted) return; const now=performance.now(); if(now-lastSonar<500) return; lastSonar=now;
  const s=new Audio(SONAR_FILE); s.volume=Math.max(0,Math.min(1,SONAR_LEVEL*vol)); s.play().catch(()=>{}); }
const sndBtn=document.getElementById('snd');
function toggleSound(){ soundOn=!soundOn; sndBtn.textContent=soundOn?'Sound on':'Sound off'; if(!soundOn){ STOPS.forEach(s=>s.player.pause()); stopExtras(); } mix(); }
sndBtn.addEventListener('click',toggleSound);
addEventListener('pointerdown',()=>startAudio(),{once:true});

function hint(t,blink=true){ hintEl.innerHTML=t; hintEl.classList.toggle('blink',blink); }

/* Recordings */
STOPS.forEach(s=>{ s.player=new Audio(); s.missing=false; s.player.preload='metadata';
  s.player.addEventListener('error',()=>{s.missing=true; if(openIdx===STOPS.indexOf(s)) renderVoice(s);});
  s.player.src=s.audio; });
function bars(seed){ let x=seed*9301+49297, out=''; for(let i=0;i<48;i++){ x=(x*9301+49297)%233280; const h=18+(x/233280)*70*Math.sin(i/48*Math.PI+.3); out+=`<i style="height:${Math.max(10,h).toFixed(0)}%"></i>`; } return out; }

/* ============================================================
   CARD
   ============================================================ */
let step=-1, mode='idle', openIdx=-1;
const PLAY_ICON='<path d="M3 1.5 L14 8 L3 14.5 Z"/>', PAUSE_ICON='<path d="M3 2 H6.5 V14 H3 Z M9.5 2 H13 V14 H9.5 Z"/>';
function renderVoice(s){
  const v=card.querySelector('.voice'); if(!v) return;
  v.querySelector('.play').disabled=s.missing;
  v.querySelector('.vnote').textContent=s.missing?`No recording yet. Drop an audio file on this card, or add ${s.audio}.`:'His voice';
}
function openCard(i,advancing){
  const s=STOPS[i]; openIdx=i; startAudio();
  STOPS.forEach(o=>o.player.pause()); stopExtras();
  const early=i<STOPS.findIndex(o=>o.id===REVEAL_AT);   /* before the landing: short source names only */
  const src=f=>f.s?`<cite>${early&&SOURCES[f.s][2]||SOURCES[f.s][0]}</cite>`:'';
  let d=0; const delay=()=>`style="animation-delay:${(d+=380)}ms"`;
  card.innerHTML=`
    <h2 class="place reveal">${s.label}</h2>
    <p class="meta reveal" ${delay()}>${[s.when,s.coord].filter(Boolean).join(' · ')}</p>
    <div class="voice reveal" ${delay()}>
      <button class="play" type="button" aria-label="Play recording"><svg viewBox="0 0 16 16"><path d="M3 1.5 L14 8 L3 14.5 Z"/></svg></button>
      <div class="vlabel">His voice${s.quote?`<em>“${s.quote}”</em>`:''}</div>
      <div class="wave">${bars(i+3)}</div>
      <p class="vnote"></p>
      ${s.transcript?`<button class="tbtn" type="button" aria-expanded="false">Read transcript</button>
      <div class="transcript" hidden>${s.transcript.map(t=>`<p>${t}</p>`).join('')}</div>`:''}
    </div>
    ${s.stamps?`<div class="stamps">${s.stamps.map(t=>`<p class="stamp reveal" ${delay()}>${t.t}</p>`).join('')}<cite class="reveal" ${delay()}>${SOURCES.interview[0]}</cite></div>`:''}
    <div class="clips">${s.facts.map((f,k)=>f.todo?`<p class="todo reveal" ${delay()}><b>To add:</b> ${f.todo}</p>`:f.img?`<blockquote class="clip has-img reveal" ${delay()} role="button" tabindex="0" data-k="${k}">${f.t}<span class="view">View the page</span>${src(f)}</blockquote>`:`<blockquote class="clip reveal" ${delay()}>${f.t}${src(f)}</blockquote>`).join('')}</div>
    ${s.video?`<div class="video reveal" ${delay()}>
      <div class="vframe"><button class="vplay" type="button"><svg viewBox="0 0 16 16">${PLAY_ICON}</svg><span>${s.video.title} · click to play</span></button></div>
      <cite>${SOURCES[s.video.s][0]} · <a href="${SOURCES[s.video.s][1]}" target="_blank" rel="noopener">Watch on CBC</a></cite>
    </div>`:''}
    ${s.more?`<div class="extras">
      <h3 class="xhead reveal" ${delay()}>More from him</h3>
      ${s.more.map(m=>`<div class="extra reveal" ${delay()}>
        <button class="play sm" type="button" aria-label="Play: ${m.title}"><svg viewBox="0 0 16 16">${PLAY_ICON}</svg></button>
        <p class="etitle">${m.title}</p>
        <i class="ebar"><b></b></i>
      </div>`).join('')}
      <cite class="reveal" ${delay()}>${SOURCES.interview[0]}</cite>
    </div>`:''}
    ${advancing?`<button class="next reveal" ${delay()} type="button" id="cont">Continue →</button>`:`<button class="next close" type="button" id="cont">Close</button>`}`;
  card.scrollTop=0;
  card.classList.toggle('left',s.side==='right');
  card.classList.add('open'); card.dataset.adv=advancing?'1':'';
  cardOpen=true; mix();
  renderVoice(s);
  const play=card.querySelector('.play'), waveBars=[...card.querySelectorAll('.wave i')];
  const icon=on=>play.querySelector('svg').innerHTML=on?PAUSE_ICON:PLAY_ICON;
  play.addEventListener('click',()=>{ if(s.player.paused){stopExtras(); s.player.play().then(()=>icon(true)).catch(()=>{});} else {s.player.pause();icon(false);} });
  s.player.ontimeupdate=()=>{ const p=s.player.duration?s.player.currentTime/s.player.duration:0; waveBars.forEach((b,k)=>b.classList.toggle('p',k/waveBars.length<p)); };
  s.player.onended=s.player.onpause=()=>icon(false);
  s.player.playbackRate=s.rate||1; s.player.preservesPitch=true;   /* a touch faster for the longest clips, same pitch */
  if(soundOn&&!s.missing){ s.player.currentTime=0; s.player.play().then(()=>icon(true)).catch(()=>{}); }
  card.querySelector('#cont').addEventListener('click',()=>closeCard(advancing));
  wireExtras(s);
  const tb=card.querySelector('.tbtn');   /* transcript stays hidden until asked for */
  if(tb) tb.addEventListener('click',()=>{ const box=card.querySelector('.transcript'), open=box.hidden; box.hidden=!open;
    tb.textContent=open?'Hide transcript':'Read transcript'; tb.setAttribute('aria-expanded',open); });
  card.querySelectorAll('.clip.has-img').forEach(c=>{ const f=s.facts[+c.dataset.k], go=()=>showPhoto(f.img.src,f.img.caption,f.s);
    c.addEventListener('click',go); c.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); e.stopPropagation(); go(); } }); });
  const vp=card.querySelector('.vplay');   /* the video only loads when clicked */
  if(vp) vp.addEventListener('click',()=>{ s.player.pause(); stopExtras();
    vp.replaceWith(el2('iframe',{src:s.video.embed,title:s.video.title,allow:'autoplay; fullscreen; encrypted-media',allowfullscreen:''})); });
  if(s.popup) setTimeout(()=>{ if(openIdx===i) showPhoto(s.popup.src,s.popup.caption,s.popup.s,s.popup.cw); },900);
  hint('',false);
  if(advancing){ s.g.classList.remove('active'); s.g.classList.add('visited'); }
  scrollToY(s.y, innerWidth<=720?.2:.42);
}
/* Photo pop-up, centred over the map */
const lightbox=document.getElementById('lightbox');
const el2=(tag,attrs)=>{ const n=document.createElement(tag); for(const k in attrs) n.setAttribute(k,attrs[k]); return n; };
function showPhoto(src,caption,s,cw){
  lightbox.querySelector('img').src=src; lightbox.querySelector('img').alt=caption;
  const fig=lightbox.querySelector('figure'), cwb=lightbox.querySelector('.lb-cw');   /* content warning: blurred until the viewer chooses to see it */
  fig.classList.toggle('cw',!!cw); cwb.hidden=!cw; if(cw) cwb.innerHTML=`<b>Content warning</b>${cw}<span>Click to view the photo</span>`;
  lightbox.querySelector('figcaption').innerHTML=caption+[].concat(s||[]).map(k=>`<cite>${SOURCES[k][0]}</cite>`).join('');   /* one source or several */
  lightbox.hidden=false; (cw?cwb:lightbox.querySelector('.lb-x')).focus(); }
lightbox.querySelector('.lb-cw').addEventListener('click',e=>{ e.stopPropagation(); lightbox.querySelector('figure').classList.remove('cw'); e.currentTarget.hidden=true; lightbox.querySelector('.lb-x').focus(); });
function closePhoto(){ lightbox.hidden=true; }
lightbox.addEventListener('click',e=>{ if(e.target===lightbox||e.target.closest('.lb-x')) closePhoto(); });

/* Extra clips from the interview, listed under the clippings. One plays at a time. */
let extraPlayers=[];
function stopExtras(){ extraPlayers.forEach(p=>p.pause()); }
function wireExtras(s){
  extraPlayers=(s.more||[]).map(m=>{ if(!m.player){ m.player=new Audio(m.audio); m.player.preload='none'; } return m.player; });
  [...card.querySelectorAll('.extra')].forEach((row,k)=>{
    const p=extraPlayers[k], btn=row.querySelector('.play'), bar=row.querySelector('.ebar b');
    const icon=on=>btn.querySelector('svg').innerHTML=on?PAUSE_ICON:PLAY_ICON;
    p.ontimeupdate=()=>{ bar.style.width=(p.duration?p.currentTime/p.duration*100:0)+'%'; };
    p.onpause=p.onended=()=>icon(false);
    btn.addEventListener('click',()=>{ if(p.paused){ stopExtras(); s.player.pause(); p.play().then(()=>icon(true)).catch(()=>{}); } else p.pause(); });
  });
}
function closeCard(advancing){
  if(openIdx<0) return;
  STOPS[openIdx].player.pause(); stopExtras(); closePhoto();
  card.classList.remove('open'); openIdx=-1;
  cardOpen=false; mix();
  if(advancing) next();
}
card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('drop');});
card.addEventListener('dragleave',()=>card.classList.remove('drop'));
card.addEventListener('drop',e=>{ e.preventDefault(); card.classList.remove('drop'); const f=[...e.dataTransfer.files].find(f=>f.type.startsWith('audio')); if(!f||openIdx<0) return; const s=STOPS[openIdx]; s.missing=false; s.player.src=URL.createObjectURL(f); renderVoice(s); if(soundOn) s.player.play().catch(()=>{}); });

/* ============================================================
   SEQUENCE
   ============================================================ */
function next(){ if(skipped) return; step++; const it=SEQ[step]; if(!it) return;
  if(it.type==='stop') showStop(it.i);
  else if(it.type==='line') drawLine(it.from);
  else if(it.type==='drift') drift();
  else if(it.type==='end') ending();
}
function showStop(i){
  const s=STOPS[i]; mode='stop';
  if(s.bed) setScene(s.bed);
  s.g.classList.add('shown','active'); s.g.setAttribute('tabindex','0');
  hint(s.cta);
}
function dashCount(leg){ if(STOPS[leg].dashesAfter) return STOPS[leg].dashesAfter+1;
  return Math.max(DASHES_PER_LEG, Math.round(legs[leg].len/ (Math.max(page.clientHeight,600)*.07))); }
async function drawLine(from,startFrac=0,endFrac=1){
  mode='line'; hint('',false);
  const n=dashCount(from);
  for(let k=1;k<n;k++){
    const s=k/n; if(s<=startFrac||s>endFrac) continue;
    addDash(from,s);
    if(from===0&&s>=.5&&!planeG) showPlane();
    follow(legs[from].at(s).y);
    await wait(reduced?30:DASH_MS);
  }
  await wait(reduced?30:DASH_MS);
  stopFollow();
  await glideTo(STOPS[from+1].y,.5);
  await wait(400);
  next();
}

/* Drawings that pop in beside the line: decoration only, not clickable */
const decor=[];
function showDecor(src,leg,s,w,h){ const g=el('g',{class:'plane','aria-hidden':'true'},layer);
  el('image',{href:src,x:-w/2,y:-h/2,width:w,height:h,class:'pop'},g); const d={g,leg,s}; decor.push(d); placeDecor(d); return d; }
function placeDecor(d){ if(!legs[d.leg]) return; const p=legs[d.leg].at(d.s), side=STOPS[d.leg].x<STOPS[d.leg+1].x?-1:1;
  d.g.setAttribute('transform',`translate(${p.x+side*110} ${p.y-30})`); }
/* the plane: halfway between Sri Lanka and Germany */
let planeG=null;
function showPlane(){ planeG=showDecor(PLANE_ART,0,.5,150,68); }
function placePlane(){ decor.forEach(placeDecor); }
/* the fishing boat: halfway between the beacon and St. Shott's */
let fishG=null;
function showFishboat(from){ fishG=showDecor(FISHBOAT_ART,3,(from+1)/2,200,96); }

/* Climax: the line falters and stops; only the beacon is left */
let strength=0, effort=0, holding=false, beaconG=null, beaconAt=null;
const NEED=1.7;
async function drift(){
  mode='drift'; hint('',false); startAudio();   /* waves keep going under the sonar through days 1-4 */
  const leg=3, n=dashCount(leg), stopAt=Math.round(n*.55), made=[];
  dayEl.classList.add('show'); let lastPing=-1e9;
  for(let k=1;k<=stopAt;k++){
    const d=addDash(leg,k/n,'ghost'); made.push(d);
    if(performance.now()-lastPing>=10000){ sonar(Math.max(.25,1-k/stopAt*.75)); lastPing=performance.now(); }   /* once every 10 s, fading with the line */
    d.node.style.opacity=Math.max(.15,1-k/stopAt*.85);
    const ms=DASH_MS*(1.5+k*.15);                 /* slowing down */
    follow(legs[leg].at(k/n).y,ms);
    const day=Math.min(4,1+Math.floor((k-1)/stopAt*4)), dayB=dayEl.querySelector('b');   /* three days in his account; a faint fourth */
    dayB.textContent='DAY '+day; dayB.style.opacity=day===4?.45:1;
    await wait(reduced?30:ms);
  }
  await wait(reduced?30:2400);
  stopFollow();
  document.body.classList.add('lost'); setScene('drift');   /* waves fade out: only the yellow dot and its sonar */
  made.forEach(d=>d.node.style.opacity=.08);
  await wait(reduced?30:2400);
  beaconAt={leg,s:stopAt/n};
  const p=legs[leg].at(beaconAt.s);
  beaconG=el('g',{class:'beacon',transform:`translate(${p.x} ${p.y})`},layer);
  el('circle',{class:'halo',r:40},beaconG); el('circle',{class:'bring',r:12},beaconG); el('circle',{class:'bring b2',r:12},beaconG); el('circle',{class:'core',r:5},beaconG);
  scrollToY(p.y,.5); page.classList.add('locked');
  strength=.45; effort=0; mode='beacon'; if(document.activeElement&&document.activeElement.blur) document.activeElement.blur();
  hint('Signal fading. Click, hold Space, or scroll to keep it alive<div class="meter" id="meter">'+'<i></i>'.repeat(10)+'</div>',false);
  sonar(.8);
  beaconLoop(made,n,stopAt);
}
function boost(amount){ if(mode!=='beacon') return; strength=Math.min(1,strength+amount); effort+=amount; }
function beaconLoop(made,n,stopAt){
  let prev=performance.now(), lastPing=0, nextPing=prev+2600;
  const tick=now=>{
    if(mode!=='beacon') return;
    const dt=(now-prev)/1000; prev=now;
    if(holding){ boost(.32*dt); if(now-lastPing>900){sonar(.3+strength*.4);lastPing=now;} }
    if(now>=nextPing){ sonar(.2+strength*.8); nextPing=now+2600; }   /* fades as the signal dies */
    strength=Math.max(.06,strength-.045*dt);
    beaconG.querySelector('.core').setAttribute('opacity',.35+strength*.65);
    beaconG.querySelector('.halo').setAttribute('opacity',strength);
    beaconG.querySelectorAll('.bring').forEach(r=>r.style.opacity=strength);
    const m=document.getElementById('meter'); if(m) [...m.children].forEach((b,k)=>b.classList.toggle('on',k<Math.round(strength*10)));
    if(effort>=NEED){ rescue(made,n,stopAt); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
page.addEventListener('click',()=>{ if(mode==='beacon'){ boost(.1); sonar(.3+strength*.5); } });
page.addEventListener('wheel',e=>{ if(mode==='beacon'){ boost(Math.min(.06,Math.abs(e.deltaY)*.0006)); } },{passive:true});

async function rescue(made,n,stopAt){
  mode='rescue'; hint('',false); page.classList.remove('locked');
  setScene('calm');
  const t=beaconG.getAttribute('transform');
  const sw=el('circle',{class:'sweep',r:2,transform:t},layer), t0=performance.now();
  await new Promise(res=>{ const f=now=>{ const k=Math.min(1,(now-t0)/1800); sw.setAttribute('r',4+k*160); sw.setAttribute('opacity',.6*(1-k)); if(k<1) requestAnimationFrame(f); else {sw.remove();res();} }; requestAnimationFrame(f); });
  document.body.classList.remove('lost');
  made.forEach(d=>{ d.node.classList.remove('ghost'); d.node.style.opacity=1; });
  beaconG.style.transition='opacity 2s'; beaconG.style.opacity=0;
  dayEl.querySelector('b').textContent='AUG 11, 1986'; dayEl.querySelector('b').style.opacity=1;
  dayEl.querySelector('span').textContent='Near St. Shott\'s, Newfoundland';
  /* the line comes back and carries on to the flag */
  for(let k=stopAt+1;k<n;k++){ addDash(3,k/n); if(!fishG&&k/n>=(stopAt/n+1)/2) showFishboat(stopAt/n); follow(legs[3].at(k/n).y); await wait(reduced?30:DASH_MS); }
  await wait(reduced?30:DASH_MS); stopFollow();
  setTimeout(()=>dayEl.classList.remove('show'),1800);
  await glideTo(STOPS[4].y,.5);
  await wait(400);
  next();
}

/* Skip to end: the whole line, every stop open to revisit, then the ending */
const skipBtn=document.getElementById('skipBtn');
function skipToEnd(){
  if(skipped) return; skipped=true; skipBtn.hidden=true;
  if(openIdx>=0) closeCard(false); closePhoto();
  mode='free'; holding=false; stopFollow(); hint('',false);
  document.body.classList.remove('lost'); page.classList.remove('locked'); dayEl.classList.remove('show');
  if(beaconG){ beaconG.remove(); beaconG=null; beaconAt=null; }
  dashes.splice(0).forEach(d=>d.node.remove());
  legs.forEach((_,leg)=>{ const n=dashCount(leg); for(let k=1;k<n;k++) addDash(leg,k/n); });
  if(!planeG) showPlane();
  if(!fishG) showFishboat(Math.round(dashCount(3)*.55)/dashCount(3));
  STOPS.forEach(s=>{ s.g.classList.remove('active'); s.g.classList.add('shown','visited'); s.g.setAttribute('tabindex','0'); });
  startAudio(); setScene('calm');
  page.scrollTo({top:0}); document.getElementById('end').hidden=false; document.getElementById('explore').focus();
}
skipBtn.addEventListener('click',skipToEnd);
document.getElementById('explore').addEventListener('click',()=>{ document.getElementById('end').hidden=true; });

function ending(){
  mode='end'; skipBtn.hidden=true;
  page.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
  setTimeout(()=>{ document.getElementById('end').hidden=false; document.getElementById('replay').focus(); },reduced?0:2600);
}

/* Lists and buttons */
document.getElementById('srcList').innerHTML=Object.values(SOURCES).map(([t,u])=>`<li class="src">${u?`<a href="${u}" target="_blank" rel="noopener">${t}</a>`:t}</li>`).join('');
document.getElementById('replay').addEventListener('click',()=>location.reload());

addEventListener('keydown',e=>{
  if(!intro.hidden){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); begin(); } return; }
  if(!lightbox.hidden&&e.key==='Enter'&&e.target.closest&&e.target.closest('.lb-cw')) return;   /* Enter on the warning reveals the photo */
  if(!lightbox.hidden&&(e.key==='Escape'||e.key==='Enter')){ e.preventDefault(); closePhoto(); return; }
  if(mode==='beacon'&&(e.key===' '||e.code==='Space')){ e.preventDefault(); e.stopPropagation(); holding=true; return; }   /* hold Space: keep the signal alive */
  if(e.target.closest&&e.target.closest('button,[role=button]')&&(e.key==='Enter'||e.key===' ')) return;
  if((e.key==='Enter'||e.key==='ArrowRight')&&openIdx>=0){ e.preventDefault(); closeCard(card.dataset.adv==='1'); return; }
  if((e.key==='Enter'||e.key==='ArrowRight')&&mode==='stop'&&openIdx<0){ const it=SEQ[step]; if(it&&it.type==='stop'){ e.preventDefault(); openCard(it.i,true); } return; }
  if(e.key==='Escape'){ document.getElementById('end').hidden=true; if(openIdx>=0&&card.dataset.adv!=='1') closeCard(false); }
  if(e.key==='h'||e.key==='H') document.body.classList.toggle('rec');
  if(e.key==='m'||e.key==='M') toggleSound();
  if(e.key==='r'||e.key==='R') location.reload();
},true);
addEventListener('keyup',e=>{ if(e.key===' '||e.code==='Space') holding=false; },true);
addEventListener('blur',()=>{ holding=false; });   /* switching windows mid-hold doesn't leave it stuck on */
addEventListener('resize',layout);

/* Intro: a short synopsis; the story starts on Begin */
const intro=document.getElementById('intro');
function begin(){ if(intro.hidden) return; intro.hidden=true; startAudio(); next(); }
document.getElementById('begin').addEventListener('click',begin);
layout(); document.getElementById('begin').focus();
