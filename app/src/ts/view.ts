import {
  AdditiveBlending,
  AnimationMixer,
  AxesHelper,
  BoxGeometry,
  Color,
  Mesh,
  MeshPhongMaterial,
  NearestFilter,
  PerspectiveCamera,
  PMREMGenerator, PointLight,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  sRGBEncoding,
  TextureLoader,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {Lensflare, LensflareElement} from "three/examples/jsm/objects/Lensflare";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Handler} from "@/ts/handlers/handler";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {BoxHandler} from "@/ts/handlers/box.handler";
import {CameraHandler} from "@/ts/handlers/camera.handler";
import {SphereHandler} from "@/ts/handlers/sphere.handler";
import {ConvexHandler} from "@/ts/handlers/convex.handler";
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";
import {ConvexHelper} from "@/ts/helpers/convex.helper";
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";

export class View {
  protected texture: TextureLoader;
  protected draco: DRACOLoader;
  protected gltf: GLTFLoader;
  protected stats: any;
  protected axes: AxesHelper;
  protected renderer!: WebGLRenderer;
  protected pmremGenerator!: PMREMGenerator;
  protected scene: Scene;
  protected $element!: HTMLDivElement;
  protected controls!: OrbitControls;

  constructor() {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = sRGBEncoding;
    this.pmremGenerator = new PMREMGenerator(this.renderer);

    this.scene = new Scene();
    this.scene.background = new Color(0x0);
    // this.scene.environment = this.pmremGenerator.fromScene(
    //   new RoomEnvironment(),
    //   0.04
    // ).texture;

    // @ts-ignore
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';

    this.axes = new AxesHelper( 5 );
    this.scene.add(this.axes);

    // sky
    this.texture = new TextureLoader();
    const skyboxTexture = this.texture.load(
      '/skybox.png',
      () => {
          const rt = new WebGLCubeRenderTarget(skyboxTexture.image.height);
          rt.fromEquirectangularTexture(this.renderer, skyboxTexture);
          this.scene.background = rt.texture;
        });
    skyboxTexture.minFilter = NearestFilter;
    skyboxTexture.magFilter = NearestFilter;

    // sun
    const sun = new PointLight(0xffffff, 1, 10000);
    sun.castShadow = true;
    sun.position.set(2000, 0, 2000);
    this.scene.add(sun);
    const lensflareTexture = this.texture.load('/lensflare.png');
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(
      lensflareTexture,
      1024,
      0.0,
      new Color(0xffffff)
    ));
    sun.add(lensflare);

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

  public getScene() {
    return this.scene;
  }

  public load(handler: Handler<any>): Promise<void> {
    if (handler instanceof ModelHandler) {
      return this.loadModel(handler);
    }
    if (handler instanceof AsteroidHandler) {
      return this.loadAsteroid(handler);
    }
    if (handler instanceof CameraHandler) {
      return this.loadCamera(handler);
    }

    if (handler instanceof BoxHandler) {
      return this.loadBox(handler);
    }
    if (handler instanceof SphereHandler) {
      return this.loadSphere(handler);
    }
    if (handler instanceof ConvexHandler) {
      return this.loadConvex(handler);
    }
    return new Promise((resolve, reject) => reject());
  }

  protected loadModel(handler: ModelHandler<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      this.gltf.load(entity.getPath(), (gltf: any) => {
        const model = gltf;
        model.scene.scale.set(1, 1, 1);

        const mixer = new AnimationMixer(model.scene);
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
      const geometry = new BoxGeometry(entity.width, entity.height, entity.depth);
      const map = this.texture.load(entity.texture);
      map.wrapS = RepeatWrapping;
      map.wrapT = RepeatWrapping;
      const dimension = Math.max(entity.width, entity.height, entity.depth);
      map.repeat.set(dimension, dimension);
      map.minFilter = NearestFilter;
      map.magFilter = NearestFilter;
      const material = new MeshPhongMaterial({map});
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = mesh.receiveShadow = true;
      handler.setObject(mesh);
      this.scene.add(mesh);
      resolve();
    });
  }

  protected loadSphere(handler: SphereHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const geometry = new SphereGeometry(entity.radius, 50, 50);
      const map = this.texture.load(entity.texture);
      map.wrapS = RepeatWrapping;
      map.wrapT = RepeatWrapping;
      map.repeat.set(entity.radius, entity.radius);
      map.minFilter = NearestFilter;
      map.magFilter = NearestFilter;
      const material = new MeshPhongMaterial({map});
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.position.set(0, -entity.radius, 0);
      handler.setObject(mesh);
      this.scene.add(mesh);
      resolve();
    });
  }

  protected loadConvex(handler: ConvexHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const geometry = new ConvexGeometry(entity.vertices.map((x: [number, number, number]) => {
        return new Vector3(x[0], x[1], x[2]);
      }));
      ConvexHelper.assignUVs(geometry);
      const map = this.texture.load(entity.texture);
      map.wrapS = RepeatWrapping;
      map.wrapT = RepeatWrapping;
      map.repeat.set(5, 5);
      map.minFilter = NearestFilter;
      map.magFilter = NearestFilter;
      const material = new MeshPhongMaterial({map});
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.position.set(0, -5, 0);
      handler.setObject(mesh);
      this.scene.add(mesh);
      resolve();
    });
  }

  protected loadAsteroid(handler: AsteroidHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const geometry = new ConvexGeometry(entity.vertices.map((x: [number, number, number]) => {
        return new Vector3(x[0], x[1], x[2]);
      }));
      ConvexHelper.assignUVs(geometry);
      const map = this.texture.load(entity.texture);
      map.wrapS = RepeatWrapping;
      map.wrapT = RepeatWrapping;
      map.repeat.set(entity.radius, entity.radius);
      map.minFilter = NearestFilter;
      map.magFilter = NearestFilter;
      const material = new MeshPhongMaterial({map});
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.position.set(0, -entity.radius, 0);
      handler.setObject(mesh);
      this.scene.add(mesh);
      resolve();
    });
  }

  protected loadCamera(handler: CameraHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const camera = new PerspectiveCamera(
        40,
        this.$element.offsetWidth / this.$element.offsetHeight,
        1,
        10000
      );
      camera.position.set(0, 2, -2);
      handler.setObject(camera);
      resolve();
    });
  }

  public isLocked() {
    return document.pointerLockElement === this.renderer.domElement;
  }

  private debug = false;
  public animate(camera: CameraHandler) {
    // if (!this.controls) {
    //   this.controls = new OrbitControls(camera.getObject(), this.renderer.domElement);
    // }
    // this.controls.update();
    this.stats.update();
    const cam = camera.getObject();
    const target = camera.getTarget();
    const object = target.getObject();
    this.axes.position.set(object.position.x, object.position.y, object.position.z);

    // debugging
    if (this.debug) {
      cam.position.set(20, 0, 20);
      cam.lookAt(this.axes.position);
    }

    this.renderer.render(this.scene, cam);
  }
}
