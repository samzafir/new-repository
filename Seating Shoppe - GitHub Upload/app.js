import { installViewerZoom } from './viewer-zoom.js';
import { installRoomAR } from './room-ar.js';
import { fabricMatches, fabricDescription, interpretConfiguration } from './configuration-search.js';
import { installCatalogSearch, semanticMatches } from './catalog-search.js';
import { assembleSuppliedChair, supplied } from './supplied-parts.js';
import * as THREE from './three.module.js';
import {woodTexture} from './chair-models.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const catalog=[{"url":"https://www.theseatingshoppe.com/product/baratheon-chair","photo":"photos/baratheon-chair.jpg","name":"Baratheon Chair","id":"baratheon-chair","w":1.02,"d":1.02,"h":2.07,"description":"Upholstered high back, exposed dark frame and tapered legs.","fabric":"fabric4","category":"Dining","options":"Handhold — Closed, Hidden, Integrated · Seat and back — None, Nailheads, Tufted, Welted · Glides — None, Deluxe Metal Glide, Glide Cover, Plastic Glides, Swivel Glides · Upgrades — None, Webbed Seat"},{"url":"https://www.theseatingshoppe.com/product/aperture-chair","photo":"photos/aperture-chair.jpg","name":"Aperture Chair","id":"aperture-chair","w":1,"d":0.96,"h":2.08,"description":"A tailored upholstered back with a distinctive rectangular opening.","fabric":"fabric7","category":"Dining","options":"Seat and back — None, Nailheads, Tufted, Welted · Glides — None, Deluxe Metal Glide, Glide Cover, Plastic Glides, Swivel Glides · Upgrades — None, Webbed Seat"},{"url":"https://www.theseatingshoppe.com/product/parigi-side-chair","photo":"photos/parigi-side-chair.jpg","name":"Parigi Chair","id":"parigi-side-chair","w":1.02,"d":1.02,"h":2.02,"description":"A softly rounded upholstered back and a deep, tailored seat.","fabric":"fabric0","category":"Dining","options":"Handhold — None, Integrated · Glides — None, Deluxe Metal Glide, Glide Cover, Plastic Glides, Swivel Glides · Upgrades — None, Webbed Seat"},{"url":"https://www.theseatingshoppe.com/product/tau-chair","photo":"photos/tau-chair.jpg","name":"Tau Chair","id":"tau-chair","w":1.02,"d":0.98,"h":1.97,"description":"A broad timber top rail, central wood slat and upholstered seat.","fabric":"fabric4","category":"Dining","options":"Seat option — Boxed, Pullover · Glides — None, Plastic Glides · Upgrades — None, Webbed Seat"},{"id":"adrian-chair","name":"Adrian Chair","description":"Tapered frame with an upholstered back and a choice of boxed or pullover seat.","url":"https://www.theseatingshoppe.com/product/adrian-chair","photo":"photos/adrian-chair.jpg","h":2,"fabric":"fabric4","category":"Dining","options":"Seat option — Boxed, Pullover · Handhold — None, Closed, Hidden, Integrated · Glides — None, Plastic Glides · Upgrades — None, Webbed Seat"},{"id":"baratheon-s-chair","name":"Baratheon S Chair","description":"High upholstered back with a slim exposed frame and tapered legs.","url":"https://www.theseatingshoppe.com/product/baratheon-s-chair","photo":"photos/baratheon-s-chair.jpg","h":2,"fabric":"fabric4","category":"Dining","options":"Handhold — Closed, Hidden, Integrated · Seat and back — None, Nailheads, Tufted, Welted · Glides — None, Deluxe Metal Glide, Glide Cover, Plastic Glides, Swivel Glides · Upgrades — None, Webbed Seat"},{"id":"churchill-chair","name":"Churchill Chair","description":"Upholstered dining chair with a broad back and boxed or pullover upholstery.","url":"https://www.theseatingshoppe.com/product/churchill-chair","photo":"photos/churchill-chair.jpg","h":2,"fabric":"fabric4","category":"Dining","options":"Seat option — Boxed, Pullover · Glides — None, Deluxe Metal Glide, Glide Cover, Plastic Glides, Swivel Glides · Upgrades — None, Webbed Seat"},{"id":"carmine-chair","name":"Carmine Chair","description":"Upholstered dining chair with a tapered frame, upholstered back and interchangeable seat.","url":"https://www.theseatingshoppe.com/product/carmine-chair","photo":"photos/carmine-chair.jpg","h":2,"fabric":"fabric4","category":"Dining","options":"Seat option — Boxed, Pullover · Handhold — None, Closed, Hidden, Integrated · Glides — None, Deluxe Metal Glide, Glide Cover, Plastic Glides, Swivel Glides · Upgrades — None, Webbed Seat"}];
const curated=[["Oat boucle","#c7bea7"],["Forest weave","#68765a"],["Terracotta linen","#b57459"],["Ink velvet","#414b51"],["Warm ivory","#e3ded0"],["Ochre tweed","#b59a54"],["Dusty rose","#b78e87"],["Silver weave","#a8aaa1"],["Cocoa linen","#6c5145"],["Moss boucle","#93996b"],["Amazon 02 · TS105-5","#e8d8be","swatches/amazon-02.jpg","beige multicolor white upholstery fabric"],["Amazon 09 · TS137-3","#55735b","swatches/amazon-09.jpg","green multicolor white upholstery fabric"],["Cleanick 511111 · TS316-2","#5d654e","swatches/cleanick-511111.jpg","green olive upholstery fabric"],["Cottonwood White · TS1851-01","#d6cfc5","swatches/cottonwood-white.jpg","cream white upholstery fabric"],["Courtyard 08 · TS219-1","#41241c","swatches/courtyard-08.jpg","brown multicolor upholstery fabric"]].map(([name,color,texture,description],i)=>({id:'fabric'+i,name,color,texture,description,type:'curated'}));
const finishes=[["Natural oak","#b3936b"],["Walnut","#403126"],["Ebony","#30342e"],["Warm white","#e2dfcf"],["Almond #68","#543a21","swatches/almond-68.jpg","Official finish gallery preview"],["Amber #77","#391107","swatches/amber-77.jpg","Official finish gallery preview"],["Driftwood #79","#895d38","swatches/driftwood-79.jpg","Official finish gallery preview"],["Ebony #85","#8a8a8a","swatches/ebony-85.jpg","Official finish gallery preview"],["Natural #25","#dcb57a","swatches/natural-25.jpg","Official finish gallery preview"],["Oak #5","#c39355","swatches/oak-5.jpg","Official finish gallery preview"],["Walnut #29","#48342d","swatches/walnut-29.jpg","Official finish gallery preview"],["Whitewash #24","#dcb99d","swatches/whitewash-24.jpg","Official finish gallery preview"],["Flat Black #18","#0e0e0e","swatches/flat-black-18.jpg","Official finish gallery preview"],["Gunmetal Grey #714","#51524d","swatches/gunmetal-grey-714.jpg","Official finish gallery preview"],["Gold Powdercoat #32","#7f5e31","swatches/gold-powdercoat-32.jpg","Official finish gallery preview"],["Silver #7","#c9c9c9","swatches/silver-7.jpg","Official finish gallery preview"],["Champagne #9","#c3ab51","swatches/champagne-9.jpg","Official finish gallery preview"]];
let uploads=[],saved={};try{uploads=JSON.parse(localStorage.getItem('ss-fabrics')||'[]');uploads=uploads.filter(f=>f.type==='personal');saved=JSON.parse(localStorage.getItem('ss-designs')||'{}')}catch{}
const params=new URLSearchParams(location.search),dedicated=params.get('view')==='dedicated';document.body.classList.toggle('dedicated',dedicated);$(dedicated?'#pageLink':'#inlineLink').classList.add('active');
let index=Math.max(0,catalog.findIndex(p=>p.id===params.get('product'))),source='curated',panel='fabric',state,auto=false,angle=.64,elevation=.22,distance=5.1,toastTimer;
const fresh=p=>({seat:p.id==='aperture-chair'?'fabric0':p.fabric,back:p.fabric,backStyle:'original',seatStyle:'original',finish:1,scale:1,angle:0});
function toast(t){$('#toast').textContent=t;$('#toast').style.opacity=1;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.opacity=0,3500)}
function persist(){saved[catalog[index].id]={...state};try{localStorage.setItem('ss-designs',JSON.stringify(saved))}catch{toast('Browser storage is full. This design is available for this session.')}}
function fabric(id){return [...curated,...uploads].find(f=>f.id===id)||curated[0]}
function textureImage(f){if(f.texture)return f.texture;if(f.data)return f.data;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=f.color;x.fillRect(0,0,256,256);let n=19;for(let i=0;i<19000;i++){n=(n*16807)%2147483647;const px=n%256;n=(n*16807)%2147483647;const py=n%256;x.fillStyle=i%2?'#ffffff14':'#00000016';x.fillRect(px,py,1,i%3+1)}x.strokeStyle='#ffffff16';for(let i=0;i<256;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.stroke()}for(let y=0;y<256;y+=4){for(let xx=0;xx<256;xx+=4){x.fillStyle=((xx+y)/4)%2?'#ffffff26':'#0000001b';x.fillRect(xx,y,3,1);x.fillRect(xx,y,1,3)}}return c.toDataURL('image/png')}
curated.forEach(f=>f.data=textureImage(f));
await Promise.all(curated.map(f=>new Promise(resolve=>{const img=new Image();img.onload=()=>{f.image=img;resolve()};img.onerror=()=>{delete f.texture;delete f.data;f.data=textureImage(f);resolve()};img.src=f.data})));
const scene=new THREE.Scene();scene.background=new THREE.Color('#eeeee5');scene.fog=new THREE.Fog('#eeeee5',9,18);const camera=new THREE.PerspectiveCamera(34,1,.1,40);let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;$('#viewport').append(renderer.domElement)}catch(e){$('#viewport').innerHTML='<p style="padding:100px 30px">3D requires WebGL. Please enable hardware acceleration or try another browser.</p>';throw e}
scene.add(new THREE.HemisphereLight(0xffffff,0xb7afa0,2.1));const light=new THREE.DirectionalLight(0xfff7df,3);light.position.set(-3,7,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-4,right:4,top:5,bottom:-4});light.shadow.bias=-.001;light.shadow.normalBias=.025;light.shadow.radius=4;scene.add(light);const fill=new THREE.DirectionalLight(0xffffff,1.4);fill.position.set(4,3,-3);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xeeeee5,roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=-.02;scene.add(floor);let model=new THREE.Group();scene.add(model);let materials=[];const textureLoader=new THREE.TextureLoader();
function frameTexture([,color,url]) {
  if (!url) return woodTexture(color);
  const map=textureLoader.load(url,draw);
  map.colorSpace=THREE.SRGBColorSpace;
  return map;
}
function mat(f){const map=f.image?new THREE.Texture(f.image):textureLoader.load(f.data,()=>draw());map.needsUpdate=true;map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2,2);map.center.set(.5,.5);map.rotation=state.angle*Math.PI/180;map.anisotropy=renderer.capabilities.getMaxAnisotropy();const m=new THREE.MeshPhysicalMaterial({map,bumpMap:map,bumpScale:f.id==='fabric7'?.008:.003,roughness:.82,sheen:.6,sheenRoughness:.8,sheenColor:new THREE.Color('#e7dfd2')});return m}
function mesh(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;model.add(m);return m}
function box(w,h,d,r,material,x,y,z){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:12});g.translate(0,0,-d/2);return mesh(g,material,x,y,z)}
function rod(a,b,r1,r2,material){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const m=mesh(new THREE.CylinderGeometry(r1,r2,start.distanceTo(end),16),material,...start.clone().add(end).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return m}
let buildVersion = 0;
async function build() {
  const version = ++buildVersion;
  const product = catalog[index];
  const settings = { ...state };
  const wood = new THREE.MeshPhysicalMaterial({ map: frameTexture(finishes[settings.finish]), roughness: .36, clearcoat: .3 });
  const seat = mat(fabric(settings.seat));
  const back = mat(fabric(settings.back));
  const nextMaterials = [wood, seat, back];
  const dispose = (object, owned) => {
    object?.traverse(node => node.geometry?.dispose());
    owned.forEach(material => {
      material.map?.dispose();
      material.dispose();
    });
  };
  $('#modelStatus').textContent = 'Loading chair…';
  if (model.userData.product !== product.id) model.visible = false;
  try {
    const next = await assembleSuppliedChair(product, settings, { wood, seat, back });
    if (version !== buildVersion) {
      dispose(next, nextMaterials);
      return;
    }
    dispose(model, materials);
    scene.remove(model);
    model = next;
    model.userData.product = product.id;
    materials = nextMaterials;
    scene.add(model);
    $('#modelStatus').textContent = '';
    draw();
  } catch (error) {
    dispose(null, nextMaterials);
    if (version === buildVersion) $('#modelStatus').textContent = 'Unable to load these parts. Try selecting the chair again.';
    console.error(error);
  }
}
function updateCamera(){const fitted=distance*Math.max(1,.95/camera.aspect);camera.position.set(Math.sin(angle)*fitted,1+Math.sin(elevation)*fitted,Math.cos(angle)*fitted);camera.lookAt(0,catalog[index].category==='Bar'?1.25:1,0)}
function draw(){if(renderer.xr.isPresenting)return;updateCamera();renderer.render(scene,camera)}
function resize(){const r=$('#viewport').getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();draw()}new ResizeObserver(resize).observe($('#viewport'));
const viewerZoom = installViewerZoom({
  canvas:renderer.domElement,
  getDistance:()=>distance,
  changeDistance:value=>{distance=value;draw();},
  rotate(dx,dy){
    angle-=dx*.009;
    elevation=Math.max(.03,Math.min(.95,elevation+dy*.005));
    draw();
  },
  controls:$('#viewerZoom'),
});
function loop(){if(auto&&!viewerZoom.isInteracting()){angle+=.004;draw()}requestAnimationFrame(loop)}loop();
function renderSwatches(){const query=$('#fabricSearch').value;const items=fabricMatches(source==='curated'?curated:uploads.filter(f=>f.type===source),query);$('#fabricCount').textContent=items.length+' fabrics';$('#swatches').replaceChildren();if(!items.length){const p=document.createElement('p');p.className='empty';p.textContent=query?'No matching colors or textures.':'Upload a fabric to make it your own.';$('#swatches').append(p)}for(const f of items){const b=document.createElement('button');b.className='swatch'+(f.id===state[$('#zone').value==='back'?'back':'seat']?' active':'');b.style.backgroundImage=`url("${f.data}")`;b.title=(f.company?f.company+' · ':'')+f.name;b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',b.classList.contains('active'));b.onclick=()=>{const zone=$('#zone').value;if(zone!=='back')state.seat=f.id;if(zone!=='seat')state.back=f.id;refresh();build();persist()};$('#swatches').append(b)}const zone=$('#zone').value;$('#fabricName').textContent=zone==='all'&&state.seat!==state.back?'Seat: '+fabric(state.seat).name+' / Back: '+fabric(state.back).name:fabric(state[zone==='back'?'back':'seat']).name}
function refresh(){const p=catalog[index];
const revit = $('#revitDownload');
revit.href = 'revit/' + p.id + '.ifc';
revit.download = p.id + '.ifc';
revit.setAttribute('aria-label', 'Download ' + p.name + ' for Revit (.ifc)');
revit.hidden = false;
$('#modelName').textContent=$('#configName').textContent=p.name;$('#productCode').textContent='STUDIO / '+String(index+1).padStart(3,'0');$('#productCategory').textContent=p.category.toUpperCase()+' COLLECTION';$('#productDescription').textContent=p.description;
$('#officialOptionsText').textContent=p.options||'';
$('#officialOptions').hidden=!p.options;
const hasRender=Boolean(p.render||['baratheon-chair','aperture-chair','parigi-side-chair','tau-chair'].includes(p.id));
document.querySelector('[data-display="render"]').hidden=!hasRender;
if(!hasRender&&displayMode==='render')document.querySelector('[data-display="3d"]').click();$('#referencePhoto').src=displayMode==='render'?'renders/'+p.id+'.png':p.photo;$('#referencePhoto').alt=p.name+' — original Seating Shoppe photograph';$('#referenceLink').href=p.url;$('#photoDownload').href=p.photo;$('#photoDownload').download=p.id+'.jpg';$('#originalBack').textContent=p.name.replace(' Chair','')+' original back';for(const id of ['backStyle','seatStyle','angle'])$('#'+id).value=state[id] ?? 'original';const parts=supplied[p.id];$('#backVariant').hidden=!parts.alternateBack;$('#seatVariant').hidden=!parts.alternateSeat;$('#zone option[value="back"]').disabled=!parts.back;$('#zone option[value="all"]').textContent=parts.back?'Seat + back':'Seat only';if(!parts.back&&$('#zone').value==='back')$('#zone').value='seat';$('#angleValue').textContent=state.angle+'°';$('#finishName').textContent=finishes[state.finish][0];$('#summary').textContent=finishes[state.finish][0]+' / '+fabric(state.seat).name;$$('#finishes button').forEach((b,i)=>b.classList.toggle('active',i===state.finish));renderSwatches();$$('.product').forEach(b=>b.classList.toggle('active',b.dataset.id===p.id));for(const [id,view] of [['inlineLink','inline'],['pageLink','dedicated']])$('#'+id).href='?view='+view+'&product='+p.id}
function choose(i){persist();index=i;state={...fresh(catalog[i]),...saved[catalog[i].id]};refresh();build();const url=new URL(location.href);url.searchParams.set('product',catalog[i].id);history.replaceState(null,'',url);if(dedicated)$('.studio').scrollIntoView({behavior:'smooth',block:'start'})}
finishes.forEach(([name,color,texture],i)=>{const b=document.createElement('button');b.style.background=color;if(texture){b.style.backgroundImage='url('+texture+')';b.style.backgroundSize='cover'}b.title=name;b.setAttribute('aria-label',name);b.onclick=()=>{state.finish=i;refresh();build();persist()};$('#finishes').append(b)});
$$('.tabs button').forEach(b=>b.onclick=()=>{panel=b.dataset.panel;$$('.tabs button').forEach(x=>x.classList.toggle('active',x===b));$('#fabricPanel').hidden=panel!=='fabric';$('#partsPanel').hidden=panel!=='parts'});$$('.sources button').forEach(b=>b.onclick=()=>{source=b.dataset.source;$$('.sources button').forEach(x=>x.classList.toggle('active',x===b));renderSwatches()});$('#zone').onchange=renderSwatches;
for(const id of ['backStyle','seatStyle','angle'])$('#'+id).addEventListener('input',e=>{state[id]=['scale','angle'].includes(id)?Number(e.target.value):e.target.value;refresh();build();persist()});$('#nextProduct').onclick=()=>choose((index+1)%catalog.length);$('#resetDesign').onclick=()=>{state=fresh(catalog[index]);refresh();build();persist();toast('This product’s design has been reset.')};$('#resetView').onclick=()=>{angle=.64;elevation=.22;distance=5.1;viewerZoom.update();draw()};$('#rotate').onclick=()=>{auto=!auto;$('#rotate').setAttribute('aria-pressed',auto)};
function download(name,url){const a=document.createElement('a');a.href=url;a.download=name;a.click()}
$('#snapshot').onclick=()=>{draw();download('seating-shoppe-'+catalog[index].id+'.png',renderer.domElement.toDataURL('image/png'));toast('Design image downloaded.')};$('#save').onclick=()=>{persist();const data={prototype:true,product:catalog[index],configuration:state,seatFabric:fabric(state.seat),backFabric:fabric(state.back),frameFinish:finishes[state.finish][0]};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));download('seating-shoppe-'+catalog[index].id+'-design.json',url);setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Design saved in this browser and downloaded.')};
let previewData=null;function openUpload(type){$('#uploadForm').reset();$('#uploadType').value=type;$('#companyLabel').hidden=type!=='company';$('#companyName').required=type==='company';$('#uploadPreview').hidden=true;$('#uploadError').textContent='';previewData=null;$('#uploadDialog').showModal()}$('#upload').onclick=()=>openUpload('personal');$('#closeDialog').onclick=()=>$('#uploadDialog').close();$('#uploadType').onchange=()=>{const isCompany=$('#uploadType').value==='company';$('#companyLabel').hidden=!isCompany;$('#companyName').required=isCompany};$('#file').onchange=async()=>{previewData=null;$('#uploadPreview').hidden=true;$('#uploadError').textContent='';const f=$('#file').files[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>8*1024*1024){$('#uploadError').textContent='Choose a JPG, PNG or WebP image under 8 MB.';return}try{const bitmap=await createImageBitmap(f);const c=document.createElement('canvas');const scale=Math.min(1,640/Math.max(bitmap.width,bitmap.height));c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);bitmap.close();previewData=c.toDataURL('image/jpeg',.85);$('#uploadPreview').src=previewData;$('#uploadPreview').hidden=false;if(!$('#uploadName').value)$('#uploadName').value=f.name.replace(/\.[^.]+$/,'')}catch{$('#uploadError').textContent='This image could not be read. Try another file.'}};
$('#uploadForm').onsubmit=e=>{e.preventDefault();if(!previewData){$('#uploadError').textContent='Choose a valid image and wait for its preview.';return}const type='personal',name=$('#uploadName').value.trim(),company=$('#companyName').value.trim();if(!name||(type==='company'&&!company)){$('#uploadError').textContent='Enter a fabric name and company name where applicable.';return}const f={id:'upload-'+crypto.randomUUID(),name,type,company:type==='company'?company:'',data:previewData};try{localStorage.setItem('ss-fabrics',JSON.stringify([...uploads,f]))}catch{$('#uploadError').textContent='Browser storage is full. Try a smaller image.';return}uploads.push(f);source=type;$$('.sources button').forEach(b=>b.classList.toggle('active',b.dataset.source===source));const zone=$('#zone').value;if(zone!=='back')state.seat=f.id;if(zone!=='seat')state.back=f.id;refresh();build();persist();$('#uploadDialog').close();toast(type==='company'?'Company fabric added to this browser’s library.':'Your fabric is ready to preview.')};
$('#libraryNav').onclick=()=>{$('[data-panel="fabric"]').click();$('.config').scrollIntoView({behavior:'smooth',block:'center'})};$('#catalogNav').onclick=()=>$('.studio').scrollIntoView({behavior:'smooth'});
const thumbnails={};function renderProducts(){const cat=$('#category').value;$('#products').replaceChildren();catalog.forEach((p,i)=>{if((cat!=='all'&&cat!==p.category))return;const b=document.createElement('button');b.className='product'+(i===index?' active':'');b.dataset.id=p.id;const img=document.createElement('img');img.src=p.photo;img.alt=p.name+' official product photograph';const text=document.createElement('div');text.className='producttext';const name=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('small'),arrow=document.createElement('span');strong.textContent=p.name;small.textContent='Photo reference / 3D concept';arrow.textContent='↗';name.append(strong,small);text.append(name,arrow);b.append(img,text);b.onclick=()=>choose(i);$('#products').append(b)});if(!$('#products').children.length){const p=document.createElement('p');p.className='empty';p.textContent='No products match your search.';$('#products').append(p)}}$('#category').onchange=renderProducts;
state={...fresh(catalog[index]),...saved[catalog[index].id]};resize();refresh();build();
renderProducts();refresh();
var displayMode='3d';document.querySelectorAll('[data-display]').forEach(b=>b.onclick=()=>{displayMode=b.dataset.display;$('.visual').dataset.display=displayMode;document.querySelectorAll('[data-display]').forEach(x=>x.classList.toggle('active',x===b));$('#referencePhoto').src=displayMode==='render'?'renders/'+catalog[index].id+'.png':catalog[index].photo;$('#reference small').textContent=displayMode==='render'?'AI-generated still reference · does not change with controls':'Original photograph · The Seating Shoppe';$('#referenceLink').hidden=displayMode==='render';$('#photoDownload').href=$('#referencePhoto').src;$('#photoDownload').download=catalog[index].id+(displayMode==='render'?'-render.png':'.jpg');$('#reference').hidden=displayMode==='3d';$('#viewport').hidden=(displayMode==='photo'||displayMode==='render');$('.stagecaption').hidden=(displayMode==='photo'||displayMode==='render');$('.viewtools').hidden=(displayMode==='photo'||displayMode==='render');$('.draghelp').hidden=displayMode!=='3d';if(displayMode!=='photo'&&displayMode!=='render')resize()});


const catalogEntries = [];
catalog.forEach((product, i) => {
  const openChair = () => {
    choose(i);
    $('.studio').scrollIntoView({ behavior: 'smooth' });
  };
  catalogEntries.push({ title: product.name, description: [product.description,product.options].filter(Boolean).join(' · '), kind: 'Chair', open: openChair });
  const parts = supplied[product.id];
  const addPart = (title, description, control, value) => {
    catalogEntries.push({
      title: product.name + ' · ' + title, description, kind: 'Part',
      open() {
        openChair();
        $('[data-panel="parts"]').click();
        if (!control) return;
        const select = $('#' + control);
        select.value = value;
        select.dispatchEvent(new Event('input', { bubbles:true }));
      },
    });
  };
  addPart('Frame', 'The original chair frame and legs. Change the frame finish in Components.');
  addPart('Boxed seat', 'The original upholstered seat cushion.', 'seatStyle', 'original');
  if (parts.back) addPart('Original back', product.description, 'backStyle', 'original');
  if (parts.alternateBack) addPart('Tufted back', 'An upholstered back with recessed tufting.', 'backStyle', 'tufted');
  if (parts.alternateSeat) addPart('Pullover seat', 'Alternative seat with upholstery wrapped over the cushion.', 'seatStyle', 'alternate');
});
curated.forEach(item => catalogEntries.push({
  title: item.name, description: fabricDescription(item), kind: 'Fabric',
  open() {
    $('[data-panel="fabric"]').click();
    $('[data-source="curated"]').click();
    $('#fabricSearch').value='';renderSwatches();$('#swatches').querySelectorAll('button')[curated.indexOf(item)]?.click();
    $('.studio').scrollIntoView({ behavior:'smooth' });
  },
}));
finishes.forEach(([name,, ,description],i)=>catalogEntries.push({
  title:name, description:description||'Frame finish', kind:'Frame finish',
  open(){ $('[data-panel="parts"]').click();$('#finishes').querySelectorAll('button')[i].click(); }
}));
installCatalogSearch(catalogEntries);

$('#fabricSearch').addEventListener('input', renderSwatches);
const configurationForm = $('#configurationForm');
const configPrompt = $('#configurationPrompt');
const configStatus = $('#configurationStatus');
const chairDescriptions = catalog.map(product => ({ title: product.name, description: product.description, product }));
let configRequest = 0;
configPrompt.addEventListener('input', () => {
  configRequest++;
  configStatus.textContent = '';
});
configurationForm.addEventListener('submit', async event => {
  event.preventDefault();
  const prompt = configPrompt.value.trim();
  if (!prompt) return;
  const request = ++configRequest;
  const original = catalog[index];
  const originalState = state;
  const plan = suggested => interpretConfiguration(prompt, catalog, supplied, curated, finishes, original, suggested);
  let result = plan();
  let fallback = '';
  const text = prompt.toLowerCase();
  const namesChair = catalog.some(product => text.includes(product.name.toLowerCase().replace(' chair','')));
  if (!namesChair && !/cutout|cut.out|opening|keyhole|slat|top rail|rounded back|tuft|pullover|pull.over|boxed seat/.test(text)
    && /\bchair\b/.test(text)) {
    configStatus.textContent = 'Finding a chair that matches your description…';
    try {
      const [candidate] = await semanticMatches(chairDescriptions, prompt);
      if (candidate) result = plan(candidate.product);
    } catch {
      fallback = ' AI matching was unavailable.';
    }
  }
  if (request !== configRequest) return;
  if (catalog[index] !== original || state !== originalState) {
    configStatus.textContent = 'The chair changed while searching. Run the request again to apply it.';
    return;
  }
  const changes = result.changes;
  const details = [];
  if (changes.backStyle) details.push(changes.backStyle === 'tufted' ? 'tufted back' : 'original back');
  if (changes.seatStyle) details.push(changes.seatStyle === 'alternate' ? 'pullover seat' : 'boxed seat');
  if (changes.finish !== undefined) details.push(finishes[changes.finish][0] + ' frame');
  if (changes.seat) details.push(fabric(changes.seat).name + ' seat');
  if (changes.back) details.push(fabric(changes.back).name + ' back');
  if (result.match !== original) choose(catalog.indexOf(result.match));
  if (details.length) {
    Object.assign(state, changes);
    refresh();
    build();
    persist();
  }
  if (result.match !== original || details.length) {
    document.querySelector('[data-display="3d"]').click();
    configStatus.textContent = result.match.name + (details.length ? ' · ' + details.join(', ') : ' · selected') + '.';
  } else {
    configStatus.textContent = 'No configuration changes applied.';
  }
  configStatus.textContent += (result.warnings.length ? ' ' + result.warnings.join(' ') : '') + fallback;
});


installRoomAR({
  renderer, button: $('#roomAR'), status: $('#roomARStatus'), overlay: $('#roomAROverlay'), redraw: resize,
  getChair() {
    const chair = catalog[index];
    if (model.userData.product !== chair.id || $('#modelStatus').textContent) return null;
    return { object:model, heightMeters:model.userData.sourceHeightMeters, viewerHeight:chair.h };
  },
});
