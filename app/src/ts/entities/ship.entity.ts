import {Intent} from "@/ts/entities/intent";
import {ModelEntity} from "@/ts/entities/model.entity";
import {DirectionHelper} from "@/ts/helpers/direction.helper";
import {Direction, DirectionKey} from "@/ts/enums/direction";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CollisionBox} from "@/ts/entities/collision-box";
import {Vec3} from "cannon-es";
import {MathHelper} from "@/ts/helpers/math.helper";

enum ShipState {
  DEFAULT = 'default',
  OPEN = 'open',
  CLOSED = 'closed',
}

export class ShipEntity extends ModelEntity {
  protected speed = {
    [ShipState.OPEN]: 0,
    [ShipState.CLOSED]: 0,
  }

  protected path = '/glb/ship.glb';
  protected animations = [
    ShipState.DEFAULT,
    ShipState.OPEN,
    ShipState.CLOSED,
  ];
  protected intent = new Intent(ShipState.OPEN);
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
    this.intent.pov.position.y = 5;
  }

  public getAnimation(key: ShipState|null = null) {
    if (key === null) {
      key = this.intent.state as ShipState;
    }
    return this.animations.indexOf(key);
  }

  public onKeysChanged($event: KeysChangedEvent) {
    super.onKeysChanged($event);
    // const zKeys = $event.keys.filter(key => [DirectionKey.N, DirectionKey.S].includes(key as DirectionKey));
    // const xKeys = $event.keys.filter(key => [DirectionKey.E, DirectionKey.W].includes(key as DirectionKey));
    // const zKey = zKeys.length != 1 ? null : zKeys[0] as DirectionKey;
    // const xKey = xKeys.length != 1 ? null : xKeys[0] as DirectionKey;
    // if (zKey || xKey) {
    //   this.intent.state = ShipState.CLOSED;
    //   this.intent.speed = this.speed[ShipState.CLOSED];
    //   this.intent.direction = DirectionHelper.fromKeys(zKey, xKey);
    // } else {
    //   this.intent.state = ShipState.OPEN;
    //   this.intent.speed = this.speed[ShipState.OPEN];
    //   this.intent.direction = null;
    // }
  }

  public onPointerMove($event: MouseEvent) {
    super.onPointerMove($event);
    // const previous = new Vec3();
    // this.intent.pov.quaternion.toEuler(previous);
    // const x = MathHelper.clamp(previous.x + $event.movementY * 0.001, -0.75, 0.9);
    //
    // this.intent.pov.quaternion.setFromEuler(
    //   x,
    //   -$event.movementX * 0.01,
    //   0
    // );
  }
}
