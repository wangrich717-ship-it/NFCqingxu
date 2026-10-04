export class Spring {
 constructor(){this.x=0;this.v=0;}
 kick(force){this.v=Math.max(-8,Math.min(8,this.v+force));}
 step(dt,target=0){
  dt=Math.min(Math.max(dt,0),1/30);
  for(let i=0;i<4;i++){
   const h=dt/4;
   this.v+=(-105*(this.x-target)-8*this.v)*h;
   this.x=Math.max(-.4,Math.min(.4,this.x+this.v*h));
  }
  return this.x;
 }
}
