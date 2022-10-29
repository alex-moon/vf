import * as THREE from 'three';
import {AxesHelper, TextureLoader} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {World} from "@/ts/world";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Controller} from "@/ts/controllers/controller";
import {ModelController} from "@/ts/controllers/model.controller";
import {BoxController} from "@/ts/controllers/box.controller";
import {KeysHelper} from "@/ts/helpers/keys.helper";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CameraController} from "@/ts/controllers/camera.controller";

export class View {
  protected world!: World;
  protected texture: TextureLoader;
  protected draco: DRACOLoader;
  protected gltf: GLTFLoader;
  protected clock: THREE.Clock;
  protected stats: any;
  protected axes: AxesHelper;
  protected renderer!: THREE.WebGLRenderer;
  protected pmremGenerator!: THREE.PMREMGenerator;
  protected scene: THREE.Scene;
  protected $element!: HTMLDivElement;
  protected controls!: OrbitControls;

  constructor() {
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // @ts-ignore
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';

    this.axes = new THREE.AxesHelper( 5 );
    this.scene.add(this.axes);

    // sky
    this.texture = new TextureLoader();
    const texture = this.texture.load(
      '/skybox.png',
      () => {
          const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
          rt.fromEquirectangularTexture(this.renderer, texture);
          this.scene.background = rt.texture;
        });
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    this.draco = new DRACOLoader();
    this.draco.setDecoderPath('js/libs/draco/gltf/');
    this.gltf = new GLTFLoader();
    this.gltf.setDRACOLoader(this.draco);
  }

  public setWorld(world: World) {
    this.world = world;
  }

  public init($element: HTMLDivElement) {
    this.$element = $element;
    this.$element.appendChild(this.stats.dom);
    this.$element.appendChild(this.renderer.domElement);
    this.renderer.setSize(this.$element.offsetWidth, this.$element.offsetHeight);

    this.world.init();

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

  public load(controller: Controller<any>): Promise<void> {
    if (controller instanceof ModelController) {
      return this.loadModel(controller);
    }
    if (controller instanceof BoxController) {
      return this.loadBox(controller);
    }
    if (controller instanceof CameraController) {
      return this.loadCamera(controller);
    }
    return new Promise((resolve, reject) => reject());
  }

  protected loadModel(controller: ModelController<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = controller.getEntity();
      this.gltf.load(entity.getPath(), (gltf: any) => {
        const model = gltf;
        model.scene.position.set(0, 0, 0);
        model.scene.scale.set(1, 1, 1);

        const mixer = new THREE.AnimationMixer(model.scene);
        const animation = model.animations[entity.getAnimation()];
        mixer.clipAction(animation).play();

        controller.setModel(model);
        controller.setMixer(mixer);
        this.scene.add(model.scene);
        resolve();
      }, undefined, (e: any) => {
        console.error(e);
        reject();
      });
    });
  }

  protected loadBox(controller: BoxController): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = controller.getEntity();
      const geometry = new THREE.BoxGeometry(entity.width, entity.height, entity.depth);
      const map = this.texture.load(entity.texture);
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      const dimension = Math.max(entity.width, entity.height, entity.depth);
      map.repeat.set(dimension, dimension);
      map.minFilter = THREE.NearestFilter;
      map.magFilter = THREE.NearestFilter;
      const material = new THREE.MeshBasicMaterial({map});
      const mesh = new THREE.Mesh(geometry, material);
      controller.setMesh(mesh);
      this.scene.add(mesh);
      resolve();
    });
  }

  protected loadCamera(controller: CameraController): Promise<void> {
    return new Promise((resolve, reject) => {
      const camera = new THREE.PerspectiveCamera(
        40,
        this.$element.offsetWidth / this.$element.offsetHeight,
        1,
        100
      );
      camera.position.set(0, 2, -2);
      controller.setCamera(camera);
      resolve();
    });
  }

  private isLocked() {
    return document.pointerLockElement === this.renderer.domElement;
  }

  private onKeyDown($event: KeyboardEvent) {
    if (!this.isLocked()) {
      return;
    }
    if (KeysHelper.onKeyDown($event.key)) {
      this.world.onKeysChanged(new KeysChangedEvent(KeysHelper.keys));
    }
  }

  private onKeyUp($event: KeyboardEvent) {
    if (!this.isLocked()) {
      return;
    }
    if (KeysHelper.onKeyUp($event.key)) {
      this.world.onKeysChanged(new KeysChangedEvent(KeysHelper.keys));
    }
  }

  private onPointerMove($event: MouseEvent) {
    if (!this.isLocked()) {
      return;
    }
    this.world.onPointerMove($event);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.stats.update();

    if (!this.world.isReady()) {
      return;
    }

    this.world.move(this.clock.getDelta());
    const camera = this.world.getCamera();
    this.renderer.render(this.scene, camera.getCamera());
    const target = camera.getTarget();
    const model = target.getModel();
    this.axes.position.copy(model.scene.position);
  }
}
