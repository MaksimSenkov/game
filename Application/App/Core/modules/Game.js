import * as THREE from "../libraries/three.module.js";
import { OrbitControls } from "../libraries/OrbitControls.js";

import * as CANNON from "../libraries/cannon-es.js";
import CannonDebugRenderer from "../libraries/CannonDebugRenderer.js";

import Box from "./Box.js";

export default class Game {
  constructor() {
    //three.js variables
    this.camera, this.scene, this.renderer;
    this.movementPlane;
    this.clickMarker;
    this.raycaster;

    //Dragging flag
    this.isDragging = false;

    //Three OrbitControl
    this.controls;

    //cannon.js variables
    this.world;
    this.jointBody;
    this.jointConstraint = undefined;

    this.floor = undefined;

    //cannon debug
    this.cannonDebugRenderer;

    //sync
    this.meshes = [];
    this.bodies = [];

    //Level
    this.currentLevel;

    //World Size
    this.worldSize = {
      side: 30,
      height: 4,
    };

    this.debug = [];
  }

  run() {
    let meshes = this.meshes;
    let bodies = this.bodies;
    let renderer = this.renderer;
    let scene = this.scene;
    let camera = this.camera;
    let controls = this.controls;

    let world = this.world;
    let cannonDebugRenderer = this.cannonDebugRenderer;

    let debug = this.debug;

    animate();

    function animate() {
      requestAnimationFrame(animate);
      world.fixedStep();
      controls.update();

      for (let i = 0; i !== meshes.length; i++) {
        meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
      }

      renderer.render(scene, camera);

      if (debug[0]) {
        cannonDebugRenderer.update();
      }
    }
  }
  debugStart() {
    this.debug[0] = true;
  }
  debugEnd() {
    this.debug[0] = false;
  }
  init() {
    this.initVisual();
    this.initPhysics();
    this.initEmptyLevel();
    this.initListeners();
  }
  initVisual() {
    //Create Camera
    const width = 10;
    const height = width * (window.innerHeight / window.innerWidth);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);

    this.camera.position.set(0, 25, 0);

