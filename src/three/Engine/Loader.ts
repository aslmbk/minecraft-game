import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { TextureAtlas } from "./utils/TextureAtlas";
type GLTFLoaderOptions = {
  url: string;
  onLoad: (gltf: GLTF) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: (err: unknown) => void;
};

type TextureLoaderOptions = {
  url: string;
  onLoad?: (texture: THREE.Texture) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: (err: unknown) => void;
};

type TextureAtlasOptions = {
  name: string;
  urls: string[];
};

export class Loader {
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private textureAtlas: TextureAtlas;

  constructor() {
    this.gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    this.gltfLoader.setDRACOLoader(dracoLoader);

    this.textureLoader = new THREE.TextureLoader();
    this.textureAtlas = new TextureAtlas();
  }

  public loadGLTF(options: GLTFLoaderOptions) {
    this.gltfLoader.load(
      options.url,
      options.onLoad,
      options.onProgress,
      options.onError
    );
  }

  public async loadGLTFAsync(
    options: Pick<GLTFLoaderOptions, "url" | "onProgress">
  ) {
    return this.gltfLoader.loadAsync(options.url, options.onProgress);
  }

  public loadTexture(options: TextureLoaderOptions) {
    return this.textureLoader.load(
      options.url,
      options.onLoad,
      options.onProgress,
      options.onError
    );
  }

  public loadTextureAsync(
    options: Pick<TextureLoaderOptions, "url" | "onProgress">
  ) {
    return this.textureLoader.loadAsync(options.url, options.onProgress);
  }

  public loadTextureAtlas(options: TextureAtlasOptions) {
    this.textureAtlas.Load(options.name, options.urls);
    // Using exmaple
    // this.textureAtlas.Load(name, [url1, url2, url3]);
    // this.textureAtlas.onLoad = () => {
    //   const texture = this.textureAtlas.Info[name].atlas;
    //   texture.colorSpace = THREE.SRGBColorSpace;
    //   texture.minFilter = THREE.NearestFilter;
    //   texture.magFilter = THREE.NearestFilter;
    //   ... do something with the texture
    // };
    return this.textureAtlas;
  }
}
