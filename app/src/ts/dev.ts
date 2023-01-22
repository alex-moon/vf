import {Color, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";

export class Dev {
  protected $element!: HTMLDivElement;
  protected texture: TextureLoader;
  protected draco: DRACOLoader;
  protected gltf: GLTFLoader;
  protected stats: any;
  protected renderer!: WebGLRenderer;
  protected scene: Scene;
  protected camera!: PerspectiveCamera;
  protected controls!: OrbitControls;
  protected composer!: EffectComposer;

  constructor() {
    this.texture = new TextureLoader();

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new Scene();
    this.scene.background = new Color(0x0);

    // @ts-ignore
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';

    this.draco = new DRACOLoader();
    this.draco.setDecoderPath('js/libs/draco/gltf/');
    this.gltf = new GLTFLoader();
    this.gltf.setDRACOLoader(this.draco);
  }

  public init($element: HTMLDivElement) {
    this.$element = $element;
    this.$element.appendChild(this.stats.dom);
    this.$element.appendChild(this.renderer.domElement);
    this.renderer.setSize(this.$element.offsetWidth, this.$element.offsetHeight);

    this.camera = new PerspectiveCamera(
      40,
      this.$element.offsetWidth / this.$element.offsetHeight,
      1,
      100
    );
    this.camera.position.set(0, 5, -5);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.load().then(this.animate.bind(this));
  }

  protected load() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }


  protected animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
