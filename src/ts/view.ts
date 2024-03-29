import {
  AnimationMixer,
  AxesHelper,
  BoxGeometry,
  Camera,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Scene,
  SphereGeometry,
  sRGBEncoding,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {Lensflare, LensflareElement} from "three/examples/jsm/objects/Lensflare";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
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
import {AsteroidEntity} from "@/ts/entities/asteroid.entity";
import {AsteroidHelper} from "@/ts/helpers/asteroid.helper";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {BeltHelper} from "@/ts/helpers/belt.helper";
import {Debug} from "@/ts/helpers/debug";
import {SunHandler} from "@/ts/handlers/sun.handler";
import {ModelEntity} from "@/ts/entities/model.entity";
import {TextureHelper} from "@/ts/helpers/texture.helper";
import {OreHandler} from "@/ts/handlers/ore.handler";
import {OreHelper} from "@/ts/helpers/ore.helper";

export class View {
  protected texture: TextureLoader;
  protected draco: DRACOLoader;
  protected gltf: GLTFLoader;
  protected stats?: any;
  protected axes?: AxesHelper;
  protected renderer!: WebGLRenderer;
  protected pmremGenerator!: PMREMGenerator;
  protected scene: Scene;
  protected $element!: HTMLDivElement;
  protected controls!: OrbitControls;
  protected composer!: EffectComposer;
  protected outlinePass!: OutlinePass;
  protected bloomPass!: UnrealBloomPass;

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

    if (Debug.STATS) {
      // @ts-ignore
      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute';
    }

    if (Debug.AXES_HELPER) {
      this.axes = new AxesHelper(5);
      this.scene.add(this.axes);
    }

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

    this.draco = new DRACOLoader();
    this.draco.setDecoderPath('js/libs/draco/gltf/');
    this.gltf = new GLTFLoader();
    this.gltf.setDRACOLoader(this.draco);
  }

  public init($element: HTMLDivElement) {
    this.$element = $element;
    if (this.stats) {
      this.$element.appendChild(this.stats.dom);
    }
    this.$element.appendChild(this.renderer.domElement);
    this.renderer.setSize(this.$element.offsetWidth, this.$element.offsetHeight);
    this.bindEvents();
  }

  public resize() {
    this.renderer.setSize(this.$element.offsetWidth, this.$element.offsetHeight);
  }

  private bindEvents() {
    this.renderer.domElement.addEventListener('click', () => {
      this.renderer.domElement.requestPointerLock();
    });
  }

  public getScene() {
    return this.scene;
  }

  public unload(handler: Handler<any>) {
    this.scene.remove(handler.getObject());
  }

  public load(handler: Handler<any>): Promise<void> {
    if (handler instanceof SunHandler) {
      return this.loadSun(handler);
    }
    if (handler instanceof ModelHandler) {
      return this.loadModel(handler);
    }
    if (handler instanceof AsteroidHandler) {
      return this.loadAsteroid(handler);
    }
    if (handler instanceof OreHandler) {
      return this.loadOre(handler);
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

  protected loadSun(handler: SunHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      // sun
      const sungeom = new SphereGeometry(handler.getEntity().radius);
      const sunmat = new MeshBasicMaterial({
        color: 0xffffff
      });
      const sun = new Mesh(sungeom, sunmat);
      sun.position.set(0, 0, 0);
      this.scene.add(sun);
      handler.setObject(sun);

      // light
      const sunlight = new PointLight(
        0xffffff,
        2,
        BeltHelper.OUTER_RADIUS,
        0
      );
      sunlight.castShadow = true;
      sunlight.position.set(0, 0, 0);
      sun.add(sunlight);

      // lens flare
      const lensflareTexture = this.texture.load('/lensflare.png');
      const lensflare = new Lensflare();
      lensflare.addElement(new LensflareElement(
        lensflareTexture,
        512,
        0.0,
        new Color(0xffffff)
      ));
      sunlight.add(lensflare);
      resolve();
    });
  }

  protected loadModel(handler: ModelHandler<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity() as ModelEntity;
      this.gltf.load(entity.getPath(), (gltf: any) => {
        const model = gltf;
        model.scene.scale.set(1, 1, 1);

        const mixer = new AnimationMixer(model.scene);
        // const animation = model.animations[entity.getAnimation()];
        // mixer.clipAction(animation).play();

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
      const dimension = Math.max(entity.width, entity.height, entity.depth);
      const map = TextureHelper.map(this.texture, entity.texture, dimension);
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
      const map = TextureHelper.map(this.texture, entity.texture, entity.radius);
      const material = new MeshPhongMaterial({map});
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = mesh.receiveShadow = true;
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
      const map = TextureHelper.map(this.texture, entity.texture, 5);
      const material = new MeshPhongMaterial({map});
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = mesh.receiveShadow = true;
      handler.setObject(mesh);
      this.scene.add(mesh);
      resolve();
    });
  }

  protected loadAsteroid(handler: AsteroidHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity() as AsteroidEntity;

      const map = TextureHelper.map(
        this.texture,
        entity.texture,
        AsteroidHelper.RESOLUTION
      );
      const material = new MeshPhongMaterial({map});

      const group = new Group();
      for (const hull of entity.hulls) {
        const geometry = new ConvexGeometry(hull.vertices.map((x: [number, number, number]) => {
          return new Vector3(x[0], x[1], x[2]);
        }));
        ConvexHelper.assignUVs(geometry);
        group.add(new Mesh(geometry, material));
      }

      // @todo not working?
      group.castShadow = group.receiveShadow = true;
      handler.setObject(group);
      this.scene.add(group);
      resolve();
    });
  }

  protected loadOre(handler: OreHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const geometry = new ConvexGeometry(entity.vertices.map((x: [number, number, number]) => {
        return new Vector3(x[0], x[1], x[2]);
      }));
      ConvexHelper.assignUVs(geometry);
      const map = TextureHelper.map(
        this.texture,
        entity.texture,
        OreHelper.RADIUS
      );
      const material = new MeshPhongMaterial({map});
      const object = new Mesh(geometry, material);
      handler.setObject(object);
      this.scene.add(object);
      resolve();
    });
  }

  protected loadCamera(handler: CameraHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const camera = new PerspectiveCamera(
        40,
        this.$element.offsetWidth / this.$element.offsetHeight,
        1,
        BeltHelper.OUTER_RADIUS, // BeltCube.EDGE * 3.46 // 2√3 - i.e. major diagonal of cube x2
      );
      handler.setObject(camera);
      resolve();
    });
  }

  public isLocked() {
    return document.pointerLockElement === this.renderer.domElement;
  }

  public setSelected(object: Object3D) {
    // @todo shouldn't need this check
    if (!this.outlinePass) {
      return;
    }
    this.outlinePass.selectedObjects = [object];
  }

  public clearSelected() {
    // @todo shouldn't need this check
    if (!this.outlinePass) {
      return;
    }
    this.outlinePass.selectedObjects = [];
  }

  public animate(delta: number, camera: CameraHandler) {
    // if (!this.controls) {
    //   this.controls = new OrbitControls(camera.getObject(), this.renderer.domElement);
    // }
    // this.controls.update();

    if (!this.composer) {
      this.initComposer(camera.getObject());
    }

    this.stats?.update();
    const cam = camera.getObject();
    const target = camera.getTarget();
    const object = target.getObject();

    if (this.axes) {
      this.axes.position.set(object.position.x, object.position.y, object.position.z);
    }

    // debugging
    if (Debug.FIXED_CAMERA) {
      // cam.position.set(1.5e5, 1.5e5, 1.5e5);
      // cam.lookAt(sun.position);
      cam.position.fromArray(Debug.FIXED_CAMERA_POSITION);
      cam.lookAt(object.position);
    }

    // this.renderer.render(this.scene, cam);
    this.composer.render();
  }

  private initComposer(camera: Camera) {
    const viewport = new Vector2(this.$element.offsetWidth, this.$element.offsetHeight);

    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, camera);
    this.composer.addPass(renderPass);

    // this.bloomPass = new UnrealBloomPass(viewport, 0.5, 0.5, 0.5);
    // this.composer.addPass(this.bloomPass);

    this.outlinePass = new OutlinePass(viewport, this.scene, camera);
    this.outlinePass.visibleEdgeColor.set('#ffffff');
    // this.outlinePass.hiddenEdgeColor.set('#190a05');
    this.outlinePass.hiddenEdgeColor.set('#ffffff');
    this.outlinePass.edgeStrength = 3;
    this.outlinePass.edgeGlow = 1;
    this.outlinePass.edgeThickness = 1;

    this.composer.addPass(this.outlinePass);
  }
}
