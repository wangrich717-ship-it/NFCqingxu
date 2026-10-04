import {playVoice} from './sounds.js';
import * as THREE from './vendor/three.module.js';
import {Spring} from './physics.js';
import {makeOrganicSurface} from './organic.js';
import {cutLeak} from './leak.js';

const canvas=document.querySelector('#jelly');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch(error){canvas.remove();throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.NeutralToneMapping || THREE.NoToneMapping;
renderer.toneMappingExposure=.85;
renderer.shadowMap.enabled=false;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,1,.1,100);
const pmrem=new THREE.PMREMGenerator(renderer);
const studio=new THREE.Scene();studio.background=new THREE.Color(0xe6e5e0);
for(const [x,y,z,size,color,power] of [[-3,4,4,2.5,0xfff8eb,2.5],[4,2,1,2,0xeef3ff,1.3],[0,4,-3,2.8,0xffffff,2]]){
 const softbox=new THREE.Mesh(new THREE.CircleGeometry(size,48),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
 softbox.material.color.multiplyScalar(power);softbox.position.set(x,y,z);softbox.lookAt(0,0,0);studio.add(softbox);
}
scene.environment=pmrem.fromScene(studio,.18).texture;
pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xfff5e4,0xc6cad8,1.5));
const key=new THREE.DirectionalLight(0xfff4db,2.1);key.position.set(-3,6,5);key.castShadow=false;
key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-3;key.shadow.bias=-.0006;key.shadow.normalBias=.03;key.shadow.radius=5;scene.add(key);
const fill=new THREE.DirectionalLight(0xe7eeff,1.1);fill.position.set(4,3,-2);scene.add(fill);
const yellow=new THREE.MeshPhysicalMaterial({color:0xffb900,roughness:.36,metalness:0,transmission:0,ior:1.36,clearcoat:.32,clearcoatRoughness:.3,envMapIntensity:.25,specularIntensity:.3});
const blue=new THREE.MeshPhysicalMaterial({color:0x003bea,roughness:.3,transmission:0,ior:1.36,clearcoat:.5,clearcoatRoughness:.25,envMapIntensity:.3,specularIntensity:.4});
const white=new THREE.MeshPhysicalMaterial({color:0xfff7d6,roughness:.35,clearcoat:.25});
const black=new THREE.MeshPhysicalMaterial({color:0x232824,roughness:.3,clearcoat:.35});
const character=new THREE.Group();scene.add(character);character.position.y=.02;
const cup=new THREE.Group();character.add(cup);
const points=[[0,.1],[.42,.1],[.63,.13],[.77,.23],[.86,.43],[.92,.85],[.94,1.1],[.94,1.2],[.9,1.24],[.85,1.21],[.84,1.14],[.82,.91],[.76,.45],[.64,.29],[.4,.25],[0,.25]].map(p=>new THREE.Vector2(...p));
const smooth=new THREE.SplineCurve(points).getPoints(128).map(p=>new THREE.Vector2(Math.max(0,p.x),p.y));
const intact=new THREE.LatheGeometry(smooth,96);
const cut=cutLeak(intact.attributes.position.array,intact.attributes.normal.array,intact.index.array);
const cupGeometry=new THREE.BufferGeometry();
cupGeometry.setAttribute('position',new THREE.Float32BufferAttribute(cut.positions,3));
cupGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(cut.normals,3));
const body=new THREE.Mesh(cupGeometry,yellow);cup.add(body);
const intactBody=new THREE.Mesh(intact,yellow);cup.add(intactBody);
const shardGroup=new THREE.Group();cup.add(shardGroup);
const shards=Array.from({length:9},(_,i)=>{const g=new THREE.TetrahedronGeometry(.075+(i%3)*.025),m=new THREE.Mesh(g,yellow.clone());m.material.transparent=true;shardGroup.add(m);return m;});
const crackMaterial=new THREE.MeshBasicMaterial({color:0x76500e});
const crack=new THREE.Group();cup.add(crack);
// Project each crack ribbon onto the actual lathed outer cup surface.
const surfaceRay=new THREE.Raycaster();intactBody.updateMatrixWorld(true);
for(const pts of [[[.18,.26],[.14,.34],[.22,.42],[.2,.49],[.27,.56]],[[.14,.34],[.02,.39],[-.06,.43],[-.17,.42]],[[.22,.42],[.32,.46],[.35,.52],[.43,.56]]]){
 const path=new THREE.SplineCurve(pts.map(p=>new THREE.Vector2(...p))),vertices=[];
 for(let i=0;i<48;i++)for(const t of [i/48,(i+1)/48]){
  const p=path.getPoint(t),tangent=path.getTangent(t),width=.0028*(1-t*.45);
  for(const sign of [-1,1]){const x=p.x-sign*tangent.y*width,y=p.y+sign*tangent.x*width;
   surfaceRay.set(new THREE.Vector3(x,y,2),new THREE.Vector3(0,0,-1));
   const hit=surfaceRay.intersectObject(intactBody)[0];
   if(!hit)throw new Error('Crack must remain on cup surface');
   vertices.push(x,y,hit.point.z+.0015);
  }
 }
 const geometry=new THREE.BufferGeometry(),indices=[];geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 for(let i=0;i<48;i++){const n=i*4;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
 geometry.setIndex(indices);crack.add(new THREE.Mesh(geometry,crackMaterial));
}
const handleCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.82,.97,0),new THREE.Vector3(-1.15,1.0,0),new THREE.Vector3(-1.34,.73,0),new THREE.Vector3(-1.22,.45,0),new THREE.Vector3(-.81,.43,0)]);
const handle=new THREE.Mesh(new THREE.TubeGeometry(handleCurve,64,.16,20,false),yellow);cup.add(handle);
const sphere=new THREE.SphereGeometry(1,48,32);
function ellipsoid(material,x,y,z,sx,sy,sz,parent=cup){const m=new THREE.Mesh(sphere,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m;}
const liquid=ellipsoid(blue,0,.88,0,.76,.095,.76);
const leakFill=ellipsoid(blue,.22,.28,.84,.85,.34,.48);
const drops=Array.from({length:4},(_,i)=>ellipsoid(blue,.5,.8,1.05,.075,.11,.075,character));
const eyes=[];
for(const x of [-.08,.39]){
 const eye=new THREE.Group();eye.position.set(x,1.265,.13);eye.rotation.z=-.18;cup.add(eye);
 ellipsoid(white,0,0,0,.13,.225,.085,eye);
 const pupil=ellipsoid(black,.028,-.095,.081,.085,.105,.028,eye);
 const glint=ellipsoid(white,-.019,.03,.025,.011,.017,.005,pupil);
 eyes.push({eye,pupil,glint});
}
const spill=new THREE.Group();character.add(spill);
const organic=makeOrganicSurface(44),blobGeo=new THREE.BufferGeometry();
blobGeo.setAttribute('position',new THREE.Float32BufferAttribute(organic.positions,3));
blobGeo.setAttribute('normal',new THREE.Float32BufferAttribute(organic.normals,3));
const puddle=new THREE.Mesh(blobGeo,blue);spill.add(puddle);
const jellyOriginal=Float32Array.from(blobGeo.attributes.position.array);
// True mesh deformation adds wobble to the material highlights as well as the silhouette.
const original=Float32Array.from(body.geometry.attributes.position.array);
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,2,64,64,64);gradient.addColorStop(0,'rgba(113,88,58,.16)');gradient.addColorStop(.45,'rgba(113,88,58,.06)');gradient.addColorStop(1,'rgba(113,88,58,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.8,3.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(.1,0,.4);scene.add(shadow);
const squash=new Spring(),sway=new Spring(),bounce=new Spring();
const pointer=new THREE.Vector2();let orbitYaw=0,orbitPitch=0,dragMoved=false,startX=0,startY=0;let dragging=false,lastX=0,lastY=0,pressAt=0,pressTarget=0,last=performance.now(),time=0;
const openedAt=performance.now();
const gaze=new THREE.Vector2();
const bubble=document.createElement('div');bubble.className='speech-bubble';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');document.querySelector('main').append(bubble);
const sayings=['漏了。咋了。','我有缺口，也有脾气。','水满了会溢，我满了会怼。','今天不装了。真装不下。','杯子都破了，还讲什么杯德。','没装稳。也没装乖。'];
let sayingIndex=0,bubbleTimer,introSaid=false;playVoice('liuliu');addEventListener('pointerdown',()=>playVoice('liuliu'),{once:true});
function speak(){bubble.textContent=sayings[sayingIndex++%sayings.length];bubble.classList.remove('show');void bubble.offsetWidth;bubble.classList.add('show');clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>bubble.classList.remove('show'),4400);}
function aim(e){pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);}
canvas.style.touchAction='none';canvas.addEventListener('dblclick',()=>{orbitYaw=0;orbitPitch=0;});addEventListener('pointermove',aim);
function boing(){playVoice('liuliu');canvas.dataset.sound='liuliu';}
function tap(force=1){squash.kick(5.7*force);sway.kick((Math.random()-.5)*2.3);bounce.kick(3*force);boing();speak();if(navigator.vibrate)navigator.vibrate(12);canvas.dataset.interactions=String((+canvas.dataset.interactions||0)+1);}
canvas.addEventListener('pointerdown',e=>{aim(e);dragging=true;dragMoved=false;startX=e.clientX;startY=e.clientY;lastX=e.clientX;lastY=e.clientY;pressAt=performance.now();pressTarget=-.17;canvas.setPointerCapture(e.pointerId);squash.kick(-2);});
canvas.addEventListener('pointermove',e=>{pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);if(dragging){if(Math.hypot(e.clientX-startX,e.clientY-startY)>7)dragMoved=true;if(dragMoved){orbitYaw+=(e.clientX-lastX)*.012;orbitPitch=Math.max(-1.25,Math.min(1.25,orbitPitch+(e.clientY-lastY)*.008));}sway.kick((e.clientX-lastX)*.025);squash.kick((e.clientY-lastY)*.009);lastX=e.clientX;lastY=e.clientY;}});
function release(e){if(!dragging)return;dragging=false;pressTarget=0;if(!dragMoved)tap(Math.min(1.5,1+(performance.now()-pressAt)/2000));if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',e=>{dragging=false;pressTarget=0;squash.kick(2);});
canvas.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();tap();}});
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;const distance=Math.max(5.9,5.5/camera.aspect);camera.position.set(distance*.06,.69+distance*.37,distance);camera.lookAt(-.02,.67,.25);camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
function animate(now){
 requestAnimationFrame(animate);if(document.hidden){last=now;return;}
 const dt=Math.min((now-last)/1000,1/30);last=now;time+=dt;
 const q=squash.step(dt,pressTarget),r=sway.step(dt),b=bounce.step(dt);
 const idle=reduce?0:Math.sin(time*1.9)*.013;
 const amount=reduce?q*.35:q;
 cup.scale.set(1+amount*.48-idle,1-amount*.65+idle,1+amount*.28);
 cup.rotation.z=-.075+r*.4+(reduce?0:Math.sin(time*1.5)*.018);
 character.rotation.y=orbitYaw;character.rotation.x=orbitPitch;canvas.dataset.orbit=orbitYaw.toFixed(3);cup.rotation.y=pointer.x*.09;character.position.y=Math.max(0,b*.37);
 const arr=body.geometry.attributes.position.array;
 for(let i=0;i<arr.length;i+=3){const y=original[i+1];arr[i]=original[i]+Math.sin(y*4+time*12)*amount*.06;arr[i+1]=y;arr[i+2]=original[i+2]+Math.cos(y*3+time*11)*amount*.045;}
 body.geometry.attributes.position.needsUpdate=true;
 const intro=(now-openedAt)/1000;if(!introSaid&&intro>2.6){introSaid=true;if(sayingIndex===0)speak();}
 const burst=reduce?10:Math.max(0,intro-.9);
 intactBody.visible=!reduce&&intro<.9;body.visible=reduce||intro>=.9;
 crack.visible=!reduce&&intro>.38&&intro<.9;
 crack.children.forEach(line=>line.geometry.setDrawRange(0,Math.floor(48*THREE.MathUtils.smoothstep(intro,.38,.82))*6));
 shards.forEach((shard,i)=>{shard.visible=!reduce&&intro>=.9&&burst<1.8;const angle=(i/9)*Math.PI*2;shard.position.set(.22+Math.cos(angle)*burst*(.55+i*.07),.3+Math.sin(angle)*burst*.65-burst*burst*.75,.86+burst*(.25+(i%3)*.12));shard.rotation.set(burst*(i+2),burst*(i-3),burst*4);shard.material.opacity=1-THREE.MathUtils.smoothstep(burst,.8,1.7);});
 const impact=reduce?0:Math.exp(-burst*7)*(intro>=.9?1:0);
 character.position.x=Math.sin(burst*70)*impact*.075;character.rotation.z=Math.cos(burst*55)*impact*.045;
 const arrival=reduce?1:THREE.MathUtils.smoothstep(intro,1.05,2.6);
 spill.scale.set((1+amount*.3)*Math.max(.001,arrival),(1-amount*.35+(reduce?0:Math.sin(time*3)*.022))*Math.max(.001,arrival),(1-amount*.1)*Math.max(.001,arrival));spill.rotation.y=r*.08;
 drops.forEach((drop,i)=>{const phase=(burst*1.7+i*.24)%1;drop.visible=!reduce&&intro>1&&intro<2.8;drop.position.set(.25+phase*(.65+i*.12),.3+Math.sin(phase*Math.PI)*.2-phase*.18,.86+phase*.35);drop.scale.setScalar(.065*(1-phase*.3));});
 canvas.dataset.flow=intro<3.8&&!reduce?'pouring':'settled';
 liquid.scale.y=.095*(1+amount*1.8);
 const jellyPositions=blobGeo.attributes.position.array;
 for(let i=0;i<jellyPositions.length;i+=3){const x=jellyOriginal[i],y=jellyOriginal[i+1],z=jellyOriginal[i+2];jellyPositions[i]=x+Math.sin(z*6-time*13)*amount*.035;jellyPositions[i+1]=y*(1+Math.sin(x*5-time*12)*amount*.14);jellyPositions[i+2]=z;}
 blobGeo.attributes.position.needsUpdate=true;
 const blink=reduce?1:(time%5.6>5.4?Math.max(.07,Math.abs(Math.cos((time%5.6-5.4)*Math.PI/.2))):1);
 gaze.lerp(pointer,1-Math.exp(-dt*8));
 eyes.forEach(({eye,pupil})=>{eye.scale.y=blink;pupil.position.x=.028+gaze.x*.055;pupil.position.y=-.095+gaze.y*.045;});
 canvas.dataset.gaze=`${gaze.x.toFixed(2)},${gaze.y.toFixed(2)}`;
 shadow.scale.setScalar(1+Math.max(0,b)*.18);
 renderer.render(scene,camera);
 if(!document.body.classList.contains('ready')){document.body.classList.add('ready');canvas.dataset.ready='true';}
}
requestAnimationFrame(animate);
