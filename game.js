const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const wrap = document.getElementById('wrap');
const LOGICAL_W = 960, LOGICAL_H = 560;
const TS = 40, ROWS = 14;

const GRAVITY = 0.24, MAX_FALL = 11, MOVE_ACC = 0.30, MOVE_MAX = 2.8, FRICTION = 0.85,
      JUMP_V = -8.8, JUMP_CUT = 0.45, BOUNCE_V = -5.8;

const PAL = {
  skyTop:'#02071a', skyBot:'#0c173b', grid:'rgba(79,212,255,0.07)',
  ground:'#080810', groundEdge:'#4fd4ff', brick:'#0e0e1a', brickEdge:'#7a5cff',
  coin:'#d4ff4f', enemy:'#ff4fd4', enemyCore:'#ffb3f2', enemyDark:'#7a1568',
  plantHead:'#39ff9d', plantMouth:'#ff3366', plantAlert:'#ffbb00',
  spike:'#ff2a2a', spikeGlow:'#ff5c5c', laser:'#00ffff', flag:'#39ff9d',
  text:'#4fd4ff', textDim:'#7d8bb0', accent:'#ff8c42',
  p1body:'#4fd4ff', p1accent:'#ff8c42', p2body:'#c084ff', p2accent:'#39ff9d'
};

function seg(a,b){return [a,b];}

const LEVELS = [
  { width: 100,
    groundSegments: [seg(0,30), seg(33,65), seg(68,96)],
    platforms: [ {x:4,y:10,w:3}, {x:9,y:8,w:3}, {x:16,y:10,w:3}, {x:23,y:8,w:3},
                 {x:36,y:10,w:3}, {x:43,y:8,w:3}, {x:51,y:10,w:3}, {x:60,y:8,w:3},
                 {x:72,y:10,w:3}, {x:80,y:8,w:3} ],
    coins: [ [4,9], [9,7], [16,9], [23,7], [36,9], [43,7], [51,9], [60,7], [72,9], [80,7] ],
    enemies: [ {x:12,y:13,range:4}, {x:40,y:13,range:5}, {x:75,y:13,range:4} ],
    plants: [ {x:16,y:9}, {x:51,y:9} ],
    lasers: [ {x:48, y:4, h:9, period:110, offset:0} ],
    spikes: [ [29,13], [66,13] ],
    boosts: [ {x:9, y:7, type:'jetpack'}, {x:43, y:7, type:'invisible'} ],
    mushroom: [23,8],
    flagX: 95 },
  { width: 110,
    groundSegments: [seg(0,25), seg(28,55), seg(58,85), seg(88,106)],
    platforms: [ {x:4,y:10,w:3}, {x:10,y:8,w:3}, {x:18,y:10,w:3}, {x:32,y:9,w:3},
                 {x:39,y:7,w:3}, {x:48,y:10,w:3}, {x:62,y:8,w:3}, {x:70,y:10,w:3}, {x:92,y:8,w:3} ],
    coins: [ [4,9], [10,7], [18,9], [32,8], [39,6], [48,9], [62,7], [70,9], [92,7] ],
    enemies: [ {x:8,y:13,range:3}, {x:35,y:13,range:4}, {x:75,y:13,range:5} ],
    plants: [ {x:18,y:9}, {x:48,y:9}, {x:70,y:9} ],
    lasers: [ {x:22, y:3, h:10, period:90, offset:20}, {x:78, y:4, h:9, period:90, offset:10} ],
    spikes: [ [26,13], [56,13], [86,13] ],
    boosts: [ {x:18, y:9, type:'invisible'}, {x:62, y:7, type:'jetpack'} ],
    mushroom: [39,7],
    flagX: 104 },
  { width: 120,
    groundSegments: [seg(0,28), seg(31,60), seg(63,92), seg(95,116)],
    platforms: [ {x:5,y:9,w:3}, {x:12,y:7,w:3}, {x:22,y:10,w:3}, {x:35,y:8,w:3},
                 {x:43,y:6,w:3}, {x:54,y:9,w:3}, {x:68,y:7,w:3}, {x:80,y:10,w:3}, {x:102,y:8,w:3} ],
    coins: [ [5,8], [12,6], [22,9], [35,7], [43,5], [54,8], [68,6], [80,9], [102,7] ],
    enemies: [ {x:10,y:13,range:4}, {x:38,y:13,range:4}, {x:70,y:13,range:5}, {x:100,y:13,range:4} ],
    plants: [ {x:22,y:9}, {x:54,y:8}, {x:80,y:9} ],
    lasers: [ {x:50, y:3, h:10, period:80, offset:0}, {x:85, y:3, h:10, period:75, offset:15} ],
    spikes: [ [29,13], [61,13], [93,13] ],
    boosts: [ {x:35, y:7, type:'jetpack'}, {x:68, y:6, type:'invisible'} ],
    mushroom: [43,6],
    flagX: 112 },
  { width: 132,
    groundSegments: [seg(0,22), seg(25,48), seg(51,74), seg(77,100), seg(103,128)],
    platforms: [ {x:5,y:9,w:3}, {x:13,y:6,w:3}, {x:20,y:9,w:2}, {x:29,y:10,w:3},
                 {x:36,y:7,w:3}, {x:44,y:5,w:3}, {x:56,y:9,w:3}, {x:64,y:6,w:3},
                 {x:82,y:10,w:2}, {x:88,y:7,w:3}, {x:96,y:9,w:2}, {x:110,y:8,w:3}, {x:118,y:6,w:3} ],
    coins: [ [5,8],[13,5],[20,8],[29,9],[36,6],[44,4],[56,8],[64,5],[82,9],[88,6],[96,8],[110,7],[118,5] ],
    enemies: [ {x:9,y:13,range:3}, {x:33,y:13,range:4}, {x:60,y:13,range:5}, {x:92,y:13,range:4}, {x:115,y:13,range:4} ],
    plants: [ {x:20,y:9}, {x:56,y:9}, {x:96,y:9} ],
    lasers: [ {x:26, y:3, h:10, period:70, offset:0}, {x:52, y:3, h:11, period:65, offset:25}, {x:104, y:3, h:10, period:70, offset:12} ],
    spikes: [ [23,13], [49,13], [75,13], [101,13] ],
    boosts: [ {x:13, y:5, type:'jetpack'}, {x:44, y:4, type:'invisible'}, {x:88, y:6, type:'magnet'} ],
    mushroom: [64,6],
    flagX: 124 },
  { width: 148,
    groundSegments: [seg(0,20), seg(23,42), seg(45,64), seg(67,88), seg(91,112), seg(115,144)],
    platforms: [ {x:4,y:9,w:2}, {x:10,y:6,w:2}, {x:16,y:9,w:2}, {x:26,y:10,w:3}, {x:33,y:7,w:2},
                 {x:39,y:5,w:2}, {x:48,y:9,w:2}, {x:54,y:6,w:2}, {x:60,y:9,w:2}, {x:70,y:10,w:2},
                 {x:76,y:7,w:2}, {x:82,y:5,w:2}, {x:94,y:9,w:3}, {x:102,y:6,w:2}, {x:118,y:8,w:2}, {x:126,y:5,w:3}, {x:134,y:9,w:2} ],
    coins: [ [4,8],[10,5],[16,8],[26,9],[33,6],[39,4],[48,8],[54,5],[60,8],[70,9],[76,6],[82,4],[94,8],[102,5],[118,7],[126,4],[134,8] ],
    enemies: [ {x:8,y:13,range:3}, {x:29,y:13,range:3}, {x:51,y:13,range:4}, {x:73,y:13,range:4}, {x:97,y:13,range:5}, {x:120,y:13,range:4}, {x:138,y:13,range:3} ],
    plants: [ {x:16,y:9}, {x:60,y:9}, {x:94,y:9}, {x:126,y:5} ],
    lasers: [ {x:21, y:2, h:11, period:60, offset:0}, {x:43, y:2, h:11, period:60, offset:20}, {x:65, y:2, h:11, period:55, offset:10}, {x:89, y:2, h:11, period:60, offset:30}, {x:113, y:2, h:11, period:55, offset:5} ],
    spikes: [ [21,13], [43,13], [65,13], [89,13], [113,13] ],
    boosts: [ {x:33, y:7, type:'magnet'}, {x:76, y:7, type:'jetpack'}, {x:102, y:6, type:'invisible'} ],
    mushroom: [54,6],
    flagX: 140 }
];

let state = 'menu', paused = false, menuIndex = 0;
const MENU_ITEMS = ['1 PLAYER', '2 PLAYER', 'LEVEL SELECT', 'SETTINGS', 'LEADERBOARD'];
let settingsIndex = 0, levelSelectIndex = 0;
let menuHitboxes = [], settingsHitboxes = [], levelSelectHitboxes = [];
let gameMode = 'sp', levelIdx = 0, score = 0, lives = 3, time = 0;
let solid, hazards, coins, enemies, plants, lasers, boosts, mushroom, cameraX = 0, targetCameraX = 0, flagPxX, levelPxW;
let particles = [], players = [];

let viewMode = '2d';
let cam3D = { facing: 1, turnFlash: 0, turnSwing: 0, landDip: 0, prevGround: true };

let xp = Number(localStorage.getItem('byte_runner_xp')) || 0;
let playerLevel = Math.floor(Math.sqrt(xp / 100)) + 1;
let hitStopFrames = 0;

// --- New: combo, shake toggle, leaderboard ---
let comboCount = 0, comboTimer = 0;
let shakeEnabled = true, shakeX = 0, shakeY = 0, shakeMag = 0;
function addShakeReal(v){ if(shakeEnabled) shakeMag = Math.min(14, shakeMag + v); }

const LB_KEY = 'byte_runner_leaderboard';
function loadLeaderboard(){
  try{ return JSON.parse(localStorage.getItem(LB_KEY)) || []; }catch(e){ return []; }
}
function saveScoreToLeaderboard(finalScore, lvl, mode){
  const board = loadLeaderboard();
  board.push({ score: finalScore, level: lvl+1, mode, date: new Date().toLocaleDateString() });
  board.sort((a,b)=>b.score-a.score);
  const trimmed = board.slice(0,5);
  localStorage.setItem(LB_KEY, JSON.stringify(trimmed));
  return trimmed;
}

