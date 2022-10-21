import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

export default class Vf {
  mixer!: THREE.AnimationMixer;
  camera!: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  container: any;
  stats: Stats;
  renderer: THREE.WebGLRenderer;
  pmremGenerator: THREE.PMREMGenerator;
  scene: THREE.Scene;
  controls: OrbitControls;
  loader: GLTFLoader;
  model: any;
  delta: any;
  dracoLoader: DRACOLoader;

  constructor() {
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbfe3dd);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('js/libs/draco/gltf/');
  }

  public init($element: any) {
    this.container = $element;
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.container.appendChild(this.stats.dom);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

    this.camera = new THREE.PerspectiveCamera(
      40,
      this.container.offsetWidth / this.container.offsetHeight,
      1,
      100
    );
    this.camera.position.set(2, 2, 2);
    this.camera.updateProjectionMatrix();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.8, 0);
    this.controls.update();
    this.controls.enablePan = true;
    this.controls.enableDamping = true;

    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.dracoLoader);
    this.loader.load('/glb/jack.glb', (gltf: any) => {
      this.model = gltf.scene;
      this.model.position.set(0, 0, 0);
      this.model.scale.set(1, 1, 1);
      this.scene.add(this.model);
      this.mixer = new THREE.AnimationMixer(this.model);
      this.mixer.clipAction(gltf.animations[1]).play();
      this.animate();
    }, undefined, (e: any) => {
      console.error(e);
    });
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.delta = this.clock.getDelta();
    this.mixer.update(this.delta);
    this.controls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }
}
