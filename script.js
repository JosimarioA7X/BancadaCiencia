'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let DATA = {metrics:{materials:0,collections:0,labs:6},catalog:[],games:[],teacher_resources:[],details:{}};
let shown = 16;

const fallback = {
  metrics:{materials:12,collections:8,labs:6},
  catalog:[
    {id:1,title:'Gravidade nos planetas',category:'Física',type:'Atividade',status:'Material didático'},
    {id:2,title:'Massa molecular',category:'Química',type:'Jogo',status:'Desafio em equipe'},
    {id:3,title:'Propriedades físicas dos minerais',category:'Geociências',type:'Atividade',status:'Ficha de identificação'},
    {id:4,title:'Observação astronômica',category:'Astronomia',type:'Atividade',status:'Roteiro de observação'},
    {id:5,title:'Teremin virtual',category:'Som e Ondas',type:'Simulador',status:'Experiência interativa'},
    {id:6,title:'Mistura de luz RGB',category:'Luz e Óptica',type:'Simulador',status:'Experiência interativa'},
    {id:7,title:'Sensor ultrassônico',category:'Arduino',type:'Projeto',status:'Atividade maker'},
    {id:8,title:'Ecossistemas e plantas',category:'Ecologia',type:'Atividade',status:'Sequência didática'},
    {id:9,title:'Pressão em líquidos',category:'Pressão',type:'Simulador',status:'Experiência interativa'},
    {id:10,title:'Kit de experiências',category:'Kits e Laboratório',type:'Kit',status:'Montagem prática'},
    {id:11,title:'Plano de aula interdisciplinar',category:'Para Professores',type:'Plano de aula',status:'Recurso docente'},
    {id:12,title:'Quiz de ciências',category:'Jogos e Desafios',type:'Jogo',status:'Atividade lúdica'}
  ],
  games:[{title:'Quiz de Ciências',category:'Jogos e Desafios',type:'Jogo'},{title:'Arquivo Jedi',category:'Matemática',type:'Desafio'}],
  teacher_resources:[{title:'Plano de aula interdisciplinar',category:'Para Professores',type:'Plano de aula'},{title:'Sequência didática de astronomia',category:'Astronomia',type:'Sequência didática'}],
  details:{'1':{title:'Gravidade nos planetas',summary:'Atividade para calcular a aceleração da gravidade.',area:'Física',type:'Atividade'}}
};

fetch('portal.json').then(r=>{if(!r.ok) throw new Error('Catálogo indisponível'); return r.json();}).then(d=>{DATA=d;setStatus(`Catálogo carregado: ${d.catalog?.length||0} materiais.`);init();}).catch(()=>{DATA=fallback;setStatus('Modo de demonstração ativo. No GitHub Pages, o catálogo completo será carregado automaticamente.');init();});