function getSystemRank(lvl) {
    if (lvl < 5) return 'E-RANK';
    if (lvl < 15) return 'D-RANK';
    if (lvl < 30) return 'C-RANK';
    if (lvl < 50) return 'B-RANK';
    if (lvl < 80) return 'A-RANK';
    return 'S-RANK';
}

function gainXP(amount, x, y) {
    xp += amount;
    localStorage.setItem('byte_runner_xp', xp);
    let newLvl = Math.floor(Math.sqrt(xp / 100)) + 1;
    if (newLvl > playerLevel) {
        playerLevel = newLvl;
        addParticle(x, y - 25, 'LEVEL UP!', '#39ff9d');
        sfx.power();
    }
}

const keys = {};

function toggleViewMode(){
  viewMode = viewMode === '2d' ? '3d' : '2d';
  document.getElementById('viewBtn').textContent = viewMode === '2d' ? '3D' : '2D';
  sfx.select();
}
document.getElementById('viewBtn').addEventListener('click', toggleViewMode);

const COYOTE_FRAMES = 7, JUMP_BUFFER_FRAMES = 7;

function triggerJump(p){
  if(p.onGround || p.coyoteTimer > 0){
    p.vy = JUMP_V;
    p.onGround = false;
    p.coyoteTimer = 0;
    p.canDoubleJump = true;
    p.jumpBuffer = 0;
    sfx.jump();
  } else if(p.canDoubleJump && p.jetpackTimer <= 0){
    p.vy = JUMP_V * 0.92;
    p.canDoubleJump = false;
    p.jumpBuffer = 0;
    sfx.doubleJump();
    for(let i=0;i<4;i++){
      particles.push({x: p.x + p.w/2, y: p.y + p.h, text: '•', color: '#4fd4ff', life: 25, vy: 0.5 + Math.random()*0.5});
    }
  } else {
    // Neither grounded nor able to double jump: buffer the input so it fires
    // automatically the instant the player lands (feels much more responsive).
    p.jumpBuffer = JUMP_BUFFER_FRAMES;
  }
}

window.addEventListener('keydown', e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  
  if(!keys[e.code] && state==='playing'){
    for(const p of players){
      if(p.controls.jump.includes(e.code)){
        triggerJump(p);
      }
    }
  }

  keys[e.code]=true;
  ensureAudio();
  if(e.code==='KeyF') toggleFullscreen();
  if(e.code==='KeyM') toggleMute();
  if(e.code==='KeyV') toggleViewMode();
  if(e.code==='KeyR' && state==='playing') restartLevel();
  if(e.code==='KeyP' && state==='playing') togglePause();
  else if(e.code==='Escape' && state==='playing'){
    if(paused) returnToMenu(); else togglePause();
  }
  else if(e.code==='Escape' && (state==='settings'||state==='levelselect'||state==='leaderboard')) state='menu';

  if(state==='menu'){
    if(e.code==='ArrowUp'||e.code==='KeyW') menuIndex=(menuIndex-1+MENU_ITEMS.length)%MENU_ITEMS.length;
    else if(e.code==='ArrowDown'||e.code==='KeyS') menuIndex=(menuIndex+1)%MENU_ITEMS.length;
    else if(e.code==='Enter'||e.code==='Space') selectMenuItem(menuIndex);
  } else if(state==='levelselect'){
    if(e.code==='ArrowLeft'||e.code==='KeyA') levelSelectIndex=(levelSelectIndex-1+LEVELS.length)%LEVELS.length;
    else if(e.code==='ArrowRight'||e.code==='KeyD') levelSelectIndex=(levelSelectIndex+1)%LEVELS.length;
    else if(e.code==='Enter'||e.code==='Space') { levelIdx = levelSelectIndex; startGame(gameMode); }
    else if(e.code==='Escape') state='menu';
  } else if(state==='settings'){
    const items = settingsItemsList();
    if(e.code==='ArrowUp'||e.code==='KeyW') settingsIndex=(settingsIndex-1+items.length)%items.length;
    else if(e.code==='ArrowDown'||e.code==='KeyS') settingsIndex=(settingsIndex+1)%items.length;
    else if(e.code==='Enter'||e.code==='Space') selectSettingsItem(settingsIndex);
  } else if(state==='leaderboard'){
    if(e.code==='Enter'||e.code==='Space'||e.code==='Escape') state='menu';
  } else if(state==='levelcomplete' && (e.code==='Enter'||e.code==='Space')) nextLevel();
  else if((state==='gameover'||state==='win') && (e.code==='Enter'||e.code==='Space')) returnToMenu();
});
window.addEventListener('keyup', e=>{ keys[e.code]=false; });

document.addEventListener('click', ensureAudio);

function toLogical(clientX, clientY){
  const rect = cv.getBoundingClientRect();
  return { x:(clientX-rect.left)*(LOGICAL_W/rect.width), y:(clientY-rect.top)*(LOGICAL_H/rect.height) };
}
function hitTest(list, x, y){
  for(const h of list){
    if(x>=h.x && x<=h.x+h.w && y>=h.y && y<=h.y+h.h) return h.index;
  }
  return -1;
}
cv.addEventListener('click', e=>{
  ensureAudio();
  const {x,y} = toLogical(e.clientX, e.clientY);
  if(state==='menu'){
    const i = hitTest(menuHitboxes, x, y);
    if(i>=0){ menuIndex=i; selectMenuItem(i); }
  } else if(state==='levelselect'){
    const i = hitTest(levelSelectHitboxes, x, y);
    if(i>=0){ levelSelectIndex=i; levelIdx=i; startGame(gameMode); }
  } else if(state==='settings'){
    const i = hitTest(settingsHitboxes, x, y);
    if(i>=0){ settingsIndex=i; selectSettingsItem(i); }
  } else if(state==='leaderboard'){ state='menu'; }
  else if(state==='levelcomplete') nextLevel();
  else if(state==='gameover'||state==='win') returnToMenu();
});

const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints>0;
function bindTouch(id, code){
  const el = document.getElementById(id);
  el.addEventListener('touchstart', e=>{ 
    e.preventDefault(); 
    ensureAudio(); 
    keys[code]=true; 
    for(const p of players) {
      if(p.controls.jump.includes(code)) triggerJump(p);
    }
  },{passive:false});
  el.addEventListener('touchend', e=>{ e.preventDefault(); keys[code]=false; },{passive:false});
  el.addEventListener('touchcancel', ()=> keys[code]=false);
}
bindTouch('btnLeft','ArrowLeft');
bindTouch('btnRight','ArrowRight');
bindTouch('jumpbtn','Space');

function toggleFullscreen(){
  if(!document.fullscreenElement) wrap.requestFullscreen?.().catch(()=>{});
  else document.exitFullscreen?.();
}
document.getElementById('fsBtn').addEventListener('click', toggleFullscreen);
document.getElementById('restartBtn').addEventListener('click', ()=>{ ensureAudio(); if(state==='playing') restartLevel(); });
document.addEventListener('fullscreenchange', ()=>{
  document.getElementById('fsBtn').textContent = document.fullscreenElement ? '⤢' : '⛶';
  resizeCanvas();
});

let actx = null, muted = false;
function ensureAudio(){ if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(actx && actx.state==='suspended') actx.resume(); }
function toggleMute(){ muted = !muted; document.getElementById('muteBtn').textContent = muted ? '🔇' : '🔊'; }
document.getElementById('muteBtn').addEventListener('click', ()=>{ ensureAudio(); toggleMute(); });
function beep(freq, dur, type, vol, delay){
  if(!actx || muted) return;
  const t0 = actx.currentTime + (delay||0);
  const osc = actx.createOscillator(); const gain = actx.createGain();
  osc.type = type||'square';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol||0.15, t0+0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0+dur);
  osc.connect(gain).connect(actx.destination);
  osc.start(t0); osc.stop(t0+dur+0.02);
}
const sfx = {
  jump: ()=> beep(520,0.14,'square',0.12),
  doubleJump: ()=> beep(740,0.16,'triangle',0.15),
  coin: ()=>{ beep(880,0.08,'square',0.12); beep(1320,0.1,'square',0.1,0.06); },
  stomp: ()=>{ beep(180,0.12,'sawtooth',0.15); beep(700,0.08,'square',0.08,0.05); },
  hurt: ()=> beep(120,0.28,'sawtooth',0.18),
  power: ()=>{ [440,660,880,1100].forEach((f,i)=>beep(f,0.1,'square',0.12,i*0.07)); },
  boost: ()=>{ [587,880,1174].forEach((f,i)=>beep(f,0.12,'triangle',0.15,i*0.08)); },
  flag: ()=>{ [523,659,784,1047].forEach((f,i)=>beep(f,0.16,'triangle',0.14,i*0.11)); },
  die: ()=>{ [400,320,240,160].forEach((f,i)=>beep(f,0.18,'sawtooth',0.15,i*0.1)); },
  select: ()=> beep(660,0.06,'square',0.1)
};

function settingsItemsList(){
  return [ 'SOUND: '+(muted?'OFF':'ON'), 'SCREEN SHAKE: '+(shakeEnabled?'ON':'OFF'), 'RESET XP/LEVEL', 'BACK' ];
}
function selectMenuItem(i){
  sfx.select();
  if(i===0) { gameMode='sp'; levelIdx=0; startGame('sp'); }
  else if(i===1) { gameMode='coop'; levelIdx=0; startGame('coop'); }
  else if(i===2) { state='levelselect'; levelSelectIndex=0; }
  else if(i===3){ state='settings'; settingsIndex=0; }
  else if(i===4){ state='leaderboard'; }
}
function selectSettingsItem(i){
  sfx.select();
  if(i===0) toggleMute();
  else if(i===1) shakeEnabled = !shakeEnabled;
  else if(i===2){ xp = 0; playerLevel = 1; localStorage.setItem('byte_runner_xp', 0); }
  else if(i===3) state='menu';
}
function returnToMenu(){ state='menu'; menuIndex=0; }
function restartLevel(){ lives=3; loadLevel(levelIdx); }