    //Create Scene
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0xcccccc);
    this.scene.background = new THREE.Color(0xf0e6fa);

    //Create Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);

    //Create Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.55);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;

    // directionalLight.shadow.mapSize.width = 512;
    // directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    // directionalLight.shadow.camera.near = 0.5;
    // directionalLight.shadow.camera.far = 500;
    let size = 40;
    directionalLight.shadow.camera.left = -size;
    directionalLight.shadow.camera.bottom = -size;
    directionalLight.shadow.camera.right = size;
    directionalLight.shadow.camera.top = size;
    directionalLight.shadow.camera.near = -30;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    // this.helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // this.scene.add(this.helper);

    //Create RayCasteer
    this.raycaster = new THREE.Raycaster();

    //Create OrbitControl
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // this.controls.autoRotate = true;
    this.controls.enableRotate = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;

    this.controls.minDistance = 25;
    this.controls.maxDistance = 100;

    this.controls.enablePan = false;

    // controls.maxPolarAngle = Math.PI / 2;
    // controls.minPolarAngle = 1;

    //Create touch marker
    const markerGeometry = new THREE.SphereBufferGeometry(0.2, 8, 8);
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.clickMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    this.clickMarker.visible = false;
    this.scene.add(this.clickMarker);

    //Create touch plane
    const planeGeometry = new THREE.PlaneBufferGeometry(this.worldSize.side * 2, this.worldSize.side * 2);
    this.movementPlane = new THREE.Mesh(planeGeometry);
    this.movementPlane.visible = false;
    this.scene.add(this.movementPlane);
  }

  initPhysics() {
    //Create World
    this.world = new CANNON.World();
    this.world.gravity.set(0, -45, 0);
    //Create Debug
    this.cannonDebugRenderer = new CannonDebugRenderer(this.scene, this.world);

    //Create joint
    const jointShape = new CANNON.Sphere(0.1);
    this.jointBody = new CANNON.Body({ mass: 0 });
    this.jointBody.addShape(jointShape);
    this.jointBody.collisionFilterGroup = 0;
    this.jointBody.collisionFilterMask = 0;
    this.world.addBody(this.jointBody);
  }
  initEmptyLevel() {
    const planeShape = new CANNON.Plane();

    const planeBody1 = new CANNON.Body({ mass: 0, shape: planeShape });
    planeBody1.quaternion.setFromEuler(Math.PI, 0, 0);
    planeBody1.position.set(0, 5, this.worldSize.side);
    this.world.addBody(planeBody1);

    const planeBody2 = new CANNON.Body({ mass: 0, shape: planeShape });
    // planeBody2.quaternion.setFromEuler(Math.PI, 0, 0);
    planeBody2.position.set(0, 5, -this.worldSize.side);
    this.world.addBody(planeBody2);

    const planeBody3 = new CANNON.Body({ mass: 0, shape: planeShape });
    planeBody3.quaternion.setFromEuler(Math.PI, -Math.PI / 2, 0);
    planeBody3.position.set(this.worldSize.side, 5, 0);
    this.world.addBody(planeBody3);

    const planeBody4 = new CANNON.Body({ mass: 0, shape: planeShape });
    planeBody4.quaternion.setFromEuler(Math.PI, Math.PI / 2, 0);
    planeBody4.position.set(-this.worldSize.side, 5, 0);
    this.world.addBody(planeBody4);

    const planeBody5 = new CANNON.Body({ mass: 0, shape: planeShape });
    planeBody5.quaternion.setFromEuler(Math.PI / 2, 0, 0);
    planeBody5.position.set(0, this.worldSize.side, 0);
    this.world.addBody(planeBody5);

    this.floor = new Box({
      width: this.worldSize.side * 2,
      height: this.worldSize.height,
      depth: this.worldSize.side * 2,
      color: new THREE.Color(`rgb(6%,29%,66%)`),
      mass: 0,
    });
    this.floor.setPosition(0, 0, 0);
    this.addVisualBody(this.floor.getMesh);
    this.addPhysicsBody(this.floor.getBody);
  }

  initListeners() {
    window.addEventListener("resize", onWindowResize);

    window.addEventListener("keydown", enableRotate);
    window.addEventListener("keyup", disableRotate);

    window.addEventListener("pointerdown", takeObject);
    window.addEventListener("pointermove", moveObject);
    window.addEventListener("pointerup", releaseObject);

    let camera = this.camera;
    let renderer = this.renderer;

    let world = this.world;

    let meshes = this.meshes;
    let bodies = this.bodies;

    let raycaster = this.raycaster;

    let clickMarker = this.clickMarker;
    let movementPlane = this.movementPlane;

    let isDragging = this.isDragging;

    let jointBody = this.jointBody;
    let jointConstraint = this.jointConstraint;
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    let controls = this.controls;
    function enableRotate(event) {
      if (controls.enableRotate == true || event.key != "Shift") return;
      controls.enableRotate = true;
      console.log(controls.enableRotate);
    }
    function disableRotate(event) {
      if (event.key != "Shift") return;
      controls.enableRotate = false;
    }

    function takeObject() {
      if (event.which != 1) return;

      const hitPoint = getHitPoint(event.clientX, event.clientY, meshes, camera);

      if (!hitPoint) return;

      // Move marker mesh on contact point
      showClickMarker();
      moveClickMarker(hitPoint.hitCoor);

      // Move the movement plane on the z-plane of the hit
      moveMovementPlane(hitPoint.hitCoor, camera);

      let index = findBody(meshes, hitPoint.object);
      addJointConstraint(hitPoint.hitCoor, bodies[index]);

      requestAnimationFrame(() => {
        isDragging = true;
      });
    }
    function moveObject() {
      if (!isDragging) {
        return;
      }
      // Project the mouse onto the movement plane
      const hitPoint = getHitPoint(event.clientX, event.clientY, movementPlane, camera);

      if (hitPoint) {
        // Move marker mesh on the contact point
        moveClickMarker(hitPoint.hitCoor);

        // Move the cannon constraint on the contact point
        moveJoint(hitPoint.hitCoor);
      }
    }
    function releaseObject() {
      isDragging = false;

      // Hide the marker mesh
      hideClickMarker();

      // Remove the mouse constraint from the world
      removeJointConstraint();
    }
    function getHitPoint(clientX, clientY, mesh, camera) {
      // Get 3D point form the client x y
      const mouse = new THREE.Vector2();
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((clientY / window.innerHeight) * 2 - 1);

      // Get the picking ray from the point
      raycaster.setFromCamera(mouse, camera);

      // Find out if there's a hit
      let hits = undefined;
      if (mesh.length > 1) {
        hits = raycaster.intersectObjects(mesh);
      } else {
        hits = raycaster.intersectObject(mesh);
      }

      // Return the closest hit or undefined
      let obj = undefined;
      if (hits.length > 0) {
        obj = { hitCoor: hits[0].point, object: hits[0].object };
      }
      return obj;
    }

    function showClickMarker() {
      clickMarker.visible = true;
    }
    function moveClickMarker(position) {
      clickMarker.position.copy(position);
    }
    function hideClickMarker() {
      clickMarker.visible = false;
    }

    // This function moves the virtual movement plane for the mouseJoint to move in
    function moveMovementPlane(point, camera) {
      // Center at mouse position
      movementPlane.position.copy(point);

      // Make it face toward the camera
      movementPlane.quaternion.copy(camera.quaternion);
    }
    // This functions moves the joint body to a new postion in space
    // and updates the constraint
    function moveJoint(position) {
      jointBody.position.copy(position);
      jointConstraint.update();
    }
    // Add a constraint between the cube and the jointBody
    // in the initeraction position
    function addJointConstraint(position, constrainedBody) {
      // Vector that goes from the body to the clicked point
      const vector = new CANNON.Vec3().copy(position).vsub(constrainedBody.position);

      // Apply anti-quaternion to vector to tranform it into the local body coordinate system
      const antiRotation = constrainedBody.quaternion.inverse();
      const pivot = antiRotation.vmult(vector); // pivot is not in local body coordinates

      // Move the cannon click marker body to the click position
      jointBody.position.copy(position);

      // Create a new constraint
      // The pivot for the jointBody is zero
      jointConstraint = new CANNON.PointToPointConstraint(constrainedBody, pivot, jointBody, new CANNON.Vec3(0, 0, 0));

      // Add the constraint to world
      world.addConstraint(jointConstraint);
    }
    // Remove constraint from world
    function removeJointConstraint() {
      world.removeConstraint(jointConstraint);
      jointConstraint = undefined;
    }
    function findBody(meshes, mesh) {
      return meshes.indexOf(mesh);
    }
  }

  takeLevel(level) {
    this.currentLevel = level;
  }
  freeLevel() {
    this.currentLevel = undefined;
  }
  async startLevel(level) {
    this.takeLevel(level);
    if (!this.currentLevel) {
      console.error("Уровень не загружен!");
      return;
    }
    this.clearLevel();
    this.currentLevel.initLevel();
    const levelObjects = this.currentLevel.giveObjects();
    await this.deployObjects(levelObjects[0], 250);
    await this.deployObjects(levelObjects[1], 180);
  }

  moveCameraFromTo(startPoint, endPoint) {
    let t = 0;
    let step = 0.01;

    const x1 = +startPoint.x.toFixed(0);
    const y1 = +startPoint.y.toFixed(0);
    const z1 = +startPoint.z.toFixed(0);

    const x3 = +endPoint.x.toFixed(0);
    const y3 = +endPoint.y.toFixed(0);
    const z3 = +endPoint.z.toFixed(0);

    const x2 = +(Math.abs(x3 - x1) / 2).toFixed(0);
    const y2 = +(Math.abs(y3 - y1) / 2).toFixed(0);
    const z2 = +(Math.abs(z3 - z1) / 2).toFixed(0);

    let currentX;
    let currentY;
    let currentZ;

    const ttt = setInterval(() => {
      const calcPart1 = (1 - t) ** 2;
      const calcPart2 = 2 * (1 - t) * t;
      const calcPart3 = t ** 2;
      currentX = calcPart1 * x1 + calcPart2 * x2 + calcPart3 * x3;
      currentY = calcPart1 * y1 + calcPart2 * y2 + calcPart3 * y3;
      currentZ = calcPart1 * z1 + calcPart2 * z2 + calcPart3 * z3;

      t += step;
      t = +t.toFixed(4);

      // this.camera.lookAt(0, currentY, 0);
      this.camera.position.set(currentX, currentY, currentZ);
    }, 30);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        clearInterval(ttt);
        resolve();
      }, 3000);
    });
    // setTimeout(() => {
    //   clearInterval(ttt);
    // }, 3000);
  }
  check() {
    let result = true;

    let meshes = this.meshes;

    let levelSettings = this.currentLevel.giveSettings();
    let toruses = fillTorusesArray();
    for (let array of toruses) {
      for (let tor of array) {
        tor.material.color = new THREE.Color("green");
      }
    }
    for (let i = 0; i < toruses.length; i++) {
      if (!checkCoordinates(toruses[i], levelSettings.positions[i], levelSettings.calculationPrecision)) {
        result = false;
      }
    }

    return result;

    function fillTorusesArray() {
      let toruses = [];
      for (let i = levelSettings.numberOfColumns; i < meshes.length; i += levelSettings.numberOfTorusesOnColumn) {
        let tmp = [];
        for (let j = 0; j < levelSettings.numberOfTorusesOnColumn; j++) {
          tmp.push(meshes[i + j]);
        }
        toruses.push(tmp);
      }
      return toruses;
    }
    function checkCoordinates(toruses, correctPosition, calculationPrecision) {
      let result = true;

      if (!isCoorYCorrect(toruses)) result = false;
      if (!isCoorCorrect("x", toruses, correctPosition.x, calculationPrecision)) result = false;
      if (!isCoorCorrect("z", toruses, correctPosition.z, calculationPrecision)) result = false;

      return result;
    }
    function isCoorYCorrect(toruses) {
      let result = true;
      for (let i = 0; i < toruses.length - 1; i++) {
        const currentTor = toruses[i];
        const nextTor = toruses[i + 1];
        if (+currentTor.position.y.toFixed(1) <= +nextTor.position.y.toFixed(1)) {
          currentTor.material.color = new THREE.Color("red");
          result = false;
        }
      }
      return result;
    }
    function isCoorCorrect(coor, toruses, position, precision) {
      // Math.abs(b - a) + Math.abs(b - c) == c - a
      let result = true;
      for (let i = 0; i < toruses.length; i++) {
        const currentTor = toruses[i];
        let currentTorPosition = currentTor.position[coor].toFixed(0);
        let minrCoor = position - precision;
        let maxCoor = position + precision;

        if (Math.abs(currentTorPosition - minrCoor) + Math.abs(currentTorPosition - maxCoor) !== maxCoor - minrCoor) {
          currentTor.material.color = new THREE.Color("red");
          result = false;
        }
      }
      return result;
    }
  }
  god() {
    let levelSettings = this.currentLevel.giveSettings();

    let y = 0;
    const vector = new CANNON.Vec3(1, 0, 0);
    for (let i = levelSettings.numberOfColumns; i < this.bodies.length; i += levelSettings.numberOfTorusesOnColumn) {
      let currentPos = levelSettings.positions[y];

      for (let j = levelSettings.numberOfTorusesOnColumn - 1; 0 <= j; j--) {
        this.bodies[i + j].position.set(currentPos.x, 20 - 2 * j, currentPos.z);
        this.bodies[i + j].quaternion.setFromAxisAngle(vector, -Math.PI / 2);
      }
      y++;
    }
  }

  endLevel() {
    const levelSettings = this.currentLevel.giveSettings();
    const bodies = this.bodies;

    const timeBeforeDelete = 11000;

    changeColumnsMass(levelSettings.numberOfColumns, bodies);
    rotateFloor(this.floor);

    setTimeout(() => {
      this.clearLevel();
      this.freeLevel();
    }, timeBeforeDelete);

    function rotateFloor(floor) {
      let rotate = 0;
      let time = 10000;

      // let floor = this.floor;
      const vector = new CANNON.Vec3(1, 0, 0);

      const preStep = 500;
      const step = (2 * Math.PI) / preStep;

      let timerId = setInterval(() => {
        rotate += step;

        floor.getBody.quaternion.setFromAxisAngle(vector, rotate);
        floor.getMesh.quaternion.copy(floor.getBody.quaternion);
      }, time / preStep);
      setTimeout(() => {
        floor.getBody.quaternion.setFromAxisAngle(vector, 0);
        floor.getMesh.quaternion.copy(floor.getBody.quaternion);
        clearInterval(timerId);
      }, time);
    }
    function changeColumnsMass(numberOfColumns, bodies) {
      for (let i = 0; i < numberOfColumns; i++) {
        let body = bodies[i];
        body.mass = 1000;
        body.updateMassProperties();
      }
    }
  }
  // deployObjects(arrayOfObjects) {
  //   for (let i = 0; i < arrayOfObjects[0].length; i++) {
  //     this.add(arrayOfObjects[0][i]);
  //   }
  //   let i = 0;
  //   let time = 180;
  //   let timerId = setInterval(
  //     () => {
  //       this.add(arrayOfObjects[1][i]);
  //       i++;
  //     },
  //     time,
  //     arrayOfObjects[1]
  //   );
  //   setTimeout(() => {
  //     clearInterval(timerId);
  //   }, time * arrayOfObjects[1].length);
  // }
  async deployObjects(arrayOfObjects, animationTime) {
    let i = 0;
    // let time = 180;
    let timerId = setInterval(
      () => {
        this.add(arrayOfObjects[i]);
        i++;
      },
      animationTime,
      arrayOfObjects
    );
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        clearInterval(timerId);
        resolve();
      }, animationTime * arrayOfObjects.length);
    });
  }

  clearLevel() {
    //Может быть стоит перепесать на Pop();
    for (let item of this.meshes) {
      this.clearMeshe(item);
    }
    for (let item of this.bodies) {
      this.clearBodie(item);
    }
    this.meshes.length = 0;
    this.bodies.length = 0;
  }
  clearMeshe(mesh) {
    this.scene.remove(mesh);
  }
  clearBodie(body) {
    this.world.removeBody(body);
  }

  add(body) {
    this.scene.add(body.getMesh);
    this.world.addBody(body.getBody);
    this.meshes.push(body.getMesh);
    this.bodies.push(body.getBody);
  }
  addPhysicsBody(body) {
    this.world.addBody(body);
  }
  addVisualBody(body) {
    this.scene.add(body);
  }
}
