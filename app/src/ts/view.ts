import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {Entity} from "@/ts/entities/entity";

export class View {
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
  follow: Entity|null = null;
  delta: any;
  raycaster: THREE.Raycaster;
  floor: THREE.Object3D;

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

    this.raycaster = new THREE.Raycaster();

    // floor
    const geometry = new THREE.BoxGeometry( 1000, 0, 1000);
    const loader = new THREE.TextureLoader();
    const map = loader.load("/floor.png");
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1000, 1000);
    map.minFilter = THREE.NearestFilter;
    map.magFilter = THREE.NearestFilter;
    const material = new THREE.MeshBasicMaterial({map});
    this.floor = new THREE.Mesh(geometry, material);
    this.scene.add(this.floor);

    // sky
    const texture = loader.load(
      '/skybox.png',
      () => {
          const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
          rt.fromEquirectangularTexture(this.renderer, texture);
          this.scene.background = rt.texture;
        });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1000, 1000);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
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

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.8, 0);
    this.controls.update();
    this.controls.enablePan = true;
    this.controls.enableDamping = true;

    this.animate();

    this.bindEvents();
  }

  private bindEvents() {
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("mousemove", this.onPointerMove.bind(this), false);
    this.renderer.domElement.addEventListener('click', () => {
      this.renderer.domElement.requestPointerLock();
    });
  }

  public load(entity: Entity) {
    this.loader.load(entity.getPath(), (gltf: any) => {
      entity.model = gltf;
      entity.model.scene.position.set(0, 0, 0);
      entity.model.scene.scale.set(1, 1, 1);
      entity.mixer = new THREE.AnimationMixer(entity.model.scene);
      const animation = entity.model.animations[entity.getAnimation()];
      entity.mixer.clipAction(animation).play();
      this.entities.push(entity);
      this.scene.add(entity.model.scene);
      if (!this.follow) {
        this.follow = entity;
      }
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
      if (intent.stateChanged) {
        const animation = entity.model.animations[entity.getAnimation()];
        entity.mixer.stopAllAction();
        entity.mixer.clipAction(animation).play();
        intent.stateChanged = false;
      }
      entity.mixer.update(this.delta);
    });
  }

  private isLocked() {
    return document.pointerLockElement === this.renderer.domElement;
  }

  private onKeyDown($event: KeyboardEvent) {
    if (!this.isLocked()) {
      return;
    }
    this.entities.forEach(entity => entity.onKeyDown($event));
  }

  private onKeyUp($event: KeyboardEvent) {
    if (!this.isLocked()) {
      return;
    }
    this.entities.forEach(entity => entity.onKeyUp($event));
  }

  private onPointerMove($event: MouseEvent) {
    if (!this.isLocked()) {
      return;
    }
    this.entities.forEach(entity => entity.onPointerMove($event));

    // const pointer = new THREE.Vector2();
    // pointer.x = ( $event.clientX / window.innerWidth ) * 2 - 1;
    // pointer.y = - ( $event.clientY / window.innerHeight ) * 2 + 1;
    // this.raycaster.setFromCamera(pointer, this.camera);
    // const points = this.raycaster.intersectObject(this.floor);
    // if (points.length > 0) {
    //   const point = points[0].point;
    //   this.entities.forEach(entity => entity.onPoint(point));
    // }
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.delta = this.clock.getDelta();
    this.move();
    if (this.follow) {
      const f = this.follow.model.scene.position;
      this.controls.target.set(f.x, 1, f.z);
    }
    this.controls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }
}
