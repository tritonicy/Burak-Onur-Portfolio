import * as THREE from 'three';
// import { GUI } from 'dat.gui';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { InstancedMesh, SpotLightHelper, step } from 'three/webgpu';
import gsap from 'gsap';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
// import { BokehShader } from 'three/examples/jsm/shaders/BokehShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
// import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';


var renderer;
var scene;
var camera;
var controls;
// var gui;
var path;
// var cssRenderer;
// var cssScene;    
var clock;
var directionalLightHelper;
var canChangeColor = true;
var lockSpotlight1 = false;

var canMoveCamera = true;
var canShowOutline = true;
var isCameraBase = true;
var roomAmbientLight;
var directionalLight;
var hemiLight;
var deskSpotLight;
var highlightSpotLight;
var deskSpotLightHelper;
var directionalLightColor = {
    color: 0xffffff
}
var hemilighColor = {
    color: 0xffffff
};
var roomAmbientLightColor = {
    color: 0xffffff
};
var roomPointLight;
var roomPointLightColor = {
    color: 0xffffff
}
// Her bir li elemanını seçiyoruz
const aboutMe = document.querySelector('.about-me');
const github = document.querySelector('.github');
const linkedin = document.querySelector('.linkedin');
const itchio = document.querySelector('.itchio');

// Tıklama olaylarını dinliyoruz
aboutMe.addEventListener('click', () => {
    spotlight1.visible = true;
    lockSpotlight1 = true;
    canShowOutline = false;
    canMoveCamera = false;
    moveCameratoScreen();
});

github.addEventListener('click', () => {
    const url = 'https://github.com/tritonicy';
    window.open(url);
});

linkedin.addEventListener('click', () => {
    const url = 'https://www.linkedin.com/in/burak-onur-siluşu-87a786258/';
    window.open(url);
});

itchio.addEventListener('click', () => {
    const url = 'https://tritonicy.itch.io';
    window.open(url);
});

const container = document.getElementById("container");
// gui ve scene
// gui = new GUI();
scene = new THREE.Scene();
scene.background = new THREE.Color(0x404d55);
// axes helper
var axesHelper = scene.add(new THREE.AxesHelper(Math.PI * 100));
axesHelper.name = "axesHelper"

