import {ShipEntity} from "@/ts/entities/ship.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {Body, Quaternion} from "cannon-es";
import {
  EquirectangularReflectionMapping,
  MeshPhysicalMaterial,
  Object3D,
  PointLight,
  SkinnedMesh,
  TextureLoader
} from "three";
import {ShipIntent, ShipState} from "@/ts/entities/ship.intent";
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {DirectionHelper} from "@/ts/helpers/direction.helper";
import {DirectionKey} from "@/ts/enums/direction";

export class ShipController extends ModelController<ShipEntity> {
  protected windshield!: Object3D;
  protected root!: Object3D;
  protected thrusters: Object3D[] = [];

  protected asteroid: AsteroidHandler|null = null;

  public isFlying() {
    return this.entity.isFlying();
  }

  public startFlying() {
    this.entity.startFlying();
    this.asteroid = null;
    this.updateThrusters(false);
  }

  public isLanding() {
    return this.entity.isLanding();
  }

  public startLanding(asteroid: AsteroidHandler) {
    this.entity.startLanding();
    this.asteroid = asteroid;
  }

  public isLaunching() {
    return this.entity.isLaunching();
  }

  public startLaunching() {
    this.entity.startLaunching();
    this.body.type = Body.DYNAMIC;
  }

  public isLanded() {
    return this.entity.isLanded();
  }

  public land() {
    this.entity.land();
    this.body.type = Body.STATIC;
  }

  public getAsteroid() {
    return this.asteroid;
  }

  public setModel(model: Model) {
    super.setModel(model);

    const windshield = model.scene.getObjectByName('Window');
    if (!windshield) {
      throw new Error('Could not get Window of Ship');
    }
    this.windshield = windshield as SkinnedMesh;

    // @todo I think we want to move toward each entity has a view
    // it's not clear to me where we access the physics, maybe in the controller
    const envMap = new TextureLoader().load(
      '/reflection.png',
      () => {
        envMap.mapping = EquirectangularReflectionMapping;
      }
    );
    (this.windshield as any).material = new MeshPhysicalMaterial({
      metalness: 0,
      roughness: 0,
      transmission: 1,
      envMap: envMap
    });

    this.thrusters = [
      model.scene.getObjectByName('ThrusterTL') || new Object3D(),
      model.scene.getObjectByName('ThrusterTR') || new Object3D(),
      model.scene.getObjectByName('ThrusterBL') || new Object3D(),
      model.scene.getObjectByName('ThrusterBR') || new Object3D(),
    ];
    this.thrusters.forEach((t) => {
      const light = new PointLight(0x00e3e0, 1, 3);
      light.position.y = 2;
      t.add(light);
      t.visible = false;
    });

    const root = model.scene.getObjectByName('Root');
    if (!root) {
      throw new Error('Could not get Root of Ship');
    }
    this.root = root;
  }

  public move(delta: number) {
    super.move(delta);

    const intent = this.entity.getIntent() as ShipIntent;
    this.body.quaternion.mult(intent.quaternion, this.body.quaternion);

    // reset intent pov quaternion @todo not this class' responsibility
    intent.quaternion = new Quaternion().normalize();

    const acceleration = this.getAcceleration();
    this.body.velocity.x += acceleration.x;
    this.body.velocity.y += acceleration.y;
    this.body.velocity.z += acceleration.z;
    const speed = this.body.velocity.length();
    if (speed > 1e5) {
      this.body.velocity.scale(1e5 / speed, this.body.velocity);
    }

    if (!this.isFlying()) {
      if (this.isLaunching() || this.isLanding()) {
        this.updateThrusters(true);
      } else {
        this.updateThrusters(false);
      }
    }
  }

  public getAcceleration() {
    const intent = this.entity.getIntent();
    const rotation = this.body.quaternion.clone();
    const acceleration = intent.acceleration.clone();
    rotation.vmult(acceleration, acceleration);
    return acceleration;
  }

  public onKeysChanged($event: KeysChangedEvent) {
    super.onKeysChanged($event);
    if (this.isFlying()) {
      const zKey = DirectionHelper.zKey($event.keys);
      this.updateThrusters(zKey === DirectionKey.N);
      if (zKey === DirectionKey.S) {
        // @todo if backward, we want reverse lights to come on
        const intent = this.entity.getIntent();
        // @todo accelerate in direction opposite travel
        const velocity = this.body.velocity.clone();
        velocity.normalize();
        velocity.scale(-intent.acceleration.length(), velocity);
        const rotation = this.body.quaternion.clone();
        rotation.conjugate(rotation);
        rotation.vmult(velocity, velocity);
        intent.acceleration.copy(velocity);
      }
    }
  }

  protected updateThrusters(visible: boolean) {
    this.thrusters.forEach(o => o.visible = visible);
  }
}
