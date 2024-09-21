import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { step } from 'three/webgpu';
import gsap from 'gsap';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry} from 'three/addons/geometries/TextGeometry.js';


var renderer;
var scene;
var camera;
var controls;
var gui;
var path;
// var cssRenderer;
// var cssScene;    
var clock;
var directionalLightHelper;
var canChangeColor = true;
var canMoveCamera = true;
var canShowOutline = true;
var isCameraBase = true;
var roomAmbientLight;
var directionalLight;
var hemiLight;
var deskSpotLight;
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

// gui ve scene
gui = new GUI();
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
renderer = new THREE.WebGLRenderer({ physicallyCorrectLights: true, antialias: true, powerPreference: "high-performance", alpha: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("resize", function () {
    camera.aspect = this.window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(this.window.innerWidth, this.window.innerHeight);
    // cssRenderer.setSize(window.innerWidth, window.innerHeight);
});
// // oda modeli
// loadModel('models/computer_with_a_table/scene.gltf', function (model) {
//     model.scale.set(15, 15, 15);
//     model.position.set(0, 0, 5);
//     model.rotation.y = Math.PI;
//     console.log(model);
// });
// // window modeli
// loadModel('models/window/scene.gltf', function (model) {
//     model.scale.set(0.3, 0.3, 0.3);
//     model.position.set(3, 15, -17);
//     model.rotation.y = -Math.PI / 2;
//     console.log(model);
// });

// scene modeli
loadModel('models/10/untitled.gltf', function (model) {
    model.scale.set(5,5,5);
    model.position.set(0, 0, 5);
    model.rotation.y = - Math.PI/2;
    console.log(model);
});

//directional lightin hedef noktasi
createBox("box1", 1, 1, 1, 0, 20, -60, function (mesh) {
    mesh.visible = false;
});
// duvarlar
// createBox("wall", 31, 40, 2, -22, 23, -10);
// createBox("wall", 31, 40, 2, 23, 23, -10);
// createBox("wall", 20, 10, 2, 0, 45, -10);
// createBox("wall", 20, 20, 2, 0, 11, -10);
// createBox("wall", 80, 2, 80, 0, 43, 30)


createHemiLight();
createDirectionalLight("directionalLight");
// roomPointLight = createPointLightSource();
// createAmbientLightSource();
deskSpotLight = createSpotLight();

// controls = new OrbitControls(camera, renderer.domElement)


camera.position.x = -10;
camera.position.y = 20;
camera.position.z = -30;
camera.rotateX(-0.2410399010823081);
camera.rotateY(-0.676929803659473);
camera.rotateZ(-0.15278183692610087);


var cameraFolder = gui.addFolder("Background color");

cameraFolder.addColor(backgroundColor, 'modelColor').onChange(function (colorval) {
    scene.background = new THREE.Color(colorval);
})

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
scene.add(pathObject);

clock = new THREE.Clock();

// // CSS3D Renderer
// cssRenderer = new CSS3DRenderer();
// cssRenderer.setSize(window.innerWidth, window.innerHeight);
// cssRenderer.domElement.style.position = 'absolute';
// cssRenderer.domElement.style.top = '0';
// document.body.appendChild(cssRenderer.domElement);

// cssScene = new THREE.Scene();

// // Add an iframe as a CSS3DObject
// const iframe = document.createElement('iframe');
// iframe.src = 'pages/index.html';
// iframe.style.width = '100%'; // Set width to 100%
// iframe.style.height = '100%'; // Set height to 100%
// iframe.style.border = 'none'; // Optional: Remove border

// const cssObject = new CSS3DObject(iframe);
// cssObject.position.set(-20, 10, -200); // Adjust position as needed
// cssObject.scale.set(0.03,0.03,0.03)
// cssScene.add(cssObject);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('pages/img/Screenshot_4.png');
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

LoadText("GitHub", 2, 4, 12, 28, -10);
LoadText("LinkedIn", 2, 4, -35, 28, -10);

// border objelerı
const bordergeometry = new THREE.BoxGeometry(1, 1, 1); // Küp boyutu
const bordermaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5}); // Yarı saydam malzeme
const LinkedInCube = new THREE.Mesh(bordergeometry, bordermaterial);
LinkedInCube.position.set(0, 30, -50); // Küpün pozisyonu
scene.add(LinkedInCube);

const GitHubCube = new THREE.Mesh(bordergeometry,bordermaterial);
GitHubCube.position.set(10, 30, -50); // Küpün pozisyonu
scene.add(GitHubCube);

