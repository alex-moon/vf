import {Intent} from "@/ts/entities/intent";
import {ModelEntity} from "@/ts/entities/model.entity";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CollisionBox} from "@/ts/entities/collision-box";
import {DirectionKey} from "@/ts/enums/direction";
import {DirectionHelper} from "@/ts/helpers/direction.helper";
import {Quaternion, Vec3} from "cannon-es";
import {MathHelper} from "@/ts/helpers/math.helper";

enum ShipState {
  DEFAULT = 'default',
  LANDED = 'landed',
  FLYING = 'flying',
}

export class ShipEntity extends ModelEntity {
  protected acceleration = {
    [ShipState.LANDED]: 0,
    [ShipState.FLYING]: 8,
  }
  protected roll = {
    [ShipState.LANDED]: 0,
    [ShipState.FLYING]: Math.PI / 12,
  }

  protected path = '/glb/ship.glb';
  protected animations = [
    ShipState.DEFAULT,
    ShipState.FLYING,
    ShipState.LANDED + '.C',
    ShipState.LANDED,
    ShipState.LANDED + '.O',
  ];

  protected intent = new Intent(ShipState.LANDED);
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
    // this.intent.pov.quaternion = new Quaternion().setFromEuler(
    //   - Math.PI / 2,
    //   Math.PI,
    //   0,
    //   'YXZ'
    // );
  }

  public isFlying() {
    return this.intent.state === ShipState.FLYING;
  }

  public startFlying() {
    this.intent.state = ShipState.FLYING;
  }

  public getAnimation(key: ShipState|null = null) {
    if (key === null) {
      key = this.intent.state as ShipState;
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
      this.intent.quaternion.mult(new Quaternion().setFromAxisAngle(
        new Vec3(0, 1, 0),
        sign * this.roll[ShipState.FLYING]
      ), this.intent.quaternion);
    }
    // @todo reset rotation???
  }

  public onPointerMove($event: MouseEvent) {
    super.onPointerMove($event);
    if (this.intent.state !== ShipState.FLYING) {
      return;
    }

    const previous = new Vec3();
    this.intent.quaternion.toEuler(previous);
    this.intent.quaternion.setFromEuler(
      previous.x + $event.movementY * 0.01,
      previous.y - $event.movementX * 0.01,
      0
    );
  }
}
