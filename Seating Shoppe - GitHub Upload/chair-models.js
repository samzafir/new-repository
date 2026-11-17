import * as T from './three.module.js';
// Photo-reference approximations, in consistent relative units; not manufacturing CAD.
export function buildChair(p,s,{wood,metal,seat,back}){
 const group=new T.Group();
 const add=(geo,material,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m};
 function rounded(w,h,d,r,material,x,y,z){const g=new T.BoxGeometry(w,h,d,10,10,10),a=g.attributes.position;const v=new T.Vector3(),q=new T.Vector3();for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i);q.set(Math.max(-w/2+r,Math.min(w/2-r,v.x)),Math.max(-h/2+r,Math.min(h/2-r,v.y)),Math.max(-d/2+r,Math.min(d/2-r,v.z)));v.sub(q).normalize().multiplyScalar(r).add(q);a.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();const result=add(g,material,x,y,z);if(material===back){const pts=shape.getPoints(100);pipe(pts.map(v=>[x+v.x*(1+v.y*.045),y+v.y,z+d/2+.018-v.y*.09]),.003,material,true)}return result}
 function beam(a,b,w,d,material){const start=new T.Vector3(...a),end=new T.Vector3(...b),m=rounded(w,start.distanceTo(end),d,Math.min(w,d)*.13,material,...start.clone().add(end).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());return m}
 function leg(x,z,y,material,slim=false){const top=new T.Vector3(x,y,z),bottom=new T.Vector3(x*1.14,.035,z*1.17);const g=new T.CylinderGeometry(slim?.024:.043,slim?.022:.028,top.distanceTo(bottom),slim?16:4,1);if(!slim)g.rotateY(Math.PI/4);const m=add(g,material,...top.clone().add(bottom).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),top.sub(bottom).normalize());if(p.id!=='tau-chair')rounded(.057,.025,.057,.009,metal,x*1.14,.021,z*1.17)}
 function outline(w,h,r){const sh=new T.Shape();sh.moveTo(-w/2+r,-h/2);sh.lineTo(w/2-r,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);sh.lineTo(w/2,h/2-r);sh.quadraticCurveTo(w/2,h/2,w/2-r,h/2);sh.lineTo(-w/2+r,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);sh.lineTo(-w/2,-h/2+r);sh.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return sh}
 function curvedBack(w,h,d,r,material,x,y,z,hole=false){const shape=outline(w,h,r);if(hole){const cut=new T.Path(outline(.23,.36,.035).getPoints(30).reverse().map(v=>new T.Vector2(v.x,v.y+.13)));shape.holes.push(cut)}const g=new T.ExtrudeGeometry(shape,{depth:d,steps:5,bevelEnabled:true,bevelSegments:5,bevelSize:.018,bevelThickness:.018,curveSegments:20});g.translate(0,0,-d/2);const a=g.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i);a.setZ(i,a.getZ(i)-yy*.09);a.setX(i,xx*(1+yy*.045))}g.computeVertexNormals();return add(g,material,x,y,z)}
 function pipe(points,r,material,closed=false){const curve=new T.CatmullRomCurve3(points.map(x=>new T.Vector3(...x)),closed);return add(new T.TubeGeometry(curve,80,r,7,closed),material)}
 const w=p.w,d=p.d,sy=.94,lx=w*.40,lz=d*.37,top=sy-.12;
 // A gently crowned cushion and a continuous fine welt seam.
 const cushion=rounded(w,p.id==='tau-chair'?.12:.22,d,.065,seat,0,sy,0);const cp=cushion.geometry.attributes.position;for(let i=0;i<cp.count;i++){let x=cp.getX(i),y=cp.getY(i),z=cp.getZ(i);if(y>0)cp.setY(i,y+.045*Math.max(0,1-(x/(w*.5))**2)*Math.max(0,1-(z/(d*.5))**2));cp.setX(i,x*(1+.035*z/d))}cushion.geometry.computeVertexNormals();
 const edge=outline(w-.035,d-.035,.10).getPoints(90);pipe(edge.map(v=>[v.x,sy+.035,v.y]),.0045,seat,true);
 rounded(w-.05,.105,d-.06,.015,p.id==='aperture-chair'?seat:wood,0,sy-.12,0);
 if(s.base==='sled'){for(const side of [-1,1]){pipe([[side*lx,top,lz],[side*lx,.08,lz],[side*lx,.045,lz-.08],[side*lx,.045,-lz],[side*lx,.08,-lz-.04],[side*lx,top,-lz-.04]],.024,metal)}}else for(const x of [-1,1])for(const z of [-1,1])leg(x*lx,z*lz,top,s.base==='metal'?metal:wood,s.base==='metal');
 if(s.base==='tapered'&&p.id==='baratheon-chair'){for(const x of [-1,1])beam([x*lx,.52,lz],[x*lx,.52,-lz],.045,.045,wood);beam([-lx,.56,-lz],[lx,.56,-lz],.045,.045,wood)}
 const backStyle=s.backStyle,original=backStyle==='original',bh=p.h-sy-.06,by=sy+.06+bh/2,bz=-d*.39;
 // Each reference has its own back construction and silhouette.
 if(original&&p.id==='tau-chair'){
  for(const x of [-1,1])beam([x*lx,sy-.08,bz],[x*lx*.95,p.h-.05,bz-.09],.045,.055,wood);
  curvedBack(w*.98,.17,.065,.006,wood,0,p.h-.07,bz-.08);
  curvedBack(w*.31,bh-.13,.05,.006,wood,0,by-.045,bz-.055);
 }else if(original&&p.id==='baratheon-chair'){
  curvedBack(w*.85,bh,.11,.015,wood,0,by,bz);
  curvedBack(w*.79,bh-.09,.085,.045,back,0,by-.015,bz+.061);curvedBack(w*.79,bh-.09,.04,.035,back,0,by-.015,bz-.073);
  curvedBack(w*.88,.075,.12,.008,wood,0,p.h-.018,bz-.025);
 }else if(original&&p.id==='aperture-chair'){
  for(const x of [-1,1])beam([x*lx,sy-.08,bz],[x*lx,sy+.26,bz],.04,.05,wood);
  curvedBack(w*.89,bh,.095,.035,back,0,by,bz,true);
 }else if(backStyle==='slat'){
  for(const x of [-1,1])beam([x*lx,sy-.08,bz],[x*lx,p.h,bz-.08],.045,.05,wood);
  for(let i=-2;i<=2;i++)curvedBack(.06,bh-.08,.045,.01,wood,i*w*.16,by,bz);
  curvedBack(w*.93,.11,.08,.015,wood,0,p.h-.035,bz-.03);
 }else{
  for(const x of [-1,1])beam([x*lx,sy-.08,bz],[x*lx,sy+.35,bz-.04],.045,.05,wood);
  const roundedTop=original||backStyle==='rounded';
  curvedBack(w*.9,bh,.11,roundedTop?.14:.02,back,0,by,bz);
 }
 if(s.arms!=='none')for(const side of [-1,1]){beam([side*lx,sy,lz*.65],[side*(lx+.035),sy+.37,lz*.65],.035,.045,wood);rounded(.085,.065,d*.80,.025,wood,side*(lx+.035),sy+.40,-.015);if(s.arms==='padded')rounded(.12,.11,d*.73,.045,seat,side*(lx+.035),sy+.445,-.015)}
 return group;
}
export function woodTexture(color){const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,256,512);for(let i=0;i<500;i++){x.beginPath();const px=i*.53;x.moveTo(px,0);for(let y=0;y<=512;y+=8)x.lineTo(px+Math.sin(y*.018+i*.4)*2+Math.sin(y*.045+i*.12)*.7,y);x.strokeStyle=i%3===0?'#00000024':'#ffffff18';x.lineWidth=i%5===0?1.1:.45;x.stroke()}const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(1,2);return tex}

