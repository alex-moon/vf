import {ModelHandler} from "@/ts/handlers/model.handler";
import {JackController} from "@/ts/controllers/jack.controller";
import {World} from "@/ts/world";
import {Quaternion, Vec3} from "cannon-es";

export class JackHandler extends ModelHandler<JackController> {
  public move(delta: number, world: World) {
    super.move(delta, world);
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
    return (6.674e-6 * m1 * m2) / (r * r);
  }
}
