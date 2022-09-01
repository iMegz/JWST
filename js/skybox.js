let scene, camera, renderer, skyboxGeo, skybox, controls, myReq;
let zoomOut = false;
let autoRotate = true;
let skyboxImage = "purplenebula";

function createSkyBox(scene) {
    const path = `https://raw.githubusercontent.com/codypearce/some-skyboxes/master/skyboxes/purplenebula/"purplenebula"`;
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    const materialArray = sides.map((side) => {
        const image = `${path}_${side}.png`;
        const map = new THREE.TextureLoader().load(image);
        return new THREE.MeshBasicMaterial({ map, side: THREE.BackSide });
    });
    const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    const skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        45,
        30000
    );
    camera.position.set(1200, -250, 2000);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = "canvas";
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.minDistance = 700;
    controls.maxDistance = 1500;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    window.addEventListener("resize", onWindowResize, false);
    animate();
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    controls.autoRotate = autoRotate;

    if (controls.maxDistance == 1500 && zoomOut) {
        controls.maxDistance = 20000;
        camera.position.z = 20000;
    } else if (controls.maxDistance == 20000 && !zoomOut) {
        console.log("called");
        controls.maxDistance = 1500;
        camera.position.z = 2000;
    }

    controls.update();
    renderer.render(scene, camera);
    myReq = window.requestAnimationFrame(animate);
}

init();

function switchSkyBox(skyboxName) {
    scene.remove(skybox);
    skyboxImage = skyboxName;
    const materialArray = createMaterialArray(skyboxImage);

    skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
}
