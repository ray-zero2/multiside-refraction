import { TextureLoader } from 'three/src/loaders/TextureLoader';
const textureLoader = new TextureLoader();

export default (src) => {
  return new Promise((resolve, reject) => {
    textureLoader.load(src, resolve, null, reject);
  });
};
