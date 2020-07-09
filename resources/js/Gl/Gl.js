import * as THREE from 'three';
import Diamond from './diamond/Diamond';
import BackGround from './background/BackGround';

export default class Gl {
  constructor($canvasElement) {
    this.$canvas = $canvasElement;
    this.viewProps = {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(devicePixelRatio, 2 || 1),
    };

    this.isTouched = null;
    this.position = new THREE.Vector2(0, 0);
    this.time = 0;
    this.velocity = 0;

    this.renderer = null;
    this.envFbo = null;
    this.backFaceFbo = null;
    this.scene = null;
    this.camera = null;
    this.orthoCamera = null;
    this.clock = null;

    this.background = null;
    this.diamond = null;
  }

  render() {
    const deltaTime = this.clock.getDelta();
    this.time += deltaTime;

    this.background.update(deltaTime);
    this.diamond.update(deltaTime, this.velocity);

    this.renderer.clear();

    //for the diamond refraction
    this.renderer.setRenderTarget(this.envFbo);
    this.renderer.render(this.scene, this.orthoCamera);
    this.renderer.clearDepth();

    //diamond backside rendering
    this.diamond.setSide('back');
    this.renderer.setRenderTarget(this.backFaceFbo);
    this.renderer.render(this.scene, this.camera);

    //layer 1 rendering
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.orthoCamera);
    this.renderer.clearDepth();

    //diamond rendering
    this.diamond.setSide(null);
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    this.render();
    requestAnimationFrame(this.animate.bind(this));
  }

  setObjects() {
    this.diamond = new Diamond(
      './model/diamond.glb',
      this.viewProps,
      this.envFbo.texture,
      this.backFaceFbo.texture
    );
    this.background = new BackGround('./images/texture.jpg', this.viewProps);

    return new Promise((resolve) => {
      Promise.all([this.diamond.init(), this.background.init()]).then(() => {
        resolve();
      });
    });
  }

  createScene() {
    const vWidth = this.viewProps.width;
    const vHeight = this.viewProps.height;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, vWidth / vHeight, 0.1, 1000);
    this.orthoCamera = new THREE.OrthographicCamera(
      -vWidth / 2,
      vWidth / 2,
      vHeight / 2,
      -vHeight / 2,
      1,
      1000
    );
    this.renderer = new THREE.WebGL1Renderer({
      antialias: true,
      canvas: this.$canvas,
    });
    this.renderer.setSize(vWidth, vHeight);
    this.renderer.setPixelRatio(this.viewProps.dpr);
    this.renderer.autoClear = false;
    this.clock = new THREE.Clock();
  }

  start() {
    this.animate();
  }

  resize() {
    const vp = this.viewProps;
    vp.width = window.innerWidth;
    vp.height = window.innerHeight;

    this.renderer.setSize(vp.width, vp.height);
    this.envFbo.setSize(vp.width * vp.dpr, vp.height * vp.dpr);
    this.backFaceFbo.setSize(vp.width * vp.dpr, vp.height * vp.dpr);
    this.background.resize(vp);
    this.diamond.resize(vp);

    this.camera.aspect = vp.width / vp.height;
    this.camera.updateProjectionMatrix();

    this.orthoCamera.left = -vp.width / 2;
    this.orthoCamera.right = vp.width / 2;
    this.orthoCamera.top = vp.height / 2;
    this.orthoCamera.bottom = -vp.height / 2;
    this.orthoCamera.updateProjectionMatrix();
  }

  // handleMouseDown(event) {
  //   this.isTouched = true;
  //   this.position.x = event.touches ? event.touches[0].clientX : event.clientX;
  // }

  // handleMouseMove(event) {
  //   if (!this.isTouched) return;
  //   const x = event.touches ? event.touches[0].clientX : event.clientX;
  //   this.velocity += (x - this.position.x) * 0.01;
  //   this.position.x = x;
  // }

  // handleMouseUp() {
  //   this.isTouched = false;
  // }

  handleResize() {
    this.resize();
  }

  bind() {
    // window.addEventListener('touchstart', (event) => {
    //   this.handleMouseDown(event);
    // });
    // window.addEventListener('touchmove', (event) => {
    //   this.handleMouseMove(event);
    // });
    // window.addEventListener('touchend', (event) => {
    //   this.handleMouseUp(event);
    // });
    // window.addEventListener('mousedown', (event) => {
    //   this.handleMouseDown(event);
    // });
    // window.addEventListener('mousemove', (event) => {
    //   this.handleMouseMove(event);
    // });
    // window.addEventListener('mouseup', (event) => {
    //   this.handleMouseUp(event);
    // });
    window.addEventListener('resize', (event) => {
      this.handleResize(event);
    });
  }

  async init() {
    this.createScene();
    this.envFbo = new THREE.WebGLRenderTarget(
      this.viewProps.width * this.viewProps.dpr,
      this.viewProps.height * this.viewProps.dpr
    );
    this.backFaceFbo = new THREE.WebGLRenderTarget(
      this.viewProps.width * this.viewProps.dpr,
      this.viewProps.height * this.viewProps.dpr
    );
    await this.setObjects();
    this.background.mesh.layers.set(1);
    this.orthoCamera.layers.set(1);

    this.scene.add(this.diamond.mesh);
    this.scene.add(this.background.mesh);
    this.camera.position.z = 5;
    this.orthoCamera.position.z = 5;
    this.bind();
  }
}
