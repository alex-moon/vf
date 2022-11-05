import {Intent} from "@/ts/entities/intent";
import {ModelEntity} from "@/ts/entities/model.entity";
import {DirectionHelper} from "@/ts/helpers/direction.helper";
import {Direction, DirectionKey} from "@/ts/enums/direction";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CollisionBox} from "@/ts/entities/collision-box";
import {Vec3} from "cannon-es";
import {MathHelper} from "@/ts/helpers/math.helper";

enum JackState {
  DEFAULT = 'default',
  IDLE = 'idle',
  RUNNING = 'running',
}

export class JackEntity extends ModelEntity {
  protected speed = {
    [JackState.IDLE]: 0,
    [JackState.RUNNING]: 0.08,
  }

  protected path = '/glb/jack.glb';
  protected animations = [
    JackState.DEFAULT,
    JackState.IDLE,
    JackState.RUNNING,
    JackState.RUNNING + '.S',
  ];
  protected intent = new Intent(JackState.IDLE);
  protected box = {
    width: 0.5,
    height: 1,
    depth: 0.4,
  } as CollisionBox;

  constructor() {
    super();
    this.intent.pov.position.y = 1.8;
  }

  public getAnimation(key: string|null = null) {
    if (key === null) {
      key = this.intent.state;
    }
    if (
      this.intent.direction
      && this.intent.direction < Direction.E
      && this.intent.direction > Direction.W
    ) {
      key = this.intent.state + '.S';
    }
    return this.animations.indexOf(key);
  }

  public onKeysChanged($event: KeysChangedEvent) {
    const zKeys = $event.keys.filter(key => [DirectionKey.N, DirectionKey.S].includes(key as DirectionKey));
    const xKeys = $event.keys.filter(key => [DirectionKey.E, DirectionKey.W].includes(key as DirectionKey));
    const zKey = zKeys.length != 1 ? null : zKeys[0] as DirectionKey;
    const xKey = xKeys.length != 1 ? null : xKeys[0] as DirectionKey;
    if (zKey || xKey) {
      this.intent.state = JackState.RUNNING;
      this.intent.speed = this.speed[JackState.RUNNING];
      this.intent.direction = DirectionHelper.fromKeys(zKey, xKey);
    } else {
      this.intent.state = JackState.IDLE;
      this.intent.speed = this.speed[JackState.IDLE];
      this.intent.direction = null;
    }
  }

  public onPointerMove($event: MouseEvent) {
    super.onPointerMove($event);
    const previous = new Vec3();
    this.intent.pov.quaternion.toEuler(previous);
    const x = MathHelper.clamp(previous.x + $event.movementY * 0.01, -0.75, 0.9);

    this.intent.pov.quaternion.setFromEuler(
      x,
      -$event.movementX * 0.01,
      0
    );
  }
}