var backgroundColor = {
    modelColor: 0xffffff
};
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// renderer ayarlari
renderer = new THREE.WebGLRenderer({ physicallyCorrectLights: true, antialias: false, powerPreference: "high-performance", alpha: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("resize", function () {
    camera.aspect = this.window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(this.window.innerWidth, this.window.innerHeight);
});

// scene modeli
loadModel('./assets/12/untitled.gltf', function (model) {
    model.scale.set(5,5,5);
    model.position.set(0, 0, 5);
    model.rotation.y = - Math.PI/2;
    console.log(model);
});

//directional lightin hedef noktasi
createBox("box1", 1, 1, 1, 0, 20, -60, function (mesh) {
    mesh.visible = false;
});
createHemiLight();
createDirectionalLight("directionalLight");
directionalLight.color.setRGB(168 / 255, 47 / 255, 1 / 255);
// roomPointLight = createPointLightSource();
// createAmbientLightSource();

// Işık hedefi (nereye yönlenecek)
var deskSpotLightTarget = new THREE.Object3D();
deskSpotLightTarget.position.set(-100, -50.6, 0);  // Hedef pozisyonu
scene.add(deskSpotLightTarget);
deskSpotLight = createSpotLight("deskspotlight", deskSpotLightTarget);
deskSpotLight.target = deskSpotLightTarget;    // SpotLight'ı hedefe yönlendir
deskSpotLight.position.set(18, 19, -53);

deskSpotLightHelper = new THREE.SpotLightHelper(deskSpotLight);
// scene.add(deskSpotLightHelper);

var highlightSpotLightTarget = new THREE.Object3D();
highlightSpotLightTarget.position.set(60, 4.6, -69);  // Hedef pozisyonu
scene.add(highlightSpotLightTarget);
highlightSpotLight = createSpotLight("highlightspotlight",highlightSpotLightTarget);
highlightSpotLight.target = highlightSpotLightTarget;     // SpotLight'ı hedefe yönlendir
highlightSpotLight.position.set(-15.3,31,-30.7);
var highlightSpotLighthelper = new THREE.SpotLightHelper(highlightSpotLight);
// scene.add(highlightSpotLighthelper)
highlightSpotLight.distance = 200;
highlightSpotLight.penumbra = 1;
highlightSpotLight.intensity = 1500;


var spotlight1Target = new THREE.Object3D();
spotlight1Target.position.set(15.6, 2.4, -69);  // Hedef pozisyonu
scene.add(spotlight1Target);
const spotlight1 = createSpotLight("spotlight1", spotlight1Target);
spotlight1.target = spotlight1Target;     // SpotLight'ı hedefe yönlendir
var spotlight1Helper = new THREE.SpotLightHelper(spotlight1);
// scene.add(spotlight1Helper);
spotlight1.distance = 20;
spotlight1.color = new THREE.Color(0xffffff);
spotlight1.angle = Math.PI / 6;
spotlight1.penumbra = 1;
spotlight1.intensity = 200;
spotlight1.position.set(0.2,24.4,-41.8);
spotlight1.visible = false;


var spotlight2Target = new THREE.Object3D();
spotlight2Target.position.set(66.3, 26.6, 100);  // Hedef pozisyonu
scene.add(spotlight2Target);
const spotlight2 = createSpotLight("spotlight2", spotlight2Target);
spotlight2.target = spotlight2Target;     // SpotLight'ı hedefe yönlendir
var spotlight2Helper = new THREE.SpotLightHelper(spotlight2);
// scene.add(spotlight2Helper);
spotlight2.distance = 100;
spotlight2.color = new THREE.Color(0xFF1493);
spotlight2.angle = Math.PI / 12;
spotlight2.penumbra = 0.2;
spotlight2.intensity = 2000;
spotlight2.position.set(20,33.2,-61.6);
spotlight2.visible = false;


var spotlight3Target = new THREE.Object3D();
spotlight3Target.position.set(66.3, 20.6, 100);  // Hedef pozisyonu
scene.add(spotlight3Target);
const spotlight3 = createSpotLight("spotlight3", spotlight3Target);
spotlight3.target = spotlight3Target;     // SpotLight'ı hedefe yönlendir
var spotlight3Helper = new THREE.SpotLightHelper(spotlight3);
// scene.add(spotlight3Helper);
spotlight3.distance = 100;
spotlight3.color = new THREE.Color(0xFF1493);
spotlight3.angle = Math.PI / 12;
spotlight3.penumbra = 0.2;
spotlight3.intensity = 2000;
spotlight3.position.set(20,27.2,-61.6);
spotlight3.visible = false;


var spotlight4Target = new THREE.Object3D();
spotlight4Target.position.set(66.3, 14.6, 100);  // Hedef pozisyonu
scene.add(spotlight4Target);
const spotlight4 = createSpotLight("spotlight4", spotlight4Target);
spotlight4.target = spotlight4Target;     // SpotLight'ı hedefe yönlendir
var spotlight4Helper = new THREE.SpotLightHelper(spotlight4);
// scene.add(spotlight4Helper);
spotlight4.distance = 100;
spotlight4.color = new THREE.Color(0xFF1493);
spotlight4.angle = Math.PI / 12;
spotlight4.penumbra = 0.2;
spotlight4.intensity = 2000;
spotlight4.position.set(20,21.2,-61.6);
spotlight4.visible = false;



// controls = new OrbitControls(camera, renderer.domElement)


camera.position.x = -10;
camera.position.y = 20;
camera.position.z = -30;
camera.rotateX(-0.2410399010823081);
camera.rotateY(-0.676929803659473);
camera.rotateZ(-0.15278183692610087);


// var cameraFolder = gui.addFolder("Background color");

// cameraFolder.addColor(backgroundColor, 'modelColor').onChange(function (colorval) {
//     scene.background = new THREE.Color(colorval);
// })

const points = [
    new THREE.Vector3(30, 35, -90),
    new THREE.Vector3(0, 65, -90),
    new THREE.Vector3(-30, 35, -90),
    new THREE.Vector3(0, 5, -90),
]

path = new THREE.CatmullRomCurve3(points, true);

const pathGeo = new THREE.BufferGeometry().setFromPoints(path.getPoints(50));
const pathMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const pathObject = new THREE.Line(pathGeo, pathMaterial);
pathObject.visible = false;
scene.add(pathObject);

clock = new THREE.Clock();


const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./assets/img/Screenshot_4.png');
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.NearestFilter;
const material = new THREE.MeshStandardMaterial({ map: texture });

// Bir geometri oluşturun ve materyali uygulayın
const geometry = new THREE.PlaneGeometry(6.4 * 1.5, 6.4); // İstenilen boyutlarda bir geometri
const htmlPlane = new THREE.Mesh(geometry, material);
htmlPlane.position.set(5.6,19.2,-52.5);
htmlPlane.name = "htmlPlane";
scene.add(htmlPlane);

// Create the outline
var outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.BackSide }); // BasicMaterial for outline
var outlineMesh = new THREE.Mesh(geometry, outlineMaterial);

