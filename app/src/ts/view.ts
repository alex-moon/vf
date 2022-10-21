import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {Entity} from "@/ts/entities/entity";

export class View {
  mixers: THREE.AnimationMixer[] = [];
  clock: THREE.Clock;
  stats: Stats;
  renderer!: THREE.WebGLRenderer;
  pmremGenerator!: THREE.PMREMGenerator;
  scene: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  controls!: OrbitControls;
  dracoLoader: DRACOLoader;
  loader: GLTFLoader;
  entities: Entity[] = [];
  delta: any;

  constructor() {
    this.clock = new THREE.Clock();
    this.delta = this.clock.getDelta();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('js/libs/draco/gltf/');

    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.dracoLoader);

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
  }

  public init($element: HTMLDivElement) {
    $element.appendChild(this.stats.dom);
    $element.appendChild(this.renderer.domElement);
    this.renderer.setSize($element.offsetWidth, $element.offsetHeight);

    this.camera = new THREE.PerspectiveCamera(
      40,
      $element.offsetWidth / $element.offsetHeight,
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

    this.animate();
  }

  public load(entity: Entity) {
    this.entities.push(entity);
    this.loader.load(entity.getPath(), (gltf: any) => {
      entity.model = gltf;
      entity.model.scene.position.set(0, 0, 0);
      entity.model.scene.scale.set(1, 1, 1);
      this.scene.add(entity.model.scene);
      const mixer = new THREE.AnimationMixer(entity.model.scene);
      this.mixers.push(mixer);
      const animation = entity.getAnimation();
      mixer.clipAction(entity.model.animations[animation]).play();
    }, undefined, (e: any) => {
      console.error(e);
    });
  }

  private move() {
    this.entities.forEach((entity) => {
      const intent = entity.getIntent();
      entity.model.scene.position.x += intent.velocity.x;
      entity.model.scene.position.y += intent.velocity.y;
      entity.model.scene.position.z += intent.velocity.z;
    });
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.move();
    this.mixers.forEach(mixer => mixer.update(this.delta));
    this.controls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }
}
