import * as THREE from "../libraries/three.module.js";
import * as CANNON from "../libraries/cannon-es.js";

export default class Torus {
  constructor(options) {
    const visualGeometry = new THREE.TorusGeometry(options.radius, options.tube, options.radialSegments, options.tubularSegments);
    const visualMaterial = new THREE.MeshLambertMaterial({ color: options.color });
    // const visualMaterial = new THREE.MeshStandardMaterial({ color: options.color });

    this.mesh = new THREE.Mesh(visualGeometry, visualMaterial);

    // this.mesh.setRotationFromQuaternion(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.physicsBody = new CANNON.Body({ mass: options.mass });

    fillBody(this.physicsBody, options.radius, options.tube);

    this.physicsBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.mesh.quaternion.copy(this.physicsBody.quaternion);

    this.setID(options.torusID);
    function fillBody(physicsBody, radius, tube) {
      let vectors = [];
      let zerosCoord = {
        x: radius * Math.cos(0).toFixed(2),
        y: radius * Math.sin(0).toFixed(2),
      };
      let coords = {
        x: radius * Math.cos(Math.PI / 6).toFixed(2),
        y: radius * Math.sin(Math.PI / 6).toFixed(2),
      };

      vectors = vectors.concat(create(coords, 4));
      vectors = vectors.concat(create(zerosCoord, 2));
      const sphereGeometry = new CANNON.Sphere(tube);
      for (let i = 0; i < 12; i++) {
        physicsBody.addShape(sphereGeometry, vectors[i]);
      }
      function create(coords, number) {
        let tmp = [];
        for (let i = 0, b = -0.5; i < number; i++, b += 0.5) {
          tmp.push(new CANNON.Vec3((-1) ** i * coords.x, (-1) ** (i * b) * coords.y, 0));
          tmp.push(new CANNON.Vec3((-1) ** (i * b) * coords.y, (-1) ** i * coords.x, 0));
        }
        return tmp;
      }
    }
  }
  get getMesh() {
    return this.mesh;
  }
  get getBody() {
    return this.physicsBody;
  }
  setID(ID) {
    this.mesh.userData = {
      ID: ID,
    };
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
    this.physicsBody.position.set(x, y, z);
  }
}
