import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

type GLTFLoaderOptions = {
  url: string;
  onLoad: (gltf: GLTF) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: (err: unknown) => void;
};

export class Loader {
  private gltfLoader: GLTFLoader;

  constructor() {
    this.gltfLoader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    this.gltfLoader.setDRACOLoader(dracoLoader);
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
}
