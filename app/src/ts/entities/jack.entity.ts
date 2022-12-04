import {ModelEntity} from "@/ts/entities/model.entity";
import {DirectionHelper} from "@/ts/helpers/direction.helper";
import {Direction} from "@/ts/enums/direction";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CollisionBox} from "@/ts/entities/collision-box";
import {Vec3} from "cannon-es";
import {MathHelper} from "@/ts/helpers/math.helper";
import {JackIntent, JackState} from "@/ts/entities/jack.intent";
import {ContactsChangedEvent} from "@/ts/events/contacts-changed.event";

export class JackEntity extends ModelEntity {
  protected speed = {
    [JackState.RUNNING]: 8,
  }

  protected path = '/glb/jack.glb';
  protected animations = [
    JackState.DEFAULT,
    JackState.FALLING,
    JackState.IDLE,
    JackState.RUNNING,
    JackState.RUNNING + '.S',
  ];
  protected intent = new JackIntent(JackState.IDLE);
  protected box = {
    width: 0.5,
    height: 1,
    depth: 0.4,
  } as CollisionBox;

  constructor() {
    super();
    this.intent.pov.position.y = 1;
  }

  public getIntent(): JackIntent {
    return super.getIntent() as JackIntent;
  }

  public isOnFoot() {
    return [
      JackState.IDLE,
      JackState.RUNNING,
      JackState.FALLING,
    ].includes(this.intent.state as JackState);
  }

  public enterVehicle() {
    this.intent.state = JackState.VEHICLE;
  }

  public exitVehicle() {
    this.intent.state = JackState.IDLE;
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
    super.onKeysChanged($event);

    if (this.intent.state === JackState.VEHICLE) {
      return;
    }

    const zKey = DirectionHelper.zKey($event.keys);
    const xKey = DirectionHelper.xKey($event.keys);
    if (zKey || xKey) {
      this.intent.state = JackState.RUNNING;
      this.intent.speed = this.speed[JackState.RUNNING];
      this.intent.direction = DirectionHelper.fromKeys(zKey, xKey);
    } else {
      this.intent.state = JackState.IDLE;
      this.intent.speed = 0;
      this.intent.direction = null;
    }
  }

  public onContactsChanged($event: ContactsChangedEvent) {
    super.onContactsChanged($event);

    if (this.intent.state === JackState.VEHICLE) {
      return;
    }

    if ($event.on.length) {
      if ([JackState.FALLING].includes(this.intent.state as JackState)) {
        this.intent.state = JackState.IDLE;
      }
    }

    if ($event.off.length) {
      if ([JackState.IDLE, JackState.RUNNING].includes(this.intent.state as JackState)) {
        this.intent.state = JackState.FALLING;
      }
    }
  }

  public onPointerMove($event: MouseEvent) {
    super.onPointerMove($event);

    if (this.intent.state === JackState.VEHICLE) {
      return;
    }

    const previous = new Vec3();
    this.intent.pov.quaternion.toEuler(previous);
    const x = MathHelper.clamp(
      previous.x + $event.movementY * 0.001,
      -1.2,
      1.0
    );

    this.intent.pov.quaternion.setFromEuler(
      x,
      -$event.movementX * 0.001,
      0
    );
  }
}
