import * as T from './vendor/three.module.js';
import {Spring} from './physics.js';
import {characters} from './characters.js';
const requested=new URLSearchParams(location.search).get('c');
const spec=characters.find(c=>c.id===requested&&c.id!=='liuliu')||characters[1];
document.title=spec.name;document.body.dataset.character=spec.id;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const canvas=document.querySelector('canvas'),renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.1,30);
scene.add(new T.HemisphereLight(0xffffff,0xc6bcc7,1.8));
const light=new T.DirectionalLight(0xfffcf0,2);light.position.set(-3,5,6);scene.add(light);
const fill=new T.DirectionalLight(0xe1ebff,.6);fill.position.set(4,2,3);scene.add(fill);
const root=new T.Group();scene.add(root);const parts={},eyes=[];
function material(color){return new T.MeshPhysicalMaterial({color,roughness:.28,metalness:0,clearcoat:.75,clearcoatRoughness:.22,specularIntensity:.35});}
const mats={red:material('#ff624d'),blue:material('#0058e5'),yellow:material('#ffda36'),purple:material('#b19aee'),deep:material('#673bc4'),green:material('#839a3f'),moss:material('#457846'),pink:material('#f2a0bf'),salmon:material('#ff835c'),lime:material('#dcee31'),white:material('#fff8e9'),black:material('#151918')};
function shape(commands){const s=new T.Shape();for(const [op,...p] of commands)s[op](...p);return s;}
function mesh(s,mat,parent=root,depth=.25){const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:8,steps:1,bevelSize:.085,bevelThickness:.085,curveSegments:48});g.translate(0,0,-depth/2);const pos=g.attributes.position,norm=g.attributes.normal,sums=new Map();for(let i=0;i<pos.count;i++){const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>Math.round(v*10000)).join(',');const sum=sums.get(key)||new T.Vector3();sum.add(new T.Vector3(norm.getX(i),norm.getY(i),norm.getZ(i)));sums.set(key,sum);}for(let i=0;i<pos.count;i++){const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>Math.round(v*10000)).join(',');const n=sums.get(key).clone().normalize();norm.setXYZ(i,n.x,n.y,n.z);}const m=new T.Mesh(g,mat);parent.add(m);return m;}
function oval(x,y,sx,sy,mat,parent=root,z=.27){const m=new T.Mesh(new T.SphereGeometry(1,36,24),mat);m.position.set(x,y,z);m.scale.set(sx,sy,.085);parent.add(m);return m;}
function eye(x,y,{parent=root,size=.105,white=true,sleep=false}={}){const g=new T.Group();g.position.set(x,y,.32);parent.add(g);if(white)oval(0,0,size,size*1.25,mats.white,g,0);const p=oval(white?.026:0,0,size*.53,sleep?size*.22:size*.78,mats.black,g,.078);eyes.push({g,p,baseX:p.position.x});return g;}
function stroke(points,mat,width=.07,parent=root,z=.3){const p=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,z)));const m=new T.Mesh(new T.TubeGeometry(p,48,width,12,false),mat);parent.add(m);return m;}
function blob(commands,mat,parent=root){return mesh(shape(commands),mat,parent);}
const M='moveTo',L='lineTo',C='bezierCurveTo',Q='quadraticCurveTo';
if(spec.id==='huanhuan'){
 parts.fold=new T.Group();root.add(parts.fold);
 blob([[M,-1.1,-.45],[C,-1.22,-.8,-.72,-.83,-.49,-.52],[C,-.27,-.91,.08,-.92,.29,-.52],[C,.55,-.87,.97,-.65,1.02,-.27],[C,1.21,.75,.8,.9,.51,.52],[L,.23,.82],[C,-.1,1.01,-.31,.74,-.38,.53],[C,-.67,1,-.96,.78,-1.1,-.45]],mats.red,parts.fold);
 blob([[M,-.87,-.46],[Q,-.72,.93,-.48,.42],[L,-.32,-.58],[Q,-.45,-.69,-.6,-.39],[L,-.87,-.46]],mats.purple,parts.fold).position.z=.17;
 blob([[M,.1,.52],[Q,.28,.98,.37,.33],[L,.65,-.47],[Q,.6,-.59,.37,-.39],[L,.1,.52]],mats.purple,parts.fold).position.z=.18;
 eye(-.05,-.17,{parent:parts.fold,size:.14,sleep:true});
}else if(spec.id==='duoduo'){
 parts.face=new T.Group();root.add(parts.face);oval(-.05,-.57,.46,.23,mats.yellow,parts.face,.23);eye(-.22,-.53,{parent:parts.face});eye(.12,-.53,{parent:parts.face});
 parts.cover=blob([[M,-1.03,-.63],[C,-1.2,-.79,-.75,-.86,-.62,-.68],[C,-.48,-.42,-.25,-.32,-.03,-.4],[C,.32,-.42,.44,-.7,.7,-.73],[C,1.15,-.92,1.2,-.67,.99,-.59],[C,.86,-.28,.94,.85,.11,1],[C,-.79,1.06,-.98,.2,-1.03,-.63]],mats.blue);parts.cover.position.z=-.02;
 parts.hand=new T.Group();parts.hand.position.set(.43,-.39,.4);root.add(parts.hand);oval(0,0,.14,.13,mats.yellow,parts.hand,0);for(let i=0;i<3;i++)oval(-.09+i*.08,.1,.04,.08,mats.yellow,parts.hand,0);
}else if(spec.id==='pianpian'){
 parts.foot=oval(.4,-.72,.52,.19,mats.pink,root,.03);
 parts.lean=new T.Group();root.add(parts.lean);
 blob([[M,-.36,-.77],[C,-.98,-.82,-.44,-.32,-.61,.09],[C,-1,.74,-.46,1.13,.02,.79],[C,.41,.5,.48,-.18,.2,-.49],[Q,-.02,-.76,-.36,-.77]],mats.green,parts.lean);
 eye(-.48,.39,{parent:parts.lean,size:.105});eye(-.1,.58,{parent:parts.lean,size:.13});stroke([[-.22,.82],[.04,.78]],mats.black,.018,parts.lean);
}else if(spec.id==='kongkong'){
 const s=new T.Shape();s.absellipse(0,0,.87,.89,0,Math.PI*2,false);s.closePath();const hole=new T.Path();hole.absellipse(-.03,-.06,.4,.42,0,Math.PI*2,true);hole.closePath();s.holes.push(hole);parts.ring=mesh(s,mats.purple);eye(-.16,.61,{white:false,size:.09});eye(.16,.61,{white:false,size:.09});
 parts.hand=new T.Group();root.add(parts.hand);oval(.56,-.48,.25,.21,mats.lime,parts.hand,.34);for(let i=0;i<3;i++)oval(.38,-.31-i*.16,.12,.09,mats.lime,parts.hand,.35);
}else if(spec.id==='chengcheng'){
 parts.arch=new T.Group();root.add(parts.arch);
 blob([[M,-1,-.58],[C,-1.13,-.94,-.58,-.89,-.38,-.63],[Q,0,-.03,.38,-.63],[C,.61,-.89,1.11,-.86,1,-.55],[C,.76,.7,.36,1.12,-.2,.91],[C,-.59,.75,-.9,.24,-1,-.58]],mats.yellow,parts.arch);
 blob([[M,-.95,-.1],[Q,-.17,.47,.8,-.22],[L,.93,-.47],[Q,-.07,.18,-1,-.34],[L,-.95,-.1]],mats.blue,parts.arch,.1).position.z=.17;
 eye(-.23,.48,{parent:parts.arch,white:false});eye(.17,.48,{parent:parts.arch,white:false});stroke([[-.35,.69],[-.24,.74]],mats.black,.022,parts.arch);stroke([[.2,.73],[.32,.66]],mats.black,.022,parts.arch);oval(-.69,-.08,.17,.15,mats.blue,parts.arch,.4);
}else if(spec.id==='raorao'){
 parts.loop=new T.Group();root.add(parts.loop);
 const s=shape([[M,-.51,1],[C,-.91,.42,-1,-.64,-.42,-.87],[C,.05,-1.05,.85,-.74,.66,-.21],[C,.61,.04,.33,.19,.15,.36],[C,.89,.15,.98,.78,.39,.9],[C,.11,1,-.1,.81,-.23,.67],[L,-.36,1.05],[Q,-.46,1.16,-.51,1]]);const h=new T.Path();h.moveTo(-.18,.07);h.bezierCurveTo(-.4,-.07,-.47,-.49,-.1,-.5);h.bezierCurveTo(.24,-.45,.13,-.14,-.18,.07);s.holes.push(h);mesh(s,mats.deep,parts.loop);
 oval(.34,.61,.31,.23,mats.salmon,parts.loop,.3);eye(.18,.58,{parent:parts.loop});eye(.48,.68,{parent:parts.loop});stroke([[-.42,.62],[-.62,.19],[-.47,-.09],[-.57,-.42],[-.2,-.64],[.02,-.84]],mats.salmon,.042,parts.loop);
}else if(spec.id==='dundun'){
 parts.low=new T.Group();root.add(parts.low);
 blob([[M,-1.05,-.47],[C,-1.02,-.08,-.68,.43,-.45,.53],[Q,-.2,.65,.77,.79],[C,1.01,.8,1.03,.19,1.15,-.4],[Q,1.2,-.64,.88,-.65],[Q,-.66,-.71,-.94,-.62],[Q,-1.1,-.57,-1.05,-.47]],mats.moss,parts.low);
 blob([[M,-.08,.62],[Q,-.26,.48,.1,.26],[Q,.53,-.01,1.02,-.12],[Q,1.13,-.16,1.05,.08],[L,.91,.63],[Q,.88,.81,.7,.75],[L,-.08,.62]],mats.yellow,parts.low).position.z=.14;
 eye(-.33,-.45,{parent:parts.low,white:false,sleep:true,size:.13});eye(.27,-.45,{parent:parts.low,white:false,sleep:true,size:.13});oval(.72,-.38,.2,.11,mats.pink,parts.low,.34).rotation.z=.35;
}else if(spec.id==='fanfan'){
 parts.page=new T.Group();root.add(parts.page);
 blob([[M,-.85,-.7],[Q,-1,-.63,-.87,-.25],[L,-.7,.65],[Q,-.65,.85,-.42,.82],[L,.7,.95],[Q,.91,.97,.94,.66],[L,1,-.52],[Q,1,-.75,.72,-.77],[L,-.85,-.7]],mats.red,parts.page);
 eye(-.37,-.01,{parent:parts.page});eye(.35,.45,{parent:parts.page});
 parts.flap=blob([[M,-.84,-.02],[Q,-.88,.06,-.76,.67],[Q,-.72,.81,-.46,.8],[L,.55,.91],[Q,.04,.15,-.84,-.02]],mats.purple,parts.page);parts.flap.position.z=.18;
}else if(spec.id==='kaokao'){
 parts.tall=new T.Group();parts.small=new T.Group();root.add(parts.tall,parts.small);
 blob([[M,-.95,-.7],[C,-1.14,-.77,-1.06,-.37,-.92,.05],[C,-.86,.85,-.44,1.06,-.15,.74],[C,.05,.52,-.16,.2,-.13,-.06],[C,.27,-.61,-.04,-.8,-.49,-.78],[L,-.95,-.7]],mats.blue,parts.tall);
 blob([[M,.03,-.71],[C,-.12,-.64,.21,-.3,.01,.01],[C,-.25,.54,.38,.71,.58,.34],[C,.72,.01,.88,-.25,1,-.52],[Q,1.08,-.79,.7,-.76],[L,.03,-.71]],mats.salmon,parts.small);
 eye(-.44,.51,{parent:parts.tall});eye(.4,.04,{parent:parts.small,white:false,sleep:true});
}
root.rotation.y=-.12;root.rotation.x=.04;
const bubble=document.createElement('div');bubble.className='speech-bubble';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');document.querySelector('main').append(bubble);
const squash=new Spring(),sway=new Spring();let time=0,last=performance.now(),actionAt=0,action=0,line=0,timer;const pointer=new T.Vector2(),gaze=new T.Vector2();
function tap(){actionAt=time;action++;canvas.dataset.interactions=String(action);bubble.textContent=spec.lines[line++%spec.lines.length];bubble.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>bubble.classList.remove('show'),4500);if(spec.id!=='dundun')squash.kick(4);sway.kick((action%2?1:-1)*1.4);}
function aim(e){pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);}
addEventListener('pointermove',aim);canvas.addEventListener('pointerdown',e=>{aim(e);tap();});canvas.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();tap();}});
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.position.set(0,.07,Math.max(5.6,4.8/camera.aspect));camera.lookAt(0,0,0);camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
const originals=[];root.traverse(o=>{if(o.isMesh&&o.geometry.type==='ExtrudeGeometry')originals.push([o,Float32Array.from(o.geometry.attributes.position.array)]);});
function render(now){requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.033);last=now;if(document.hidden)return;time+=dt;const age=time-actionAt;const wave=reduced?0:Math.sin(age*10)*Math.exp(-age*2.2),idle=reduced?0:Math.sin(time*1.6)*.014;
 if(spec.id==='dundun'&&age>.38&&age<.38+dt)squash.kick(4);
 const q=squash.step(dt),r=sway.step(dt);root.scale.set(1+q*.25,1-q*.35+idle,1+q*.1);root.rotation.z=r*.15;root.rotation.y=-.12+gaze.x*.08;gaze.lerp(pointer,1-Math.exp(-dt*8));
 if(parts.fold)parts.fold.scale.x=1+wave*.13;
 if(parts.cover){parts.cover.position.y=-Math.max(0,wave)*.18;parts.face.position.y=Math.max(0,wave)*.12;parts.hand.rotation.z=wave*.4;}
 if(parts.lean)parts.lean.rotation.z=.07+wave*.3;
 if(parts.ring){parts.ring.scale.set(1+wave*.13,1-wave*.13,1);parts.hand.rotation.z=wave*.25;}
 if(parts.arch)parts.arch.position.y=-Math.abs(wave)*.12;
 if(parts.loop){parts.loop.rotation.y=wave*.5;parts.loop.rotation.z=wave*.16;}
 if(parts.low)parts.low.rotation.z=wave*.025;
 if(parts.flap){parts.flap.rotation.y=Math.max(0,wave)*.65;parts.flap.position.z=.18+Math.max(0,wave)*.14;}
 if(parts.tall){parts.tall.rotation.z=-Math.max(0,wave)*.12;parts.small.rotation.z=Math.max(0,wave)*.14;}
 for(const [m,base] of originals){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i]=base[i]+Math.sin(base[i+1]*4+time*9)*q*.018;a[i+1]=base[i+1];a[i+2]=base[i+2]+Math.cos(base[i]*3+time*8)*q*.022;}m.geometry.attributes.position.needsUpdate=true;}
 const blink=reduced?1:(time%5>4.8?Math.max(.08,Math.abs(Math.cos((time%5-4.8)*Math.PI/.2))):1);eyes.forEach(({g,p,baseX})=>{g.scale.y=blink;p.position.x=baseX+gaze.x*.025;p.position.y=gaze.y*.02;});renderer.render(scene,camera);canvas.dataset.ready='true';canvas.dataset.gaze=gaze.x.toFixed(2);
}requestAnimationFrame(render);
