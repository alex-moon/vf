import {JackEntity} from "@/ts/entities/jack.entity";
import {JackHandler} from "@/ts/handlers/jack.handler";
import {View} from "@/ts/view";
import {Handler} from "@/ts/handlers/handler";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CameraHandler} from "@/ts/handlers/camera.handler";
import {CameraEntity} from "@/ts/entities/camera.entity";
import {PointEvent} from "@/ts/events/point.event";
import {Clock, Object3D, PerspectiveCamera, Raycaster, Vector3} from "three";
import {Physics} from "@/ts/physics";
import {KeysHelper} from "@/ts/helpers/keys.helper";
import {JackController} from "@/ts/controllers/jack.controller";
import {CameraController} from "@/ts/controllers/camera.controller";
import CannonDebugger from 'cannon-es-debugger';
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";
import {AsteroidEntity} from "@/ts/entities/asteroid.entity";
import {AsteroidController} from "@/ts/controllers/asteroid.controller";
import {ShipHandler} from "@/ts/handlers/ship.handler";
import {ShipController} from "@/ts/controllers/ship.controller";
import {ShipEntity} from "@/ts/entities/ship.entity";
import {MouseHelper} from "@/ts/helpers/mouse.helper";
import {BeltCube, BeltHelper} from "@/ts/helpers/belt.helper";
import {Debug} from "@/ts/helpers/debug";
import {SunHandler} from "@/ts/handlers/sun.handler";
import {SunController} from "@/ts/controllers/sun.controller";
import {SunEntity} from "@/ts/entities/sun.entity";
import {HudUi} from "@/ts/ui/hud.ui";
import {InventoryUi} from "@/ts/ui/inventory.ui";
import {Vec3} from "cannon-es";
import {Ui} from "@/ts/ui/ui";
import {ReticleUi} from "@/ts/ui/reticle.ui";
import {ContactsHelper} from "@/ts/helpers/contacts.helper";
import {ContactsChangedEvent} from "@/ts/events/contacts-changed.event";
import {OreHandler} from "@/ts/handlers/ore.handler";
import {Store} from "@/ts/store";
import {MessagePriority} from "@/ts/stores/message.store";

export class World {
  static UPDATE_NEAREST_PERIOD = 1 / 2;

  protected $element!: HTMLDivElement;

  protected view: View;
  protected physics: Physics;
  protected store: Store;
  protected clock: Clock;
  protected handlers: Handler<any>[] = [];

  protected asteroids: {[key: string]: AsteroidHandler} = {};
  protected oresLoaded ?: string;
  protected nearest: AsteroidHandler|null = null;
  protected nearestUpdated?: number;

  protected sun!: SunHandler;
  protected jack!: JackHandler;
  protected ship!: ShipHandler;
  protected camera!: CameraHandler;

  protected ready = false;
  protected selected: Handler<any>|null = null;

  protected debugger ?: {update: () => void;};
  protected raycaster = new Raycaster();

  protected uis: Ui[] = [];
  protected afterResetOriginCallbacks: (() => void)[] = [];

  constructor(view: View, physics: Physics, store: Store) {
    this.clock = new Clock;
    this.view = view;
    this.physics = physics;
    this.store = store;
  }

  public getView() {
    return this.view;
  }

  public getPhysics() {
    return this.physics;
  }

  public init($element: HTMLDivElement) {
    this.$element = $element;
    this.physics.init();
    this.view.init($element);
    Promise.all([
      this.loadSun(),
      this.loadJack(),
      this.loadShip(),
      this.loadCamera(),
    ]).then(() => {
      if (Debug.CANNON_DEBUGGER) {
        // @ts-ignore
        this.debugger = new CannonDebugger(
          this.view.getScene(),
          this.physics.getWorld(),
          {}
        );
      }
      this.bindEvents();
      this.animate();
      this.start();
      this.initUi($element);
    });
  }

