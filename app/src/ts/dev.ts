import {
  BoxGeometry,
  Color,
  ConeGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer
} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";

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
    this.renderer.autoClear = false;
    this.renderer.setClearColor( 0x101000 );

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
      10000
    );
    this.camera.position.set(0, 5, -5);
    this.camera.layers.enable(1);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);
    const render = new RenderPass(this.scene, this.camera);
    this.composer.addPass(render);
    const bloom = new UnrealBloomPass(
      new Vector2(this.$element.offsetWidth, this.$element.offsetHeight),
      1.5,
      1.5,
      0.1
    );
    this.composer.addPass(bloom);

    this.load().then(this.animate.bind(this));
  }

  protected load() {
    return new Promise((resolve, reject) => {
      const cone = new ConeGeometry(1, 4, 16);
      const coneMat = new ShaderMaterial({
        vertexShader: this.vertexShader(),
        fragmentShader: this.fragmentShader(),
        transparent: true,
      });
      const coneMesh = new Mesh(cone, coneMat);
      coneMesh.position.set(0, 2, 0);
      this.scene.add(coneMesh);
      this.controls.target.copy(coneMesh.position);

      const cube = new BoxGeometry(2, 2, 2);
      const map = this.texture.load('/thruster.png');
      const cubeMat = new MeshStandardMaterial({
        map: map,
        emissiveMap: map,
        emissive: 0xffffff,
      });
      const cubeMesh = new Mesh(cube, cubeMat);
      cubeMesh.position.set(0, -1, 0);
      // this.scene.add(cubeMesh);

      resolve();
    });
  }


  protected animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }

  protected vertexShader() {
    return `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  protected fragmentShader() {
    return `
      uniform vec2 u_resolution;
      varying vec2 vUv;
      void main() {
        float alpha = smoothstep(0.5, 0.0, vUv.y);
        gl_FragColor = vec4(0.3, 0.8, 1.0, alpha);
      }
    `;
  }
}