function makePlayer(id){
  const startX = (id===0 ? 1*TS : 1*TS + TS*0.7);
  return {
    id, x:startX, y:12*TS, w:28, h:38, vx:0, vy:0, onGround:false, canDoubleJump:true,
    coyoteTimer:0, jumpBuffer:0, magnetTimer:0, shieldTimer:0, comboBonus:0,
    facing:1, powered:false, invuln:0, invisibleTimer:0, jetpackTimer:0, jetpackMax: 300, animT:0,
    body: id===0?PAL.p1body:PAL.p2body, accentC: id===0?PAL.p1accent:PAL.p2accent,
    controls: id===0
      ? { left:['ArrowLeft'], right:['ArrowRight'], jump:['ArrowUp','Space'] }
      : { left:['KeyA'], right:['KeyD'], jump:['KeyW'] }
  };
}

function loadLevel(idx){
  const def = LEVELS[idx];
  levelPxW = def.width*TS;
  flagPxX = def.flagX*TS;
  solid = new Set();
  def.groundSegments.forEach(([a,b])=>{
    for(let c=a;c<=b;c++) for(let r=13;r<ROWS;r++) solid.add(c+','+r);
  });
  def.platforms.forEach(p=>{ for(let i=0;i<p.w;i++) solid.add((p.x+i)+','+p.y); });
  hazards = def.spikes.map(([x,y])=>({x:x*TS,y:y*TS-2,w:TS,h:14}));
  coins = def.coins.map(([x,y])=>({x:x*TS+8,y:y*TS+8,w:24,h:24,taken:false,spin:Math.random()*10}));
  enemies = def.enemies.map(e=>({
    x:e.x*TS, y:e.y*TS-28, w:30, h:28, vx:0.8, vy:0, dir:1,
    baseX:e.x*TS, range:e.range*TS, alive:true, seed: Math.floor(e.x*TS)%977
  }));
  plants = def.plants ? def.plants.map(p=>({
    x:p.x*TS + 4, y:p.y*TS - 32, w:32, h:32, state:'idle', biteTimer:Math.random()*10
  })) : [];
  lasers = def.lasers ? def.lasers.map(l=>({
    x:l.x*TS + TS/2, startY:l.y*TS, h:l.h*TS, period:l.period, offset:l.offset, active:false
  })) : [];
  boosts = def.boosts ? def.boosts.map(b=>({
    x:b.x*TS+6, y:b.y*TS+6, w:28, h:28, type:b.type, taken:false
  })) : [];
  mushroom = def.mushroom ? {x:def.mushroom[0]*TS+4, y:def.mushroom[1]*TS-24, w:32, h:24, taken:false} : null;
  players = [ makePlayer(0) ];
  if(gameMode==='coop') players.push(makePlayer(1));
  cameraX = 0; targetCameraX = 0;
  particles = [];
}

function startGame(mode){
  gameMode = mode;
  score=0; lives = 3;
  loadLevel(levelIdx);
  state='playing'; paused=false;
}

let leaderboardResult = [];

function nextLevel(){
  levelIdx++;
  if(levelIdx>=LEVELS.length){ state='win'; leaderboardResult = saveScoreToLeaderboard(score, levelIdx-1, gameMode); return; }
  loadLevel(levelIdx); state='playing';
}

function respawnPlayer(p){
  const startX = (p.id===0 ? 1*TS : 1*TS + TS*0.7);
  p.x=startX; p.y=12*TS; p.vx=0; p.vy=0; p.w=28; p.h=38; p.powered=false; p.invisibleTimer=0; p.jetpackTimer=0; p.invuln=90; p.canDoubleJump=true;
  p.coyoteTimer=0; p.jumpBuffer=0; p.magnetTimer=0; p.shieldTimer=0;
}

function loseLife(p){
  lives--; sfx.die();
  addShakeReal(8);
  comboCount = 0; comboTimer = 0;
  if(lives<=0){ state='gameover'; leaderboardResult = saveScoreToLeaderboard(score, levelIdx, gameMode); return; }
  respawnPlayer(p);
}

function togglePause(){ paused = !paused; }
function addParticle(x,y,text,color){ particles.push({x,y,text,color,life:50, vy:-0.8}); }

function tilesOverlap(x,y,w,h){
  const c1=Math.floor(x/TS), c2=Math.floor((x+w-1)/TS);
  const r1=Math.floor(y/TS), r2=Math.floor((y+h-1)/TS);
  const out=[];
  for(let c=c1;c<=c2;c++) for(let r=r1;r<=r2;r++)
    if(solid.has(c+','+r)) out.push({c,r});
  return out;
}

function rectsOverlap(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function updatePlayerPhysics(p){
  const ctl = p.controls;
  let left = ctl.left.some(k=>keys[k]);
  let right = ctl.right.some(k=>keys[k]);

  if(left && !right){ p.vx -= MOVE_ACC; p.facing=-1; }
  else if(right && !left){ p.vx += MOVE_ACC; p.facing=1; }
  else { p.vx *= FRICTION; if(Math.abs(p.vx)<0.05) p.vx=0; }
  p.vx = Math.max(-MOVE_MAX, Math.min(MOVE_MAX, p.vx));

  let jumpKey = ctl.jump.some(k=>keys[k]);
  if(p.jetpackTimer>0){
    p.jetpackTimer--;
    if(jumpKey) p.vy = -4.5;
    else p.vy = Math.min(2.0, p.vy + GRAVITY*0.3);
    p.onGround = false;
  } else {
    if(!jumpKey && p.vy < JUMP_CUT*JUMP_V){ p.vy = JUMP_CUT*JUMP_V; }
    p.vy = Math.min(MAX_FALL, p.vy + GRAVITY);
  }

  p.x += p.vx;
  p.x = Math.max(0, Math.min(levelPxW - p.w, p.x));
  for(const t of tilesOverlap(p.x,p.y,p.w,p.h)){
    if(p.vx>0) p.x = t.c*TS - p.w;
    else if(p.vx<0) p.x = (t.c+1)*TS;
    p.vx = 0;
  }
  p.y += p.vy;
  p.onGround = false;
  for(const t of tilesOverlap(p.x,p.y,p.w,p.h)){
    if(p.vy>0){ 
      p.y = t.r*TS - p.h; 
      p.onGround = true; 
      p.canDoubleJump = true; 
    }
    else if(p.vy<0){ p.y = (t.r+1)*TS; }
    p.vy = 0;
  }
  if(p.invuln>0) p.invuln--;
  if(p.invisibleTimer>0) p.invisibleTimer--;
  if(p.magnetTimer>0) p.magnetTimer--;
  if(p.shieldTimer>0) p.shieldTimer--;
  p.animT += Math.abs(p.vx)>0.3 ? 0.20 : 0.08;

  // Coyote time: keep a short grace window after walking off a ledge where
  // jump still works, and consume any buffered jump the instant we land.
  if(p.onGround) p.coyoteTimer = COYOTE_FRAMES;
  else if(p.coyoteTimer > 0) p.coyoteTimer--;

  if(p.jumpBuffer > 0){
    p.jumpBuffer--;
    if(p.onGround || p.coyoteTimer > 0) triggerJump(p);
  }
}

function updateEnemies(){
  for(const e of enemies){
    if(!e.alive) continue;
    e.vy = Math.min(MAX_FALL, e.vy + GRAVITY);
    e.x += e.vx*e.dir;
    for(const t of tilesOverlap(e.x,e.y,e.w,e.h)){
      if(e.dir>0) e.x = t.c*TS - e.w; else e.x = (t.c+1)*TS;
      e.dir *= -1;
    }
    e.y += e.vy;
    let landed=false;
    for(const t of tilesOverlap(e.x,e.y,e.w,e.h)){
      if(e.vy>0){ e.y = t.r*TS - e.h; landed=true; }
      else if(e.vy<0){ e.y=(t.r+1)*TS; }
      e.vy=0;
    }
    if(Math.abs(e.x - e.baseX) > e.range) e.dir *= -1;
    if(landed){
      const aheadX = e.dir>0 ? e.x+e.w+2 : e.x-2;
      const belowTiles = tilesOverlap(aheadX, e.y+e.h+2, 2, 2);
      if(belowTiles.length===0) e.dir *= -1;
    }
    if(e.y > ROWS*TS + 200) e.alive=false;
  }
}

function updateTraps(){
  plants.forEach(pt => {
    let triggered = false;
    for(const p of players){
      const dist = Math.abs((p.x + p.w/2) - (pt.x + pt.w/2));
      if(dist < 36 && p.y <= pt.y + 10 && p.y >= pt.y - 45){
        triggered = true;
      }
    }
    if(triggered){
      pt.state = 'snapping';
      pt.biteTimer += 0.3;
    } else {
      pt.state = 'idle';
      pt.biteTimer += 0.08;
    }
  });

  lasers.forEach(l => {
    const cycle = (time + l.offset) % l.period;
    l.active = cycle < l.period * 0.5;
  });
}

function checkPickups(p){
  if(p.magnetTimer > 0){
    const pcx = p.x + p.w/2, pcy = p.y + p.h/2;
    for(const c of coins){
      if(c.taken) continue;
      const dx = pcx - (c.x + c.w/2), dy = pcy - (c.y + c.h/2);
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 160 && dist > 2){ c.x += (dx/dist) * 6; c.y += (dy/dist) * 6; }
    }
  }
  for(const c of coins){
    if(!c.taken && rectsOverlap(p,{x:c.x,y:c.y,w:c.w,h:c.h})){
      c.taken=true; score+=10; 
      gainXP(10, c.x, c.y);
      addParticle(c.x, c.y, '+10', PAL.coin); sfx.coin();
    }
  }
  for(const b of boosts){
    if(!b.taken && rectsOverlap(p,b)){
      b.taken = true;
      sfx.boost();
      if(b.type==='invisible'){
        p.invisibleTimer = 350;
        addParticle(b.x, b.y, 'STEALTH SHIELD', PAL.accent);
      } else if(b.type==='jetpack'){
        p.jetpackTimer = p.jetpackMax;
        addParticle(b.x, b.y, 'JETPACK FUEL!', PAL.accent);
      } else if(b.type==='magnet'){
        p.magnetTimer = 400;
        addParticle(b.x, b.y, 'COIN MAGNET!', PAL.coin);
      }
    }
  }
  if(mushroom && !mushroom.taken && rectsOverlap(p,mushroom)){
    mushroom.taken=true; p.powered=true;
    const oldH=p.h; p.h=52; p.w=34; p.y -= (p.h-oldH);
    addParticle(mushroom.x, mushroom.y, 'POWER UP', PAL.accent); sfx.power();
  }
}