function setStatus(text){const e=$('#dataStatus'); if(e)e.textContent=text;}
function init(){
  DATA.catalog ||= []; DATA.games ||= []; DATA.teacher_resources ||= []; DATA.details ||= {};
  const m=DATA.metrics||{};
  $('#impactMaterials').textContent=(m.materials||DATA.catalog.length)+'+';
  $('#impactCollections').textContent=m.collections||new Set(DATA.catalog.map(x=>x.category)).size;
  $('#impactLabs').textContent=m.labs||6;
  renderAreas(); renderGames(); renderKits(); renderTeacher(); fillLibrary(); renderLibrary(); bindUI();
}
const areaInfo=[['Astronomia','🔭','#00cfff'],['Física','⚛','#198cff'],['Química','⚗','#ffb020'],['Biologia','🧬','#48df7a'],['Arduino','▣','#ffad18'],['Matemática','📐','#9b5cff'],['Ecologia','🌱','#64e948'],['Luz e Óptica','💡','#ffd52b'],['Som e Ondas','〰','#ff5bd1'],['Água','💧','#32baff'],['Eletricidade','⚡','#ffdd2f'],['Pressão','◉','#40bfff'],['Jogos e Desafios','🎮','#ff649e'],['Para Professores','🎓','#bd70ff']];
function renderAreas(){const counts={};DATA.catalog.forEach(x=>counts[x.category]=(counts[x.category]||0)+1);$('#areaGrid').innerHTML=areaInfo.map(([n,i,c])=>`<a class="area-card" style="--accent:${c}" href="#biblioteca" data-area="${esc(n)}"><div class="area-icon">${i}</div><b>${esc(n)}</b><small>${counts[n]||0} atividades</small></a>`).join('');$$('[data-area]').forEach(a=>a.addEventListener('click',()=>{$('#libraryCategory').value=a.dataset.area;shown=16;renderLibrary();}));}
function renderGames(){const list=DATA.games.length?DATA.games:DATA.catalog.filter(x=>/jogo|quiz|desafio/i.test(`${x.type} ${x.title}`)).slice(0,12);$('#gameGrid').innerHTML=list.map(card).join('')||'<p>Nenhum jogo catalogado.</p>';}
function renderKits(){const list=DATA.catalog.filter(x=>x.category==='Kits e Laboratório'||/kit|projeto|experimento/i.test(`${x.title} ${x.type}`)).slice(0,12);$('#kitGrid').innerHTML=list.map(card).join('')||'<p>Nenhum kit catalogado.</p>';}
function card(x){return `<article class="small-card"><span>${esc(x.category||'Ciência')}</span><b>${esc(x.title)}</b><small>${esc(x.type||'Material')}</small></article>`;}
function renderTeacher(){const sel=$('#teacherType');[...new Set(DATA.teacher_resources.map(x=>x.type).filter(Boolean))].sort().forEach(x=>sel.insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));filterTeacher();}
function filterTeacher(){const q=$('#teacherSearch').value.toLowerCase(),t=$('#teacherType').value;const list=DATA.teacher_resources.filter(x=>(!q||x.title.toLowerCase().includes(q))&&(!t||x.type===t));$('#teacherGrid').innerHTML=list.map(card).join('')||'<p>Nenhum recurso encontrado.</p>';}
function fillLibrary(){const c=$('#libraryCategory'),t=$('#libraryType');[...new Set(DATA.catalog.map(x=>x.category).filter(Boolean))].sort().forEach(x=>c.insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));[...new Set(DATA.catalog.map(x=>x.type).filter(Boolean))].sort().forEach(x=>t.insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));}
function filtered(){const q=$('#librarySearch').value.toLowerCase(),c=$('#libraryCategory').value,t=$('#libraryType').value;return DATA.catalog.filter(x=>(!q||`${x.title} ${x.category} ${x.type}`.toLowerCase().includes(q))&&(!c||x.category===c)&&(!t||x.type===t));}
function renderLibrary(){const list=filtered();$('#libraryCount').textContent=`${list.length} material(is) encontrado(s)`;$('#libraryGrid').innerHTML=list.slice(0,shown).map(x=>`<article class="library-card"><span>${esc(x.category||'Ciência')} • ${esc(x.type||'Material')}</span><h3>${esc(x.title)}</h3><p>${esc(x.status||'Material catalogado no acervo.')}</p><button data-material="${esc(String(x.id))}">Ver registro →</button></article>`).join('')||'<p>Nenhum material encontrado.</p>';$('#loadMore').style.display=list.length>shown?'block':'none';$$('[data-material]').forEach(b=>b.onclick=()=>openMaterial(DATA.details[String(b.dataset.material)]||DATA.catalog.find(x=>String(x.id)===b.dataset.material)));}
function openMaterial(x){if(!x)return;$('#drawerContent').innerHTML=`<h2>${esc(x.title)}</h2><p>${esc(x.summary||x.status||'Material catalogado no acervo.')}</p><p><b>Área:</b> ${esc(x.area||x.category||'Não informada')}</p><p><b>Tipo:</b> ${esc(x.type||'Material')}</p>${x.source?`<p><b>Arquivo:</b> ${esc(x.source)}</p>`:''}`;$('#drawer').classList.add('open');}
function bindUI(){
  $$('[data-close]').forEach(x=>x.onclick=()=>$('#drawer').classList.remove('open'));
  $('#teacherSearch').oninput=filterTeacher; $('#teacherType').onchange=filterTeacher;
  $('#librarySearch').oninput=()=>{shown=16;renderLibrary()};
  $('#libraryCategory').onchange=$('#libraryType').onchange=()=>{shown=16;renderLibrary()};
  $('#loadMore').onclick=()=>{shown+=16;renderLibrary()};
  $('#globalSearch').oninput=e=>{$('#librarySearch').value=e.target.value;location.hash='biblioteca';shown=16;renderLibrary()};
  $('#themeToggle').onclick=()=>document.body.classList.toggle('light');
  $$('[data-lab]').forEach(b=>b.onclick=()=>openLab(b.dataset.lab));
  $$('[data-lab-close]').forEach(b=>b.onclick=()=>$('#labModal').classList.remove('open'));
  const jd=$('#judithDialog'); const open=()=>jd.classList.add('open'); const close=()=>jd.classList.remove('open');
  $('#judithFab').onclick=open; $('#openJudith').onclick=open; $$('[data-judith-close]').forEach(x=>x.onclick=close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();$('#drawer').classList.remove('open');$('#labModal').classList.remove('open');}});
}
function openLab(id){$('#labModal').classList.add('open');({telescopio:labTelescope,teremin:labTheremin,pressao:labPressure,rgb:labRGB,jedi:labJedi,sensor:labSensor}[id]||labTelescope)();}
function head(t,p){return `<h2>${t}</h2><p>${p}</p>`;}
function labTelescope(){$('#labContent').innerHTML=head('Telescópio Virtual','Ajuste altitude e azimute para centralizar o objeto.')+`<div class="virtual-grid"><div class="sim-panel"><div class="stage"><div class="target" id="target"></div><div class="scope"></div></div></div><div class="sim-panel"><div class="control"><label>Azimute <output id="azO">180°</output></label><input id="az" type="range" min="0" max="360" value="180"></div><div class="control"><label>Altitude <output id="alO">45°</output></label><input id="al" type="range" min="0" max="90" value="45"></div><div class="readout" id="read">Ajuste o telescópio.</div></div></div>`;let a=$('#az'),l=$('#al'),t=$('#target');function u(){let av=+a.value,lv=+l.value;$('#azO').textContent=av+'°';$('#alO').textContent=lv+'°';t.style.left=(4+av/360*92)+'%';t.style.top=(5+(90-lv)/90*85)+'%';$('#read').textContent=Math.hypot(av-180,lv-45)<12?'Objeto centralizado!':'Continue ajustando.';}a.oninput=l.oninput=u;u();}
function labTheremin(){$('#labContent').innerHTML=head('Teremin Virtual','Mova o cursor para controlar frequência e volume.')+`<div class="virtual-grid"><div class="stage" id="theremin" style="background:linear-gradient(145deg,#150522,#4f1761)"><div class="dot" id="dot" style="left:50%;top:50%"></div></div><div class="sim-panel"><div class="readout">Frequência: <b id="freq">440</b> Hz<br>Volume: <b id="vol">50</b>%</div></div></div>`;let p=$('#theremin'),d=$('#dot');p.onpointermove=e=>{let r=p.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;d.style.left=x*100+'%';d.style.top=y*100+'%';$('#freq').textContent=Math.round(110+x*880);$('#vol').textContent=Math.round((1-y)*100);};}
function labPressure(){$('#labContent').innerHTML=head('Coluna de Líquido','Calcule a pressão usando P = ρgh.')+`<div class="virtual-grid"><div class="tank"><div class="water-fill" id="wf"></div></div><div class="sim-panel"><div class="control"><label>Profundidade <output id="do">5 m</output></label><input id="d" type="range" min="0" max="10" step=".1" value="5"></div><div class="control"><label>Densidade <output id="ro">1000</output></label><input id="rho" type="range" min="700" max="1400" value="1000"></div><div class="readout">Pressão: <b id="po">49050 Pa</b></div></div></div>`;let d=$('#d'),r=$('#rho');function u(){let p=+d.value*+r.value*9.81;$('#do').textContent=d.value+' m';$('#ro').textContent=r.value;$('#po').textContent=Math.round(p)+' Pa';$('#wf').style.height=(20+d.value*7.5)+'%';}d.oninput=r.oninput=u;u();}
function labRGB(){$('#labContent').innerHTML=head('Mistura RGB','Combine os canais de luz.')+`<div class="virtual-grid"><div class="rgb-stage"><div class="rgb-circle red"></div><div class="rgb-circle green"></div><div class="rgb-circle blue"></div></div><div class="sim-panel"><div class="control"><label>Vermelho <output id="rv">255</output></label><input id="r" type="range" min="0" max="255" value="255"></div><div class="control"><label>Verde <output id="gv">255</output></label><input id="g" type="range" min="0" max="255" value="255"></div><div class="control"><label>Azul <output id="bv">255</output></label><input id="b" type="range" min="0" max="255" value="255"></div></div></div>`;['r','g','b'].forEach(i=>$('#'+i).oninput=e=>$('#'+i+'v').textContent=e.target.value);}
function labJedi(){let tx=Math.ceil(Math.random()*8),ty=Math.ceil(Math.random()*8);$('#labContent').innerHTML=head('Arquivo Jedi','Encontre o alvo oculto.')+`<div class="virtual-grid"><div class="stage"><div class="grid-lines"></div><div class="jpoint known" style="left:20%;top:70%"></div><div class="jpoint guess" id="guess"></div></div><div class="sim-panel"><div class="control"><label>X <output id="xo">5</output></label><input id="x" type="range" min="1" max="8" value="5"></div><div class="control"><label>Y <output id="yo">5</output></label><input id="y" type="range" min="1" max="8" value="5"></div><button id="check">Verificar</button><div class="readout" id="jr"></div></div></div>`;let x=$('#x'),y=$('#y'),g=$('#guess');function u(){g.style.left=+x.value/9*100+'%';g.style.top=(9-+y.value)/9*100+'%';$('#xo').textContent=x.value;$('#yo').textContent=y.value;}x.oninput=y.oninput=u;u();$('#check').onclick=()=>$('#jr').textContent=(+x.value===tx&&+y.value===ty)?'Missão concluída!':'Ainda não. Continue tentando.';}
function labSensor(){$('#labContent').innerHTML=head('Sensor Ultrassônico','Observe distância e tempo de retorno.')+`<div class="virtual-grid"><div class="stage" style="background:#eaf3f8"><div class="sensor-unit"></div><div class="pulse" id="pulse"></div><div class="sensor-object" id="obj"></div></div><div class="sim-panel"><div class="control"><label>Distância <output id="sd">100 cm</output></label><input id="dist" type="range" min="5" max="300" value="100"></div><div class="readout">Tempo: <b id="tm">5.83 ms</b></div></div></div>`;let d=$('#dist'),o=$('#obj'),p=$('#pulse');function u(){let pct=(d.value-5)/295;$('#sd').textContent=d.value+' cm';$('#tm').textContent=(d.value/100*2/343*1000).toFixed(2)+' ms';o.style.left=(20+pct*65)+'%';p.style.width=(10+pct*65)+'%';}d.oninput=u;u();}
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
