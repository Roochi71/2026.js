const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

// On narrow/portrait screens (most phones) a 60° FOV crops the room too
// tightly. Widen it automatically so more of the scene stays in frame.
function updateCameraForViewport() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.fov = aspect < 0.7 ? 80 : aspect < 1 ? 72 : 60;
    camera.updateProjectionMatrix();
}
updateCameraForViewport();

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI - Math.PI / 4;
controls.enableRotate = false;

scene.add(new THREE.AmbientLight(0xffffff, 1.1));

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 12, 7);
scene.add(dirLight);

let mixer;
const clock = new THREE.Clock();

// ---------------------------------------------------------------------------
// لودینگ دقیقاً ۲ ثانیه‌ای (جایگزین لودینگ سنگین قبلی بر اساس درخواست شما)
// ---------------------------------------------------------------------------
const loadingManager = new THREE.LoadingManager();
const percentEl = document.getElementById('loading-percent');
const loadingEl = document.getElementById('loading');

let currentPercent = 0;
const loadingInterval = setInterval(() => {
    currentPercent += 5;
    if (currentPercent > 100) currentPercent = 100;
    if (percentEl) percentEl.innerText = currentPercent + '%';

    if (currentPercent === 100) {
        clearInterval(loadingInterval);
        if (loadingEl) {
            loadingEl.style.opacity = '0';
            setTimeout(() => { loadingEl.style.display = 'none'; }, 800);
        }
    }
}, 100);

loadingManager.onError = (url) => {
    console.error('خطا در بارگذاری فایل:', url);
    if (percentEl) percentEl.innerText = 'خطا در بارگذاری';
};

const textureLoader = new THREE.TextureLoader(loadingManager);

const entranceView = {
    pos: [16.79, 1.32, -0.62],
    target: [5.00, 1.60, 0.00]
};
camera.position.set(...entranceView.pos);
controls.target.set(...entranceView.target);

const aboutView = {
    pos: [-10.62, 1.52, -1.09],
    target: [-5.59, 1.54, -1.33]
};

