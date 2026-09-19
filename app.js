const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// نقطه‌ی شروع: نزدیک تالار ورودی گرد (کنار میز گرد)، رو به راهرو
// این فقط یه تخمینه — برای این‌که دقیقاً مثل عکسی که فرستادی بشه، پایین توضیح دادم چطور تنظیمش کنی
camera.position.set(-11, 1.6, 1.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(5, 1.6, 0); // رو به راهرو (سمت ساختمون‌های انتهایی)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight1.position.set(5, 10, 7);
scene.add(dirLight1);

let mixer;
const clock = new THREE.Clock();

// همه‌ی قاب‌عکس‌ها (اجسامی که تکسچرشون از قبل بیک شده - اسمشون شامل "manual bake" هست)
// این لیست موقع لود مدل، خودکار و از روی خودِ فایل GLB ساخته میشه - دیگه مختصات دستی حدس نمی‌زنیم
let artworks = []; // { name, mesh, worldCenter }

const loader = new THREE.GLTFLoader();
loader.load(
    'room.glb',
    function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        }

        // پیدا کردن همه‌ی قاب‌عکس‌ها / تابلوها داخل مدل
        const box = new THREE.Box3();
        model.traverse((child) => {
            if (child.isMesh && /manual bake/i.test(child.name)) {
                box.setFromObject(child);
                const center = box.getCenter(new THREE.Vector3());
                const label = (child.parent && child.parent.name) ? child.parent.name : child.name;
                artworks.push({ name: label, mesh: child, worldCenter: center });
            }
        });
        // مرتب‌سازی از چپ به راست راهرو (بر اساس X) تا ترتیب دکمه‌ها منطقی باشه
        artworks.sort((a, b) => a.worldCenter.x - b.worldCenter.x);

        buildButtons();
        document.getElementById('loading').style.display = 'none';
    },
    function (xhr) {
        if (xhr.total > 0) {
            const percent = Math.floor((xhr.loaded / xhr.total) * 100);
            document.getElementById('loading').innerText = `در حال بارگذاری: ${percent}%`;
        }
    },
    function (error) {
        console.error('خطا در بارگذاری مدل:', error);
        document.getElementById('loading').innerText = 'خطا در بارگذاری فایل room.glb!';
    }
);

// محاسبه‌ی موقعیت مناسب دوربین برای رو‌به‌رو ایستادن جلوی یک قاب عکس
// (قاب‌ها روی دو ردیف دیوار، تقریباً z=+0.8 و z=-1 هستن؛ دوربین باید از سمت راهرو
// (یعنی سمت z=0) به سمت قاب نگاه کنه، نه از پشتش)
function getViewpointForArtwork(worldCenter) {
    const standOffset = 2.2;
    const dir = worldCenter.z >= 0 ? -1 : 1; // بایستیم اونور راهرو، رو به قاب
    return {
        pos: [worldCenter.x, 1.6, worldCenter.z + dir * standOffset],
        target: [worldCenter.x, worldCenter.y, worldCenter.z]
    };
}

function flyTo(viewpoint) {
    gsap.to(camera.position, {
        x: viewpoint.pos[0], y: viewpoint.pos[1], z: viewpoint.pos[2],
        duration: 1.5, ease: "power2.inOut"
    });
    gsap.to(controls.target, {
        x: viewpoint.target[0], y: viewpoint.target[1], z: viewpoint.target[2],
        duration: 1.5, ease: "power2.inOut",
        onUpdate: () => controls.update()
    });
}

function buildButtons() {
    const uiControls = document.getElementById('ui-controls');
    uiControls.innerHTML = '';
    artworks.forEach((art, i) => {
        const btn = document.createElement('button');
        btn.innerText = i + 1;
        btn.title = art.name;
        btn.addEventListener('click', () => {
            document.querySelectorAll('#ui-controls button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            flyTo(getViewpointForArtwork(art.worldCenter));
        });
        uiControls.appendChild(btn);
    });
}

// ---- کلیک مستقیم روی قاب عکس داخل صحنه‌ی سه‌بعدی (زوم روی قاب با کلیک، نه فقط دکمه) ----
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
    // اگه ماوس بیشتر از چند پیکسل جابجا شده، یعنی کاربر داشته صحنه رو می‌چرخونده (orbit drag)، نه کلیک
    if (movedDist > 6) return;

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(scene.children, true);
    for (const hit of hits) {
        let obj = hit.object;
        if (/manual bake/i.test(obj.name)) {
            const found = artworks.find(a => a.mesh === obj);
            if (found) {
                document.querySelectorAll('#ui-controls button').forEach(b => b.classList.remove('active'));
                const idx = artworks.indexOf(found);
                const btn = document.querySelectorAll('#ui-controls button')[idx];
                if (btn) btn.classList.add('active');
                flyTo(getViewpointForArtwork(found.worldCenter));
            }
            break;
        }
    }
});

// وقتی با ماوس/اسکرول دقیقاً همون نمایی که تو عکس اسکچ‌فب دیدی رو پیدا کردی، کلید P رو بزن
// مختصات دقیق توی کنسول (F12) چاپ میشه - همونا رو بریز توی camera.position.set و controls.target.set بالای همین فایل
window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        console.log(
            `camera.position.set(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)});\n` +
            `controls.target.set(${controls.target.x.toFixed(2)}, ${controls.target.y.toFixed(2)}, ${controls.target.z.toFixed(2)});`
        );
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
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