function checkHazards(p){
  for(const h of hazards){
    if(rectsOverlap(p,h) && p.invuln<=0){ hurtPlayer(p); return; }
  }
  for(const pt of plants){
    const activeBite = Math.sin(pt.biteTimer) > -0.4;
    const biteBox = { x: pt.x - 2, y: pt.y - 4, w: 36, h: 36 };
    if(activeBite && rectsOverlap(p, biteBox) && p.invuln<=0){ hurtPlayer(p); return; }
  }
  for(const l of lasers){
    if(l.active){
      const laserBox = {x: l.x - 3, y: l.startY, w: 6, h: l.h};
      if(rectsOverlap(p, laserBox) && p.invuln<=0){ hurtPlayer(p); return; }
    }
  }
  if(p.y > ROWS*TS + 100){ loseLife(p); }
}

function hurtPlayer(p){
  if(p.powered){
    p.powered=false;
    const oldH=p.h;
    p.h=38; p.w=28; p.y += (oldH-p.h);
    p.invuln=90;
    hitStopFrames = 4;
    addShakeReal(5);
    addParticle(p.x, p.y-10, 'OUCH', PAL.spike);
    sfx.hurt();
  } else {
    loseLife(p);
  }
}

function checkEnemyCollisions(p){
  for(const e of enemies){
    if(!e.alive) continue;
    if(rectsOverlap(p,e)){
      const stomping = p.vy>0 && (p.y+p.h) - e.y < 18;
      if(stomping){
        e.alive=false; p.vy=BOUNCE_V;
        comboCount++; comboTimer = 90;
        const bonus = 100 * Math.min(comboCount, 5);
        score += bonus;
        gainXP(50, e.x, e.y);
        hitStopFrames = 6;
        addShakeReal(2);
        addParticle(e.x, e.y, (comboCount>1 ? `x${comboCount} COMBO +${bonus}` : '+100'), PAL.enemy); sfx.stomp();
      } else if(p.invuln<=0){
        if(p.invisibleTimer <= 0){
          hurtPlayer(p);
          p.vx = (p.x < e.x ? -1 : 1) * 5;
        }
      }
    }
  }
}

function checkFlag(p){
  if(p.x + p.w/2 >= flagPxX){ state='levelcomplete'; sfx.flag(); }
}

function update(){
  if (hitStopFrames > 0) {
      hitStopFrames--;
      return; 
  }
  
  time++;
  if(state!=='playing' || paused) return;

  for(const p of players) updatePlayerPhysics(p);
  updateEnemies();
  updateTraps();

  for(const p of players){
    checkPickups(p);
    checkHazards(p);
    if(state!=='playing') return;
    checkEnemyCollisions(p);
    if(state!=='playing') return;
    checkFlag(p);
    if(state!=='playing') return;
  }

  const avgX = players.reduce((s,p)=>s+p.x,0)/players.length;
  targetCameraX = Math.max(0, Math.min(avgX - LOGICAL_W/2, levelPxW - LOGICAL_W));
  cameraX += (targetCameraX - cameraX) * 0.12;

  for(const pt of particles){ pt.y += pt.vy; pt.life--; }
  particles = particles.filter(pt=>pt.life>0);

  if(comboTimer > 0){ comboTimer--; if(comboTimer===0) comboCount = 0; }
  if(shakeMag > 0){
    shakeX = (Math.random()-0.5) * shakeMag;
    shakeY = (Math.random()-0.5) * shakeMag;
    shakeMag *= 0.85;
    if(shakeMag < 0.3) { shakeMag = 0; shakeX = 0; shakeY = 0; }
  }
}

