// ==================== VARIABLES GLOBALES ====================
let currentGame = null, gameActive = false, currentTurn = null;
// Estadísticas: total, usuario, ia, empates
let stats = {gato:{t:0,u:0,i:0,d:0}, nim:{t:0,u:0,i:0,d:0}, suma15:{t:0,u:0,i:0,d:0}};

// GATO
let gatoBoard = Array(9).fill(''), gatoDiff = 'dificil', userSymbol = 'X', iaSymbol = 'O';
const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

// NIM
let nimValue = 100, nimMin = 1, nimMax = 10;

// SUMAR 15
let available = [], userNums = [], iaNums = [];
let pendingFirst = null;

// ==================== ESTADÍSTICAS ====================
function updateStats() {
    let s = stats[currentGame];
    document.getElementById('stats-container').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card total"><div class="stat-label">📊 Partidas</div><div class="stat-value">${s.t}</div></div>
            <div class="stat-card user"><div class="stat-label">👤 Tú</div><div class="stat-value">${s.u}</div></div>
            <div class="stat-card ia"><div class="stat-label">🤖 IA</div><div class="stat-value">${s.i}</div></div>
            <div class="stat-card draw"><div class="stat-label">🤝 Empates</div><div class="stat-value">${s.d}</div></div>
        </div>`;
}
function addResult(r) { let s = stats[currentGame]; s.t++; if(r==='user') s.u++; else if(r==='ia') s.i++; else if(r==='draw') s.d++; updateStats(); }

// ==================== NAVEGACIÓN ====================
function backToMenu() {
    document.querySelectorAll('.game-area').forEach(a=>a.classList.remove('active'));
    document.getElementById('menu').style.display = 'block';
    document.getElementById('stats-container').innerHTML = '';
    currentGame = null;
}
function showGame(game) {
    document.getElementById('menu').style.display = 'none';
    document.querySelectorAll('.game-area').forEach(a=>a.classList.remove('active'));
    document.getElementById(`game-${game}`).classList.add('active');
    currentGame = game;
    updateStats();
    if(game === 'gato') resetGato();
    else if(game === 'nim') resetNim();
    else resetSuma();
}

// ==================== MODAL ====================
function showModal(title, onUser, onIa, extra='') {
    document.getElementById('modal-title').innerHTML = title;
    document.getElementById('modal-extra').innerHTML = extra;
    let modal = document.getElementById('modal');
    modal.style.display = 'block';
    let uBtn = document.getElementById('user-first'), iBtn = document.getElementById('ia-first');
    let nu = uBtn.cloneNode(true), ni = iBtn.cloneNode(true);
    uBtn.parentNode.replaceChild(nu, uBtn);
    iBtn.parentNode.replaceChild(ni, iBtn);
    nu.onclick = () => { modal.style.display = 'none'; onUser(); };
    ni.onclick = () => { modal.style.display = 'none'; onIa(); };
    if(document.getElementById('symX')) {
        document.getElementById('symX').onclick = () => { modal.style.display = 'none'; startGato(pendingFirst, 'X'); };
        document.getElementById('symO').onclick = () => { modal.style.display = 'none'; startGato(pendingFirst, 'O'); };
    }
}

// ==================== JUEGO 1: GATO ====================
function checkWinner(b) { for(let w of wins) if(b[w[0]] && b[w[0]]===b[w[1]] && b[w[0]]===b[w[2]]) return b[w[0]]; return null; }
function minimax(b,d,isMax){
    let w=checkWinner(b);
    if(w===iaSymbol) return 10-d;
    if(w===userSymbol) return d-10;
    if(b.every(c=>c)) return 0;
    if(isMax){
        let best=-Infinity;
        for(let i=0;i<9;i++) if(!b[i]){ b[i]=iaSymbol; best=Math.max(best,minimax(b,d+1,false)); b[i]=''; }
        return best;
    } else {
        let best=Infinity;
        for(let i=0;i<9;i++) if(!b[i]){ b[i]=userSymbol; best=Math.min(best,minimax(b,d+1,true)); b[i]=''; }
        return best;
    }
}
function getBestMove(){
    let best=-Infinity, move;
    for(let i=0;i<9;i++) if(!gatoBoard[i]){ gatoBoard[i]=iaSymbol; let s=minimax(gatoBoard,0,false); gatoBoard[i]=''; if(s>best){ best=s; move=i; } }
    return move;
}
function iaMoveGato(){
    if(!gameActive || currentTurn!=='ia') return;
    let empty = gatoBoard.reduce((a,c,i)=>c?a:[...a,i],[]);
    if(!empty.length) return;
    let move = gatoDiff==='facil' ? empty[Math.floor(Math.random()*empty.length)] : (gatoDiff==='medio' ? (Math.random()<0.7?getBestMove():empty[Math.floor(Math.random()*empty.length)]) : getBestMove());
    setTimeout(()=>{
        if(gameActive && currentTurn==='ia' && !gatoBoard[move]){
            gatoBoard[move]=iaSymbol;
            renderGato();
            let w=checkWinner(gatoBoard);
            if(w===iaSymbol){ document.getElementById('gato-msg').innerHTML='🤖 Ganó IA'; gameActive=false; addResult('ia'); }
            else if(w===userSymbol){ document.getElementById('gato-msg').innerHTML='🎉 Ganaste'; gameActive=false; addResult('user'); }
            else if(gatoBoard.every(c=>c)){ document.getElementById('gato-msg').innerHTML='🤝 Empate'; gameActive=false; addResult('draw'); }
            else{ currentTurn='user'; document.getElementById('gato-msg').innerHTML='🎯 Tu turno'; }
        }
    },200);
}
function handleGatoClick(i){
    if(!gameActive || currentTurn!=='user' || gatoBoard[i]) return;
    gatoBoard[i]=userSymbol;
    renderGato();
    let w=checkWinner(gatoBoard);
    if(w===userSymbol){ document.getElementById('gato-msg').innerHTML='🎉 Ganaste'; gameActive=false; addResult('user'); return; }
    if(gatoBoard.every(c=>c)){ document.getElementById('gato-msg').innerHTML='🤝 Empate'; gameActive=false; addResult('draw'); return; }
    currentTurn='ia'; document.getElementById('gato-msg').innerHTML='🤖 Pensando...';
    iaMoveGato();
}
function renderGato(){
    let b=document.getElementById('gato-board'); b.innerHTML='';
    gatoBoard.forEach((c,i)=>{ let d=document.createElement('div'); d.className='cell'; d.textContent=c; d.onclick=()=>handleGatoClick(i); b.appendChild(d); });
}
function startGato(first, sym){
    userSymbol=sym; iaSymbol=(sym==='X')?'O':'X';
    gatoBoard=Array(9).fill(''); gameActive=true;
    currentTurn=first==='user'?'user':'ia';
    renderGato();
    if(currentTurn==='user') document.getElementById('gato-msg').innerHTML=`🎯 Tu turno (${userSymbol})`;
    else{ document.getElementById('gato-msg').innerHTML='🤖 Turno IA...'; iaMoveGato(); }
}
function elegirSimbolo(first) {
    pendingFirst = first;
    let extra = '<div style="margin-top:15px"><button id="symX" class="modal-btn" style="background:#667eea;margin:5px">❌ X</button><button id="symO" class="modal-btn" style="background:#667eea;margin:5px">⭕ O</button></div>';
    document.getElementById('modal-title').innerHTML = 'Elige tu símbolo';
    document.getElementById('modal-extra').innerHTML = extra;
    document.getElementById('modal').style.display = 'block';
    document.getElementById('symX').onclick = () => { document.getElementById('modal').style.display = 'none'; startGato(first, 'X'); };
    document.getElementById('symO').onclick = () => { document.getElementById('modal').style.display = 'none'; startGato(first, 'O'); };
    document.getElementById('user-first').style.display = 'none';
    document.getElementById('ia-first').style.display = 'none';
}
function resetGato(){
    document.getElementById('user-first').style.display = 'inline-block';
    document.getElementById('ia-first').style.display = 'inline-block';
    showModal('🐱 ¿Quién empieza?',()=>elegirSimbolo('user'),()=>elegirSimbolo('ia'),'');
}
document.querySelectorAll('.diff').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('.diff').forEach(d=>d.classList.remove('active'));
    b.classList.add('active'); gatoDiff=b.dataset.diff;
});

// ==================== JUEGO 2: NIM ====================
function renderNim(){
    document.getElementById('nim-current').innerHTML = nimValue;
    let ctrl = document.getElementById('nim-controls'); ctrl.innerHTML='';
    if(gameActive && currentTurn==='user')
        for(let i=nimMin; i<=Math.min(nimMax,nimValue); i++){
            let btn=document.createElement('button');
            btn.textContent=`- ${i}`; btn.className='nim-btn';
            btn.onclick=()=>{ 
                if(gameActive && currentTurn==='user' && i<=nimValue){ 
                    nimValue-=i; renderNim(); 
                    if(nimValue===0){ document.getElementById('nim-msg').innerHTML='🎉 Ganaste'; gameActive=false; addResult('user'); return; } 
                    currentTurn='ia'; document.getElementById('nim-msg').innerHTML='🤖 Turno IA...'; renderNim(); 
                    setTimeout(iaMoveNim,400); 
                } 
            };
            ctrl.appendChild(btn);
        }
    else if(gameActive && currentTurn==='ia'){ let btn=document.createElement('button'); btn.textContent='🤖 IA...'; btn.disabled=true; btn.className='nim-btn'; ctrl.appendChild(btn); }
}
function iaMoveNim(){
    if(!gameActive || currentTurn!=='ia') return;
    let best=null, target=nimMin+nimMax;
    for(let i=nimMin; i<=Math.min(nimMax,nimValue); i++) if((nimValue-i)%target===0){ best=i; break; }
    if(!best) best=Math.min(nimMax,nimValue);
    setTimeout(()=>{
        if(gameActive && currentTurn==='ia'){ 
            nimValue-=best; renderNim(); 
            if(nimValue===0){ document.getElementById('nim-msg').innerHTML='🤖 Ganó IA'; gameActive=false; addResult('ia'); return; } 
            currentTurn='user'; document.getElementById('nim-msg').innerHTML='🎯 Tu turno'; renderNim(); 
        }
    },400);
}
function startNim(first){
    gameActive=true; currentTurn=first==='user'?'user':'ia';
    renderNim();
    if(currentTurn==='user') document.getElementById('nim-msg').innerHTML='🎯 Tu turno';
    else{ document.getElementById('nim-msg').innerHTML='🤖 Turno IA...'; iaMoveNim(); }
}
function applyNim(){
    nimValue=parseInt(document.getElementById('nim-start').value)||100;
    nimMin=parseInt(document.getElementById('nim-min').value)||1;
    nimMax=parseInt(document.getElementById('nim-max').value)||10;
    resetNim();
}
function resetNim(){
    document.getElementById('user-first').style.display = 'inline-block';
    document.getElementById('ia-first').style.display = 'inline-block';
    nimValue=parseInt(document.getElementById('nim-start').value)||100;
    showModal('🎲 NIM - ¿Quién empieza?',()=>startNim('user'),()=>startNim('ia'),'');
}

// ==================== JUEGO 3: SUMAR 15 ====================
function checkSum15(n){
    for(let i=0;i<n.length;i++) for(let j=i+1;j<n.length;j++) for(let k=j+1;k<n.length;k++) if(n[i]+n[j]+n[k]===15) return true;
    return false;
}
function renderSuma(){
    let g=document.getElementById('suma-numbers'); g.innerHTML='';
    for(let i=1;i<=9;i++){
        let d=document.createElement('div'); d.className='number';
        if(!available.includes(i)) d.classList.add('used');
        else if(!gameActive || currentTurn!=='user') d.classList.add('disabled');
        d.textContent=i;
        if(gameActive && currentTurn==='user' && available.includes(i)) d.onclick=()=>handleSumaClick(i);
        g.appendChild(d);
    }
    document.getElementById('user-nums').innerHTML=userNums.length?userNums.sort((a,b)=>a-b).join(','):'-';
    document.getElementById('ia-nums').innerHTML=iaNums.length?iaNums.sort((a,b)=>a-b).join(','):'-';
}
function handleSumaClick(num){
    if(!gameActive || currentTurn!=='user' || !available.includes(num)) return;
    userNums.push(num); available=available.filter(n=>n!==num); renderSuma();
    if(checkSum15(userNums)){ document.getElementById('suma-msg').innerHTML='🎉 Ganaste'; gameActive=false; addResult('user'); return; }
    if(available.length===0){ document.getElementById('suma-msg').innerHTML='🤝 Empate'; gameActive=false; addResult('draw'); return; }
    currentTurn='ia'; document.getElementById('suma-msg').innerHTML='🤖 Turno IA...'; renderSuma();
    setTimeout(iaMoveSuma,500);
}
function iaMoveSuma(){
    if(!gameActive || currentTurn!=='ia') return;
    let move=null;
    for(let n of available) if(checkSum15([...iaNums,n])){ move=n; break; }
    if(!move) for(let n of available) if(checkSum15([...userNums,n])){ move=n; break; }
    if(!move && available.includes(5)) move=5;
    if(!move) move=available[Math.floor(Math.random()*available.length)];
    if(move){
        iaNums.push(move); available=available.filter(n=>n!==move); renderSuma();
        if(checkSum15(iaNums)){ document.getElementById('suma-msg').innerHTML='🤖 Ganó IA'; gameActive=false; addResult('ia'); return; }
        if(available.length===0){ document.getElementById('suma-msg').innerHTML='🤝 Empate'; gameActive=false; addResult('draw'); return; }
        currentTurn='user'; document.getElementById('suma-msg').innerHTML='🎯 Tu turno'; renderSuma();
    }
}
function startSuma(first){
    available=[1,2,3,4,5,6,7,8,9]; userNums=[]; iaNums=[]; gameActive=true;
    currentTurn=first==='user'?'user':'ia'; renderSuma();
    if(currentTurn==='user') document.getElementById('suma-msg').innerHTML='🎯 Tu turno';
    else{ document.getElementById('suma-msg').innerHTML='🤖 Turno IA...'; iaMoveSuma(); }
}
function resetSuma(){ 
    document.getElementById('user-first').style.display = 'inline-block';
    document.getElementById('ia-first').style.display = 'inline-block';
    showModal('🔢 Sumar 15 - ¿Quién empieza?',()=>startSuma('user'),()=>startSuma('ia'),''); 
}