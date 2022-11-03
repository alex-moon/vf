import * as THREE from 'three';
import {AxesHelper, Camera, TextureLoader} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Handler} from "@/ts/handlers/handler";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {BoxHandler} from "@/ts/handlers/box.handler";
import {CameraHandler} from "@/ts/handlers/camera.handler";
import {SphereHandler} from "@/ts/handlers/sphere.handler";

export class View {
  protected texture: TextureLoader;
  protected draco: DRACOLoader;
  protected gltf: GLTFLoader;
  protected stats: any;
  protected axes: AxesHelper;
  protected renderer!: THREE.WebGLRenderer;
  protected pmremGenerator!: THREE.PMREMGenerator;
  protected scene: THREE.Scene;
  protected $element!: HTMLDivElement;
  protected controls!: OrbitControls;

  constructor() {
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

  public init($element: HTMLDivElement) {
    this.$element = $element;
    this.$element.appendChild(this.stats.dom);
    this.$element.appendChild(this.renderer.domElement);
    this.renderer.setSize(this.$element.offsetWidth, this.$element.offsetHeight);
    this.bindEvents();
  }

  private bindEvents() {
    this.renderer.domElement.addEventListener('click', () => {
      this.renderer.domElement.requestPointerLock();
    });
  }

  public load(handler: Handler<any>): Promise<void> {
    if (handler instanceof ModelHandler) {
      return this.loadModel(handler);
    }
    if (handler instanceof BoxHandler) {
      return this.loadBox(handler);
    }
    if (handler instanceof SphereHandler) {
      return this.loadSphere(handler);
    }
    if (handler instanceof CameraHandler) {
      return this.loadCamera(handler);
    }
    return new Promise((resolve, reject) => reject());
  }

  protected loadModel(handler: ModelHandler<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      this.gltf.load(entity.getPath(), (gltf: any) => {
        const model = gltf;
        model.scene.position.set(0, 0, 0);
        model.scene.scale.set(1, 1, 1);

        const mixer = new THREE.AnimationMixer(model.scene);
        const animation = model.animations[entity.getAnimation()];
        mixer.clipAction(animation).play();

        handler.setModel(model);
        handler.setMixer(mixer);
        this.scene.add(model.scene);
        resolve();
      }, undefined, (e: any) => {
        console.error(e);
        reject();
      });
    });
  }

  protected loadBox(handler: BoxHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
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
      handler.setObject(mesh);
      this.scene.add(mesh);
      resolve();
    });
  }

  protected loadSphere(handler: SphereHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const geometry = new THREE.SphereGeometry(entity.radius);
      const map = this.texture.load(entity.texture);
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(entity.radius, entity.radius);
      map.minFilter = THREE.NearestFilter;
      map.magFilter = THREE.NearestFilter;
      const material = new THREE.MeshBasicMaterial({map});
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, -entity.radius, 0);
      handler.setObject(mesh);
      this.scene.add(mesh);
      resolve();
    });
  }

  protected loadCamera(handler: CameraHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const camera = new THREE.PerspectiveCamera(
        40,
        this.$element.offsetWidth / this.$element.offsetHeight,
        1,
        100
      );
      camera.position.set(0, 2, -2);
      handler.setObject(camera);
      resolve();
    });
  }

  public isLocked() {
    return document.pointerLockElement === this.renderer.domElement;
  }

  public animate(camera: CameraHandler) {
    this.stats.update();
    this.renderer.render(this.scene, camera.getObject() as Camera);
    const target = camera.getTarget();
    const model = target.getModel();
    this.axes.position.copy(model.scene.position);
  }
}
