import {Intent} from "@/ts/entities/intent";
import {ModelEntity} from "@/ts/entities/model.entity";
import {DirectionHelper} from "@/ts/helpers/direction.helper";
import {DirectionKey} from "@/ts/enums/direction";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {Euler} from "three";

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
  ];
  protected intent = new Intent(JackState.IDLE);
  constructor() {
    super();
    this.intent.pov.position.y = 1.8;
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
    const euler = new Euler().setFromQuaternion(this.intent.pov.rotation);
    const y = euler.y - $event.movementX * 0.01;
    let x = euler.x + $event.movementY * 0.001;
    if (x < -0.75) {
      x = -0.75;
    }
    if (x > 0.9) {
      x = 0.9;
    }
    const rotation = new Euler(x, y, euler.z);
    this.intent.pov.rotation.setFromEuler(rotation);
  }
}