// Position the outline mesh and scale slightly larger
outlineMesh.position.copy(htmlPlane.position);
outlineMesh.position.z -= 0.01;
outlineMesh.rotation.y  = Math.PI;
outlineMesh.scale.set(1.01,1.01,1.01); // Slightly larger scale to create the outline effect
scene.add(outlineMesh);

LoadText("GitHub", 0.5, 3.5, 24.5, 31, -55);
LoadText("LinkedIn", 0.5, 3.5, 24.5, 25, -55);
LoadText('Itch.io', 0.5, 3.5, 24.5, 19, -55);

// border objelerı
const bordergeometry = new THREE.BoxGeometry(3, 5, 22); // Küp boyutu
const bordermaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0}); // Yarı saydam malzeme

const GitHubCube = new THREE.Mesh(bordergeometry,bordermaterial);
GitHubCube.position.set(24.5, 33, -45); // Küpün pozisyonu
GitHubCube.name = 'githubCube';
scene.add(GitHubCube);

const LinkedInCube = new THREE.Mesh(bordergeometry, bordermaterial);
LinkedInCube.position.set(24.5, 27, -45); // Küpün pozisyonu
LinkedInCube.name = 'linkedinCube';
scene.add(LinkedInCube);

const itchioCube = new THREE.Mesh(bordergeometry,bordermaterial);
itchioCube.position.set(24.5, 21, -45); // Küpün pozisyonu
itchioCube.name = 'itchioCube';
scene.add(itchioCube);

// Küpü tıklanabilir hale getirmek için, gölge ve ışık özelliklerini kapatıyoruz
LinkedInCube.castShadow = false;
LinkedInCube.receiveShadow = false;
LinkedInCube.visible = true;

GitHubCube.castShadow = false;
GitHubCube.receiveShadow = false;
GitHubCube.visible = true;

itchioCube.castShadow = false;
itchioCube.receiveShadow = false;
itchioCube.visible = true;

// DirectionalLight'ın renk animasyonu fonksiyonu
function animateDirectionalLightColor(light, color,) {
    return gsap.to(light.color, {
        r: color.r / 255, // 255 üzerinden normalize edilmiş RGB değerleri
        g: color.g / 255,
        b: color.b / 255,
        paused: true, // Animasyonu başta durdurulmuş halde bırakıyoruz
    });
}

// DirectionalLight'ın yoğunluk animasyonu fonksiyonu
function animateDirectionalLightIntensity(light, intensity,) {
    return gsap.to(light, {
        intensity: intensity, // Hedef yoğunluk
        paused: true // Başlangıçta durdurulmuş
    });
}

// HemisphereLight'ın yoğunluk animasyonu fonksiyonu
function animateHemiLightIntensity(hemiLight, intensity,) {
    return gsap.to(hemiLight, {
        intensity: intensity, // Hedef yoğunluk
        paused: true // Durdurulmuş
    });
}

function animateSpotLightIntensity(spotLight, intensity, angle, penumbra) {
    return gsap.to(spotLight, {
        intensity: intensity,
        angle: angle,
        penumbra: penumbra,
        ease: "bounce.out",
        paused: true
    })
}

