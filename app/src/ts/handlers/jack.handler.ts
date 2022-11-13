import {ModelHandler} from "@/ts/handlers/model.handler";
import {JackController} from "@/ts/controllers/jack.controller";
import {JackEntity} from "@/ts/entities/jack.entity";
import {World} from "@/ts/world";
import {Quaternion, Vec3} from "cannon-es";

export class JackHandler extends ModelHandler<JackController> {
  public getEntity(): JackEntity {
    return super.getEntity();
  }

  public isOnFoot() {
    return this.getEntity().isOnFoot();
  }

  public enterVehicle(vehicle: ModelHandler<any>) {
    this.controller.enterVehicle(vehicle);
  }

  public move(delta: number, world: World) {
    super.move(delta, world);

    if (!this.isOnFoot()) {
      return;
    }

    const body = this.getBody();

    // first apply force
    const asteroid = world.getAsteroid().getBody();
    const target = asteroid.position;
    const origin = body.position;
    const force = target.clone();
    force.vsub(origin, force);
    force.normalize();
    const gravity = this.gravity(
      body.mass,
      asteroid.mass,
      body.position.distanceTo(asteroid.position)
    );
    force.scale(gravity, force);
    body.applyForce(force);

    // second rotate body
    const downN = new Vec3(0, -1, 0);
    const forceN = force.clone();
    forceN.unit(forceN);
    body.quaternion.conjugate().vmult(forceN, forceN);
    const rotation = new Quaternion().setFromVectors(downN, forceN);
    body.quaternion.mult(rotation, body.quaternion);
  }

  private gravity(m1: number, m2: number, r: number) {
    const G = 6.674e-6;
    return (G * m1 * m2) / (r * r);
  }
}
