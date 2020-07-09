import * as THREE from 'three';
import promiseGLTFLoader from '../common/PromiseGLTFLoader';

import refractVs from './shaders/refraction.vert';
import refractFs from './shaders/refraction.frag';
import backfaceVs from './shaders/backface.vert';
import backfaceFs from './shaders/backface.frag';

export default class Diamond {
  constructor(modelSrc, resolution, texture, backTexture) {
    this.src = modelSrc;
    this.resolution = resolution;
    console.log(texture);
    this.uniforms = {
      texture: { type: 't', value: texture },
      backTexture: { type: 't', value: backTexture },
      resolution: {
        type: 'vec2',
        value: {
          x: resolution.width * resolution.dpr,
          y: resolution.height * resolution.dpr,
        },
      },
    };
    this.backFaceMaterial = null;
    this.refractionMaterial = null;
    this.mesh = null;
    this.time = 0;
  }

  async createGeometry() {
    const model = await promiseGLTFLoader(this.src);
    // const mesh = model.scene.children[0].children[0].children[0].children[0];
    const mesh = model.scene.children[0];
    const geometry = mesh.geometry;
    geometry.computeVertexNormals();
    return geometry;
  }

  createMaterial() {
    this.backFaceMaterial = new THREE.ShaderMaterial({
      vertexShader: backfaceVs,
      fragmentShader: backfaceFs,
      side: THREE.BackSide,
    });
    this.refractionMaterial = new THREE.ShaderMaterial({
      vertexShader: refractVs,
      fragmentShader: refractFs,
      uniforms: this.uniforms,
    });

    const material = this.refractionMaterial;
    return material;
  }

  resize(resolution) {
    this.resolution = resolution;
    this.uniforms.resolution.value = {
      x: resolution.width * resolution.dpr,
      y: resolution.height * resolution.dpr,
    };
  }

  setSide(side = 'front') {
    if (side === 'front' || side === null) {
      this.mesh.material = this.refractionMaterial;
    } else {
      this.mesh.material = this.backFaceMaterial;
    }
  }

  update(deltaTime, velocity) {
    this.time += deltaTime;
    this.mesh.rotation.x = this.time / 6;
    this.mesh.rotation.y = this.time / 4;
  }

  async createMesh() {
    const geometry = await this.createGeometry();
    const material = this.createMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  async init() {
    this.mesh = await this.createMesh();
    return;
  }
}
