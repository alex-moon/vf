import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export default class Vf {
  mixer: any;
  clock: any;
  container: any;
  stats: any;
  renderer: any;
  pmremGenerator: any;
  scene: any;
  camera: any;
  controls: any;
  loader: any;
  model: any;
  delta: any;
  dracoLoader: any;

  constructor() {
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbfe3dd);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    this.camera.position.set(5, 2, 8);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('js/libs/draco/gltf/');
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.dracoLoader);
    this.loader.load('/glb/jack.glb', (gltf: any) => {
      this.model = gltf.scene;
      this.model.position.set(1, 1, 0);
      this.model.scale.set(0.01, 0.01, 0.01);
      this.scene.add(this.model);
      this.mixer = new THREE.AnimationMixer(this.model);
      this.mixer.clipAction(gltf.animations[ 0 ]).play();
    }, undefined, (e: any) => {
      console.error(e);
    });
  }

  public init($element: any) {
    this.container = $element;
    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);
    this.container.appendChild(this.renderer.domElement);
    this.animate();

    window.onresize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.delta = this.clock.getDelta();
    this.mixer.update(this.delta);
    this.controls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }
}
