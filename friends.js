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
const mats={red:material('#ff321d'),blue:material('#0058e5'),yellow:material('#ffda36'),purple:material('#b19aee'),deep:material('#673bc4'),green:material('#829e35'),moss:material('#457846'),pink:material('#f2a0bf'),salmon:material('#ff835c'),lime:material('#dcee31'),white:material('#fff8e9'),black:material('#151918')};
function shape(commands){const s=new T.Shape();for(const [op,...p] of commands)s[op](...p);return s;}
function mesh(s,mat,parent=root,depth=.25){const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:8,steps:1,bevelSize:Math.min(.065,depth*.28),bevelThickness:Math.min(.065,depth*.28),curveSegments:48});g.translate(0,0,-depth/2);const pos=g.attributes.position,norm=g.attributes.normal,sums=new Map();for(let i=0;i<pos.count;i++){const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>Math.round(v*10000)).join(',');const sum=sums.get(key)||new T.Vector3();sum.add(new T.Vector3(norm.getX(i),norm.getY(i),norm.getZ(i)));sums.set(key,sum);}for(let i=0;i<pos.count;i++){const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>Math.round(v*10000)).join(',');const n=sums.get(key).clone().normalize();norm.setXYZ(i,n.x,n.y,n.z);}const m=new T.Mesh(g,mat);parent.add(m);return m;}
function oval(x,y,sx,sy,mat,parent=root,z=.27){const m=new T.Mesh(new T.SphereGeometry(1,36,24),mat);m.position.set(x,y,z);m.scale.set(sx,sy,.085);parent.add(m);return m;}
function eye(x,y,{parent=root,size=.105,white=true,sleep=false}={}){const g=new T.Group();g.position.set(x,y,.32);parent.add(g);if(white)oval(0,0,size,size*1.25,mats.white,g,0);const p=oval(white?.026:0,0,size*.53,sleep?size*.22:size*.78,mats.black,g,.078);eyes.push({g,p,baseX:p.position.x});return g;}
function stroke(points,mat,width=.07,parent=root,z=.3){const p=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,z)));const m=new T.Mesh(new T.TubeGeometry(p,48,width,12,false),mat);parent.add(m);return m;}
function blob(commands,mat,parent=root){return mesh(shape(commands),mat,parent);}
const M='moveTo',L='lineTo',C='bezierCurveTo',Q='quadraticCurveTo';
if(spec.id==='huanhuan'){
 parts.fold=new T.Group();root.add(parts.fold);
 blob([[M,-1.1,-.45],[C,-1.22,-.8,-.72,-.83,-.49,-.52],[C,-.27,-.91,.08,-.92,.29,-.52],[C,.55,-.87,.97,-.65,1.02,-.27],[C,1.21,.75,.8,.9,.51,.52],[L,.23,.82],[C,-.1,1.01,-.31,.74,-.38,.53],[C,-.67,1,-.96,.78,-1.1,-.45]],mats.red,parts.fold);
 mesh(shape([[M,-.9,-.51],[C,-.86,-.13,-.77,.48,-.64,.6],[C,-.49,.74,-.43,.35,-.41,.04],[L,-.35,-.61],[Q,-.35,-.71,-.43,-.63],[L,-.6,-.39],[L,-.83,-.57],[Q,-.91,-.64,-.9,-.51]]),mats.purple,parts.fold,.035).position.z=.205;
 mesh(shape([[M,.12,.5],[Q,.22,.78,.32,.55],[C,.44,.29,.5,-.12,.62,-.45],[Q,.67,-.62,.57,-.57],[L,.18,-.38],[Q,.12,.15,.12,.5]]),mats.purple,parts.fold,.035).position.z=.205;
 mesh(shape([[M,.85,-.52],[Q,.89,-.13,.98,.05],[Q,1.06,.16,1.06,-.02],[Q,1.01,-.34,.89,-.55],[Q,.84,-.59,.85,-.52]]),mats.purple,parts.fold,.035).position.z=.205;
 const sleepy=new T.Group();sleepy.position.set(-.05,-.3,.33);sleepy.rotation.z=.48;sleepy.scale.x=.68;parts.fold.add(sleepy);
 blob([[M,-.13,0],[Q,0,-.25,.13,0],[L,-.13,0]],mats.white,sleepy).scale.set(1,1,.2);
 blob([[M,-.015,0],[Q,.06,-.15,.13,0],[L,-.015,0]],mats.black,sleepy).position.z=.06;eyes.push({g:sleepy,p:new T.Group(),baseX:0,baseY:.68});
}else if(spec.id==='duoduo'){
 parts.face=new T.Group();root.add(parts.face);blob([[M,-.48,-.66],[C,-.63,-.24,-.12,-.12,.13,-.28],[C,.52,-.4,.53,-.76,.15,-.79],[Q,-.37,-.86,-.48,-.66]],mats.yellow,parts.face).position.z=.16;
 for(const x of [-.24,.1]){const g=eye(x,-.53,{parent:parts.face,size:.12});g.children[0].scale.y=.11;g.children[1].scale.set(.068,.068,.065);g.children[1].position.set(.035,.035,.078);}
 parts.cover=blob([[M,-1.03,-.63],[C,-1.2,-.79,-.75,-.86,-.62,-.68],[C,-.48,-.42,-.25,-.32,-.03,-.4],[C,.32,-.42,.44,-.7,.7,-.73],[C,1.15,-.92,1.2,-.67,.99,-.59],[C,.86,-.28,.94,.85,.11,1],[C,-.79,1.06,-.98,.2,-1.03,-.63]],mats.blue);parts.cover.position.z=-.02;
 parts.coverBase=Float32Array.from(parts.cover.geometry.attributes.position.array);
 parts.hand=new T.Group();parts.hand.position.set(.43,-.39,.4);root.add(parts.hand);oval(0,0,.14,.13,mats.yellow,parts.hand,0);for(let i=0;i<3;i++)oval(-.09+i*.08,.1,.04,.08,mats.yellow,parts.hand,0);
}else if(spec.id==='pianpian'){
 parts.foot=blob([[M,-.2,-.72],[Q,.13,-.53,.23,-.24],[Q,.3,-.66,.66,-.64],[C,1.02,-.63,1.07,-1.02,.65,-1.04],[Q,.19,-1.04,-.2,-.72]],mats.pink);parts.foot.position.z=-.08;
 parts.lean=new T.Group();root.add(parts.lean);parts.lean.scale.x=.82;
 blob([[M,-.36,-.77],[C,-.98,-.82,-.44,-.32,-.61,.09],[C,-1,.74,-.46,1.13,.02,.79],[C,.41,.5,.48,-.18,.2,-.49],[Q,-.02,-.76,-.36,-.77]],mats.green,parts.lean);
 for(const [x,y,size] of [[-.48,.39,.1],[-.1,.58,.12]]){const g=eye(x,y,{parent:parts.lean,size});g.children[0].scale.set(size/.82,size,.065);g.children[1].scale.set(size*.55/.82,size*.55,.065);}stroke([[-.22,.82],[.04,.78]],mats.black,.018,parts.lean);
}else if(spec.id==='kongkong'){
 parts.ring=new T.Mesh(new T.TorusGeometry(.65,.235,48,120),mats.purple);parts.ring.scale.y=1.02;root.add(parts.ring);eye(-.16,.61,{white:false,size:.09});eye(.16,.61,{white:false,size:.09});
 parts.hand=new T.Group();parts.hand.position.set(.56,-.48,.34);root.add(parts.hand);oval(0,0,.25,.21,mats.lime,parts.hand,0);for(let i=0;i<3;i++)oval(-.18,.17-i*.16,.12,.09,mats.lime,parts.hand,.01);
}else if(spec.id==='chengcheng'){
 parts.arch=new T.Group();root.add(parts.arch);
 blob([[M,-1,-.58],[C,-1.13,-.94,-.58,-.89,-.38,-.63],[Q,0,-.03,.38,-.63],[C,.61,-.89,1.11,-.86,1,-.55],[C,.76,.7,.36,1.12,-.2,.91],[C,-.59,.75,-.9,.24,-1,-.58]],mats.yellow,parts.arch);
 mesh(shape([[M,-.98,.01],[Q,-.18,.41,.94,-.31],[L,.99,-.48],[Q,-.1,.18,-1.03,-.21],[L,-.98,.01]]),mats.blue,parts.arch,.035).position.z=.18;
 eye(-.23,.48,{parent:parts.arch,white:false});eye(.17,.48,{parent:parts.arch,white:false});stroke([[-.35,.69],[-.24,.74]],mats.black,.022,parts.arch);stroke([[.2,.73],[.32,.66]],mats.black,.022,parts.arch);parts.supportHand=mesh(shape([[M,-.78,-.12],[Q,-.94,-.06,-.81,.06],[Q,-.78,.23,-.67,.11],[Q,-.55,.22,-.54,.06],[Q,-.44,.08,-.48,-.05],[Q,-.57,-.19,-.78,-.12]]),mats.blue,parts.arch,.04);parts.supportHand.position.z=.22;
}else if(spec.id==='raorao'){
 parts.loop=new T.Group();root.add(parts.loop);
 const s=shape([[M,-.51,1],[C,-.91,.42,-1,-.64,-.42,-.87],[C,.05,-1.05,.85,-.74,.66,-.21],[C,.61,.04,.33,.19,.15,.36],[C,.89,.15,.98,.78,.39,.9],[C,.11,1,-.1,.81,-.23,.67],[L,-.36,1.05],[Q,-.46,1.16,-.51,1]]);const h=new T.Path();h.moveTo(-.18,.07);h.bezierCurveTo(-.4,-.07,-.47,-.49,-.1,-.5);h.bezierCurveTo(.24,-.45,.13,-.14,-.18,.07);s.holes.push(h);mesh(s,mats.deep,parts.loop);
 oval(.34,.61,.31,.23,mats.salmon,parts.loop,.3);eye(.18,.58,{parent:parts.loop});eye(.48,.68,{parent:parts.loop});const curve=new T.CatmullRomCurve3([[-.42,.62],[-.62,.19],[-.47,-.09],[-.57,-.42],[-.2,-.64],[.02,-.84]].map(([x,y])=>new T.Vector3(x,y,.23)));const vs=[];
 for(let i=0;i<=120;i++){const pt=curve.getPoint(i/120),t=curve.getTangent(i/120);vs.push(pt.x-t.y*(.045*Math.sin(Math.PI*i/120)**.28),pt.y+t.x*(.045*Math.sin(Math.PI*i/120)**.28),.23,pt.x+t.y*(.045*Math.sin(Math.PI*i/120)**.28),pt.y-t.x*(.045*Math.sin(Math.PI*i/120)**.28),.23);}const indices=[];for(let i=0;i<120;i++){let j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vs,3));geo.setIndex(indices);geo.computeVertexNormals();parts.threadBase=Float32Array.from(geo.attributes.position.array);parts.thread=new T.Mesh(geo,mats.salmon);parts.loop.add(parts.thread);
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
 parts.tall=new T.Group();parts.small=new T.Group();parts.small.position.z=.15;root.add(parts.tall,parts.small);
 blob([[M,-.95,-.7],[C,-1.14,-.77,-1.06,-.37,-.92,.05],[C,-.86,.85,-.44,1.06,-.15,.74],[C,.05,.52,-.16,.2,-.13,-.06],[C,.27,-.61,-.04,-.8,-.49,-.78],[L,-.95,-.7]],mats.blue,parts.tall);
 blob([[M,.03,-.71],[C,-.12,-.64,.21,-.3,.01,.01],[C,-.25,.54,.38,.71,.58,.34],[C,.72,.01,.88,-.25,1,-.52],[Q,1.08,-.79,.7,-.76],[L,.03,-.71]],mats.salmon,parts.small);
 eye(-.44,.51,{parent:parts.tall});eye(.4,.04,{parent:parts.small,white:false,sleep:true});
}
root.rotation.y=-.12;root.rotation.x=.04;
const bubble=document.createElement('div');bubble.className='speech-bubble';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');document.querySelector('main').append(bubble);
let epoch=performance.now(),actionAt=0,action=0,line=0,spoken=false;const pointer=new T.Vector2(),gaze=new T.Vector2();
const duration=.85;
function speak(){bubble.textContent=spec.lines[line++%spec.lines.length];bubble.classList.add('show');}
function tap(){actionAt=(performance.now()-epoch)/1000;action++;spoken=false;bubble.classList.remove('show');canvas.dataset.interactions=String(action);}
function aim(e){pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);}
let yaw=0,pitch=0,drag=null;
canvas.style.touchAction='none';
addEventListener('pointermove',aim);canvas.addEventListener('pointerdown',e=>{aim(e);drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)drag.moved=true;if(drag.moved){yaw+=dx*.012;pitch=Math.max(-1.25,Math.min(1.25,pitch+dy*.008));}drag.lastX=e.clientX;drag.lastY=e.clientY;});
canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved)tap();drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('dblclick',()=>{yaw=0;pitch=0;});canvas.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();tap();}});
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.position.set(0,.07,Math.max(6.2,6.1/camera.aspect));camera.lookAt(0,0,0);camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const flapBase=parts.flap?Float32Array.from(parts.flap.geometry.attributes.position.array):null;
let last=performance.now();
function render(now){requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;
 const time=(now-epoch)/1000,age=reduced?10:Math.max(0,time-actionAt),p=clamp(age/duration),spring=Math.sin(age*12)*Math.exp(-age*2),settled=age>=duration;
 canvas.dataset.phase=settled?'settled':'entering';if(settled&&!spoken){speak();spoken=true;}
 gaze.lerp(pointer,1-Math.exp(-dt*8));root.rotation.y=yaw-.08+gaze.x*.06;root.rotation.x=.04+pitch;canvas.dataset.orbit=yaw.toFixed(3);root.rotation.z=0;root.position.y=0;root.scale.setScalar(1);
 const loop=reduced?0:Math.sin(time*4.8),bounce=reduced?0:Math.sin(time*6.5),pop=reduced?0:Math.sin(age*22)*Math.exp(-age*5);
 if(parts.fold){const open=ease(age/.32);parts.fold.scale.set(.61+.57*open+loop*.115+pop*.1,.79-loop*.055-pop*.04,1);}
 if(parts.cover){const reveal=ease((age-.12)/.42)*(reduced?1:ease((.5+.5*Math.cos(Math.max(0,age-.55)*3.8))));parts.face.visible=reveal>.02;parts.hand.visible=reveal>.08;parts.face.position.set(0,-(1-reveal)*.25+loop*.035,-.32*(1-reveal));parts.hand.position.y=-.59+.2*reveal+loop*.035;parts.hand.rotation.z=loop*.09;
 const a=parts.cover.geometry.attributes.position.array,b=parts.coverBase;for(let i=0;i<a.length;i+=3){const x=b[i],y=b[i+1],weight=Math.max(0,1-Math.abs(x)/.76)*Math.max(0,Math.min(1,(-y-.19)/.25));a[i+1]=y-weight*((1-reveal)*.52-loop*.045*reveal);}parts.cover.geometry.attributes.position.needsUpdate=true;parts.cover.scale.y=1+loop*.016;}
 if(parts.lean){const tip=ease(age/.32);parts.lean.rotation.z=.2*(1-tip)-.12*tip+pop*.055+loop*.055;parts.lean.position.set(.08*tip,-.06*tip+loop*.025,0);parts.foot.scale.set(1+loop*.045,1-loop*.12,1);}
 if(parts.ring){parts.hand.rotation.z=Math.sin(time*7)*.34;parts.ring.scale.set(1+loop*.045,1.02-loop*.045,1);}
 if(parts.arch){const press=(1+Math.sin(time*7.5))*.5;parts.arch.scale.set(1+press*.13,1-press*.23,1);parts.arch.position.y=-.85*press*.23;parts.supportHand.rotation.z=press*.13;parts.supportHand.position.y=-press*.06;}
 if(parts.loop){const drawn=ease(age/.5);parts.thread.geometry.setDrawRange(0,Math.floor(drawn*120)*6);const a=parts.thread.geometry.attributes.position.array,b=parts.threadBase;for(let i=0;i<a.length;i+=3){const phase=time*5+i/6*.025;a[i]=b[i]+(reduced?0:Math.sin(phase)*.028);a[i+1]=b[i+1]+(reduced?0:Math.cos(phase)*.024);}parts.thread.geometry.attributes.position.needsUpdate=true;parts.loop.rotation.z=loop*.025;parts.loop.scale.set(1+loop*.025,1-loop*.025,1);}
 if(parts.low){const enter=ease(age/.22);root.position.y=(1-enter)*-.8+pop*.19;parts.low.scale.set(1-loop*.035-pop*.05,1+loop*.045+pop*.1,1);}
 if(parts.flap){const curl=reduced?0:.5+.5*Math.sin(time*3.8);const a=parts.flap.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){const x=flapBase[i],y=flapBase[i+1],w=clamp((.7-y)/.85)*clamp((.4-x)/1.1);a[i]=x+w*curl*.07;a[i+1]=y+w*curl*.075;a[i+2]=flapBase[i+2]+w*w*curl*.18;}parts.flap.geometry.attributes.position.needsUpdate=true;parts.page.rotation.z=loop*.018;}
 if(parts.tall){const join=action===0?ease(age/.22):1,impact=action===0&&age>.22?Math.sin((age-.22)*24)*Math.exp(-(age-.22)*7):0,press=reduced?0:(.5+.5*Math.sin(time*5));parts.tall.position.x=-(1-join)*.75+join*.08-impact*.07;parts.small.position.x=(1-join)*.75-join*.12+impact*.07;parts.tall.scale.set(1-press*.065,1+press*.055,1);parts.small.scale.set(1-press*.07,1+press*.06,1);parts.tall.rotation.z=-.07-press*.045-impact*.04;parts.small.rotation.z=.08+press*.055+impact*.04;}
 const blink=reduced?1:(time%4.3>4.08?Math.max(.045,Math.abs(Math.cos((time%4.3-4.08)*Math.PI/.22))):1);eyes.forEach(({g,p,baseX,baseY=1})=>{g.scale.y=blink*baseY;p.position.x=baseX+gaze.x*.025;p.position.y=gaze.y*.02;});renderer.render(scene,camera);canvas.dataset.ready='true';
}requestAnimationFrame(render);

