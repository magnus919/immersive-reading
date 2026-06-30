// The fractal frontier — a particle sphere that grows fractal detail as you
// descend (knowledge has a fractal edge: pry open a crack, a world inside).
// Self-contained: renders behind everything, reads scroll + the DOM to decide
// when it should glow (over the hero / pinned overtures) and when to recede
// behind the reading text. It does NOT touch the reader's own JS.
// THREE is the global from the r128 CDN script (matches the proven immersive build).
const THREE = window.THREE;

const VERT = `
precision highp float;
uniform float uTime, uAmp, uFreq, uSize, uSeed;
attribute float aRand;
varying float vDisp; varying float vRand;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*snoise(p); p=p*2.0+13.7; a*=0.5;} return v; }
void main(){
  vec3 pos=normalize(position);
  float n=fbm(pos*uFreq + vec3(uSeed) + uTime*0.04);
  float disp=n*uAmp;
  vDisp=disp; vRand=aRand;
  vec3 p=pos*(1.0+disp);
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_PointSize=uSize*(9.0/ -mv.z)*(0.55+0.9*aRand);
  gl_Position=projectionMatrix*mv;
}`;

const FRAG = `
precision highp float;
uniform vec3 uColA, uColB; uniform float uBright;
varying float vDisp; varying float vRand;
void main(){
  vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5) discard;
  float a=smoothstep(0.5,0.0,d);
  vec3 col=mix(uColA,uColB,smoothstep(-0.15,0.4,vDisp));
  col*=uBright*(0.5+0.6*vRand);
  gl_FragColor=vec4(col,a*0.5*(0.3+0.7*vRand));
}`;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export function createFrontier() {
  const canvas = document.getElementById("gl");
  if (!canvas || !THREE || typeof WebGLRenderingContext === "undefined") return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  // fibonacci sphere — even point distribution
  const N = 9000;
  const positions = new Float32Array(N * 3), rand = new Float32Array(N);
  const gr = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < N; i++) {
    const t = i / N, inc = Math.acos(1 - 2 * t), az = (2 * Math.PI * i) / gr;
    positions[i * 3] = Math.sin(inc) * Math.cos(az);
    positions[i * 3 + 1] = Math.sin(inc) * Math.sin(az);
    positions[i * 3 + 2] = Math.cos(inc);
    rand[i] = Math.abs((Math.sin(i * 127.1) * 43758.5453) % 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

  const uniforms = {
    uTime: { value: 0 }, uAmp: { value: 0.05 }, uFreq: { value: 1.1 },
    uSize: { value: 1.5 }, uSeed: { value: 0 },
    uColA: { value: new THREE.Color("#6a3c18") }, uColB: { value: new THREE.Color("#ecb46c") },
    uBright: { value: 0.9 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));
  scene.add(group);
  let lightMode = false;
  function setTheme(light) {
    lightMode = light;
    if (light) {
      uniforms.uColA.value.set("#a87c46");
      uniforms.uColB.value.set("#4a2c12");
      mat.blending = THREE.NormalBlending;
    } else {
      uniforms.uColA.value.set("#6a3c18");
      uniforms.uColB.value.set("#ecb46c");
      mat.blending = THREE.AdditiveBlending;
    }
    mat.needsUpdate = true;
  }
  setTheme(document.body.classList.contains("light"));
  addEventListener("il-theme", (event) => setTheme(Boolean(event.detail && event.detail.light)));

  function resize() {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  const veilEl = document.getElementById("veil");
  const target = { amp: 0.05, freq: 1.1, seed: 0, bright: 1.4, rotY: 0, camZ: 4.2, veil: 0 };
  const cur = { ...target };
  cur.camZ = 8.6; cur.bright = 0.08; cur.veil = 0.22; cur.amp = 0.02; // ignite + dolly-in on load

  // glow over the frontier sections; recede behind the reading column.
  function onScroll() {
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = h > 0 ? scrollY / h : 0;
    target.amp = 0.05 + p * 0.62;   // knowledge grows fractal as you descend
    target.freq = 1.1 + p * 2.8;
    target.seed = p * 6.0;
    target.camZ = 4.2 - p * 0.9;    // descend INTO it
    target.rotY = p * 1.35;         // turn as you go, no idle spin
    const vh = innerHeight;
    let onFrontier = false, onReading = false;
    document.querySelectorAll(".movement, .hero").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > vh * 0.45) onFrontier = true;
    });
    document.querySelectorAll(".body-wrap, .foot").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > vh * 0.45) onReading = true;
    });
    const readingActive = onReading;
    document.body.classList.toggle("frontier-reading", readingActive);
    target.veil = readingActive ? 0.7 : (onFrontier ? 0.02 : 0.34);
    if (lightMode) {
      target.bright = readingActive ? 0.34 : (onFrontier ? 0.92 : 0.58);
    } else {
      target.bright = readingActive ? 0.4 : (onFrontier ? 1.42 : 0.58);
    }
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function raf() {
    uniforms.uTime.value += 0.016;
    for (const k of ["amp", "freq", "seed", "bright", "camZ", "veil", "rotY"]) cur[k] += (target[k] - cur[k]) * 0.06;
    uniforms.uAmp.value = cur.amp; uniforms.uFreq.value = cur.freq; uniforms.uSeed.value = cur.seed;
    uniforms.uBright.value = cur.bright;
    group.rotation.y = cur.rotY + Math.sin(uniforms.uTime.value * 0.05) * 0.04; // scroll-driven turn + faint sway
    group.rotation.x = Math.sin(uniforms.uTime.value * 0.07) * 0.06;            // gentle breath
    camera.position.z = cur.camZ;
    if (veilEl) veilEl.style.opacity = cur.veil.toFixed(3);
    renderer.render(scene, camera);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}