// Renk animasyonu için renk ve süre belirleme
let colorAnim1 = animateDirectionalLightColor(directionalLight, { r: 242, g: 159, b: 5 });
let colorAnim2 = animateDirectionalLightColor(directionalLight, { r: 168, g: 47, b: 1 });
let colorAnim3 = animateDirectionalLightColor(directionalLight, { r: 0, g: 0, b: 0 });
let colorAnim4 = animateDirectionalLightColor(directionalLight, { r: 168, g: 47, b: 1 });

// Yoğunluk animasyonu için hedef yoğunluk ve süre belirleme
let intensityAnim1 = animateDirectionalLightIntensity(directionalLight, 7,);
let intensityAnim2 = animateDirectionalLightIntensity(directionalLight, 5,);
let intensityAnim3 = animateDirectionalLightIntensity(directionalLight, 3,);
let intensityAnim4 = animateDirectionalLightIntensity(directionalLight, 5,);


// Hemisphere ışığı için yoğunluk animasyonu
let hemiLightAnim1 = animateHemiLightIntensity(hemiLight, 0.75,);
let hemiLightAnim2 = animateHemiLightIntensity(hemiLight, 0.5,);
let hemiLightAnim3 = animateHemiLightIntensity(hemiLight, 0.2,);
let hemiLightAnim4 = animateHemiLightIntensity(hemiLight, 0.5,);

let spotLightAnim1 = animateSpotLightIntensity(deskSpotLight, 0, 0, 1);
let spotLightAnim2 = animateSpotLightIntensity(deskSpotLight, 0, 0, 1);
let spotLightAnim3 = animateSpotLightIntensity(deskSpotLight, 1000, 0.5, 0.1);
let spotLightAnim4 = animateSpotLightIntensity(deskSpotLight, 0, 0, 1);

// buradan sonrası post processing
const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { samples: 4 } // 4x MSAA uygulamak için örnek sayısını belirtin
);
const composer = new EffectComposer( renderer , renderTarget);

const renderPass = new RenderPass( scene, camera );


// SSAA Render Pass oluşturun
const ssaaRenderPass = new SSAARenderPass(scene, camera, 0x000000, 0);
// Örnekleme seviyesini ayarlayın
ssaaRenderPass.sampleLevel = 1; // SSAA örnekleme seviyesi (daha yüksek değerler daha kaliteli ama daha yavaş)
// sampleLevel = 2 veya 4 tipik değerlerdir, ancak 8 ve 16 gibi daha yüksek değerler kaliteyi artırabilir.


// Bloom efekti ekle
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), // Ekran çözünürlüğü
    0.3,  // Bloom yoğunluğu
    0.8,  // Bloom radius
    1.25  // Bloom threshold
);

// SSAO pass oluşturma
const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);

const fxaaPass = new ShaderPass(FXAAShader);
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms['resolution'].value.set(1 / (window.innerWidth * pixelRatio), 1 / (window.innerHeight * pixelRatio));

// Parametre ayarları
ssaoPass.kernelRadius = 8; // AO etkisinin yayılma miktarı (daha yüksek değer daha fazla yayılma)
ssaoPass.minDistance = 0.005; // AO etkisinin en düşük mesafesi
ssaoPass.maxDistance = 0.01;   // AO etkisinin en yüksek mesafesi

// Composer'a ekleyin


const options = {
    enableSSAO: true // Başlangıçta SSAO etkin
};
// GUI'ye bir buton ekleyin
// gui.add(options, 'enableSSAO').name('Toggle SSAO').onChange(function(value) {
//     ssaoPass.enabled = value; // SSAO pass'in aktif olup olmadığını kontrol eder
// });


const outputPass = new OutputPass();


composer.addPass( renderPass );
// composer.addPass(ssaaRenderPass);
// composer.addPass(fxaaPass);
composer.addPass(ssaoPass);
composer.addPass(bloomPass);
composer.addPass(outputPass );

Update();

