import * as THREE from 'three';

// =============================================
// IRONFORGE — Main JS: 3D Effects & Interactions
// =============================================

// ---- CUSTOM CURSOR ----
document.addEventListener('mousemove', (e) => {
  document.body.style.setProperty('--mx', e.clientX + 'px');
  document.body.style.setProperty('--my', e.clientY + 'px');
});

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
});

// =============================================
// 1. BACKGROUND PARTICLE FIELD (Three.js)
// =============================================
(function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // Particles
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    sizes[i] = Math.random() * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xff4d00,
    size: 0.15,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Grid
  const gridHelper = new THREE.GridHelper(200, 40, 0xff4d00, 0x1a1a1a);
  gridHelper.position.y = -20;
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    particles.rotation.y = t * 0.02;
    particles.rotation.x = t * 0.01;
    gridHelper.position.z = (t * 5) % 10;

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
})();

// =============================================
// 2. ABOUT SECTION — 3D ROTATING DUMBBELL/CUBE
// =============================================
(function initCubeCanvas() {
  const canvas = document.getElementById('cube-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(400, 400);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xff4d00, 3, 20);
  pointLight.position.set(3, 3, 3);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0xff7300, 1.5, 15);
  pointLight2.position.set(-3, -2, 2);
  scene.add(pointLight2);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(-5, 5, -5);
  scene.add(rimLight);

  // Main octahedron (gem-like shape — iconic for forge/strength)
  const mainGeo = new THREE.OctahedronGeometry(1.2, 0);
  const mainMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1,
  });
  const mainMesh = new THREE.Mesh(mainGeo, mainMat);
  scene.add(mainMesh);

  // Wireframe overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xff4d00,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  const wireMesh = new THREE.Mesh(mainGeo, wireMat);
  wireMesh.scale.setScalar(1.02);
  scene.add(wireMesh);

  // Outer ring
  const ringGeo = new THREE.TorusGeometry(2, 0.04, 8, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4d00, transparent: true, opacity: 0.6 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
  ring2.material.opacity = 0.3;
  ring2.rotation.x = Math.PI / 2;
  const ring3 = new THREE.Mesh(ringGeo, ringMat.clone());
  ring3.material.opacity = 0.2;
  ring3.rotation.y = Math.PI / 2;
  scene.add(ring1, ring2, ring3);

  // Floating particles around
  const floatCount = 60;
  const floatPositions = new Float32Array(floatCount * 3);
  for (let i = 0; i < floatCount; i++) {
    const angle = (i / floatCount) * Math.PI * 2;
    const radius = 1.8 + Math.random() * 0.8;
    floatPositions[i * 3] = Math.cos(angle) * radius;
    floatPositions[i * 3 + 1] = (Math.random() - 0.5) * 3;
    floatPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const floatGeo = new THREE.BufferGeometry();
  floatGeo.setAttribute('position', new THREE.BufferAttribute(floatPositions, 3));
  const floatMat = new THREE.PointsMaterial({ color: 0xff7300, size: 0.05 });
  const floatParticles = new THREE.Points(floatGeo, floatMat);
  scene.add(floatParticles);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    mainMesh.rotation.x = t * 0.4;
    mainMesh.rotation.y = t * 0.6;
    wireMesh.rotation.x = t * 0.4;
    wireMesh.rotation.y = t * 0.6;

    ring1.rotation.z = t * 0.5;
    ring2.rotation.z = t * 0.3;
    ring3.rotation.x = t * 0.4;

    floatParticles.rotation.y = t * 0.3;

    pointLight.position.x = Math.sin(t) * 3;
    pointLight.position.y = Math.cos(t) * 3;

    renderer.render(scene, camera);
  }
  animate();
})();

// =============================================
// 3. JOIN SECTION — PARTICLE BURST
// =============================================
(function initJoinParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const w = canvas.parentElement.offsetWidth;
  const h = canvas.parentElement.offsetHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,77,0,${p.opacity})`;
      ctx.fill();
    });

    // Connect close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,77,0,${0.1 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// =============================================
// 4. COUNTER ANIMATION
// =============================================
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// =============================================
// 5. SCROLL REVEAL + INTERSECTION OBSERVERS
// =============================================
// Reveal elements
const revealEls = document.querySelectorAll(
  '.program-card, .trainer-card, .price-card, .about-text, .about-visual, .section-header'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), 100);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// Stagger program cards
document.querySelectorAll('.program-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});

// Counters
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(animateCounter);
      counterObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// =============================================
// 6. FORM SUBMIT
// =============================================
const form = document.getElementById('joinForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.textContent = 'WELCOME TO THE FORGE!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = 'FORGE MY PATH';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}

// =============================================
// 7. HAMBURGER
// =============================================
const hamburger = document.getElementById('hamburger');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
});
