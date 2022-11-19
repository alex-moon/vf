import {
  BoxGeometry,
  Color,
  ConeGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
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
    // this.composer.renderToScreen = false;
    const render = new RenderPass(this.scene, this.camera);
    this.composer.addPass(render);
    const bloom = new UnrealBloomPass(
      new Vector2(this.$element.offsetWidth, this.$element.offsetHeight),
      1.5,
      1.5,
      0.1
    );
    bloom.renderToScreen = true;
    this.composer.addPass(bloom);
    // const copy = new ShaderPass(CopyShader);
    // copy.renderToScreen = true;
    // this.composer.addPass(copy);

    this.load().then(this.animate.bind(this));
  }

  protected load() {
    return new Promise((resolve, reject) => {
      const cone = new ConeGeometry(1, 4, 16);
      const coneMat = new MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: 0x33ccff,
        opacity: 0.5,
        transparent: true,
      });
      const coneMesh = new Mesh(cone, coneMat);
      coneMesh.position.set(0, 2, 0);
      coneMesh.layers.set(1);
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
      cubeMesh.layers.set(0);
      this.scene.add(cubeMesh);

      const light = new PointLight(0x33ccff, 1, 100);
      light.position.set(0, 5, 0);
      this.scene.add(light);

      resolve();
    });
  }


  protected animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update();

    this.camera.layers.set(0);
    this.renderer.render(this.scene, this.camera);

    this.camera.layers.set(1);
    this.composer.render();
  }

  protected vertexShader() {
    return `
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;
  }

  protected fragmentShader() {
    return `
      uniform sampler2D baseTexture;
      uniform sampler2D bloomTexture;
      varying vec2 vUv;
      void main() {
          gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
      }
    `;
  }
}