function Update() {
    directionalLightHelper.update();
    deskSpotLightHelper.update();
    highlightSpotLighthelper.update();
    spotlight1Helper.update();
    spotlight2Helper.update();

    scene.getObjectByName("directionalLight").target = scene.getObjectByName("box1");
    // cssRenderer.render(cssScene, camera);
    composer.render();
    // renderer.render(scene,camera);

    // controls.update();
    // console.log(camera.position);
    // console.log(camera.rotation);
    const t = (clock.getElapsedTime() % 20) / 20;
    const pos = path.getPointAt(t);
    scene.getObjectByName("directionalLight").position.copy(pos);

    if (t < 0.25) {
        const progress = t / 0.25;  // 0 ile 0.25 arasındaki t'yi normalize et

        // GSAP animasyonlarını manuel olarak ilerlet
        colorAnim1.progress(progress); 
        intensityAnim1.progress(progress); 
        hemiLightAnim1.progress(progress); 
        spotLightAnim1.progress(progress);
    }
    else if(t < 0.5) {
        const progress = (t - 0.25) / 0.25;  // 0 ile 0.25 arasındaki t'yi normalize et

        // GSAP animasyonlarını manuel olarak ilerlet
        colorAnim2.progress(progress); 
        intensityAnim2.progress(progress); 
        hemiLightAnim2.progress(progress); 
        spotLightAnim2.progress(progress);

    }
    else if(t < 0.75) {
        const progress = (t - 0.5) / 0.25;  // 0 ile 0.25 arasındaki t'yi normalize et

        // GSAP animasyonlarını manuel olarak ilerlet
        colorAnim3.progress(progress); 
        intensityAnim3.progress(progress); 
        hemiLightAnim3.progress(progress); 
        spotLightAnim3.progress(progress);

    }
    else{
        const progress = (t - 0.75) / 0.25;  // 0 ile 0.25 arasındaki t'yi normalize et

        // GSAP animasyonlarını manuel olarak ilerlet
        colorAnim4.progress(progress); 
        intensityAnim4.progress(progress); 
        hemiLightAnim4.progress(progress); 
        spotLightAnim4.progress(progress);

    }
    requestAnimationFrame(Update);

}


function onMouseDown(event) {
    if (event.button == 0) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            if(canMoveCamera && isCameraBase) {
                if(intersects[0].object.name == "htmlPlane") {
                    lockSpotlight1 = true;
                    canShowOutline = false;
                    canMoveCamera = false;
                    moveCameratoScreen();
                }
                else if(intersects[0].object.name == "githubCube") {
                    const url = 'https://github.com/tritonicy';
                    window.open(url);
                } else if(intersects[0].object.name == "linkedinCube") {
                    const url = 'https://www.linkedin.com/in/burak-onur-siluşu-87a786258/';
                    window.open(url);
                } else if (intersects[0].object.name == "itchioCube") {
                    const url = 'https://tritonicy.itch.io';
                    window.open(url);
                }
            }
            else if(canMoveCamera && !isCameraBase) {
                canMoveCamera = false;
                lockSpotlight1 = false;
                moveCameratoBase();
            }
            else{
                console.log(intersects[0].object.name);
            }
        }
        else {
            // console.log("hit nothing");
        }
    }
}

function onMouseMove(event) {
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        if(intersects[0].object.name == "htmlPlane" && canShowOutline) {
            spotlight1.visible = true;             
            outlineMesh.visible = true;
        }
        else if(intersects[0].object.name == "githubCube") {
            // bokehPass.enabled = true; // Bokeh efektini aktif et
            spotlight3.visible = false;
            spotlight4.visible = false;
            spotlight2.visible = true;
        }
        else if(intersects[0].object.name == "linkedinCube") {
            spotlight2.visible = false;
            spotlight4.visible = false;
            spotlight3.visible = true;
        }
        else if(intersects[0].object.name == "itchioCube") {
            spotlight3.visible = false;
            spotlight2.visible = false;
            spotlight4.visible = true;
        }
        else{
            if(!lockSpotlight1) spotlight1.visible = false; 
            spotlight2.visible = false;
            spotlight3.visible = false;
            spotlight4.visible = false;
            outlineMesh.visible = false;
        }
    }
    else {
        // console.log("hit nothing");
    }
}

