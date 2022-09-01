"use strict";

/* global THREE */
let skyboxGeo, skybox, controls;
let skyboxImage = "purplenebula";

function createPathStrings(filename) {
    const basePath = `https://raw.githubusercontent.com/codypearce/some-skyboxes/master/skyboxes/${filename}/`;
    const baseFilename = basePath + filename;
    const fileType = filename == "purplenebula" ? ".png" : ".jpg";
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    const pathStings = sides.map((side) => {
        return baseFilename + "_" + side + fileType;
    });

    return pathStings;
}

function createMaterialArray(filename) {
    const skyboxImagepaths = createPathStrings(filename);
    const materialArray = skyboxImagepaths.map((image) => {
        let texture = new THREE.TextureLoader().load(image);

        return new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
        });
    });
    return materialArray;
}
function animate(camera) {
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
    // const myReq = window.requestAnimationFrame(animate);
}
function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });

    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    // scene.background = new THREE.Color("black");
    {
        // const materialArray = createMaterialArray(skyboxImage);
        // skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
        // skybox = new THREE.Mesh(skyboxGeo, materialArray);
        // scene.add(skybox);
        // controls = new THREE.OrbitControls(camera, renderer.domElement);
        // controls.enabled = true;
        // controls.minDistance = 700;
        // controls.maxDistance = 1500;
        // controls.autoRotate = true;
        // controls.autoRotateSpeed = 1.0;
        // animate();
    }

    // {
    //     const loader = new THREE.TextureLoader();
    //     const path = "http://localhost:3000/bg.jfif";
    //     loader.load(path, function (texture) {
    //         var img = texture.image;

    //         scene.background = texture;
    //     });
    // }

    // {
    //     const planeSize = 40;

    //     const loader = new THREE.TextureLoader();
    //     const texture = loader.load(
    //         "https://r105.threejsfundamentals.org/threejs/resources/images/checker.png"
    //     );
    //     texture.wrapS = THREE.RepeatWrapping;
    //     texture.wrapT = THREE.RepeatWrapping;
    //     texture.magFilter = THREE.NearestFilter;
    //     const repeats = planeSize / 2;
    //     texture.repeat.set(repeats, repeats);

    //     const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    //     const planeMat = new THREE.MeshPhongMaterial({
    //         map: texture,
    //         side: THREE.DoubleSide,
    //     });
    //     const mesh = new THREE.Mesh(planeGeo, planeMat);
    //     mesh.rotation.x = Math.PI * -0.5;
    //     scene.add(mesh);
    // }

    {
        const skyColor = 0xb1e1ff; // light blue
        const groundColor = 0xb97a20; // brownish orange
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
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(5, 10, 2);
        scene.add(light);
        scene.add(light.target);
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.Math.degToRad(camera.fov * 0.5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        // compute a unit vector that points in the direction the camera is now
        // in the xz plane from the center of the box
        const direction = new THREE.Vector3()
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize();

        // move the camera to a position distance units way from the center
        // in whatever direction the camera was from the center already
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

        // pick some near and far values for the frustum that
        // will contain the box.
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;

        camera.updateProjectionMatrix();

        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }

    {
        const gltfLoader = new THREE.GLTFLoader();
        const path = "http://localhost:3000/scene/scene.gltf";
        gltfLoader.load(path, (gltf) => {
            const root = gltf.scene;
            scene.add(root);

            // compute the box that contains all the stuff
            // from root and below
            const box = new THREE.Box3().setFromObject(root);

            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            // set the camera to frame the box
            frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

            // update the Trackball controls to handle the new size
            controls.maxDistance = boxSize * 10;
            controls.target.copy(boxCenter);
            controls.update();
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

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