// ---------------------------------------------------------------------------
// Unified per-artwork configuration
// (replaces EXACT_ARTWORK_NAMES + CUSTOM_IMAGES + CUSTOM_IMAGE_SIZE + MANUAL_OVERRIDES)
// Each artwork now lives in exactly one place, keyed once — no repeated name
// strings across four separate objects.
// ---------------------------------------------------------------------------
const ARTWORK_CONFIG = [
    {
        name: "jake and london eye_london eye manual bake_0",
        image: './1.jpg',
        size: { width: 0.66, height: 0.81, dist: 0.01, offsetX: 0.01, offsetY: -0.005, degX: 3, degY: 5, degZ: -1 },
        override: { pos: [11.30, 1.60, -1.50], target: [10.50, 1.60, -3.00] }
    },
    {
        name: "Object003_eddie manuel bake_0",
        image: './2.jpg',
        size: { width: 0.69, height: 0.55, dist: 0.005, offsetX: 0, offsetY: -0.02, degX: -1, degY: 7, degZ: 0 },
        override: { pos: [13.30, 1.60, 1.50], target: [13.75, 1.60, 2.00] }
    },
    {
        name: "Eddie and horse_propinquity early manual bake_0",
        image: './one.jpg',
        size: { width: 0.55, height: 0.75, dist: 0.015, offsetX: 0, offsetY: -0.01, degX: 0, degY: 1, degZ: 0 },
        override: { pos: [12.68, 1.63, 2.65], target: [12.80, 1.64, 3.84] }
    },
    {
        name: "Object004_holly manual bake_0",
        image: './two.jpg',
        size: { width: 0.18, height: 0.29, dist: 0.005, offsetX: 0, offsetY: 0, degX: -12, degY: 2, degZ: 6 },
        override: { pos: [11.90, 1.46, 0.09], target: [11.44, 1.14, 0.78] }
    },
    {
        name: "jakeframe_jake manua bake_0",
        image: './three.jpg',
        size: { width: 0.44, height: 0.74, dist: -0.005, offsetX: 0, offsetY: 0, degX: -4, degY: -2, degZ: 4 }
    },
    {
        name: "SIMON AND JAKE_simon manual bake_0",
        image: './four.jpg',
        size: { width: 0.28, height: 0.45, dist: 0.005, offsetX: 0, offsetY: 0, degX: 0, degY: 1, degZ: 0 }
    },
    {
        name: "Object005_squirrel manual bake_0",
        image: './five.jpg',
        size: { width: 0.51, height: 0.48, dist: 0.005, offsetX: -0.005, offsetY: 0, degX: -2, degY: -2, degZ: 0 },
        override: { pos: [7.95, 1.60, -1], target: [7.95, 1.31, 1.97] }
    },
    {
        name: "Object006_tess manual bake_0",
        image: './six.jpg',
        size: { width: 0.54, height: 0.55, dist: 0.01, offsetX: 0, offsetY: 0, degX: 0, degY: -6, degZ: 0 },
        override: { pos: [6.38, 1.56, 1.50], target: [6.38, 1.56, -2.78] }
    },
    {
        name: "Loveknot and tess_Loveknot Manual Bake_0",
        image: './seven.jpg',
        size: { width: 0.45, height: 0.37, dist: 0.005, offsetX: 0, offsetY: 0, degX: -2, degY: 0, degZ: 0 }
    },
    {
        name: "scarlett frame_scarlett manual bake_0",
        image: './eight.jpg',
        size: { width: 0.52, height: 0.69, dist: 0.01, offsetX: 0.005, offsetY: 0, degX: -5, degY: 8, degZ: -1 },
        override: { pos: [3.20, 1.46, 0.77], target: [3.21, 1.46, -1.70] }
    },
    {
        name: "Object010_squirrel manual bake_0",
        image: './nine.jpg',
        size: { width: 0.5, height: 0.56, dist: 0.005, offsetX: -0.005, offsetY: 0, degX: -2, degY: -5, degZ: 0 },
        override: { pos: [2.96, 1.60, -1], target: [2.96, 1.50, -0.10] }
    },
    {
        name: "weeebo and tiggy_weebo manual bake_0",
        image: './teen.jpg',
        size: { width: 0.39, height: 0.24, dist: 0, offsetX: 0, offsetY: 0, degX: -3, degY: 0, degZ: 0 }
    },
    {
        name: "Object007_tiggy manual bake_0",
        image: './eleven.jpg',
        size: { width: 0.39, height: 0.53, dist: 0, offsetX: -0.03, offsetY: -0.05, degX: -5, degY: -6, degZ: 0 },
        override: { pos: [0.48, 1.68, -1.16], target: [0.48, 1.65, 0.96] }
    },
    {
        name: "aston manual bake_aston manual bake_0",
        image: './twelve.jpg',
        size: { width: 0.95, height: 0.61, dist: 0.005, offsetX: 0, offsetY: 0, degX: 1, degY: 0, degZ: 0 }
    },
    {
        name: "boat_boat manual bake_0",
        image: './thirteen.jpg',
        size: { width: 0.94, height: 0.7, dist: 0.005, offsetX: 0.01, offsetY: -0.015, degX: -1, degY: 2, degZ: 0 },
        override: { pos: [-2.14, 1.60, -1], target: [-2.14, 1.56, 0.20] }
    },
    {
        name: "Object009_propinquity manual bake_0",
        image: './fourteen.jpg',
        size: { width: 0.59, height: 0.81, dist: 0.005, offsetX: 0, offsetY: 0.01, degX: 6, degY: 0, degZ: 5 },
        override: { pos: [-6.62, 1.58, 1.31], target: [-5.54, 1.57, 2.06] }
    },
    {
        name: "seal 2_jag manual bake_0",
        image: './fifteen.jpg',
        size: { width: 0.77, height: 0.48, dist: 0.005, offsetX: 0, offsetY: -0.01, degX: -9, degY: 0, degZ: 4 }
    },
    {
        name: "end frame_end frame manual bake_0",
        image: './sixteen.jpg',
        size: { width: 0.77, height: 0.33, dist: -0.02, offsetX: 0.01, offsetY: -0.01, degX: 2, degY: 7, degZ: -2 }
    },
    {
        name: "horse and squirrel_seal manual bake_0",
        image: './seventeen.jpg',
        size: { width: 0.57, height: 0.35, dist: 0, offsetX: 0, offsetY: 0, degX: -2, degY: 3, degZ: -2 },
        override: { pos: [-6.31, 1.55, -1.86], target: [-5.59, 1.54, -2.33] }
    }
];

function normalizeName(str) {
    return str.toLowerCase().replace(/[_\s]+/g, ' ').trim();
}

const NORMALIZED_TARGETS = ARTWORK_CONFIG.map((a) => normalizeName(a.name));

const ARTWORK_AZIMUTH_RANGE = THREE.MathUtils.degToRad(35);

let artworks = [];
let currentIndex = -1;
let isAnimating = false;

function getWorldNormal(mesh) {
    const normal = new THREE.Vector3();
    const normAttr = mesh.geometry.attributes.normal;
    if (normAttr) {
        for (let i = 0; i < normAttr.count; i++) {
            normal.x += normAttr.getX(i);
            normal.y += normAttr.getY(i);
            normal.z += normAttr.getZ(i);
        }
        normal.divideScalar(normAttr.count);
    }
    if (normal.lengthSq() < 1e-6) normal.set(0, 0, 1);
    normal.normalize();

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    return normal.applyMatrix3(normalMatrix).normalize();
}

