// A smooth implicit surface fuses the spill into one soft volume.
const lobes=[
 [.30,.27,.55,.42,.19,.34],
 [-.08,.40,.86,.48,.23,.17],
 [.25,.30,.94,.45,.22,.23],
 [.49,.18,1.03,.43,.16,.34],
 [.77,.13,1.02,.57,.12,.43],
 [1.08,.145,.91,.32,.14,.29],
];
function smoothMin(a,b,k){const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;}
export function field(x,y,z){
 let d=10;
 for(const [cx,cy,cz,rx,ry,rz] of lobes){
  const q=Math.hypot((x-cx)/rx,(y-cy)/ry,(z-cz)/rz)-1;
  d=smoothMin(d,q*Math.min(rx,ry,rz),.075);
 }
 return d;
}
export function makeOrganicSurface(resolution=40){
 const min=[-.65,-.08,.10],max=[1.53,1.02,1.59];
 const n=[resolution,Math.ceil(resolution*.6),Math.ceil(resolution*.75)];
 const step=max.map((v,i)=>(v-min[i])/n[i]);
 const nodes=[];
 for(let z=0;z<=n[2];z++)for(let y=0;y<=n[1];y++)for(let x=0;x<=n[0];x++){
  const p=[min[0]+x*step[0],min[1]+y*step[1],min[2]+z*step[2]];
  nodes.push({p,d:field(...p)});
 }
 const get=(x,y,z)=>nodes[(z*(n[1]+1)+y)*(n[0]+1)+x];
 const offsets=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
 const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
 const positions=[],normals=[];
 function crossing(a,b){const t=a.d/(a.d-b.d);return a.p.map((v,i)=>v+(b.p[i]-v)*t);}
 function normal(p){const e=.001,x=field(p[0]+e,p[1],p[2])-field(p[0]-e,p[1],p[2]),y=field(p[0],p[1]+e,p[2])-field(p[0],p[1]-e,p[2]),z=field(p[0],p[1],p[2]+e)-field(p[0],p[1],p[2]-e);const l=Math.hypot(x,y,z)||1;return [x/l,y/l,z/l];}
 function triangle(a,b,c){
  const na=normal(a),nb=normal(b),nc=normal(c),u=b.map((v,i)=>v-a[i]),v=c.map((p,i)=>p-a[i]);
  const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  if(cross.reduce((s,x,i)=>s+x*na[i],0)<0){[b,c]=[c,b];positions.push(...a,...b,...c);normals.push(...na,...nc,...nb);}else{positions.push(...a,...b,...c);normals.push(...na,...nb,...nc);}
 }
 for(let z=0;z<n[2];z++)for(let y=0;y<n[1];y++)for(let x=0;x<n[0];x++){
  const corners=offsets.map(o=>get(x+o[0],y+o[1],z+o[2]));
  for(const indices of tetra){
   const inside=[],outside=[];indices.forEach(i=>(corners[i].d<0?inside:outside).push(corners[i]));
   if(!inside.length||!outside.length)continue;
   if(inside.length===1){triangle(...outside.map(p=>crossing(inside[0],p)));}
   else if(inside.length===3){triangle(...inside.map(p=>crossing(p,outside[0])));}
   else{const a=crossing(inside[0],outside[0]),b=crossing(inside[0],outside[1]),c=crossing(inside[1],outside[0]),d=crossing(inside[1],outside[1]);triangle(a,b,c);triangle(b,d,c);}
  }
 }
 return {positions,normals};
}
