import {ModelHandler} from "@/ts/handlers/model.handler";
import {ShipController} from "@/ts/controllers/ship.controller";
import {ShipEntity} from "@/ts/entities/ship.entity";
import {World} from "@/ts/world";
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";
import {Body} from "cannon-es";
import {AsteroidEntity} from "@/ts/entities/asteroid.entity";

export class ShipHandler extends ModelHandler<ShipController> {
  static LANDING_ALTITUDE = 22;

  public getEntity(): ShipEntity {
    return super.getEntity();
  }

  public isFlying() {
    return this.controller.isFlying();
  }

  public startFlying() {
    this.controller.startFlying();
  }

  public isLanding() {
    return this.controller.isLanding();
  }

  public startLanding(asteroid: AsteroidHandler) {
    this.controller.startLanding(asteroid);

    const body = this.getBody();
    const origin = asteroid.getBody().position;
    const target = body.position.clone();
    target.vsub(origin, target);
    target.normalize();
    const entity = asteroid.getEntity() as AsteroidEntity;
    target.scale(entity.radius + ShipHandler.LANDING_ALTITUDE, target);
    target.vadd(origin, target);
    body.position.copy(target);
  }

  public isLaunching() {
    return this.controller.isLaunching();
  }

  public startLaunching() {
    this.controller.startLaunching();
  }

  public isLanded() {
    return this.controller.isLanded();
  }

  public land() {
    return this.controller.land();
  }

  public move(delta: number, world: World) {
    super.move(delta, world);

    const body = this.getBody();

    if (this.isFlying()) {
      // cool stuff but whatever
      // this.applyGravity(body, world, 1);
    }

    const landing = this.isLanding();
    const launching = this.isLaunching();
    if (landing || launching) {
      const asteroid = this.controller.getAsteroid();
      if (asteroid) {
        const target = asteroid.getBody().position;
        const origin = body.position;
        const force = target.clone();
        force.vsub(origin, force);
        const distance = force.length();
        force.normalize();
        if (landing) {
          this.rotateToward(body, force);
          body.position.addScaledVector(0.5, force, body.position);
        } else {
          const entity = asteroid.getEntity() as AsteroidEntity;
          if (distance >= entity.radius + ShipHandler.LANDING_ALTITUDE) {
            this.startFlying();
          } else {
            body.position.addScaledVector(-0.5, force, body.position);
          }
        }
      } else {
        console.warn('Attempted to rotate toward asteroid without asteroid set');
      }
    }
  }
}