function computeViewpointForArtwork(art) {
    const override = art.config.override;
    if (override) return { pos: [...override.pos], target: [...override.target] };

    const standOffset = 1.2;
    const pos = art.worldCenter.clone().addScaledVector(art.normal, standOffset);
    return {
        pos: [pos.x, 1.6, pos.z],
        target: [art.worldCenter.x, art.worldCenter.y, art.worldCenter.z]
    };
}

function computeOutwardDirection(art, viewpoint) {
    const camPos = new THREE.Vector3(...viewpoint.pos);
    const dir = camPos.sub(art.worldCenter);
    if (dir.lengthSq() < 1e-6) return art.normal.clone();
    return dir.normalize();
}

function applyCustomImage(art, url) {
    const requestId = (art.imageRequestId = (art.imageRequestId || 0) + 1);

    textureLoader.load(
        url,
        (texture) => {
            if (art.imageRequestId !== requestId) {
                texture.dispose();
                return;
            }

            texture.encoding = THREE.sRGBEncoding;

            if (art.imageMesh) {
                scene.remove(art.imageMesh);
                art.imageMesh.geometry.dispose();
                art.imageMesh.material.map?.dispose();
                art.imageMesh.material.dispose();
            }

            const outward = art.outwardDir;
            const manual = art.config.size || {};
            const width = manual.width || 0.5;
            const height = manual.height || 0.7;

            const dist = manual.dist !== undefined ? manual.dist : 0.03;
            const offsetX = manual.offsetX || 0;
            const offsetY = manual.offsetY || 0;

            const worldUp = new THREE.Vector3(0, 1, 0);
            const right = new THREE.Vector3().crossVectors(worldUp, outward);
            if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
            right.normalize();
            const up = new THREE.Vector3().crossVectors(outward, right).normalize();

            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            const planeMesh = new THREE.Mesh(geometry, material);

            planeMesh.position.copy(art.worldCenter);
            planeMesh.position.addScaledVector(outward, dist);
            planeMesh.position.addScaledVector(right, offsetX);
            planeMesh.position.addScaledVector(up, offsetY);
            planeMesh.lookAt(art.worldCenter.clone().add(outward));

            if (manual.degX) planeMesh.rotation.x += THREE.MathUtils.degToRad(manual.degX);
            if (manual.degY) planeMesh.rotation.y += THREE.MathUtils.degToRad(manual.degY);
            if (manual.degZ) planeMesh.rotation.z += THREE.MathUtils.degToRad(manual.degZ);

            scene.add(planeMesh);
            art.imageMesh = planeMesh;
        },
        undefined,
        (err) => console.error(`خطا در بارگذاری تصویر ${url}:`, err)
    );
}

const loader = new THREE.GLTFLoader(loadingManager);
loader.load(
    'room3.glb',
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        if (gltf.animations?.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }

        model.updateMatrixWorld(true);

        const foundMeshes = {};
        model.traverse((child) => {
            if (!child.isMesh) return;

            const candidates = [normalizeName(child.name)];
            if (child.parent?.name) candidates.push(normalizeName(child.parent.name));

            for (const candidate of candidates) {
                const idx = NORMALIZED_TARGETS.indexOf(candidate);
                if (idx !== -1 && !foundMeshes[NORMALIZED_TARGETS[idx]]) {
                    foundMeshes[NORMALIZED_TARGETS[idx]] = child;
                }
            }
        });

        artworks = ARTWORK_CONFIG
            .map((config, i) => {
                const mesh = foundMeshes[NORMALIZED_TARGETS[i]];
                if (!mesh) return null;

                const nodePos = new THREE.Vector3();
                mesh.getWorldPosition(nodePos);

                const boxCenter = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
                const worldCenter = nodePos.length() < 0.5 ? boxCenter : nodePos;

                return { name: config.name, config, mesh, worldCenter, normal: getWorldNormal(mesh) };
            })
            .filter(Boolean);

        artworks.forEach((art) => {
            art.viewpoint = computeViewpointForArtwork(art);
            art.outwardDir = computeOutwardDirection(art, art.viewpoint);
            const camPos = new THREE.Vector3(...art.viewpoint.pos);
            const tgt = new THREE.Vector3(...art.viewpoint.target);
            const offset = camPos.sub(tgt);
            art.baseAzimuth = Math.atan2(offset.x, offset.z);
        });

        // بارگذاری پله‌ای تصاویر (هر ۲۰۰ میلی‌ثانیه یک تصویر) جهت جلوگیری از کرش سافاری روی آیفون
        artworks.forEach((art, index) => {
            if (art.config.image) {
                setTimeout(() => {
                    applyCustomImage(art, art.config.image);
                }, index * 200);
            }
        });
    },
    undefined,
    (error) => {
        console.error('خطا در بارگذاری مدل:', error);
    }
);