function loadModel(path, onLoad) {
    const loader = new GLTFLoader();

    loader.load(
        path,
        function (gltf) {
            const model = gltf.scene;
            model.traverse((n) => {
                if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                    if (n.material.map) {
                        n.material.map.anisotropy = 16;
                    }
                }
            })
            scene.add(model);
            if (onLoad) onLoad(model); // Model yüklendiğinde onLoad callback'i çağrılır
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
}

function createAmbientLightSource() {
    roomAmbientLight = new THREE.AmbientLight(roomAmbientLightColor.color, 1);
    // gui.addFolder("AmbientLight");
    // gui.addColor(roomAmbientLightColor, "color").onChange(function (colorVal) {
    //     roomAmbientLight.Color = new THREE.Color(colorVal);
    // })
    // gui.add(roomAmbientLight.position, "x", -100, 100).step(0.1);
    // gui.add(roomAmbientLight.position, "y", -100, 100).step(0.1);
    // gui.add(roomAmbientLight.position, "z", -100, 100).step(0.1);

    // scene.add(roomAmbientLight);
}
function createDirectionalLight(name) {
    directionalLight = new THREE.DirectionalLight(0xA82F01, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.mapSize.width = 1024 * 8;
    directionalLight.shadow.mapSize.height = 1024 * 8;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 200;

    directionalLight.position.set(0, 65, -60);
    directionalLight.name = name;
    // gui.addFolder("DirectionalLight");
    // gui.addColor(directionalLightColor, "color").onChange(function (colorVal) {
    //     directionalLight.color = new THREE.Color(colorVal);
    // })
    // gui.add(directionalLight, "intensity", 0, 100).step(0.1);
    // gui.add(directionalLight.position, "x", -100, 100).step(0.1);
    // gui.add(directionalLight.position, "y", -100, 100).step(0.1);
    // gui.add(directionalLight.position, "z", -100, 100).step(0.1);

    directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
    // scene.add(directionalLightHelper)
    var shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(shadowCameraHelper);
    scene.add(directionalLight);
}
function createPointLightSource() {
    roomPointLight = new THREE.PointLight(roomPointLightColor.color, 1);
    roomPointLight.name = "pointLight";
    // gui.addFolder("RoomPointLight");
    // gui.addColor(roomPointLightColor, "color").onChange(function (colorVal) {
    //     roomPointLight.color = new THREE.Color(colorVal);
    // });
    // gui.add(roomPointLight, "intensity", 0, 100).step(0.1);
    // gui.add(roomPointLight.position, "x", -100, 100).step(0.1);
    // gui.add(roomPointLight.position, "y", -100, 100).step(0.1);
    // gui.add(roomPointLight.position, "z", -100, 100).step(0.1);
    var helper = new THREE.PointLightHelper(roomPointLight);
    helper.name = "pointLightHelper";
    scene.add(helper);
    scene.add(roomPointLight);

    return roomPointLight;
}
function createHemiLight() {
    hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.5);
    // gui.addFolder("HemiLight");
    // gui.addColor(hemilighColor, "color").onChange(function (colorVal) {
    //     hemiLight.color = new THREE.Color(colorVal);
    // });
    // gui.add(hemiLight, "intensity", 0, 10).step(0.01);
    // gui.add(hemiLight.position, "x", -100, 100).step(0.1);
    // gui.add(hemiLight.position, "y", -100, 100).step(0.1);
    // gui.add(hemiLight.position, "z", -100, 100).step(0.1);
    var helper = new THREE.HemisphereLightHelper(hemiLight);
    helper.name = "hemispherelight";
    scene.add(helper);

    scene.add(hemiLight);
}
function createSpotLight(name, target) {
    var spotLight = new THREE.SpotLight(0xFF9800, 0);  // Işık rengi ve yoğunluk
    spotLight.castShadow = true;

    // Spot ışığı ayarları
    spotLight.angle = Math.PI / 6;  // Koninin genişliği (ışığın yayılma açısı)
    spotLight.penumbra = 0.1;       // Yumuşak kenar (0 = keskin, 1 = çok yumuşak)
    spotLight.decay = 2;            // Mesafeye bağlı parlaklık düşüşü
    spotLight.distance = 20;       // Işığın etkili olduğu mesafe

    spotLight.shadow.mapSize.width = 1024 * 2;  // Gölge çözünürlüğü
    spotLight.shadow.mapSize.height = 1024 * 2;
    spotLight.shadow.camera.near = 10;          // Gölge kamerası yakın uzaklık
    spotLight.shadow.camera.far = 200;          // Gölge kamerası uzaklık
    spotLight.shadow.camera.fov = 30;           // Gölge kamerasının görüş açısı

    // GUI kontrolleri
    // var spotLightFolder = gui.addFolder(name);
    // spotLightFolder.addColor({ color: spotLight.color.getHex() }, "color").onChange(function (colorVal) {
    //     spotLight.color.set(colorVal);
    // });
    // spotLightFolder.add(spotLight, "intensity", 0, 100).step(0.1);
    // spotLightFolder.add(spotLight, "angle", 0, Math.PI / 2).step(0.01);
    // spotLightFolder.add(spotLight, "penumbra", 0, 1).step(0.01);
    // spotLightFolder.add(spotLight.position, "x", -100, 100).step(0.1);
    // spotLightFolder.add(spotLight.position, "y", -100, 100).step(0.1);
    // spotLightFolder.add(spotLight.position, "z", -100, 100).step(0.1);
    // spotLightFolder.add(target.position, "x", -100, 100).step(0.1);
    // spotLightFolder.add(target.position, "y", -100, 100).step(0.1);
    // spotLightFolder.add(target.position, "z", -100, 100).step(0.1);




    // Spot ışığını sahneye ekle
    scene.add(spotLight);
    return spotLight;
}


function createBox(name, w, h, d, x, y, z, onCreate) {
    var boxGeo = new THREE.BoxGeometry(w, h, d);
    var material = new THREE.MeshStandardMaterial();
    var mesh = new THREE.Mesh(boxGeo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, y, z);
    mesh.name = name;
    if (onCreate) onCreate(mesh);
    scene.add(mesh)
}

function moveCameratoScreen() {
    gsap.to(camera.position, {
        x: 5.350717887185537,
        y: 20.24122457068609,
        z: -47.87354352158978,
        duration: 2.5,
        onComplete: () =>{
            canMoveCamera = true;
            isCameraBase = false
        }
    })
    gsap.to(camera.rotation, {
        x:-0.15493407752025207,
        y:-0.12457722949516417,
        z:-0.0194044706219834,
        duration: 2.5
    })
}

function moveCameratoBase() {
    gsap.to(camera.position, {
        x: -10,
        y: 20,
        z: -30,
        duration: 2.5,
        onComplete: () =>{
            canShowOutline = true;
            isCameraBase = true;
            canMoveCamera = true;
        }
    })
    gsap.to(camera.rotation, {
        x:-0.2410399010823081,
        y:-0.676929803659473,
        z:-0.15278183692610087,
        duration: 2.5
    })
}

function LoadText(text, height, size, x, y, z) {
    const fontloader = new FontLoader();
    
    try {
        fontloader.load(
            './assets/droid/droid_sans_bold.typeface.json', 
            (droidfont) => {
                try {
                    const textGeometry = new TextGeometry(text, {
                        height: height,
                        size: size,
                        font: droidfont,
                        curveSegments: 12,
                        bevelEnabled: true,
                        bevelThickness: 0.5,
                        bevelSize: 0.2,
                    });

                    const textureMaterial = new THREE.MeshStandardMaterial({
                        color: 0x6B8E23,
                        roughness: 0.2,
                        metalness: 0.8,
                        emissive: 0xFFD700,
                        emissiveIntensity: 0.01,
                    });

                    const textMesh = new THREE.Mesh(textGeometry, textureMaterial);
                    textMesh.position.set(x, y, z);
                    textMesh.name = text;
                    textMesh.rotation.y = -Math.PI / 2;
                    textMesh.castShadow = true;
                    textMesh.receiveShadow = true;
                    
                    scene.add(textMesh);
                } catch (geometryError) {
                    console.error("Error while creating text geometry or material:", geometryError);
                }
            },
            undefined, // Optional onProgress callback
            (error) => {
                console.error("Error loading the font:", error);
            }
        );
    } catch (loadError) {
        console.error("FontLoader encountered an error:", loadError);
    }
}