  public resize() {
    if (this.camera) {
      const camera = this.camera.getObject();
      if (camera instanceof PerspectiveCamera) {
        camera.aspect = this.$element.offsetWidth / this.$element.offsetHeight;
        camera.updateProjectionMatrix();
      }
    }
    this.view.resize();
    this.uis.forEach(ui => ui.resize(this.$element.offsetWidth, this.$element.offsetHeight));
  }

  public isReady() {
    return this.ready;
  }

  public getJack() {
    return this.jack;
  }

  public getShip() {
    return this.ship;
  }

  public getAsteroid() {
    if (this.ship.getAsteroid()) {
      return this.ship.getAsteroid();
    }
    if (this.selected instanceof AsteroidHandler) {
      return this.selected;
    }
    return this.nearest;
  }

  protected loadCamera() {
    this.camera = new CameraHandler(new CameraController(new CameraEntity()));
    this.camera.setTarget(this.jack);
    this.handlers.push(this.camera);
    return Promise.all([
      this.physics.load(this.camera),
      this.view.load(this.camera),
    ]);
  }

  protected loadSun() {
    this.sun = new SunHandler(new SunController(new SunEntity(7e4)));
    this.handlers.push(this.sun);
    return Promise.all([
      this.physics.load(this.sun),
      this.view.load(this.sun),
    ]);
  }

  protected loadJack() {
    this.jack = new JackHandler(new JackController(new JackEntity()));
    this.handlers.push(this.jack);
    return Promise.all([
      this.physics.load(this.jack),
      this.view.load(this.jack),
    ]);
  }

  protected loadShip() {
    this.ship = new ShipHandler(new ShipController(new ShipEntity()));
    this.handlers.push(this.ship);
    return Promise.all([
      this.physics.load(this.ship),
      this.view.load(this.ship),
    ]);
  }

  private bindEvents() {
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("mousemove", this.onPointerMove.bind(this), false);
    document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    this.ship.getBody().addEventListener('collide', this.collide.bind(this));
  }

  private onKeyDown($event: KeyboardEvent) {
    if (!this.view.isLocked()) {
      return;
    }
    if (KeysHelper.onKeyDown($event.key)) {
      this.onKeysChanged(new KeysChangedEvent(KeysHelper.keys));
    }
  }

  private onKeyUp($event: KeyboardEvent) {
    if (!this.view.isLocked()) {
      return;
    }
    if (KeysHelper.onKeyUp($event.key)) {
      this.onKeysChanged(new KeysChangedEvent(KeysHelper.keys));
    }
  }

  private onPointerMove($event: MouseEvent) {
    if (!this.view.isLocked()) {
      return;
    }
    this.handlers.forEach(handler => handler.onPointerMove($event));
  }

  private onMouseDown($event: MouseEvent) {
    if (!this.view.isLocked()) {
      return;
    }
    if (this.selected && $event.button === MouseHelper.RIGHT) {
      this.use();
    }
  }

  private onKeysChanged($event: KeysChangedEvent) {
    this.handlers.forEach(handler => handler.onKeysChanged($event));
  }

  private onPoint($event: PointEvent) {
    this.handlers.forEach(handler => handler.onPoint($event));
  }

  private collide($event: any) {
    const contact = ContactsHelper.forCollision($event.contact, this.handlers);
    if (contact) {
      if (this.ship === contact.i || this.ship === contact.j) {
        if (contact.i instanceof AsteroidHandler || contact.j instanceof AsteroidHandler) {
          if (this.ship.isLanding()) {
            this.afterResetOrigin(() => {
              this.ship.land();
              this.ship.openDoor().then(() => {
                this.jack.exitVehicle();
                this.camera.setTarget(this.jack);
              });
            });
          }
        }
      }
    }
  }

  private update(delta: number) {
    this.handlers.forEach((handler) => {
      handler.move(delta, this);
    });
  }

