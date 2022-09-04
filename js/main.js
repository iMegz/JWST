const api = "https://jwst3js.herokuapp.com";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const objects = [];
const distance = [];
const names = ["Earth", "Moon", "JWST"];
const info = (title, data) =>
    `<li><span class="info-title">${title} : </span>${data}</li>`;
const infoContent = {
    Earth: `
        ${info("Radius", "6,371 km")}
        ${info("Mass", "5.972 x 10^24 kg")}
        ${info("Dist. from sun", "150.99M km")}
        ${info("Tilt", "23.5 degrees")}
        ${info("More", "Earth is the 3rd planet in the solar system")}
        `,
    Moon: `
        ${info("Radius", "1,737.4 km")}
        ${info("Mass", "7.347 x 10^22 Kg")}
        ${info("Dist. from earth", "384.4K km")}
        ${info("More", "THe gravity on the moon is about 1/6 of that on earth")}
        `,
    JWST: `
        ${info("Launch", "Dec, 25, 2021 @ 2:20PM GMT+2")}
        ${info("Mass", "6200 kg")}
        ${info("Disk size", "68 GB SSD")}
        ${info("Dist. from earth", "about 1M Miles")}
        ${info("Position", "L2 Lagrange point")}
        ${info(
            "More",
            "The main mirror of JWST is 6.5m across<br>JWST is doesn't rotate around earth but rotates with it around the sun"
        )}
        `,
};

viewInfo("JWST");

let coords = { x: 0, y: 0, z: 0 };
let lastDistance = 150;

function init() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const scene = new THREE.Scene();

    {
        //Light
        scene.add(new THREE.AmbientLight(0xaaaaaa, 0.7));
        const color = 0xffffff;
        const intensity = 0.3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(1700, -100, -100);
        scene.add(light);
        scene.add(light.target);
    }

    //----------------------------------------------------//
    //---------------------- Camera ----------------------//
    //----------------------------------------------------//
    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 30000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(1609, 0, 100);
    const controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(1609, 0, 0);
    // controls.autoRotate = true;
    // controls.autoRotateSpeed = -2.0;
    // controls.minDistance = 10;
    // controls.maxDistance = 3000;

    //----------------------------------------------------//
    //----------------- Scene components -----------------//
    //----------------------------------------------------//
    addSkybox(scene, 30000);
    addSphere(scene, "earth", 63.71, [0, 0, 0], "earth");
    addSphere(scene, "moon", 17.37, [384.4, 0, 0], "moon");
    {
        const gltfLoader = new THREE.GLTFLoader();
        const path = "https://jwst3js.herokuapp.com/scene/scene.gltf";
        gltfLoader.load(path, (gltf) => {
            const mesh = gltf.scene;
            // mesh.position = new THREE.Vector3(1609, 0, 0);
            mesh.position.set(1609, 0, 0);
            mesh.rotation.set(Math.PI, Math.PI, Math.PI / 2);
            mesh.scale.set(3, 3, 3);
            scene.add(mesh);

            const box = new THREE.Box3().setFromObject(mesh);
            const { x, y, z } = box.getSize(new THREE.Vector3());
            const { x: ox, y: oy, z: oz } = box.getCenter(new THREE.Vector3());

            const geometry = new THREE.BoxGeometry(x, y, z);
            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
            });
            const boundryBox = new THREE.Mesh(geometry, material);
            boundryBox.position.set(ox, oy, oz);
            scene.add(boundryBox);

            objects.push(boundryBox);
            distance.push(Math.max(x, y, z) * 3);
            mesh.name = "JWST";
        });
    }

    //----------------------------------------------------//
    //---------------------- Click -----------------------//
    //----------------------------------------------------//
    renderer.domElement.addEventListener("click", onClick);

    let intersects = [];

    function onClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            selected = intersects[0].object;
            const { x: x1, y: y1, z: z1 } = camera.position;
            const { x: x2, y: y2, z: z2 } = selected.position;
            const x = Math.abs(x1 - x2);
            const y = Math.abs(y1 - y2);
            const z = Math.abs(z1 - z2);
            if (x > lastDistance || y > lastDistance || z > lastDistance) {
                const i = objects.findIndex((obj) => obj.name == selected.name);
                lastDistance = distance[i];
                camera.position.set(x2, y2, z2 + lastDistance);
                controls.target.set(x2, y2, z2);
                viewInfo(names[i]);
            }
        }
    }

    //----------------------------------------------------//
    //---------------------- Render ----------------------//
    //----------------------------------------------------//
    function resizeRendererToDisplaySize() {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) renderer.setSize(width, height, false);
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        // updateTest();
        if (objects.length > 2) {
            const time = Date.now() / 1000;
            //Earth
            objects[0].rotation.set((Math.PI * 23.5) / 180, time * 1.375, 0);

            //Moon
            objects[1].position.set(
                Math.cos(time * 0.024) * -384.4,
                0,
                Math.sin(time * 0.024) * -384.4
            );
        }
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    render();
}

function addSkybox(scene, dim) {
    //Skybox
    const path = `https://raw.githubusercontent.com/codypearce/some-skyboxes/master/skyboxes/purplenebula/purplenebula`;
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    const materialArray = sides.map((side) => {
        const image = `${path}_${side}.png`;
        const map = new THREE.TextureLoader().load(image);
        return new THREE.MeshBasicMaterial({ map, side: THREE.BackSide });
    });
    const skyboxGeo = new THREE.BoxGeometry(dim, dim, dim);
    const skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
    skybox.name = "skybox";
    skybox.position.set(0, 0, 0);
}

function addSphere(scene, filename, radius, position, name) {
    const geometry = new THREE.SphereGeometry(radius, 50, 50);
    const path = `${api}/${filename}.jpg`;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(path, (map) => {
        const overdraw = 0.5;
        const material = new THREE.MeshBasicMaterial({ map, overdraw });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        sphere.name = name;
        objects.push(sphere);
        distance.push(radius * 6);
        sphere.position.set(position[0], position[1], position[2]);
    });
}
function updateTest() {
    document.querySelector(".btn").childNodes.forEach((n) => {
        coords[n.id] = n.value;
    });
}
function viewInfo(objectName) {
    document.querySelector("#title").innerHTML = objectName;
    document.querySelector("#infoContent").innerHTML = infoContent[objectName];
}
init();
