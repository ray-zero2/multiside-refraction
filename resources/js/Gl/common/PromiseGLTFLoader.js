import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const gltfLoader = new GLTFLoader();

export default (src) => {
  return new Promise((resolve, reject) => {
    gltfLoader.load(src, resolve, null, reject);
  });
};