function renderFirstPerson3D(){
  const p = players[0];

  if(p.facing !== cam3D.facing){ cam3D.turnFlash = 14; cam3D.turnSwing = 10 * -p.facing; cam3D.facing = p.facing; }
  if(cam3D.turnFlash > 0) cam3D.turnFlash--;
  cam3D.turnSwing *= 0.8;

  if(p.onGround && !cam3D.prevGround) cam3D.landDip = 9;
  cam3D.prevGround = p.onGround;
  cam3D.landDip *= 0.82;

  const horizonY = LOGICAL_H * 0.5;
  const runBob = (p.onGround && Math.abs(p.vx) > 0.25) ? Math.sin(time * 0.5) * 4 : Math.sin(time * 0.08) * 1.2;
  const jumpOffset = (p.y - 12 * TS) * 0.55 - cam3D.landDip;
  const camY = horizonY + jumpOffset + runBob;
  const camX = LOGICAL_W / 2 + cam3D.turnSwing;

  const FOV = 300, NEAR = 22, FAR = 620;
  function depthScale(dist){ return FOV / (dist + NEAR); }
  function fog(dist){ return Math.max(0, 1 - dist / FAR); }

  const gradSky = ctx.createLinearGradient(0, 0, 0, horizonY);
  gradSky.addColorStop(0, PAL.skyTop); gradSky.addColorStop(1, PAL.skyBot);
  ctx.fillStyle = gradSky; ctx.fillRect(0, 0, LOGICAL_W, horizonY);
  ctx.strokeStyle = 'rgba(79,212,255,0.06)'; ctx.lineWidth = 1;
  for(let i = 0; i < 6; i++){
    const y = horizonY * (i / 6);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
  }

  const skylineShift = (p.x * 0.12) % 140;
  for(let i = -1; i < 9; i++){
    const bx = i * 140 - skylineShift;
    const bh = 26 + ((i * 53 + 17) % 5) * 11;
    ctx.fillStyle = 'rgba(24,34,66,0.55)';
    ctx.fillRect(bx, horizonY - bh, 78, bh);
    ctx.fillStyle = 'rgba(79,212,255,0.15)';
    for(let wy = horizonY - bh + 6; wy < horizonY - 4; wy += 9){
      ctx.fillRect(bx + 8, wy, 5, 4);
      ctx.fillRect(bx + 22, wy, 5, 4);
      ctx.fillRect(bx + 50, wy, 5, 4);
    }
  }

  const gradFloor = ctx.createLinearGradient(0, horizonY, 0, LOGICAL_H);
  gradFloor.addColorStop(0, '#070c22'); gradFloor.addColorStop(1, '#01030a');
  ctx.fillStyle = gradFloor; ctx.fillRect(0, horizonY, LOGICAL_W, LOGICAL_H - horizonY);

  ctx.strokeStyle = 'rgba(79,212,255,0.18)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-20, LOGICAL_H * 0.08); ctx.lineTo(camX, camY - 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(LOGICAL_W + 20, LOGICAL_H * 0.08); ctx.lineTo(camX, camY - 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-20, LOGICAL_H * 0.94); ctx.lineTo(camX, camY + 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(LOGICAL_W + 20, LOGICAL_H * 0.94); ctx.lineTo(camX, camY + 6); ctx.stroke();

  const groundRelY = (13 * TS) - (p.y + p.h / 2);
  const scrollPhase = (p.x * p.facing * 0.5) % TS;
  ctx.lineWidth = 1;
  for(let d = TS - scrollPhase; d < FAR; d += TS){
    if(d < 8) continue;
    const sc = depthScale(d);
    const gy = camY + groundRelY * sc;
    if(gy < horizonY - 4 || gy > LOGICAL_H + 4) continue;
    const halfLen = Math.min(LOGICAL_W, 240 * sc);
    ctx.strokeStyle = `rgba(79,212,255,${0.16 * fog(d)})`;
    ctx.beginPath(); ctx.moveTo(camX - halfLen, gy); ctx.lineTo(camX + halfLen, gy); ctx.stroke();
  }

  for(let d = TS - scrollPhase; d < FAR; d += TS * 2){
    if(d < 8) continue;
    const sc = depthScale(d);
    const gy = camY + groundRelY * sc;
    if(gy < horizonY - 4 || gy > LOGICAL_H + 4) continue;
    const halfLen = Math.min(LOGICAL_W, 240 * sc);
    const barH = 55 * sc;
    const a = 0.4 * fog(d);
    ctx.fillStyle = `rgba(255,140,66,${a})`;
    ctx.fillRect(camX - halfLen - 2, gy - barH, 3, barH);
    ctx.fillRect(camX + halfLen - 1, gy - barH, 3, barH);
    ctx.fillStyle = `rgba(255,200,140,${a * 1.3})`;
    ctx.beginPath(); ctx.arc(camX - halfLen - 0.5, gy - barH, Math.max(1, 3 * sc), 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(camX + halfLen + 0.5, gy - barH, Math.max(1, 3 * sc), 0, Math.PI * 2); ctx.fill();
  }

  let renderQueue = [];
  const pCenterX = p.x + p.w / 2;
  const pTileX = Math.floor(p.x / TS);
  const searchRange = 15 * p.facing;
  const minC = Math.min(pTileX, pTileX + searchRange);
  const maxC = Math.max(pTileX, pTileX + searchRange);
  const maxCol = Math.floor(levelPxW / TS);

  let nearestGapDist = Infinity;
  for(let c = minC; c <= maxC; c++){
    if(c < 0 || c >= maxCol) continue;
    let colHasGround = false;
    for(let r = 0; r < ROWS; r++){
      if(!solid.has(c + ',' + r)) continue;
      if(r >= 13){ colHasGround = true; continue; }
      renderQueue.push({ type: 'obstacle', x: c * TS + TS / 2, y: r * TS + TS / 2 });
    }
    if(!colHasGround){
      renderQueue.push({ type: 'pit', x: c * TS + TS / 2, y: 13 * TS });
      const aheadDist = (c * TS + TS / 2 - pCenterX) * p.facing;
      if(aheadDist > 0) nearestGapDist = Math.min(nearestGapDist, aheadDist);
    }
  }

  coins.forEach(c => { if(!c.taken) renderQueue.push({ type: 'coin', x: c.x + c.w / 2, y: c.y + c.h / 2 }); });
  enemies.forEach(e => { if(e.alive) renderQueue.push({ type: 'enemy', x: e.x + e.w / 2, y: e.y + e.h / 2, ref: e }); });
  boosts.forEach(b => { if(!b.taken) renderQueue.push({ type: 'boost', x: b.x + b.w / 2, y: b.y + b.h / 2 }); });
  hazards.forEach(h => { renderQueue.push({ type: 'hazard', x: h.x + h.w / 2, y: h.y + h.h / 2 }); });
  renderQueue.push({ type: 'flag', x: flagPxX, y: ROWS * TS / 2 });

  renderQueue.sort((a, b) => Math.abs(b.x - pCenterX) - Math.abs(a.x - pCenterX));

  const sway = Math.sin(time * 0.05) * 3;
  let dangerAhead = false;
  renderQueue.forEach(item => {
    const dx = item.x - pCenterX;
    const dist = Math.abs(dx);
    const relX = p.facing > 0 ? dx : -dx;
    if(relX < 4 || dist > FAR) return;

    const scale = depthScale(dist);
    const screenX = camX + sway;
    const screenY = camY + (item.y - (p.y + p.h / 2)) * scale;
    const f = fog(dist);

    if((item.type === 'enemy' || item.type === 'hazard') && relX < 90) dangerAhead = true;

    if(item.type === 'obstacle'){
      const size = Math.max(2, TS * scale);
      const shade = Math.max(0.15, f);
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgb(${22 * shade | 0}, ${22 * shade | 0}, ${64 * shade | 0})`;
      ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
      ctx.fillStyle = `rgba(79,212,255,${0.14 * shade})`;
      ctx.fillRect(screenX - size / 2, screenY - size / 2, size, Math.max(1, size * 0.18));
      ctx.strokeStyle = PAL.brickEdge;
      ctx.globalAlpha = shade;
      ctx.lineWidth = Math.max(1, 2 * scale);
      ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
      ctx.globalAlpha = 1;
    } else if(item.type === 'pit'){
      const size = Math.max(3, TS * scale);
      const pulse = 0.4 + 0.3 * Math.sin(time * 0.3 + item.x * 0.05);
      ctx.fillStyle = `rgba(3,2,6,${0.9 * f})`;
      ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size * 1.4);
      ctx.strokeStyle = `rgba(255,42,42,${pulse * f})`;
      ctx.lineWidth = Math.max(1, 2 * scale);
      ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size * 0.5);
      ctx.fillStyle = `rgba(255,42,42,${0.5 * pulse * f})`;
      ctx.font = `bold ${Math.max(6, 11 * scale)}px "Courier New"`;
      ctx.textAlign = 'center';
      ctx.fillText('▚▚▚', screenX, screenY - size * 0.2);
      ctx.textAlign = 'left';
    } else if(item.type === 'coin'){
      const sz = Math.max(3, 22 * scale);
      const spin = Math.max(0.15, Math.abs(Math.cos(time * 0.12 + item.x * 0.1)));
      ctx.globalAlpha = f;
      ctx.fillStyle = PAL.coin;
      ctx.beginPath(); ctx.ellipse(screenX, screenY, sz * spin, sz, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = 1;
    } else if(item.type === 'enemy'){
      const e = item.ref;
      const seed = e ? e.seed : 0;
      const dir = e ? e.dir : 1;
      const sz = Math.max(6, 46 * scale);
      const bounce = Math.sin(time * 0.1 + seed) * sz * 0.05;
      const squish = 1 + 0.06 * Math.sin(time * 0.1 + seed);
      const cy = screenY - sz * 0.5 + bounce;

      ctx.globalAlpha = f;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(screenX, screenY, sz * 0.4, sz * 0.09, 0, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.translate(screenX, cy);
      ctx.scale(1, squish);

      ctx.fillStyle = PAL.enemyDark;
      const footShift = Math.sin(time * 0.15 + seed) * sz * 0.06;
      ctx.beginPath(); ctx.ellipse(-sz * 0.26 + footShift, sz * 0.42, sz * 0.14, sz * 0.11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sz * 0.26 - footShift, sz * 0.42, sz * 0.14, sz * 0.11, 0, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = PAL.enemyCore; ctx.lineWidth = Math.max(1, sz * 0.045);
      const sway = Math.sin(time * 0.08 + seed) * sz * 0.08;
      ctx.beginPath(); ctx.moveTo(0, -sz * 0.44); ctx.lineTo(sway, -sz * 0.66); ctx.stroke();
      ctx.fillStyle = PAL.coin;
      ctx.beginPath(); ctx.arc(sway, -sz * 0.66, Math.max(1, sz * 0.06), 0, Math.PI * 2); ctx.fill();

      const grad = ctx.createRadialGradient(-sz * 0.1, -sz * 0.14, sz * 0.06, 0, 0, sz * 0.58);
      grad.addColorStop(0, PAL.enemyCore);
      grad.addColorStop(0.55, PAL.enemy);
      grad.addColorStop(1, PAL.enemyDark);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(0, 0, sz * 0.5, sz * 0.46, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,179,242,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();

      const eLook = dir > 0 ? sz * 0.06 : -sz * 0.06;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(-sz * 0.16 + eLook, -sz * 0.08, sz * 0.11, sz * 0.13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sz * 0.16 + eLook, -sz * 0.08, sz * 0.11, sz * 0.13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a0522';
      ctx.beginPath(); ctx.arc(-sz * 0.16 + eLook * 1.4, -sz * 0.06, sz * 0.055, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sz * 0.16 + eLook * 1.4, -sz * 0.06, sz * 0.055, 0, Math.PI * 2); ctx.fill();

      ctx.restore();

      if(relX < 140){
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.35);
        ctx.strokeStyle = `rgba(255,42,120,${(0.45 + 0.25 * pulse) * f})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(screenX, screenY - sz * 0.5, sz * 0.72, sz * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if(item.type === 'boost'){
      const sz = Math.max(6, 28 * scale);
      ctx.globalAlpha = f;
      ctx.fillStyle = PAL.accent;
      ctx.save(); ctx.translate(screenX, screenY); ctx.rotate(time * 0.05);
      ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
      ctx.restore(); ctx.globalAlpha = 1;
    } else if(item.type === 'hazard'){
      const sz = Math.max(4, 24 * scale);
      ctx.globalAlpha = f;
      ctx.fillStyle = PAL.spike;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY - sz); ctx.lineTo(screenX - sz / 2, screenY + sz / 2); ctx.lineTo(screenX + sz / 2, screenY + sz / 2);
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    } else if(item.type === 'flag'){
      ctx.globalAlpha = f;
      ctx.fillStyle = PAL.flag;
      const h = Math.max(20, 190 * scale);
      ctx.fillRect(screenX - 3, screenY - h, 6, h);
      ctx.fillStyle = `rgba(57,255,157,${0.5 * f})`;
      ctx.beginPath(); ctx.moveTo(screenX + 3, screenY - h); ctx.lineTo(screenX + 3 + h * 0.28, screenY - h + h * 0.14); ctx.lineTo(screenX + 3, screenY - h + h * 0.28);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  const spd = Math.abs(p.vx);
  if(spd > 1.2){
    ctx.strokeStyle = `rgba(79,212,255,${Math.min(0.35, spd * 0.08)})`;
    ctx.lineWidth = 1;
    for(let i = 0; i < 8; i++){
      const ang = (i / 8) * Math.PI * 2 + time * 0.02;
      const r1 = 40, r2 = 40 + spd * 26;
      ctx.beginPath();
      ctx.moveTo(camX + Math.cos(ang) * r1, camY + Math.sin(ang) * r1);
      ctx.lineTo(camX + Math.cos(ang) * r2, camY + Math.sin(ang) * r2);
      ctx.stroke();
    }
  }

  ctx.save();
  const moveBob = Math.sin(time * 0.22) * 10 * (Math.abs(p.vx) > 0.1 ? 1 : 0.25);
  const jumpRecoil = p.onGround ? 0 : -14;
  ctx.translate(LOGICAL_W / 2 + 185 + (p.vx * 6), LOGICAL_H - 100 + moveBob + jumpRecoil + cam3D.landDip);
  ctx.fillStyle = '#0d1322';
  ctx.beginPath();
  ctx.moveTo(-10, 120); ctx.lineTo(40, 15); ctx.lineTo(140, 25); ctx.lineTo(180, 120);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PAL.text; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = PAL.accent; ctx.fillRect(50, 30, 50, 12);
  ctx.fillStyle = PAL.coin; ctx.fillRect(62, 33, 26, 6);
  ctx.fillStyle = '#00ffff'; ctx.fillRect(38, 10, 10, 6);
  ctx.restore();

  if(cam3D.turnFlash > 0){
    const a = cam3D.turnFlash / 14;
    ctx.fillStyle = `rgba(120,220,255,${0.22 * a})`;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * a})`; ctx.lineWidth = 3;
    for(let i = 0; i < 5; i++){
      const yy = (LOGICAL_H / 5) * i + 20;
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(LOGICAL_W, yy - 40 * a); ctx.stroke();
    }
  }

  if(p.invuln > 0){
    const a = Math.min(1, p.invuln / 90) * (Math.floor(time / 4) % 2 === 0 ? 0.35 : 0.15);
    ctx.fillStyle = `rgba(255,40,60,${a})`;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  }

  if(p.onGround && nearestGapDist < 130){
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.4);
    ctx.strokeStyle = `rgba(255,42,42,${0.5 + 0.4 * pulse})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, LOGICAL_W - 10, LOGICAL_H - 10);
    ctx.fillStyle = `rgba(255,60,60,${0.8 + 0.2 * pulse})`;
    ctx.font = 'bold 20px "Courier New"'; ctx.textAlign = 'center';
    ctx.fillText('⚠ GAP AHEAD — JUMP', LOGICAL_W / 2, LOGICAL_H - 130);
    ctx.textAlign = 'left';
  }

  ctx.strokeStyle = dangerAhead ? 'rgba(255,70,90,0.95)' : 'rgba(79,212,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(camX, horizonY, dangerAhead ? 20 : 16, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = dangerAhead ? '#ff4a5a' : PAL.accent;
  ctx.fillRect(camX - 2, horizonY - 2, 4, 4);

  const radarX = LOGICAL_W / 2 - 220, radarY = 46, radarW = 440, radarH = 14;
  ctx.fillStyle = 'rgba(10,10,20,0.85)';
  ctx.fillRect(radarX, radarY, radarW, radarH);
  ctx.strokeStyle = 'rgba(79,212,255,0.5)'; ctx.lineWidth = 1;
  ctx.strokeRect(radarX, radarY, radarW, radarH);
  const toRadarX = wx => radarX + (wx / levelPxW) * radarW;
  coins.forEach(c => { if(!c.taken){ ctx.fillStyle = PAL.coin; ctx.fillRect(toRadarX(c.x) - 1, radarY + 4, 2, 6); } });
  enemies.forEach(e => { if(e.alive){ ctx.fillStyle = PAL.enemy; ctx.fillRect(toRadarX(e.x) - 1, radarY + 2, 2, 10); } });
  hazards.forEach(h => { ctx.fillStyle = PAL.spike; ctx.fillRect(toRadarX(h.x) - 1, radarY + 4, 2, 6); });
  ctx.fillStyle = PAL.flag; ctx.fillRect(toRadarX(flagPxX) - 1, radarY, 2, radarH);
  ctx.fillStyle = PAL.text;
  ctx.beginPath();
  const rpx = toRadarX(pCenterX);
  ctx.moveTo(rpx, radarY - 6); ctx.lineTo(rpx - 5, radarY); ctx.lineTo(rpx + 5, radarY); ctx.closePath(); ctx.fill();

  ctx.fillStyle = PAL.textDim; ctx.font = '10px "Courier New"'; ctx.textAlign = 'center';
  ctx.fillText('TRACK POSITION', LOGICAL_W / 2, radarY + radarH + 12);
  ctx.textAlign = 'left';
}

function drawBackground(){
  const g = ctx.createLinearGradient(0,0,0,LOGICAL_H);
  g.addColorStop(0, PAL.skyTop); g.addColorStop(1, PAL.skyBot);
  ctx.fillStyle = g; ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);

  ctx.fillStyle = 'rgba(79,212,255,0.08)';
  const offs = -((cameraX*0.3) % 300);
  for(let i=-1;i<5;i++){
    const bx = offs + i*300;
    ctx.beginPath();
    ctx.moveTo(bx,LOGICAL_H);
    ctx.lineTo(bx+150,LOGICAL_H-160);
    ctx.lineTo(bx+300,LOGICAL_H);
    ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = PAL.grid; ctx.lineWidth=1;
  const gOff = -((cameraX*0.6) % 40);
  for(let x=gOff; x<LOGICAL_W; x+=40){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,LOGICAL_H); ctx.stroke();
  }
  for(let y=0;y<LOGICAL_H;y+=40){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(LOGICAL_W,y); ctx.stroke();
  }
  ctx.fillStyle='rgba(255,255,255,0.5)';
  for(let i=0;i<40;i++){
    const sx = (i*137 - cameraX*0.15) % LOGICAL_W;
    const sy = (i*71) % (LOGICAL_H*0.6);
    const tw = 0.4 + 0.6*Math.abs(Math.sin(time*0.02 + i));
    ctx.globalAlpha = tw;
    ctx.fillRect(((sx%LOGICAL_W)+LOGICAL_W)%LOGICAL_W, sy, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawTiles(){
  const c1 = Math.floor(cameraX/TS)-1, c2 = Math.ceil((cameraX+LOGICAL_W)/TS)+1;
  for(let c=c1;c<=c2;c++){
    for(let r=0;r<ROWS;r++){
      if(!solid.has(c+','+r)) continue;
      const px = c*TS - cameraX, py = r*TS;
      if(r>=13){
        ctx.fillStyle = PAL.ground; ctx.fillRect(px,py,TS,TS);
        ctx.fillStyle = PAL.groundEdge; ctx.fillRect(px,py,TS,4);
        ctx.strokeStyle = 'rgba(79,212,255,0.18)'; ctx.lineWidth = 1; ctx.strokeRect(px+0.5, py+0.5, TS-1, TS-1);
      } else {
        ctx.fillStyle = PAL.brick; ctx.fillRect(px,py,TS,TS);
        ctx.fillStyle = PAL.brickEdge; ctx.fillRect(px,py,TS,3);
        ctx.strokeStyle = 'rgba(122,92,255,0.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(px+0.5, py+0.5, TS-1, TS-1);
      }
    }
  }
}

function drawHazards(){
  for(const h of hazards){
    const px = h.x-cameraX, baseY = h.y+h.h;
    for(let i=0;i<TS;i+=10){
      ctx.fillStyle = PAL.spikeGlow;
      ctx.beginPath();
      ctx.moveTo(px+i, baseY);
      ctx.lineTo(px+i+5, baseY-18);
      ctx.lineTo(px+i+10, baseY);
      ctx.closePath(); ctx.fill();
      
      ctx.fillStyle = PAL.spike;
      ctx.beginPath();
      ctx.moveTo(px+i+2, baseY);
      ctx.lineTo(px+i+5, baseY-13);
      ctx.lineTo(px+i+8, baseY);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(px+i+4, baseY-4);
      ctx.lineTo(px+i+5, baseY-13);
      ctx.lineTo(px+i+6, baseY-4);
      ctx.closePath(); ctx.fill();
    }
  }
}

function drawPlants(){
  for(const pt of plants){
    const px = pt.x - cameraX;
    const alert = pt.state === 'snapping';
    const jawOpen = Math.sin(pt.biteTimer) > -0.3;

    ctx.fillStyle = alert ? PAL.plantAlert : PAL.plantHead;
    ctx.beginPath();
    ctx.arc(px + 16, pt.y + 16, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = PAL.plantMouth;
    ctx.beginPath();
    if(jawOpen){
      ctx.arc(px + 16, pt.y + 16, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 10, pt.y + 10, 3, 6);
      ctx.fillRect(px + 18, pt.y + 10, 3, 6);
    } else {
      ctx.fillRect(px + 6, pt.y + 12, 20, 8);
    }
  }
}

function drawLasers(){
  for(const l of lasers){
    const px = l.x - cameraX;
    ctx.fillStyle = '#222233';
    ctx.fillRect(px - 10, l.startY - 10, 20, 12);
    ctx.fillRect(px - 10, l.startY + l.h - 2, 20, 12);
    ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 1.5;
    ctx.strokeRect(px - 10, l.startY - 10, 20, 12);
    ctx.strokeRect(px - 10, l.startY + l.h - 2, 20, 12);

    if(l.active){
      ctx.strokeStyle = PAL.laser;
      ctx.lineWidth = 5;
      ctx.shadowColor = PAL.laser;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(px, l.startY + 2);
      ctx.lineTo(px, l.startY + l.h - 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, l.startY + 2);
      ctx.lineTo(px, l.startY + l.h - 2);
      ctx.stroke();
    } else {
      if(Math.floor(time/10)%2===0){
        ctx.strokeStyle = 'rgba(255, 42, 42, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, l.startY + 2);
        ctx.lineTo(px, l.startY + l.h - 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
}

function drawCoins(){
  for(const c of coins){
    if(c.taken) continue;
    c.spin += 0.08;
    const scaleX = Math.abs(Math.cos(c.spin));
    const px = c.x - cameraX + c.w/2;
    ctx.save();
    ctx.translate(px, c.y+c.h/2);
    ctx.scale(scaleX, 1);
    ctx.fillStyle = PAL.coin;
    ctx.beginPath(); ctx.arc(0,0,c.w/2,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.arc(0,0,c.w/2-5,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }
}

function drawBoosts(){
  for(const b of boosts){
    if(b.taken) continue;
    const px = b.x - cameraX;
    const floatBob = Math.sin(time*0.12) * 4;
    ctx.save();
    ctx.translate(px + b.w/2, b.y + b.h/2 + floatBob);

    if(b.type==='invisible'){
      const grad = ctx.createRadialGradient(0,0,2, 0,0,14);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#c084ff');
      grad.addColorStop(1, 'rgba(100,20,180,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();

      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px "Courier New"'; ctx.textAlign='center'; ctx.fillText('STEALTH', 0, 3);
    } else if(b.type==='jetpack'){
      ctx.fillStyle = '#111122';
      roundRect(ctx, -10, -14, 20, 28, 6); ctx.fill();
      ctx.strokeStyle = '#ff8c42'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = '#ff8c42';
      ctx.fillRect(-6, -6, 12, 16);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-4, 4, 8, 4);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -18, 6, 4);
    } else if(b.type==='magnet'){
      ctx.strokeStyle = PAL.coin; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 2, 11, Math.PI*0.15, Math.PI*0.85); ctx.stroke();
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(-14, -4, 5, 9);
      ctx.fillRect(9, -4, 5, 9);
      ctx.fillStyle = PAL.enemy;
      ctx.fillRect(-14, 5, 5, 4);
      ctx.fillRect(9, 5, 5, 4);
    }
    ctx.restore();
  }
}

function drawMushroom(){
  if(!mushroom || mushroom.taken) return;
  const px = mushroom.x - cameraX;
  ctx.save();
  ctx.translate(px + mushroom.w/2, mushroom.y + mushroom.h/2 + Math.sin(time*0.1)*2);
  
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -6, -2, 12, 14, 3); ctx.fill();
  
  ctx.fillStyle = PAL.accent;
  ctx.beginPath();
  ctx.ellipse(0, -4, 16, 11, 0, Math.PI, 0, false);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-6, -6, 3.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -8, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawEnemies(){
  for(const e of enemies){
    if(!e.alive) continue;
    const px = e.x - cameraX + e.w/2, py = e.y + e.h/2;
    const bounce = Math.sin(time*0.10 + e.seed)*2;
    const squish = 1 + 0.05*Math.sin(time*0.10 + e.seed);
    const glitch = ((time + e.seed) % 200) < 8;

    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(px, e.y+e.h+3, e.w*0.42, 4, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py + bounce);
    ctx.scale(1, squish);

    ctx.fillStyle = PAL.enemyDark;
    const footShift = Math.sin(time*0.15 + e.seed)*3;
    ctx.beginPath(); ctx.ellipse(-e.w*0.28+footShift, e.h/2-2, 6, 5, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(e.w*0.28-footShift, e.h/2-2, 6, 5, 0, 0, Math.PI*2); ctx.fill();

    ctx.strokeStyle = PAL.enemyCore; ctx.lineWidth=2;
    const sway = Math.sin(time*0.08 + e.seed)*3;
    ctx.beginPath(); ctx.moveTo(0,-e.h/2+2); ctx.lineTo(sway, -e.h/2-8); ctx.stroke();
    ctx.fillStyle = PAL.coin;
    ctx.beginPath(); ctx.arc(sway, -e.h/2-8, 2.5, 0, Math.PI*2); ctx.fill();

    const grad = ctx.createRadialGradient(-4,-6,3, 0,0, e.w*0.62);
    grad.addColorStop(0, PAL.enemyCore);
    grad.addColorStop(0.55, PAL.enemy);
    grad.addColorStop(1, PAL.enemyDark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0,0, e.w*0.52, e.h*0.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,179,242,0.5)'; ctx.lineWidth=1.5;
    ctx.stroke();

    const eLook = e.dir>0 ? 3 : -3;
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.ellipse(-7+eLook, -2, 5.5, 6.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7+eLook, -2, 5.5, 6.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#1a0a1a';
    ctx.beginPath(); ctx.arc(-6+eLook*1.6, -1, 2.6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8+eLook*1.6, -1, 2.6, 0, Math.PI*2); ctx.fill();

    if(glitch){
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#4fd4ff';
      ctx.fillRect(-e.w*0.5, -6+Math.random()*2, e.w, 3);
      ctx.fillStyle = '#ff4fd4';
      ctx.fillRect(-e.w*0.5+2, 1+Math.random()*2, e.w, 3);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}

function drawFlag(){
  const px = flagPxX - cameraX;
  ctx.strokeStyle = '#8a8a9e'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, ROWS*TS); ctx.stroke();
  ctx.fillStyle = PAL.flag;
  ctx.beginPath();
  ctx.moveTo(px,20); ctx.lineTo(px+34,32); ctx.lineTo(px,44);
  ctx.closePath(); ctx.fill();
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function drawPlayer(p){
  const px = p.x - cameraX, py = p.y;
  let alphaVal = 1.0;
  if(p.invisibleTimer > 0) alphaVal = 0.35;
  if(p.invuln > 0 && Math.floor(time/4)%2===0) alphaVal = 0.4;
  ctx.globalAlpha = alphaVal;

  const running = Math.abs(p.vx) > 0.4 && p.onGround;
  const jumping = !p.onGround;
  const bob = (!running && !jumping) ? Math.sin(time*0.06 + p.id*2)*1.2 : 0;

  ctx.save();
  ctx.translate(px + p.w/2, py + p.h/2 + bob);
  ctx.scale(p.facing, 1);

  if(p.jetpackTimer > 0){
    ctx.fillStyle = '#ff3300';
    ctx.beginPath(); ctx.moveTo(-6, p.h/2); ctx.lineTo(0, p.h/2 + 14 + Math.random()*8); ctx.lineTo(6, p.h/2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffff00';
    ctx.beginPath(); ctx.moveTo(-3, p.h/2); ctx.lineTo(0, p.h/2 + 8 + Math.random()*4); ctx.lineTo(3, p.h/2); ctx.closePath(); ctx.fill();
  }

  ctx.fillStyle = p.accentC;
  const flutter = Math.sin(time*0.2 + p.id*2)*3;
  ctx.beginPath();
  ctx.moveTo(-p.w/2+2, -p.h/2+6);
  ctx.lineTo(-p.w/2-8-Math.abs(p.vx), flutter);
  ctx.lineTo(-p.w/2+2, p.h/2-6);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#1b3a4a';
  const legSwing = running ? Math.sin(p.animT)*6 : 0;
  if(jumping){
    ctx.fillRect(-p.w/2+4, p.h/2-12, 8, 12);
    ctx.fillRect(p.w/2-12, p.h/2-14, 8, 12);
  } else {
    ctx.fillRect(-p.w/2+4+legSwing*0.3, p.h/2-10, 8, 10);
    ctx.fillRect(p.w/2-12-legSwing*0.3, p.h/2-10, 8, 10);
  }

  ctx.fillStyle = p.body;
  roundRect(ctx, -p.w/2, -p.h/2, p.w, p.h-8, 6); ctx.fill();

  ctx.fillStyle = '#0a0a12';
  roundRect(ctx, -p.w/2+4, -p.h/2+8, p.w-8, 10, 3); ctx.fill();
  ctx.fillStyle = p.accentC;
  ctx.fillRect(-p.w/2+6, -p.h/2+11, p.w-12, 3);

  ctx.fillStyle = PAL.coin;
  ctx.beginPath(); ctx.arc(0, 4, 3 + Math.sin(time*0.1), 0, Math.PI*2); ctx.fill();

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawParticles(){
  ctx.font='bold 14px "Courier New"'; ctx.textAlign='center';
  ctx.globalCompositeOperation = 'lighter';
  for(const pt of particles){
    ctx.globalAlpha = Math.min(1,pt.life/50);
    ctx.fillStyle = pt.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = pt.color;
    ctx.fillText(pt.text, pt.x-cameraX, pt.y);
  }
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha=1; ctx.textAlign='left';
}

function drawHUD(){
  ctx.fillStyle='rgba(10,10,20,0.85)';
  ctx.fillRect(0,0,LOGICAL_W,40);
  ctx.strokeStyle='rgba(79,212,255,0.4)';
  ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,40); ctx.lineTo(LOGICAL_W,40); ctx.stroke();

  ctx.fillStyle=PAL.text; ctx.font='bold 15px "Courier New"';
  ctx.fillText('SCORE: ' + String(score).padStart(6,'0'), 20, 25);

  // Lives as hearts instead of a plain number
  ctx.fillStyle = PAL.spike; ctx.font='16px "Courier New"';
  let heartStr = '';
  for(let i=0;i<Math.max(0,lives);i++) heartStr += '♥ ';
  ctx.fillText(heartStr.trim() || '—', 170, 25);

  ctx.fillStyle = PAL.p2body; ctx.font='bold 15px "Courier New"';
  const sysRank = getSystemRank(playerLevel);
  ctx.fillText(`[${sysRank}] LVL: ${playerLevel} (XP: ${xp})`, 260, 25);

  if(comboCount > 1){
    ctx.fillStyle = PAL.coin;
    ctx.font = 'bold 14px "Courier New"';
    ctx.fillText(`COMBO x${Math.min(comboCount,5)}!`, 470, 25);
  }

  const p1 = players[0];
  let barX = LOGICAL_W - 210;
  if(p1 && p1.jetpackTimer > 0){
    ctx.fillStyle = '#7d8bb0'; ctx.font = '11px "Courier New"';
    ctx.fillText('JET', barX - 32, 25);
    ctx.fillStyle = '#333344'; ctx.fillRect(barX, 14, 70, 12);
    ctx.fillStyle = '#ff8c42';
    ctx.fillRect(barX, 14, (p1.jetpackTimer / p1.jetpackMax) * 70, 12);
    ctx.strokeStyle = '#4fd4ff'; ctx.strokeRect(barX, 14, 70, 12);
    barX -= 90;
  }
  if(p1 && p1.magnetTimer > 0){
    ctx.fillStyle = '#7d8bb0'; ctx.font = '11px "Courier New"';
    ctx.fillText('MAG', barX - 32, 25);
    ctx.fillStyle = '#333344'; ctx.fillRect(barX, 14, 70, 12);
    ctx.fillStyle = PAL.coin;
    ctx.fillRect(barX, 14, (p1.magnetTimer / 400) * 70, 12);
    ctx.strokeStyle = '#4fd4ff'; ctx.strokeRect(barX, 14, 70, 12);
  }

  // Level progress bar (based on player 1's x position vs the flag)
  const progW = LOGICAL_W - 40;
  const progPct = p1 ? Math.max(0, Math.min(1, (p1.x + p1.w/2) / flagPxX)) : 0;
  ctx.fillStyle = 'rgba(20,25,45,0.9)';
  ctx.fillRect(20, LOGICAL_H - 14, progW, 6);
  ctx.fillStyle = PAL.flag;
  ctx.fillRect(20, LOGICAL_H - 14, progW * progPct, 6);
  ctx.strokeStyle = 'rgba(79,212,255,0.35)'; ctx.lineWidth=1;
  ctx.strokeRect(20, LOGICAL_H - 14, progW, 6);

  ctx.textAlign='right';
  ctx.fillStyle=PAL.textDim; ctx.font='12px "Courier New"';
  ctx.fillText('V: 2D/3D | R: Restart | P: Pause', LOGICAL_W-16, 60);
  ctx.textAlign='left';
}

function centerPanel(lines, sub){
  ctx.fillStyle='rgba(5,5,12,0.88)';
  ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);
  ctx.textAlign='center';
  ctx.fillStyle=PAL.text; ctx.font='bold 42px "Courier New"';
  ctx.shadowColor=PAL.text; ctx.shadowBlur=18;
  ctx.fillText(lines[0], LOGICAL_W/2, LOGICAL_H/2-40);
  ctx.shadowBlur=0;
  ctx.font='18px "Courier New"'; ctx.fillStyle=PAL.textDim;
  for(let i=1;i<lines.length;i++) ctx.fillText(lines[i], LOGICAL_W/2, LOGICAL_H/2-40+30*i);
  if(sub){
    ctx.fillStyle=PAL.accent; ctx.font='16px "Courier New"';
    ctx.fillText(sub, LOGICAL_W/2, LOGICAL_H/2+120);
  }
  ctx.textAlign='left';
}

// Improved & Modernized Menu Design
function drawMenu(){
  drawBackground();

  // Subtle ambient background panel overlay for menu focus
  ctx.fillStyle = 'rgba(2, 5, 15, 0.65)';
  ctx.fillRect(LOGICAL_W/2 - 280, 68, 560, 440);
  ctx.strokeStyle = 'rgba(79, 212, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(LOGICAL_W/2 - 280, 68, 560, 440);

  ctx.textAlign='center';
  
  // Neon Title Glow
  ctx.fillStyle=PAL.text; ctx.font='bold 52px "Courier New"';
  ctx.shadowColor='#4fd4ff'; ctx.shadowBlur=25;
  ctx.fillText('BYTE RUNNER', LOGICAL_W/2, 135);
  ctx.shadowBlur=0;

  // Subtitle badge
  ctx.fillStyle='rgba(79, 212, 255, 0.15)';
  roundRect(ctx, LOGICAL_W/2 - 190, 155, 380, 26, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(79, 212, 255, 0.4)';
  ctx.strokeRect(LOGICAL_W/2 - 190, 155, 380, 26);
  ctx.fillStyle=PAL.accent; ctx.font='bold 13px "Courier New"';
  ctx.fillText('⚡ ULTIMATE NEON ARCADE EDITION ⚡', LOGICAL_W/2, 172);

  const topBoard = loadLeaderboard();
  const highScore = topBoard.length ? topBoard[0].score : 0;
  ctx.fillStyle = PAL.coin; ctx.font = '12px "Courier New"';
  ctx.fillText('HIGH SCORE: ' + String(highScore).padStart(6,'0'), LOGICAL_W/2, 196);

  menuHitboxes = [];
  const startY = 222, gap = 52, boxW = 380, boxH = 42;
  MENU_ITEMS.forEach((label, i)=>{
    const y = startY + i*gap;
    const selected = i===menuIndex;
    
    // Modern button styling with subtle gradient glow on active item
    ctx.fillStyle = selected ? 'rgba(79,212,255,0.22)' : 'rgba(15,20,35,0.8)';
    roundRect(ctx, LOGICAL_W/2-boxW/2, y-boxH/2, boxW, boxH, 8);
    ctx.fill();
    
    ctx.strokeStyle = selected ? PAL.text : 'rgba(125,139,176,0.35)';
    ctx.lineWidth = selected ? 2.5 : 1; 
    ctx.stroke();

    ctx.fillStyle = selected ? '#ffffff' : PAL.textDim;
    ctx.font = selected ? 'bold 21px "Courier New"' : '19px "Courier New"';
    ctx.shadowColor = selected ? PAL.text : 'transparent';
    ctx.shadowBlur = selected ? 10 : 0;
    ctx.fillText((selected? '►  ' : '') + label + (selected? '  ◄' : ''), LOGICAL_W/2, y+7);
    ctx.shadowBlur = 0;

    menuHitboxes.push({index:i, x:LOGICAL_W/2-boxW/2, y:y-boxH/2, w:boxW, h:boxH});
  });

  ctx.fillStyle=PAL.textDim; ctx.font='11px "Courier New"';
  ctx.fillText(isTouch ? 'TAP BUTTONS TO SELECT' : 'USE ARROWS / W-S TO NAVIGATE · ENTER / SPACE TO SELECT', LOGICAL_W/2, 480);
  ctx.textAlign='left';
}

function drawLevelSelect(){
  drawBackground();
  ctx.textAlign='center';
  ctx.fillStyle=PAL.text; ctx.font='bold 38px "Courier New"';
  ctx.shadowColor=PAL.text; ctx.shadowBlur=16;
  ctx.fillText('SELECT LEVEL', LOGICAL_W/2, 140);
  ctx.shadowBlur=0;

  levelSelectHitboxes = [];
  const maxW = LOGICAL_W - 60;
  const gap = 22;
  const cardW = Math.min(180, (maxW - gap*(LEVELS.length-1)) / LEVELS.length);
  const cardH = 130;
  const totalW = LEVELS.length * cardW + (LEVELS.length - 1) * gap;
  const startX = (LOGICAL_W - totalW) / 2;
  const startY = 230;

  LEVELS.forEach((lvl, i)=>{
    const cx = startX + i * (cardW + gap);
    const selected = i === levelSelectIndex;

    ctx.fillStyle = selected ? 'rgba(79,212,255,0.2)' : 'rgba(15,15,30,0.7)';
    roundRect(ctx, cx, startY, cardW, cardH, 12);
    ctx.fill();
    ctx.strokeStyle = selected ? PAL.text : 'rgba(79,212,255,0.3)';
    ctx.lineWidth = selected ? 3 : 1;
    ctx.stroke();

    ctx.fillStyle = selected ? PAL.text : PAL.textDim;
    ctx.font = 'bold 18px "Courier New"';
    ctx.fillText('LEVEL ' + (i+1), cx + cardW/2, startY + 38);

    ctx.fillStyle = PAL.textDim;
    ctx.font = '12px "Courier New"';
    ctx.fillText(lvl.width + ' blocks', cx + cardW/2, startY + 66);

    const stars = '★'.repeat(i+1) + '☆'.repeat(LEVELS.length-1-i);
    ctx.fillStyle = PAL.accent; ctx.font = '13px "Courier New"';
    ctx.fillText(stars, cx + cardW/2, startY + 90);

    levelSelectHitboxes.push({index: i, x: cx, y: startY, w: cardW, h: cardH});
  });

  ctx.fillStyle = PAL.textDim; ctx.font = '12px "Courier New"';
  ctx.fillText('use A/D or arrows to navigate · enter to play · esc for menu', LOGICAL_W/2, startY + cardH + 40);
  ctx.textAlign = 'left';
}

function drawSettings(){
  drawBackground();
  ctx.textAlign='center';
  ctx.fillStyle=PAL.text; ctx.font='bold 34px "Courier New"';
  ctx.shadowColor=PAL.text; ctx.shadowBlur=16;
  ctx.fillText('SETTINGS', LOGICAL_W/2, 140);
  ctx.shadowBlur=0;

  settingsHitboxes = [];
  const items = settingsItemsList();
  const startY = 250, gap = 62, boxW = 340, boxH = 46;
  items.forEach((label, i)=>{
    const y = startY + i*gap;
    const selected = i===settingsIndex;
    ctx.fillStyle = selected ? 'rgba(79,212,255,0.16)' : 'rgba(255,255,255,0.03)';
    roundRect(ctx, LOGICAL_W/2-boxW/2, y-boxH/2, boxW, boxH, 8);
    ctx.fill();
    ctx.strokeStyle = selected ? PAL.text : 'rgba(125,139,176,0.3)';
    ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle = selected ? PAL.text : PAL.textDim;
    ctx.font = selected ? 'bold 20px "Courier New"' : '18px "Courier New"';
    ctx.fillText((selected?'> ':'') + label + (selected?' <':''), LOGICAL_W/2, y+6);
    settingsHitboxes.push({index:i, x:LOGICAL_W/2-boxW/2, y:y-boxH/2, w:boxW, h:boxH});
  });
  ctx.fillStyle=PAL.textDim; ctx.font='12px "Courier New"';
  ctx.fillText('enter/space to toggle · esc to go back', LOGICAL_W/2, startY + items.length*gap + 20);
  ctx.textAlign='left';
}

function drawLeaderboard(){
  drawBackground();
  ctx.textAlign='center';
  ctx.fillStyle=PAL.text; ctx.font='bold 36px "Courier New"';
  ctx.shadowColor=PAL.text; ctx.shadowBlur=16;
  ctx.fillText('TOP SCORES', LOGICAL_W/2, 110);
  ctx.shadowBlur=0;

  const board = loadLeaderboard();
  const startY = 175, rowH = 46, boxW = 460;
  ctx.fillStyle = 'rgba(10,10,20,0.7)';
  roundRect(ctx, LOGICAL_W/2-boxW/2, startY-10, boxW, Math.max(1,board.length)*rowH + 20, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(79,212,255,0.3)'; ctx.lineWidth=1.5; ctx.stroke();

  if(board.length===0){
    ctx.fillStyle = PAL.textDim; ctx.font='16px "Courier New"';
    ctx.fillText('NO SCORES YET — GO PLAY!', LOGICAL_W/2, startY+30);
  } else {
    board.forEach((entry, i)=>{
      const y = startY + i*rowH + 26;
      const medal = ['🥇','🥈','🥉'][i] || (i+1)+'.';
      ctx.fillStyle = i===0 ? PAL.coin : (i<3 ? PAL.text : PAL.textDim);
      ctx.font = i===0 ? 'bold 20px "Courier New"' : '17px "Courier New"';
      ctx.textAlign='left';
      ctx.fillText(medal + '  ' + String(entry.score).padStart(6,'0') + ' pts', LOGICAL_W/2-boxW/2+24, y);
      ctx.textAlign='right';
      ctx.fillStyle = PAL.textDim; ctx.font='13px "Courier New"';
      ctx.fillText('LVL ' + entry.level + ' · ' + entry.mode.toUpperCase() + ' · ' + entry.date, LOGICAL_W/2+boxW/2-24, y);
    });
  }
  ctx.textAlign='center';
  ctx.fillStyle=PAL.textDim; ctx.font='12px "Courier New"';
  ctx.fillText('PRESS ENTER OR CLICK TO GO BACK', LOGICAL_W/2, startY + Math.max(1,board.length)*rowH + 40);
  ctx.textAlign='left';
}

function render(){
  document.getElementById('touchpad').classList.toggle('show', isTouch && state==='playing' && !paused);

  ctx.save();

  if(state==='menu'){ drawMenu(); ctx.restore(); return; }
  if(state==='levelselect'){ drawLevelSelect(); ctx.restore(); return; }
  if(state==='settings'){ drawSettings(); ctx.restore(); return; }
  if(state==='leaderboard'){ drawLeaderboard(); ctx.restore(); return; }

  if(shakeMag > 0) ctx.translate(shakeX, shakeY);

  if(viewMode === '3d'){
    renderFirstPerson3D();
  } else {
    drawBackground();
    drawTiles();
    drawHazards();
    drawPlants();
    drawLasers();
    drawCoins();
    drawBoosts();
    drawMushroom();
    drawFlag();
    drawEnemies();
    for(const p of players) drawPlayer(p);
    drawParticles();
  }

  if(shakeMag > 0) ctx.translate(-shakeX, -shakeY);
  drawHUD();

  if(state==='levelcomplete'){
    centerPanel(['LEVEL COMPLETE', 'score '+score], 'PRESS ENTER FOR NEXT LEVEL');
  } else if(state==='gameover'){
    const rank = leaderboardResult.findIndex(e=>e.score===score) + 1;
    const rankLine = rank>=1 && rank<=5 ? ['NEW TOP '+rank+' SCORE!'] : [];
    centerPanel(['GAME OVER', 'final score '+score, ...rankLine], 'PRESS ENTER FOR MENU');
  } else if(state==='win'){
    const rank = leaderboardResult.findIndex(e=>e.score===score) + 1;
    const rankLine = rank>=1 && rank<=5 ? ['NEW TOP '+rank+' SCORE!'] : [];
    centerPanel(['YOU WIN', 'all levels cleared', 'final score '+score, ...rankLine], 'PRESS ENTER FOR MENU');
  } else if(paused){
    centerPanel(['PAUSED', '', 'P: RESUME  ·  R: RESTART  ·  ESC: MENU'], '');
  }
  ctx.restore();
}

function resizeCanvas(){
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.min(window.innerWidth/LOGICAL_W, window.innerHeight/LOGICAL_H);
  cv.style.width = (LOGICAL_W*scale)+'px';
  cv.style.height = (LOGICAL_H*scale)+'px';
  cv.width = Math.round(LOGICAL_W*dpr);
  cv.height = Math.round(LOGICAL_H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function loop(){
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
