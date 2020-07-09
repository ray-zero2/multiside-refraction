import Gl from './Gl/Gl';

class App {
  constructor() {
    this.gl = new Gl(document.querySelector('#canvas'));
    this.init();
  }

  async init() {
    await this.gl.init();
    this.gl.start();
  }
}
new App();
