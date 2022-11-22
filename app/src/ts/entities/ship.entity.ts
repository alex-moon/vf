import {ModelEntity} from "@/ts/entities/model.entity";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CollisionBox} from "@/ts/entities/collision-box";
import {DirectionKey} from "@/ts/enums/direction";
import {DirectionHelper} from "@/ts/helpers/direction.helper";
import {Quaternion, Vec3} from "cannon-es";
import {DoorState, ShipIntent, ShipState} from "@/ts/entities/ship.intent";

export class ShipEntity extends ModelEntity {
  protected acceleration = {
    [ShipState.FLYING]: 1,
  }
  protected roll = {
    [ShipState.FLYING]: 0.01,
  }

  protected path = '/glb/ship.glb';
  protected animations = [
    DoorState.DEFAULT,
    DoorState.CLOSED,
    DoorState.CLOSING,
    DoorState.OPEN,
    DoorState.OPENING,
  ];

  protected intent = new ShipIntent(ShipState.LANDED);
  protected box = {
    // width: 22,
    // height: 6,
    // depth: 7,
    width: 6,
    height: 6,
    depth: 6,
  } as CollisionBox;

  constructor() {
    super();
    this.intent.pov.position.y = 1;
    this.getIntent();
  }

  public getIntent(): ShipIntent {
    this.calculatePovQuaternion();
    this.calculateIntentQuaternion();
    return super.getIntent() as ShipIntent;
  }

  private calculatePovQuaternion() {
    if (this.intent.state === ShipState.FLYING) {
      this.intent.pov.quaternion.setFromEuler(-Math.PI / 2, Math.PI, 0,'YXZ');
      // this.intent.pov.quaternion.setFromEuler(0, Math.PI, 0);

      // tiny difference to camera angle x to suggest acceleration
      const acceleration = this.intent.acceleration.y;
      if (acceleration != 0) {
        const sign = acceleration > 0 ? 1 : -1;
        const aq = new Quaternion().setFromEuler(sign * 0.2, 0, 0);
        this.intent.pov.quaternion.mult(aq, this.intent.pov.quaternion);
      }
    } else {
      this.intent.pov.quaternion.setFromEuler(0, Math.PI, 0);
    }
  }

  private calculateIntentQuaternion() {
    const quaternion = new Quaternion().setFromEuler(
      this.intent.angularVelocity.x,
      this.intent.angularVelocity.y,
      this.intent.angularVelocity.z
    );
    this.intent.quaternion.mult(quaternion, this.intent.quaternion);
  }

  public isFlying() {
    return this.intent.state === ShipState.FLYING;
  }

  public startFlying() {
    this.intent.state = ShipState.FLYING;
  }

  public isLanding() {
    return this.intent.state === ShipState.LANDING;
  }

  public startLanding() {
    this.intent.state = ShipState.LANDING;
  }

  public isLanded() {
    return this.intent.state === ShipState.LANDED;
  }

  public land() {
    this.intent.state = ShipState.LANDED;
  }

  public isLaunching() {
    return this.intent.state === ShipState.LAUNCHING;
  }

  public startLaunching() {
    this.intent.state = ShipState.LAUNCHING;
  }

  public getAnimation(key: DoorState|null = null) {
    if (key === null) {
      key = this.intent.doorState as DoorState;
    }
    return this.animations.indexOf(key);
  }

  public onKeysChanged($event: KeysChangedEvent) {
    super.onKeysChanged($event);
    if (this.intent.state !== ShipState.FLYING) {
      return;
    }

    const zKey = DirectionHelper.zKey($event.keys);
    const xKey = DirectionHelper.xKey($event.keys);
    if (zKey) {
      const sign = zKey === DirectionKey.N ? 1 : -1;
      this.intent.acceleration.set(0, sign * this.acceleration[ShipState.FLYING], 0);
    } else {
      this.intent.acceleration.set(0, 0, 0);
    }

    if (xKey) {
      const sign = xKey === DirectionKey.W ? -1 : 1;
      this.intent.angularVelocity.set(0, sign * this.roll[ShipState.FLYING], 0);
    } else {
      this.intent.angularVelocity.set(0, 0, 0);
    }
  }

  public onPointerMove($event: MouseEvent) {
    super.onPointerMove($event);
    if (this.intent.state !== ShipState.FLYING) {
      return;
    }

    const previous = new Vec3();
    this.intent.quaternion.toEuler(previous);
    this.intent.quaternion.setFromEuler(
      previous.x - $event.movementY * 0.001,
      0,
      previous.z - $event.movementX * 0.001
    );
  }
}
