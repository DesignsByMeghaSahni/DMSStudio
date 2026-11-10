/* DMS Studio · original procedural house.
 * Native scroll -> camera path. Scanned CC0 PBR textures, local environment and procedural architecture. No remote runtime requests.
 * Rendering sleeps when stable/offscreen. Keyboard/touch controls supplement scroll.
 */
(() => {
  'use strict';
  const section = document.querySelector('#walkthrough');
  if (!section) return;
  const scriptRoot = new URL('.', document.currentScript.src);
  const view = document.querySelector('#house-view');
  const mount = document.querySelector('#house-canvas');
  const status = document.querySelector('#tour-load-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const chapters = [...document.querySelectorAll('[data-tour]')];
  const orbitButton = document.querySelector('#orbit-toggle');
  const orbitControls = document.querySelector('.orbit-controls');
  const title = document.querySelector('#tour-title');
  const description = document.querySelector('#tour-description');
  const hint = document.querySelector('#tour-hint');
  const progressBar = document.querySelector('.tour-progress > span');
  const chapterData = [
    ['The plan','See how the spaces connect. Every considered home begins with a thoughtful layout.'],
    ['In perspective','Walls gain depth. Light finds its way in. A drawing becomes a place.'],
    ['Welcome inside','Move through the entrance. A quiet threshold connects the outside to the world within.'],
    ['The living room','Soft seating, warm timber and a generous pool of daylight. Space to simply be.'],
    ['Gather together','An open dining space, designed around conversation and everyday rituals.']
  ];
  let started = false, api = null, lastChapter = -1, manualProgress = 0;
  function setChapter(progress) {
    const index = progress < .12 ? 0 : progress < .35 ? 1 : progress < .6 ? 2 : progress < .87 ? 3 : 4;
    progressBar.style.width = `${Math.max(1, progress * 100)}%`;
    if (lastChapter === index) return;
    lastChapter = index;
    title.textContent = chapterData[index][0]; description.textContent = chapterData[index][1];
    document.querySelector('.walkthrough-number').innerHTML = `0${index + 1} <span>/ 05</span>`;
    chapters.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    mount.setAttribute('aria-label', `3D concept house: ${chapterData[index][0]}. ${chapterData[index][1]}`);
  }
  function fallback(message) {
    section.classList.add('is-fallback'); status.hidden=false; status.textContent = message;
    hint.textContent = 'Illustrative floor plan'; orbitButton.hidden = true;
    mount.classList.remove('is-ready'); view.classList.remove('has-3d');
  }
  function loadEngine() {
    return new Promise((resolve, reject) => {
      if (window.THREE) return resolve();
      const script = document.createElement('script');
      script.src = new URL('vendor/three.min.js', scriptRoot).href;
      script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
  }
  async function start() {
    if (started) return;
    started = true; status.textContent = 'Preparing your 3D house…';
    try { await Promise.all([loadEngine(), new Promise((resolve,reject)=>{const materials=document.createElement('script');materials.src=new URL('house-materials.js',scriptRoot).href;materials.onload=resolve;materials.onerror=resolve;document.head.append(materials);})]); api = createHouse(); }
    catch (error) { fallback('The floor plan is available here. Interactive 3D needs a WebGL2-enabled browser.'); }
  }
  if (reduced.matches) section.classList.add('is-manual');
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { start(); loader.disconnect(); }
    }, {rootMargin:'700px 0px'}); loader.observe(section);
  } else { start(); }
  chapters.forEach(button => button.addEventListener('click', () => {
    manualProgress = Number(button.dataset.tour);
    if (reduced.matches) { api?.setProgress(manualProgress); setChapter(manualProgress); }
    else {
      const top = section.getBoundingClientRect().top + scrollY;
      window.scrollTo({top:top + manualProgress * (section.offsetHeight - innerHeight),behavior:'smooth'});
    }
    api?.exitOrbit(); start();
  }));

  function createHouse() {
    const T = window.THREE;
    const mobile = matchMedia('(max-width: 700px)').matches;
    const renderer = new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
    renderer.setClearColor(0xe9e4da);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.domElement.setAttribute('aria-hidden','true'); mount.append(renderer.domElement);
    const scene = new T.Scene();
    scene.background = new T.Color(0xe9e4da);
    const camera = new T.PerspectiveCamera(43,1,.07,100);
    const house = new T.Group(); scene.add(house);
    const mat = (color,roughness=.85) => new T.MeshStandardMaterial({color,roughness,metalness:0});
    const plaster=mat(0xe5dfd1), limestone=mat(0xc6b59a), cream=mat(0xeee6d7), oak=mat(0xb9a387), walnut=mat(0x59412e), charcoal=mat(0x35382f), linen=mat(0xcfc9bf), rug=mat(0xb9b3a7), green=mat(0x6c7350), brass=mat(0xa28b5c,.4), dark=mat(0x292822);
    // Photographic material maps, not flat fills. Environment supplies rough reflections.
    const loader=new T.TextureLoader();
    function texture(name,repeat=1,color=false){
      if(!window.DMS_MATERIALS?.[name])return null;
      const tx=loader.load(window.DMS_MATERIALS[name],()=>requestRender());
      tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(repeat,repeat);tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      if(color)tx.colorSpace=T.SRGBColorSpace;return tx;
    }
    function surface(material,prefix,diffuse,repeat,normalStrength){
      material.map=texture(prefix+'-'+diffuse,repeat,true);material.normalMap=texture(prefix+'-nor_gl',repeat);material.roughnessMap=texture(prefix+'-Rough',repeat);material.normalScale.set(normalStrength,normalStrength);material.needsUpdate=true;
    }
    surface(oak,'oak','Diffuse',1,.5);surface(walnut,'oak','Diffuse',1,.35);
    surface(plaster,'plaster','Diffuse',2,.15);surface(limestone,'plaster','Diffuse',1,.22);
    surface(linen,'linen','col_1',18,.2);surface(cream,'linen','col_1',18,.16);surface(rug,'linen','col_1',30,.35);
    linen.map=null;cream.map=null;rug.map=null;plaster.map=null;limestone.map=null;
    oak.color.set(0xe8d7bd);walnut.color.set(0xa88e71);
    brass.metalness=.85;brass.roughness=.28;
    if(window.DMS_MATERIALS?.['studio-environment'])loader.load(window.DMS_MATERIALS['studio-environment'],tx=>{tx.mapping=T.EquirectangularReflectionMapping;tx.colorSpace=T.SRGBColorSpace;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(tx).texture;scene.environmentIntensity=1.0;tx.dispose();pmrem.dispose();requestRender();});
    const boxGeometry = new T.BoxGeometry(1,1,1);
    const meshes=[];
    function box(w,h,d,x,y,z,material,parent=house) {
      const mesh=new T.Mesh(boxGeometry,material);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);meshes.push(mesh);return mesh;
    }
    function cylinder(rt,rb,h,x,y,z,material,segments=32,parent=house) {
      const mesh=new T.Mesh(new T.CylinderGeometry(rt,rb,h,segments),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);meshes.push(mesh);return mesh;
    }
    function sphere(r,x,y,z,material,sx=1,sy=1,sz=1,parent=house) {
      const mesh=new T.Mesh(new T.SphereGeometry(r,20,12),material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);meshes.push(mesh);return mesh;
    }
    function rounded(w,h,d,r,x,y,z,material,parent=house) {
      const shape=new T.Shape(),hw=w/2,hh=h/2;
      shape.moveTo(-hw+r,-hh);shape.lineTo(hw-r,-hh);shape.quadraticCurveTo(hw,-hh,hw,-hh+r);
      shape.lineTo(hw,hh-r);shape.quadraticCurveTo(hw,hh,hw-r,hh);shape.lineTo(-hw+r,hh);
      shape.quadraticCurveTo(-hw,hh,-hw,hh-r);shape.lineTo(-hw,-hh+r);shape.quadraticCurveTo(-hw,-hh,-hw+r,-hh);
      const geometry=new T.ExtrudeGeometry(shape,{depth:Math.max(.02,d-r*2),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r*.55,bevelThickness:r,curveSegments:5});geometry.center();
      const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);meshes.push(mesh);return mesh;
    }
    // Floating architectural base and subtle dimension lines.
    box(13,.28,10,0,-.25,0,limestone).castShadow=false;
    box(12,.12,9,0,-.05,0,oak).castShadow=false;
    // Floorboards establish real scale without large image textures.
    for(let x=-5.8;x<6;x+=.4) box(.007,.003,9,x,.014,0,walnut).castShadow=false;
    for(let z=-4;z<4.5;z+=1.8)for(let x=-5.8;x<6;x+=.8)box(.4,.003,.006,x,.015,z+((Math.round(x*10)%3)*.2),walnut).castShadow=false;
    const foundationGround = new T.Mesh(new T.PlaneGeometry(200,200),mat(0xe9e4da));
    foundationGround.rotation.x=-Math.PI/2;foundationGround.position.y=-.42;foundationGround.receiveShadow=true;scene.add(foundationGround);
    // Exterior walls: front is deliberately cut away to reveal the model.
    box(12.3,3.25,.2,0,1.62,-4.5,plaster);
    box(.2,3.25,2.55,-6,1.62,-3.225,plaster);box(.2,3.25,2.7,-6,1.62,3.15,plaster);
    box(.2,.45,3.8,-6,.22,-.05,plaster);box(.2,.28,3.8,-6,3.11,-.05,plaster);
    box(.2,3.25,9,6,1.62,0,plaster);
    box(4.9,.55,.2,-3.55,.27,4.5,plaster);box(4.9,.55,.2,3.55,.27,4.5,plaster);
    // Entry portico, deliberately roofless for dollhouse readability.
    box(.22,3.2,.22,-1.1,1.6,4.5,limestone);box(.22,3.2,.22,1.1,1.6,4.5,limestone);box(2.42,.22,.28,0,3.1,4.5,limestone);
    box(2.2,.1,1.5,0,-.01,5.25,limestone);
    // Two connected rooms, a generous opening between them.
    box(.2,3.2,3.5,1,1.6,-2.75,plaster);box(.2,3.2,1.4,1,1.6,3.8,plaster);box(.2,.42,4,1,2.99,1,plaster);
    // Back feature wall with timber slats and large framed abstract artwork.
    box(5.6,2.8,.08,-3,1.6,-4.34,oak);
    for(let x=-5.6;x<-.4;x+=.18)box(.045,2.8,.06,x,1.6,-4.26,walnut);
    box(2.6,1.8,.09,-3,1.85,-4.13,walnut);box(2.45,1.65,.035,-3,1.85,-4.065,cream);
    const artCircle=new T.Mesh(new T.CircleGeometry(.53,48),mat(0x92795b));artCircle.position.set(-3.4,1.85,-4.04);house.add(artCircle);
    box(.8,1.2,.02,-2.62,1.69,-4.035,limestone);
    // Living room rug and L-shaped softly upholstered sofa.
    rounded(4.5,.03,4.6,.02,-2.8,.045,-.45,rug);
    const sofa=new T.Group();house.add(sofa);sofa.position.set(-3.15,0,-2.85);
    rounded(4.25,.4,1.05,.12,0,.35,0,linen,sofa);
    rounded(4.25,.8,.28,.1,0,.82,-.46,linen,sofa);
    rounded(.3,.65,1.1,.1,-2.06,.55,0,linen,sofa);rounded(.3,.65,1.1,.1,2.06,.55,0,linen,sofa);
    for(let x=-1.4;x<=1.5;x+=1.4)rounded(1.31,.22,.83,.09,x,.62,.05,cream,sofa);
    rounded(1.2,.42,1.6,.12,-1.55,.37,1.1,linen,sofa);rounded(1.05,.22,1.45,.09,-1.55,.65,1.1,cream,sofa);
    for(let x of [-1.5,1.5]){const cushion=rounded(.6,.6,.22,.1,x,.94,-.2,limestone,sofa);cushion.rotation.z=x>0?-.18:.15;}
    // Two nested stone coffee tables, books and ceramics.
    cylinder(.82,.82,.1,-2.3,.49,-.25,limestone);cylinder(.38,.46,.43,-2.3,.24,-.25,walnut);
    cylinder(.5,.5,.09,-1.15,.34,.15,cream);cylinder(.24,.3,.29,-1.15,.16,.15,walnut);
    box(.4,.045,.28,-2.42,.56,-.15,cream);box(.33,.035,.24,-2.4,.6,-.12,charcoal);
    cylinder(.13,.17,.29,-2,.7,-.47,plaster);cylinder(.075,.12,.09,-2,.88,-.47,plaster);
    // Accent chair and side table near the open facade.
    const chair=new T.Group();chair.position.set(-4.25,0,2.1);chair.rotation.y=.4;house.add(chair);
    rounded(.9,.22,.85,.09,0,.53,0,oak,chair);rounded(.95,.75,.18,.1,0,.92,.4,oak,chair);
    for(const x of [-.34,.34])for(const z of [-.3,.3])box(.055,.48,.055,x,.24,z,walnut,chair);
    cylinder(.37,.37,.055,-5.15,.62,1.7,walnut);cylinder(.07,.09,.59,-5.15,.3,1.7,walnut);
    // Window suggestion: pale glazing, dark mullions and light sheer strips.
    const glass=new T.MeshPhysicalMaterial({color:0xc4d0cb,transparent:true,opacity:.16,roughness:.06,metalness:.05});box(.025,2.4,3.4,-5.875,1.8,-.1,glass).castShadow=false;
    for(let z of [-1.8,-.68,.45,1.6])box(.06,2.5,.045,-5.83,1.8,z,charcoal);
    box(.07,.055,3.5,-5.82,3.03,-.1,charcoal);box(.07,.055,3.5,-5.82,.57,-.1,charcoal);
    // Pleated floor-length curtains, sill and a timber window seat.
    for(const edge of [-2.04,1.86])for(let i=0;i<8;i++){const fold=cylinder(.045,.045,2.8,-5.7+(i%2)*.035,1.54,edge+i*.045,cream,10);fold.castShadow=false;}
    box(.34,.055,3.7,-5.72,.52,-.1,limestone);
    // Dining zone: sideboard, oval table, chairs and pendant.
    rounded(3.8,.8,.52,.04,3.45,.45,-4.02,walnut);
    for(let x=1.8;x<5.3;x+=.38)box(.015,.69,.01,x,.46,-3.745,oak);
    cylinder(.25,.35,.55,4.75,1.1,-4.0,limestone);sphere(.2,4.75,1.43,-4.0,green,1,1.2,1);
    box(1.7,1.3,.06,3.0,2.0,-4.34,walnut);box(1.57,1.17,.02,3.0,2.0,-4.29,cream);
    const art2=new T.Mesh(new T.CircleGeometry(.38,32),mat(0x666c51));art2.position.set(3,2,-4.27);house.add(art2);
    rounded(2.8,.12,1.25,.25,3.65,.87,-.7,oak);
    cylinder(.22,.28,.79,2.83,.43,-.7,walnut);cylinder(.22,.28,.79,4.47,.43,-.7,walnut);
    for(const x of [2.75,4.55])for(const z of [-1.85,.48]){
      const seat=new T.Group();seat.position.set(x,0,z);if(z<0)seat.rotation.y=Math.PI;house.add(seat);
      rounded(.65,.16,.6,.06,0,.48,0,cream,seat);rounded(.68,.62,.14,.06,0,.82,.25,linen,seat);
      for(const a of [-.25,.25])for(const b of [-.2,.2])box(.045,.43,.045,a,.22,b,walnut,seat);
    }
    const pendantMaterial=new T.MeshStandardMaterial({color:0xf0dfba,emissive:0xf3ddab,emissiveIntensity:.35,roughness:.7});
    cylinder(.02,.02,.55,3.65,2.97,-.7,brass);sphere(.42,3.65,2.3,-.7,pendantMaterial,1,.7,1);
    cylinder(.23,.23,.04,3.6,.965,-.65,cream);cylinder(.08,.1,.27,3.6,1.12,-.65,limestone);
    // Indoor tree; deterministic branches and leaf clusters.
    cylinder(.34,.26,.65,5.25,.34,2.85,plaster);cylinder(.036,.055,1.65,5.25,1.3,2.85,walnut,12);
    for(let i=0;i<9;i++){
      const angle=i*2.399;const y=1.25+i*.1;const x=5.25+Math.cos(angle)*(.27+(i%3)*.1);const z=2.85+Math.sin(angle)*(.27+(i%3)*.1);
      sphere(.24,x,y+.3,z,green,1,.5,1.4);
    }
    // Door opening framed in warm timber. Small architectural lighting details.
    box(.24,.08,3.9,.91,2.7,.98,walnut);
    for(const x of [-5.4,-.65]){
      cylinder(.07,.07,.65,x,1.75,-4.26,brass,16);
      sphere(.105,x,2.11,-4.2,pendantMaterial);
    }
    const hemisphere=new T.HemisphereLight(0xeef2ff,0x8e7961,1.25);scene.add(hemisphere);
    const sun=new T.DirectionalLight(0xffedcf,2.6);sun.position.set(-8,7,4);sun.castShadow=true;
    sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);sun.shadow.camera.left=-11;sun.shadow.camera.right=11;sun.shadow.camera.top=11;sun.shadow.camera.bottom=-11;sun.shadow.camera.near=.1;sun.shadow.camera.far=35;sun.shadow.bias=-.001;sun.shadow.normalBias=.045;sun.target.position.set(0,0,-1);scene.add(sun,sun.target);
    const fill=new T.DirectionalLight(0xe5edff,.45);fill.position.set(6,5,-5);scene.add(fill);
    // Architectural finish details establish scale and realistic junctions.
    box(12,.095,.035,0,.075,-4.37,cream);box(.035,.095,9,5.87,.075,0,cream);
    box(.035,.095,2.4,-5.87,.075,-3.2,cream);
    const ceilingMaterial=mat(0xe9e5db);ceilingMaterial.transparent=true;ceilingMaterial.opacity=0;
    const ceiling=box(12.1,.12,9.1,0,3.29,0,ceilingMaterial);ceiling.castShadow=false;
    const cove=new T.MeshStandardMaterial({color:0xffe2ae,emissive:0xffcb79,emissiveIntensity:2});
    box(11.4,.025,.035,0,3.16,-4.33,cove).castShadow=false;
    for(const x of [-4,-1.8,2.5,4.8]){cylinder(.095,.095,.02,x,3.18,1.2,brass);const bulb=new T.PointLight(0xffd7a0,.7,4,2);bulb.position.set(x,2.95,1.2);scene.add(bulb);}
    const pendantLight=new T.PointLight(0xffd1a0,5,6,2);pendantLight.position.set(3.65,2.15,-.7);scene.add(pendantLight);
    // Sofa feet and stitched cushion seams. No motion or decorative floating shapes.
    for(const x of [-5.05,-1.25])for(const z of [-3.2,-2.5])cylinder(.035,.035,.16,x,.12,z,walnut,12);
    for(const x of [-4.55,-3.15,-1.75])box(1.22,.009,.012,x,.743,-2.39,linen);
    // Fine leaves replace the old spherical tree clusters.
    for(let i=0;i<meshes.length;i++){const m=meshes[i];if(m.material===green&&m.geometry.type==='SphereGeometry')m.visible=false;}
    for(let i=0;i<52;i++){const a=i*2.399;const h=1.2+(i%13)*.09;const radius=.25+(i%5)*.07;const leaf=new T.Mesh(new T.SphereGeometry(1,8,6),green);leaf.scale.set(.12,.014,.25);leaf.position.set(5.25+Math.cos(a)*radius,h,2.85+Math.sin(a)*radius);leaf.rotation.set(.3*Math.sin(a),a,.25);house.add(leaf);}
    // Soft, stationary contact shadows ground furnishings without a per-frame postprocess.
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,10,64,64,64);gradient.addColorStop(0,'rgba(35,24,16,.4)');gradient.addColorStop(1,'rgba(35,24,16,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
    const shadowTexture=new T.CanvasTexture(shadowCanvas);
    for(const [x,z,w,d] of [[-3.1,-2.8,5,2],[-2.3,-.25,2.5,2.5],[3.65,-.7,4.2,2.6]]){const shadow=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.026,z);house.add(shadow);}
    // A small, fixed number of chapter camera poses. No collisions through room walls.
    const stops=[
      {t:0,pos:[.2,24,11],look:[0,0,0]},
      {t:.23,pos:[13,11.5,15],look:[0,.7,0]},
      {t:.48,pos:[0,2.7,10],look:[-.7,1.15,-1.8]},
      {t:.74,pos:[.05,1.75,2.45],look:[-3.15,1.15,-2.1]},
      {t:1,pos:[3.85,1.8,2.35],look:[3.5,1.05,-2.45]}
    ];
    let current=0,target=0,frame=0,visible=true,orbit=false,angle=.72,elevation=.73,drag=null,needsRender=true;
    const look=new T.Vector3(),position=new T.Vector3();
    function cameraPose(progress) {
      ceilingMaterial.opacity=orbit?0:T.MathUtils.smoothstep(progress,.5,.68);ceiling.visible=ceilingMaterial.opacity>.01;
      if(orbit){const radius=mobile?21:18;camera.position.set(Math.sin(angle)*Math.cos(elevation)*radius,Math.sin(elevation)*radius,Math.cos(angle)*Math.cos(elevation)*radius);camera.lookAt(0,.5,0);return;}
      let i=0;while(i<stops.length-2&&progress>stops[i+1].t)i++;
      const a=stops[i],b=stops[i+1];let f=T.MathUtils.clamp((progress-a.t)/(b.t-a.t),0,1);f=f*f*(3-2*f);
      position.fromArray(a.pos).lerp(new T.Vector3(...b.pos),f);look.fromArray(a.look).lerp(new T.Vector3(...b.look),f);
      // Extra pull-back while reading the plan on narrow canvases.
      if(camera.aspect<1&&progress<.45)position.multiplyScalar(T.MathUtils.lerp(1.35,1,Math.min(progress/.45,1)));
      if(camera.aspect<1&&progress>.45){position.z+=Math.min(1,(progress-.45)/.25)*.8;position.y+=.1;}
      camera.position.copy(position);camera.lookAt(look);
    }
    function requestRender(){needsRender=true;if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
    function render(){
      frame=0;if(!visible||document.hidden)return;
      if(reduced.matches)current=target;else current+=(target-current)*.12;
      if(Math.abs(current-target)<.0003)current=target;
      cameraPose(current);renderer.render(scene,camera);mount.dataset.progress=current.toFixed(3);mount.dataset.view=orbit ? "orbit" : "walkthrough";needsRender=false;
      if(Math.abs(current-target)>.0003)frame=requestAnimationFrame(render);
    }
    function resize(){const rect=mount.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.fov=camera.aspect<1?54:43;camera.updateProjectionMatrix();requestRender();}
    new ResizeObserver(resize).observe(mount);
    function readScroll(){
      if(reduced.matches)return;
      const rect=section.getBoundingClientRect();target=T.MathUtils.clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight),0,1);setChapter(target);requestRender();
    }
    window.addEventListener('scroll',readScroll,{passive:true});
    window.addEventListener('resize',()=>{resize();readScroll();},{passive:true});
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){readScroll();requestRender();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px'});observer.observe(view);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestRender();});
    function exitOrbit(){orbit=false;section.classList.remove('is-orbit');orbitControls.hidden=true;orbitButton.setAttribute('aria-pressed','false');orbitButton.textContent='Explore 360° ↗';hint.textContent=reduced.matches?'Choose a room view below':'Scroll to move through the house ↓';requestRender();}
    orbitButton.disabled=false;orbitButton.addEventListener('click',()=>{
      if(orbit)return exitOrbit();
      orbit=true;section.classList.add('is-orbit');orbitControls.hidden=false;orbitButton.setAttribute('aria-pressed','true');orbitButton.textContent='Return to walkthrough';hint.textContent='Drag to rotate · or use the arrows';requestRender();
    });
    mount.addEventListener('pointerdown',event=>{if(!orbit)return;drag={x:event.clientX,y:event.clientY};renderer.domElement.setPointerCapture(event.pointerId);});
    mount.addEventListener('pointermove',event=>{if(!orbit||!drag)return;angle-=(event.clientX-drag.x)*.006;elevation=T.MathUtils.clamp(elevation+(event.clientY-drag.y)*.004,.25,1.38);drag={x:event.clientX,y:event.clientY};requestRender();});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])mount.addEventListener(name,()=>{drag=null;});
    document.querySelectorAll('[data-orbit]').forEach(button=>button.addEventListener('click',()=>{angle+=Number(button.dataset.orbit);requestRender();}));
    document.querySelector('#orbit-reset').addEventListener('click',()=>{angle=.72;elevation=.73;requestRender();});
    reduced.addEventListener('change',()=>{section.classList.toggle('is-manual',reduced.matches);if(reduced.matches){target=manualProgress;setChapter(target);}else readScroll();requestRender();});
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;visible=false;fallback('3D paused. The floor plan remains available. Reload the page to try the interactive view again.');});
    section.classList.add('is-enhanced');resize();readScroll();renderer.shadowMap.needsUpdate=true;cameraPose(target);renderer.render(scene,camera);
    mount.classList.add('is-ready');view.classList.add('has-3d');status.hidden=true;
    hint.textContent=reduced.matches?'Choose a room view below':'Scroll to move through the house ↓';
    return {exitOrbit,setProgress(p){target=p;requestRender();}};
  }
})();
