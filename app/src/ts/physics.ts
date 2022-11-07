import {Handler} from "@/ts/handlers/handler";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {BoxHandler} from "@/ts/handlers/box.handler";
import {CameraHandler} from "@/ts/handlers/camera.handler";
import {SphereHandler} from "@/ts/handlers/sphere.handler";
import {
  World,
  ContactMaterial,
  Material,
  Body,
  Box,
  Vec3,
  Sphere,
  ConvexPolyhedron
} from "cannon-es";
import {ConvexHandler} from "@/ts/handlers/convex.handler";

export class Physics {
  protected world: World;
  protected materials: Material[] = [];

  constructor() {
    this.world = new World({
      // gravity: new Vec3(0, -500, 0),
      // frictionGravity: new Vec3(0, -5, 0),
    });
  }

  public init() {
  }

  public getWorld() {
    return this.world;
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
    if (handler instanceof ConvexHandler) {
      return this.loadConvex(handler);
    }
    if (handler instanceof CameraHandler) {
      return this.loadCamera(handler);
    }
    return new Promise((resolve, reject) => reject());
  }

  protected loadModel(handler: ModelHandler<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const material = new Material('jack');
      this.materials.push(material);
      const body = new Body({
        shape: new Box(new Vec3(
          entity.box.width / 2,
          entity.box.height / 2,
          entity.box.depth / 2
        )),
        material,
        mass: 1, // @todo take from entity
      });
      body.linearDamping = 0;
      body.angularDamping = 0.75;
      body.position.set(0, entity.box.height, 0);
      body.fixedRotation = true;
      body.updateMassProperties();
      this.materials.forEach((other) => {
        const contactMaterial = new ContactMaterial(
          material,
          other,
          {
            friction: 0.4,
            restitution: 0.3,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3,
            frictionEquationStiffness: 1e8,
            frictionEquationRelaxation: 3,
          }
        );
        this.world.addContactMaterial(contactMaterial);
      });
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadBox(handler: BoxHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const material = new Material('box');
      this.materials.push(material);
      const body = new Body({
        shape: new Box(new Vec3(
          entity.width / 2,
          entity.height / 2,
          entity.depth / 2
        )),
        material,
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
      const material = new Material('sphere');
      this.materials.push(material);
      const body = new Body({
        shape: new Sphere(entity.radius),
        material,
      });
      body.position.set(0, -entity.radius, 0);
      // body.quaternion.set(-1, 0, 0, 1).normalize();
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadConvex(handler: ConvexHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const material = new Material('sphere');
      this.materials.push(material);
      const body = new Body({
        shape: new ConvexPolyhedron({
          vertices: entity.vertices.map((x: [number, number, number]) => {
            return new Vec3(x[0], x[1], x[2]);
          }),
          faces: entity.faces,
        }),
        material,
      });
      body.position.set(0, -1, 0);
      // body.quaternion.set(-1, 0, 0, 1).normalize();
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
      body.position.set(0, 5, -20);
      body.quaternion.set(-0.2, 0, 0, 1).normalize();
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  public animate(delta: number) {
    this.world.step(delta);
  }
}
