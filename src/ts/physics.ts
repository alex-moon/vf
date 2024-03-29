import {Handler} from "@/ts/handlers/handler";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {BoxHandler} from "@/ts/handlers/box.handler";
import {CameraHandler} from "@/ts/handlers/camera.handler";
import {SphereHandler} from "@/ts/handlers/sphere.handler";
import {Body, Box, ConvexPolyhedron, NaiveBroadphase, Sphere, Vec3, World} from "cannon-es";
import {ConvexHandler} from "@/ts/handlers/convex.handler";
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";
import {AsteroidEntity} from "@/ts/entities/asteroid.entity";
import {MathHelper} from "@/ts/helpers/math.helper";
import {BeltHelper} from "@/ts/helpers/belt.helper";
import {Debug} from "@/ts/helpers/debug";
import {SunHandler} from "@/ts/handlers/sun.handler";
import {PillHelper} from "@/ts/helpers/pill.helper";
import {OreEntity} from "@/ts/entities/ore.entity";
import {OreHandler} from "@/ts/handlers/ore.handler";

export class Physics {
  protected startingPosition!: Vec3;
  protected world: World;

  constructor() {
    this.world = new World({
      broadphase: new NaiveBroadphase(),
      // gravity: new Vec3(0, -500, 0),
      // frictionGravity: new Vec3(0, -5, 0),
    });
    this.world.defaultContactMaterial.friction = Infinity;
    this.world.defaultContactMaterial.restitution = 0;
    this.world.defaultContactMaterial.contactEquationStiffness = 1;
    this.world.defaultContactMaterial.contactEquationRelaxation = 1e8;
    this.world.defaultContactMaterial.frictionEquationStiffness = 1e8;
    this.world.defaultContactMaterial.frictionEquationRelaxation = 0;
  }

  public init() {
    this.startingPosition = new Vec3(
      MathHelper.random(BeltHelper.INNER_RADIUS, BeltHelper.OUTER_RADIUS),
      0,
      MathHelper.random(BeltHelper.INNER_RADIUS, BeltHelper.OUTER_RADIUS),
    );
    Debug.FIXED_CAMERA_POSITION = this.startingPosition.toArray();
  }

  public getWorld() {
    return this.world;
  }

  public unload(handler: Handler<any>) {
    this.world.removeBody(handler.getBody());
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
      const entity = handler.getEntity();
      const body = new Body({
        shape: new Sphere(entity.radius),
      });
      body.position.set(0, 0, 0);
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadModel(handler: ModelHandler<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const {vertices, faces} = PillHelper.get(
        entity.box.height,
        entity.box.width,
        entity.box.depth
      );
      const body = new Body({
        shape: new ConvexPolyhedron({
          vertices: vertices.map((x: [number, number, number]) => {
            return new Vec3(x[0], x[1], x[2]);
          }),
          faces: faces,
        }),
        mass: Math.PI * entity.box.width * entity.box.height * entity.box.depth,
      });
      body.linearDamping = 0;
      body.angularDamping = 0.75;
      body.position.set(
        this.startingPosition.x + MathHelper.random(-20, 20),
        this.startingPosition.y + MathHelper.random(-20, 20),
        this.startingPosition.z + MathHelper.random(-20, 20),
      );
      body.fixedRotation = true;
      body.updateMassProperties();
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadBox(handler: BoxHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const body = new Body({
        shape: new Box(new Vec3(
          entity.width / 2,
          entity.height / 2,
          entity.depth / 2
        )),
      });
      body.position.set(0, -entity.height, 0);
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadSphere(handler: SphereHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const body = new Body({
        shape: new Sphere(entity.radius),
      });
      body.position.set(0, -entity.radius, 0);
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadConvex(handler: ConvexHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const body = new Body({
        shape: new ConvexPolyhedron({
          vertices: entity.vertices.map((x: [number, number, number]) => {
            return new Vec3(x[0], x[1], x[2]);
          }),
          faces: entity.faces,
        }),
        mass: 1e8,
      });
      body.position.set(0, -10, 0);
      body.angularVelocity.set(0, 1e-3, 0);
      // body.quaternion.set(-1, 0, 0, 1).normalize();
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadAsteroid(handler: AsteroidHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity() as AsteroidEntity;
      const body = new Body({
        mass: 1e5 * Math.PI * entity.radius * entity.radius * entity.radius,
      });

      // @todo normals error seems bogus to me - hide errors/warnings for now
      const wincon = (window as any).console;
      (window as any).console = {error: () => {}, warn: () => {}, log: () => {}};
      for (const hull of entity.hulls) {
        const convex = new ConvexPolyhedron({
          vertices: hull.vertices.map((x: [number, number, number]) => {
            return new Vec3(x[0], x[1], x[2]);
          }),
          faces: hull.faces,
        });
        body.addShape(convex);
      }
      (window as any).console = wincon;

      // body.quaternion.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 2);
      // body.angularVelocity.set(0, 1e-2, 0);
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadOre(handler: OreHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity() as OreEntity;
      const body = new Body({
        type: Body.STATIC,
        collisionFilterMask: 256, // i.e. disable contacts
      });

      // @todo normals error seems bogus to me - hide errors/warnings for now
      const wincon = (window as any).console;
      (window as any).console = {error: () => {}, warn: () => {}, log: () => {}};
      const convex = new ConvexPolyhedron({
        vertices: entity.vertices.map((x: [number, number, number]) => {
          return new Vec3(x[0], x[1], x[2]);
        }),
        faces: entity.faces,
      });
      body.addShape(convex);
      (window as any).console = wincon;

      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadCamera(handler: CameraHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const body = new Body({
        shape: new Box(new Vec3(0.1, 0.1, 0.1)),
      });
      body.position.copy(this.startingPosition);
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  public animate(delta: number) {
    this.world.step(delta);
  }
}
