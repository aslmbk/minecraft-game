import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { TextureAtlas } from "./utils/TextureAtlas";
import { Events } from "./utils/Events";

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

export type LoadEventArgs = void;
export type ProgressEventArgs = {
  total: number;
  loaded: number;
  url: string;
};
export type ErrorEventArgs = string;

export class Loader {
  private loadingManager: THREE.LoadingManager;
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private textureAtlas: TextureAtlas;

  public readonly events = new Events<
    | { trigger: "load"; args: LoadEventArgs }
    | { trigger: "progress"; args: ProgressEventArgs }
    | { trigger: "error"; args: ErrorEventArgs }
  >();

  constructor() {
    this.loadingManager = new THREE.LoadingManager(
      () => this.events.trigger("load"),
      (url, loaded, total) =>
        this.events.trigger("progress", { url, loaded, total }),
      (url) => this.events.trigger("error", url)
    );

    this.gltfLoader = new GLTFLoader(this.loadingManager);
    const dracoLoader = new DRACOLoader(this.loadingManager);
    dracoLoader.setDecoderPath("/draco/");
    this.gltfLoader.setDRACOLoader(dracoLoader);

    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.textureAtlas = new TextureAtlas(this.textureLoader);
  }

  public loadGLTF(options: GLTFLoaderOptions) {
    this.gltfLoader.load(
      options.url,
      options.onLoad,
      options.onProgress,
      options.onError
    );
  }

  public loadGLTFAsync(options: Pick<GLTFLoaderOptions, "url" | "onProgress">) {
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

  public loadTextureAtlas(urls: string[]) {
    return this.textureAtlas.load(urls);
  }
}
