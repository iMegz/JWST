let autoRotate = false;
let earth = null;
let moon = null;
// let jamesWebb = null;
const moonOrbit = 2000;
// const jamesWebbOrbit = 100;
function init() {
    //Renderer
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });

    //Camera
    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 15000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(530, 500, 520);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(500, 505, 500);
    controls.minDistance = 10;
    controls.maxDistance = 450;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.update();

    //Scene
    const scene = new THREE.Scene();

    {
        const light = new THREE.AmbientLight(0xaaaaaa, 0.3);
        scene.add(light);
    }

    {
        const skyColor = 0xaaaaaa;
        const groundColor = 0x000000;
        const intensity = 1;
        const light = new THREE.HemisphereLight(
            skyColor,
            groundColor,
            intensity
        );
        scene.add(light);
    }

    {
        const color = 0xffffff;
        const intensity = 0.3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(500, 100, 500);
        scene.add(light);
        scene.add(light.target);
    }

    {
        //Skybox
        const path = `https://raw.githubusercontent.com/codypearce/some-skyboxes/master/skyboxes/purplenebula/purplenebula`;
        // const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
        const sides = ["ft", "dn", "ft", "dn", "ft", "dn"];
        const materialArray = sides.map((side) => {
            const image = `${path}_${side}.png`;
            const map = new THREE.TextureLoader().load(image);
            return new THREE.MeshBasicMaterial({ map, side: THREE.BackSide });
        });
        const skyboxGeo = new THREE.BoxGeometry(15000, 15000, 15000);
        const skybox = new THREE.Mesh(skyboxGeo, materialArray);
        scene.add(skybox);
        skybox.position.set(500, 500, 500);
    }

    {
        //Earth
        const geometry = new THREE.SphereGeometry(500, 50, 50);

        const path = "http://localhost:3000/earthDay.jpg";
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(path, (map) => {
            const material = new THREE.MeshBasicMaterial({
                map,
                overdraw: 0.5,
            });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            sphere.position.set(500, -5000, 500);
            earth = sphere;
        });

        // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    }

    {
        //Moon
        const geometry = new THREE.SphereGeometry(135, 50, 50);

        const path = "http://localhost:3000/moon.jpg";
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(path, (map) => {
            const material = new THREE.MeshBasicMaterial({
                map,
                overdraw: 0.5,
            });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            sphere.position.set(1500, -5000, 1500);
            sphere.rotation.set(2, 3, 3);
            moon = sphere;
        });

        // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    }

    {
        const gltfLoader = new THREE.GLTFLoader();
        const path = "http://localhost:3000/scene/scene.gltf";
        gltfLoader.load(path, (gltf) => {
            const mesh = gltf.scene;
            mesh.position.set(500, 500, 500);
            jamesWebb = mesh;
            scene.add(mesh);
        });
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        controls.autoRotate = autoRotate;
        controls.update();
        if (earth) {
            const date = Date.now() * 0.0001;
            earth.rotation.set(date * 0.01, date * 0.628, date * 0.03);
        }
        if (moon) {
            const date = Date.now() * 0.024;
            moon.position.set(
                Math.cos(date) * moonOrbit + 500,
                -6000,
                Math.sin(date) * moonOrbit + 500
            );
        }
        // if (jamesWebb) {
        //     const date = Date.now() * 0.00001;
        //     jamesWebb.position.set(
        //         Math.cos(date) * jamesWebbOrbit + 500,
        //         0,
        //         Math.sin(date) * jamesWebbOrbit + 500
        //     );
        // }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

init();

const autoRotateBtn = document.querySelector("#autoRotate");

autoRotateBtn.onclick = () => {
    if (autoRotate) {
        autoRotateBtn.innerHTML = "Start";
        autoRotateBtn.className = "on";
    } else {
        autoRotateBtn.innerHTML = "Stop";
        autoRotateBtn.className = "off";
    }
    autoRotate = !autoRotate;
};
