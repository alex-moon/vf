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
import {ShipIntent} from "@/ts/entities/ship.intent";
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {DirectionHelper} from "@/ts/helpers/direction.helper";

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

    // could get this from the prop positions?
    // const d = 1.25;
    // const y = -0.5;
    // for (const point of [
    //   new Vector3(d, y, d),
    //   new Vector3(d, y, -d),
    //   new Vector3(-d, y, -d),
    //   new Vector3(-d, y, d),
    // ]) {
    //   const thruster = ThrusterHelper.get(0.35, 1.5);
    //   thruster.position.copy(point);
    //   thruster.rotateX(Math.PI);
    //   thruster.visible = false;
    //   this.object.add(thruster);
    //   this.thrusters.push(thruster);
    // }
    this.thrusters = [
      model.scene.getObjectByName('ThrusterTL') || new Object3D(),
      model.scene.getObjectByName('ThrusterTR') || new Object3D(),
      model.scene.getObjectByName('ThrusterBL') || new Object3D(),
      model.scene.getObjectByName('ThrusterBR') || new Object3D(),
    ];
    this.thrusters.forEach((t) => {
      const light = new PointLight(0x00e3e0, 0.5, 1);
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
      // const sign = zKey === DirectionKey.N ? 1 : -1;
      // @todo what if backward?
      this.updateThrusters(!!zKey);
    }
  }

  protected updateThrusters(visible: boolean) {
    this.thrusters.forEach(o => o.visible = visible);
  }
}