function flyTo(viewpoint, onArrive) {
    isAnimating = true;
    gsap.to(camera.position, {
        x: viewpoint.pos[0], y: viewpoint.pos[1], z: viewpoint.pos[2],
        duration: 2.8, ease: "power2.inOut",
        onComplete: () => {
            isAnimating = false;
            if (onArrive) onArrive();
        }
    });
    gsap.to(controls.target, {
        x: viewpoint.target[0], y: viewpoint.target[1], z: viewpoint.target[2],
        duration: 2.0, ease: "power2.inOut",
        onUpdate: () => controls.update()
    });
}

function updateAboutPanel(index) {
    const aboutPanel = document.getElementById('about-me-panel');
    if (!aboutPanel) return;

    if (index === artworks.length) {
        aboutPanel.innerHTML = `
            <h3 class="name">Your Company Name</h3>
            <p class="role">Photographer</p>
            <div class="panel-divider"></div>
            <p class="bio">I'm a passionate photographer with over [X] years of experience capturing life's most precious moments. My work specializes in [wedding / portrait / nature] photography, where every shot tells a unique story.</p>
            <div class="panel-divider"></div>
            <h4 class="contact-title">Contact me</h4>
            <div class="social-links">
                <a href="https://wa.me/YOUR_PHONE" target="_blank" class="social-btn btn-whatsapp" title="WhatsApp">
                    <i class="fa-brands fa-whatsapp"></i>
                </a>
                <a href="https://instagram.com/YOUR_ID" target="_blank" class="social-btn btn-instagram" title="Instagram">
                    <i class="fa-brands fa-instagram"></i>
                </a>
                <a href="https://linkedin.com/in/YOUR_ID" target="_blank" class="social-btn btn-linkedin" title="LinkedIn">
                    <i class="fa-brands fa-linkedin"></i>
                </a>
                <a href="https://youtube.com/@YOUR_ID" target="_blank" class="social-btn btn-youtube" title="YouTube">
                    <i class="fa-brands fa-youtube"></i>
                </a>
                <a href="https://t.me/YOUR_ID" target="_blank" class="social-btn btn-telegram" title="Telegram">
                    <i class="fa-brands fa-telegram"></i>
                </a>
            </div>
        `;
        aboutPanel.style.display = 'block';
    } else {
        aboutPanel.style.display = 'none';
    }
}

function goToIndex(index) {
    if (isAnimating || index < -1 || index > artworks.length || index === currentIndex) return;
    if (Math.abs(index - currentIndex) > 1) return;

    currentIndex = index;

    controls.enableRotate = false;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;

    if (index === -1) {
        flyTo(entranceView);
    } else if (index === artworks.length) {
        flyTo(aboutView);
    } else {
        const art = artworks[index];
        flyTo(art.viewpoint, () => {
            controls.enableRotate = true;
            controls.minAzimuthAngle = art.baseAzimuth - ARTWORK_AZIMUTH_RANGE;
            controls.maxAzimuthAngle = art.baseAzimuth + ARTWORK_AZIMUTH_RANGE;
        });
    }

    updateAboutPanel(index);
}

function stepIndex(direction) {
    goToIndex(currentIndex + direction);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = null;

renderer.domElement.addEventListener('pointerdown', (e) => {
    pointerDownPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointerup', (e) => {
    if (!pointerDownPos) return;
    const movedDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
    pointerDownPos = null;
    if (movedDist > 6 || !artworks.length) return;

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(artworks.map((a) => a.mesh), true);
    if (hits.length > 0) {
        const found = artworks.find((a) => a.mesh === hits[0].object);
        if (found) goToIndex(artworks.indexOf(found));
    }
});

let wheelCooldown = false;
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isAnimating || wheelCooldown) return;

    wheelCooldown = true;
    setTimeout(() => { wheelCooldown = false; }, 150);

    stepIndex(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

const TOUCH_STEP_DISTANCE = 60;
let touchLastY = null;
let touchAccum = 0;

window.addEventListener('touchstart', (e) => {
    touchLastY = e.touches[0].clientY;
    touchAccum = 0;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    if (touchLastY === null) return;

    const currentY = e.touches[0].clientY;
    const delta = touchLastY - currentY;
    touchLastY = currentY;

    if (isAnimating) return;

    touchAccum += delta;
    while (Math.abs(touchAccum) >= TOUCH_STEP_DISTANCE) {
        const direction = touchAccum > 0 ? 1 : -1;
        stepIndex(direction);
        touchAccum -= direction *TOUCH_STEP_DISTANCE;
        if (isAnimating) {
            touchAccum = 0;
            break;
        }
    }
}, { passive: true });

window.addEventListener('touchend', () => {
    touchLastY = null;
    touchAccum = 0;
});

window.addEventListener('resize', () => {
    updateCameraForViewport();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
}
animate();
