export function leakField(p){return ((p[0]-.22)/.83)**2+((p[1]-.28)/.33)**2+((p[2]-.84)/.47)**2-1;}
export function cutLeak(source,sourceNormals,index){
 const positions=[],normals=[];
 const vertex=i=>({p:Array.from(source.slice(i*3,i*3+3)),n:Array.from(sourceNormals.slice(i*3,i*3+3))});
 const mix=(a,b,t)=>({p:a.p.map((v,i)=>v+(b.p[i]-v)*t),n:a.n.map((v,i)=>v+(b.n[i]-v)*t)});
 function emit(a,b,c){for(const v of [a,b,c]){positions.push(...v.p);const length=Math.hypot(...v.n)||1;normals.push(...v.n.map(n=>n/length));}}
 function clip(a,b,c,depth=0){
  const distance=(a,b)=>Math.hypot(...a.p.map((v,i)=>v-b.p[i]));
  if(depth<7&&Math.max(distance(a,b),distance(b,c),distance(c,a))>.065){
   const ab=mix(a,b,.5),bc=mix(b,c,.5),ca=mix(c,a,.5);clip(a,ab,ca,depth+1);clip(ab,b,bc,depth+1);clip(ca,bc,c,depth+1);clip(ab,bc,ca,depth+1);return;
  }
  const poly=[a,b,c],kept=[];
  for(let i=0;i<3;i++){
   const v=poly[i],next=poly[(i+1)%3],d=leakField(v.p),nd=leakField(next.p);
   if(d>=0)kept.push(v);
   if((d>=0)!==(nd>=0))kept.push(mix(v,next,d/(d-nd)));
  }
  for(let i=1;i<kept.length-1;i++)emit(kept[0],kept[i],kept[i+1]);
 }
 for(let i=0;i<index.length;i+=3)clip(vertex(index[i]),vertex(index[i+1]),vertex(index[i+2]));
 return {positions,normals};
}
