import * as THREE from "three";
import * as dat from "three/examples/jsm/libs/dat.gui.module.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import * as CANNON from "cannon";

import "./styles.css";
import { initStats } from "./util";

function main() {
  // create a scene
  const scene = new THREE.Scene();
  const stats = initStats();

  // create a camera
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // create a renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  // create the ground plane
  const planeGeometry = new THREE.PlaneGeometry(200, 200);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(0, 0, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  // position and point the camera
  camera.position.set(-50, 50, 50);
  camera.lookAt(scene.position);

  // add a spotlight
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-20, 50, 20);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  scene.add(spotLight);

  // add the output of the renderer to the HTML element
  document.getElementById("webgl-output").appendChild(renderer.domElement);

  // initialize the trackball controls and clock
  const trackballControls = new TrackballControls(camera, renderer.domElement);
  const clock = new THREE.Clock();

  // Initialize Cannon.js world
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create a physical ground plane in Cannon.js
  const groundMaterial = new CANNON.Material("groundMaterial");
  const groundBody = new CANNON.Body({
    mass: 0, // Ground is static
    material: groundMaterial,
  });
  groundBody.addShape(new CANNON.Plane());
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // Create the boxes
  const boxMaterial = new CANNON.Material("boxMaterial");
  const boxes = [];
  const meshes = [];

  const dropPoint = new CANNON.Vec3(0, 50, 0); // Drop all boxes from this point

  for (let i = 0; i < 1000; i++) {
    const size = Math.random() * 2 + 1;

    // Cannon.js box
    const boxShape = new CANNON.Box(
      new CANNON.Vec3(size / 2, size / 2, size / 2)
    );
    const boxBody = new CANNON.Body({
      mass: 1, // Boxes are dynamic
      material: boxMaterial,
    });
    boxBody.addShape(boxShape);
    boxBody.position.set(
      dropPoint.x,
      dropPoint.y + Math.random() * 6,
      dropPoint.z + (Math.random() - 0.5) * 100
    );
    world.addBody(boxBody);
    boxes.push(boxBody);

    // THREE.js box
    const boxGeometry = new THREE.BoxGeometry(size, size, size);
    const boxMesh = new THREE.Mesh(
      boxGeometry,
      new THREE.MeshLambertMaterial({ color: 0x2cbe4e }) // GitHub green color
    );
    boxMesh.castShadow = true;
    scene.add(boxMesh);
    meshes.push(boxMesh);
  }

  function updatePhysics() {
    world.step(1 / 60); // Fixed time step

    // Update THREE.js meshes based on Cannon.js bodies
    for (let i = 0; i < boxes.length; i++) {
      meshes[i].position.copy(boxes[i].position);
      meshes[i].quaternion.copy(boxes[i].quaternion);
    }
  }

  function renderScene() {
    stats.update();
    trackballControls.update(clock.getDelta());

    updatePhysics();

    renderer.render(scene, camera);
    window.requestAnimationFrame(renderScene);
  }

  window.addEventListener(
    "resize",
    () => onWindowResize(camera, renderer),
    false
  );

  renderScene();
}

function onWindowResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

main();