// Küpü tıklanabilir hale getirmek için, gölge ve ışık özelliklerini kapatıyoruz
LinkedInCube.castShadow = false;
LinkedInCube.receiveShadow = false;
LinkedInCube.visible = true;

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


Update();

function Update() {
    console.log(deskSpotLight.intensity);
    // console.log(colorAnim2.progress());
    directionalLightHelper.update();
    deskSpotLightHelper.update();

    scene.getObjectByName("directionalLight").target = scene.getObjectByName("box1");
    // cssRenderer.render(cssScene, camera);
    renderer.render(scene, camera);
    // controls.update();
    // console.log(camera.position);
    // console.log(camera.rotation);
    const t = (clock.getElapsedTime() % 20) / 20;
    const pos = path.getPointAt(t);
    scene.getObjectByName("directionalLight").position.copy(pos);
    
    // console.log(directionalLight.intensity);
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
    




    // else if (t < 0.5 && canChangeColor) {
    //     canChangeColor = false;
    //     gsap.to(directionalLight.color, {
    //         r: 168,
    //         g: 47,
    //         b: 1,
    //         duration: 5.1,
    //         onComplete: (() => {
    //             canChangeColor = true;
    //         })
    //     })
    //     gsap.to(directionalLight, {
    //         intensity: 1.25,
    //         duration: 5.1
    //     })
    //     gsap.to(hemiLight, {
    //         intensity: 0.5,
    //         duration:5.1
    //     })
    // } else if (t < 0.75 && canChangeColor) {
    //     canChangeColor = false;
    //     gsap.to(directionalLight.color, {
    //         r: 0,
    //         g: 0,
    //         b: 0,
    //         duration: 5.1,
    //         onComplete: (() => {
    //             canChangeColor = true;
    //         })
    //     })
    //     gsap.to(directionalLight, {
    //         intensity: 0,
    //         duration: 5.1
    //     })
    //     gsap.to(hemiLight, {
    //         intensity: 0.25,
    //         duration:5.1
    //     })
    // } else if (canChangeColor) {
    //     canChangeColor = false;
    //     gsap.to(directionalLight.color, {
    //         r: 168,
    //         g: 47,
    //         b: 1,
    //         duration: 5.1,
    //         onComplete: (() => {
    //             canChangeColor = true;
    //         })
    //     })
    //     gsap.to(directionalLight, {
    //         intensity: 1.25,
    //         duration: 5.1
    //     })
    //     gsap.to(hemiLight, {
    //         intensity: 0.5,
    //         duration:5.1
    //     })
    // }


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
            if(intersects[0].object.name == "htmlPlane" && canMoveCamera && isCameraBase) {
                canShowOutline = false;
                canMoveCamera = false;
                moveCameratoScreen();
            }
            else if(canMoveCamera && !isCameraBase) {
                canMoveCamera = false;
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
            // console.log(intersects[0].object.name);
            outlineMesh.visible = true;
        }
        else{
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
    gui.addFolder("AmbientLight");
    gui.addColor(roomAmbientLightColor, "color").onChange(function (colorVal) {
        roomAmbientLight.Color = new THREE.Color(colorVal);
    })
    gui.add(roomAmbientLight.position, "x", -100, 100).step(0.1);
    gui.add(roomAmbientLight.position, "y", -100, 100).step(0.1);
    gui.add(roomAmbientLight.position, "z", -100, 100).step(0.1);

    // scene.add(roomAmbientLight);
}
function createDirectionalLight(name) {
    directionalLight = new THREE.DirectionalLight(0xffa95c, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.mapSize.width = 1024 * 4;
    directionalLight.shadow.mapSize.height = 1024 * 4;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 200;

    directionalLight.position.set(0, 65, -60);
    directionalLight.name = name;
    gui.addFolder("DirectionalLight");
    gui.addColor(directionalLightColor, "color").onChange(function (colorVal) {
        directionalLight.color = new THREE.Color(colorVal);
    })
    gui.add(directionalLight, "intensity", 0, 100).step(0.1);
    gui.add(directionalLight.position, "x", -100, 100).step(0.1);
    gui.add(directionalLight.position, "y", -100, 100).step(0.1);
    gui.add(directionalLight.position, "z", -100, 100).step(0.1);

    directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
    scene.add(directionalLightHelper)
    var shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(shadowCameraHelper);
    scene.add(directionalLight);
}
function createPointLightSource() {
    roomPointLight = new THREE.PointLight(roomPointLightColor.color, 1);
    roomPointLight.name = "pointLight";
    gui.addFolder("RoomPointLight");
    gui.addColor(roomPointLightColor, "color").onChange(function (colorVal) {
        roomPointLight.color = new THREE.Color(colorVal);
    });
    gui.add(roomPointLight, "intensity", 0, 100).step(0.1);
    gui.add(roomPointLight.position, "x", -100, 100).step(0.1);
    gui.add(roomPointLight.position, "y", -100, 100).step(0.1);
    gui.add(roomPointLight.position, "z", -100, 100).step(0.1);
    var helper = new THREE.PointLightHelper(roomPointLight);
    helper.name = "pointLightHelper";
    scene.add(helper);
    scene.add(roomPointLight);

    return roomPointLight;
}
function createHemiLight() {
    hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.5);
    gui.addFolder("HemiLight");
    gui.addColor(hemilighColor, "color").onChange(function (colorVal) {
        hemiLight.color = new THREE.Color(colorVal);
    });
    gui.add(hemiLight, "intensity", 0, 10).step(0.01);
    gui.add(hemiLight.position, "x", -100, 100).step(0.1);
    gui.add(hemiLight.position, "y", -100, 100).step(0.1);
    gui.add(hemiLight.position, "z", -100, 100).step(0.1);
    var helper = new THREE.HemisphereLightHelper(hemiLight);
    helper.name = "hemispherelight";
    scene.add(helper);

    scene.add(hemiLight);
}
function createSpotLight() {
    var spotLight = new THREE.SpotLight(0xFF9800, 0);  // Işık rengi ve yoğunluk
    spotLight.castShadow = true;

    // Spot ışığı ayarları
    spotLight.angle = Math.PI / 6;  // Koninin genişliği (ışığın yayılma açısı)
    spotLight.penumbra = 0.1;       // Yumuşak kenar (0 = keskin, 1 = çok yumuşak)
    spotLight.decay = 2;            // Mesafeye bağlı parlaklık düşüşü
    spotLight.distance = 20;       // Işığın etkili olduğu mesafe
    spotLight.position.set(18, 19, -53);  // Işığın pozisyonu

    spotLight.shadow.mapSize.width = 1024 * 2;  // Gölge çözünürlüğü
    spotLight.shadow.mapSize.height = 1024 * 2;
    spotLight.shadow.camera.near = 10;          // Gölge kamerası yakın uzaklık
    spotLight.shadow.camera.far = 200;          // Gölge kamerası uzaklık
    spotLight.shadow.camera.fov = 30;           // Gölge kamerasının görüş açısı

    // Işık hedefi (nereye yönlenecek)
    var target = new THREE.Object3D();
    target.position.set(-100, -50.6,0);  // Hedef pozisyonu
    scene.add(target);
    spotLight.target = target;     // SpotLight'ı hedefe yönlendir

    // GUI kontrolleri
    var spotLightFolder = gui.addFolder("SpotLight");
    spotLightFolder.addColor({ color: spotLight.color.getHex() }, "color").onChange(function (colorVal) {
        spotLight.color.set(colorVal);
    });
    spotLightFolder.add(spotLight, "intensity", 0, 100).step(0.1);
    spotLightFolder.add(spotLight, "angle", 0, Math.PI / 2).step(0.01);
    spotLightFolder.add(spotLight, "penumbra", 0, 1).step(0.01);
    spotLightFolder.add(spotLight.position, "x", -100, 100).step(0.1);
    spotLightFolder.add(spotLight.position, "y", -100, 100).step(0.1);
    spotLightFolder.add(spotLight.position, "z", -100, 100).step(0.1);
    spotLightFolder.add(target.position, "x", -100, 100).step(0.1);
    spotLightFolder.add(target.position, "y", -100, 100).step(0.1);
    spotLightFolder.add(target.position, "z", -100, 100).step(0.1);


    // SpotLight için helper (görsel rehber)
    deskSpotLightHelper = new THREE.SpotLightHelper(spotLight);
    // scene.add(deskSpotLightHelper);

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

function LoadText(text, height, size, x,y,z) {
    const fontloader = new FontLoader();
    fontloader.load('node_modules/three/examples/fonts/droid/droid_sans_bold.typeface.json', (droidfont) => {
        const textGeometry = new TextGeometry(text, {
            height: height,
            size: size,
            font: droidfont,
            curveSegments: 12,
            bevelEnabled: true,      // Adds a bevel to the text
            bevelThickness: 0.5,     // Thickness of the bevel
            bevelSize: 0.2,          // How far the bevel reaches inside the text
        });
        const textureMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
        const textMesh = new THREE.Mesh(textGeometry, textureMaterial);
        textMesh.position.set(x,y,z);
        textMesh.name = text;
        scene.add(textMesh);
    })
}