  // @todo replace with physics.world.raycastClosest
  // @see https://github.com/alex-moon/vf/issues/25
  public intersects(
    handler: Handler<any>,
    origin: Vector3,
    vector: Vector3,
    buffer: number = 0,
    exclude: Handler<any>[] = []
  ): Vector3|null {
    const objects = this.handlers
      .filter(candidate => candidate != handler && !exclude.includes(candidate))
      .map(candidate => candidate.getObject());
    const length = vector.length();
    this.raycaster.set(origin, vector);
    const intersections = this.raycaster.intersectObjects(objects);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const distance = intersection.distance;
      if (distance - buffer < length) {
        const multiple = (distance - buffer) / length;
        const resultant = vector.clone();
        resultant.multiplyScalar(multiple);
        const target = origin.clone();
        return target.add(resultant);
      }
    }
    return null;
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    const delta = this.clock.getDelta();
    this.resetOrigin();
    this.runAfterResetOriginCallbacks();
    this.update(delta);
    this.view.animate(delta, this.camera);
    this.physics.animate(delta);
    this.debugger?.update();
    this.updateSelected();
    this.loadAsteroids();
    this.detectContacts();
    this.uis.forEach((ui) => {
      ui.draw(this);
    });
  }

  private detectContacts() {
    const {on, off} = ContactsHelper.parse(this.physics.getWorld().contacts, this.handlers);
    if (on.length || off.length) {
      const event = new ContactsChangedEvent(on, off);
      this.handlers.forEach((handler) => {
        handler.onContactsChanged(event);
      });
    }
  }

  private afterResetOrigin(callback: () => void) {
    this.afterResetOriginCallbacks.push(callback);
  }

  private runAfterResetOriginCallbacks() {
    this.afterResetOriginCallbacks.forEach(callback => callback());
    this.afterResetOriginCallbacks = [];
  }

  private resetOrigin() {
    const origin = this.ship.getBody().position;
    this.handlers.forEach((handler) => {
      if (handler !== this.ship) {
        const p = handler.getBody().position;
        p.addScaledVector(-1, origin, p);
      }
    });
    origin.set(0, 0, 0);

    const now = this.clock.getElapsedTime();
    if (!this.nearestUpdated || (now - this.nearestUpdated) > World.UPDATE_NEAREST_PERIOD) {
      this.nearestUpdated = now;
      this.nearest = null;
      let distance = Infinity;
      Object.values(this.asteroids).forEach((asteroid) => {
        const diff = new Vec3();
        asteroid.getBody().position.vsub(this.ship.getBody().position, diff);
        if (diff.length() < distance) {
          distance = diff.length();
          this.nearest = asteroid;
        }
      });
    }
  }

  private updateSelected() {
    this.raycaster.setFromCamera({x: 0, y: 0}, this.camera.getObject());
    const objects = this.handlers.map(candidate => candidate.getObject());
    const intersections = this.raycaster.intersectObjects(objects);
    for (const intersection of intersections) {
      const handler = this.handlerForObject(intersection.object);
      if (handler && this.isSelectable(handler)) {
        this.selected = handler;
        this.updateMessageForSelected();
        this.view.setSelected(handler.getObject());
        return;
      }
    }
    this.selected = null;
    this.view.clearSelected();
  }

  private updateMessageForSelected() {
    if (this.selected) {
      this.store.message.push(this.selected.getDescription(), MessagePriority.HIGH, 0);
    }
  }

  private handlerForObject(object: Object3D) {
    for (const handler of this.handlers) {
      if (handler.hasObject(object)) {
        return handler;
      }
    }
    return null;
  }

  private isSelectable(handler: Handler<any>) {
    if (handler === this.ship) {
      return this.ship.isLanded();
    }
    if (handler instanceof AsteroidHandler) {
      return this.ship.isFlying();
    }
    if (handler instanceof OreHandler) {
      if (handler.isMined()) {
        return false;
      }
      return this.jack.isOnFoot();
    }
    return false;
  }

  private use() {
    if (!this.selected) {
      return;
    }

    if (this.selected === this.ship) {
      if (this.ship.isLanded() && this.jack.isOnFoot()) {
        this.jack.enterVehicle(this.ship);
        this.ship.closeDoor().then(() => {
          this.ship.startLaunching();
          this.camera.setTarget(this.ship);
        });
      }
    }
    if (this.selected instanceof AsteroidHandler) {
      if (this.ship.isFlying()) {
        this.ship.startLanding(this.selected);
        this.camera.cut();
      }
    }
    if (this.selected instanceof OreHandler) {
      this.selected.mine();
      const type = this.selected.getEntity().type;
      this.store.ore.add(type);
      this.store.message.push('Mined ' + type);
      this.physics.unload(this.selected);
      this.view.unload(this.selected);
    }
  }

  private initUi($element: HTMLDivElement) {
    this.uis.push(new HudUi($element, this.store.message));
    this.uis.push(new InventoryUi($element, this.store.ore));
    this.uis.push(new ReticleUi($element));
  }

  private start() {
    this.jack.enterVehicle(this.ship);
    this.ship.startFlying();
    this.camera.setTarget(this.ship);
  }

  protected loadAsteroids() {
    const position = this.ship.getBody().position.clone();
    this.subOrigin(position);
    const cubes = BeltHelper.getNearest(position);
    const currentHash = '' + BeltHelper.getCube(position).hash();

    // first load what we don't have
    const keep = [];
    for (const cube of cubes) {
      const hash = '' + cube.hash();
      keep.push(hash);
      if (!Object.keys(this.asteroids).includes(hash)) {
        this.loadAsteroid(cube);
      }
      if (hash !== currentHash) {
        this.unloadOres(this.asteroids[hash]);
      } else {
        if (this.oresLoaded !== currentHash) {
          this.loadOres(this.asteroids[currentHash]);
          this.oresLoaded = currentHash;
        }
      }
    }

    // now unload what we don't need any more
    for (const key of Object.keys(this.asteroids)) {
      if (!keep.includes(key)) {
        this.unloadAsteroid(this.asteroids[key]);
        this.unloadOres(this.asteroids[key]);
        delete this.asteroids[key];
      }
    }
  }

  protected unloadAsteroid(handler: AsteroidHandler) {
    this.handlers.splice(this.handlers.indexOf(handler), 1);
    this.physics.unload(handler);
    this.view.unload(handler);
  }

  protected unloadOres(handler: AsteroidHandler) {
    for (const ore of handler.getEntity().ores) {
      this.handlers.splice(this.handlers.indexOf(ore), 1);
      this.physics.unload(ore);
      this.view.unload(ore);
    }
  }

  protected loadOres(handler: AsteroidHandler) {
    for (const ore of handler.getEntity().ores) {
      if (ore.isMined()) {
        continue;
      }
      this.handlers.push(ore);
      Promise.all([
        this.physics.load(ore),
        this.view.load(ore),
      ]).then(() => {
      });
    }
  }

  protected loadAsteroid(cube: BeltCube) {
    const asteroid = new AsteroidHandler(new AsteroidController(new AsteroidEntity(
      cube.asteroidRadius(),
      cube.hash()
    )));
    asteroid.setCube(cube);
    this.asteroids['' + cube.hash()] = asteroid;
    this.handlers.push(asteroid);
    Promise.all([
      this.physics.load(asteroid),
      this.view.load(asteroid),
    ]).then(() => {
      const position = cube.asteroidPosition();
      this.addOrigin(position);
      asteroid.getBody().position.copy(position);
    });
  }

  protected addOrigin(position: Vec3) {
    position.addScaledVector(1, this.sun.getBody().position, position);
  }

  protected subOrigin(position: Vec3) {
    position.addScaledVector(-1, this.sun.getBody().position, position);
  }
}
