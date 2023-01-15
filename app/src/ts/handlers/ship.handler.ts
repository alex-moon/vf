import {ModelHandler} from "@/ts/handlers/model.handler";
import {ShipController} from "@/ts/controllers/ship.controller";
import {ShipEntity} from "@/ts/entities/ship.entity";
import {World} from "@/ts/world";
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";
import {AsteroidEntity} from "@/ts/entities/asteroid.entity";
import {Vec3} from "cannon-es";
import {DoorState} from "@/ts/entities/ship.intent";

export class ShipHandler extends ModelHandler<ShipController> {
  static LANDING_ALTITUDE = 18;

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

    const ores = this.getAsteroid()?.getOres();
    console.log(ores?.length, 'ores on this asteroid');

    const body = this.getBody();
    body.velocity.set(0, 0, 0);
    const origin = asteroid.getBody().position;
    const target = body.position.clone();
    target.vsub(origin, target);
    target.scale(1 / target.length(), target);
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

  public getAsteroid() {
    return this.controller.getAsteroid();
  }

  public openDoor() {
    return new Promise((resolve, reject) => {
      this.getEntity().getIntent().doorState = DoorState.OPENING;
      this.onAnimationFinished(() => {
        this.getEntity().getIntent().doorState = DoorState.OPEN;
        resolve();
      });
    })
  }

  public closeDoor() {
    return new Promise((resolve, reject) => {
      this.getEntity().getIntent().doorState = DoorState.CLOSING;
      this.onAnimationFinished(() => {
        this.getEntity().getIntent().doorState = DoorState.CLOSED;
        resolve();
      });
    })
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
        force.scale(1 / distance, force);
        if (landing) {
          this.rotateToward(body, force);
          body.position.addScaledVector(0.5, force, body.position);
        } else {
          const entity = asteroid.getEntity() as AsteroidEntity;
          if (distance >= entity.radius + ShipHandler.LANDING_ALTITUDE) {
            const velocity = new Vec3();
            force.scale(-10, velocity);
            body.velocity.copy(velocity);
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
