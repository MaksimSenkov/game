import * as THREE from "../libraries/three.module.js";
import * as CANNON from "../libraries/cannon-es.js";

export default class Box {
  constructor(options) {
    const visualGeometry = new THREE.BoxGeometry(options.width, options.height, options.depth);
    const visualMaterial = new THREE.MeshLambertMaterial({ color: options.color });
    // const visualMaterial = new THREE.MeshStandardMaterial({ color: options.color });

    this.mesh = new THREE.Mesh(visualGeometry, visualMaterial);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    const physicsGeometry = new CANNON.Box(new CANNON.Vec3(options.width / 2, options.height / 2, options.depth / 2));
    this.physicsBody = new CANNON.Body({ mass: options.mass, shape: physicsGeometry });
  }

  get getMesh() {
    return this.mesh;
  }
  get getBody() {
    return this.physicsBody;
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
    this.physicsBody.position.set(x, y, z);
  }
}
