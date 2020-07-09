import * as THREE from 'three';
import promiseTextureLoader from '../common/PromiseTextureLoader';

export default class BackGround {
  constructor(src, resolution) {
    this.src = src;
    this.resolution = resolution;
    this.mesh = null;
    this.time = 0;
  }

  createGeometry() {
    const geometry = new THREE.PlaneBufferGeometry();
    return geometry;
  }

  async createMaterial() {
    this.texture = await promiseTextureLoader(this.src);
    const material = new THREE.MeshBasicMaterial({ map: this.texture });
    return material;
  }

  resize(resolution) {
    this.resolution = resolution;
    this.mesh.scale.set(this.resolution.height * 2, this.resolution.width, 1);
  }

  update(deltaTime) {
    this.time += deltaTime;
    // this.mesh.rotation.z += 0.001;
  }

  async createMesh() {
    const geometry = this.createGeometry();
    const material = await this.createMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(this.resolution.height * 2, this.resolution.width, 1);
    return mesh;
  }

  async init() {
    this.mesh = await this.createMesh();
    return;
  }
}
