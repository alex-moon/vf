import {Entity} from "@/ts/entities/entity";
import {Intent} from "@/ts/entities/intent";

enum JackState {
  DEFAULT = 'default',
  IDLE = 'idle',
  RUNNING = 'running',
}

export class Jack extends Entity {
  protected velocity = {
    [JackState.IDLE]: 0,
    [JackState.RUNNING]: 0.1,
  }

  protected path = '/glb/jack.glb';
  protected animations = [
    JackState.DEFAULT,
    JackState.IDLE,
    JackState.RUNNING,
  ];
  protected intent = new Intent(JackState.IDLE);

  protected bindEvents() {
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  private onKeyDown($event: KeyboardEvent) {
    console.log('key down', $event);
    switch ($event.key) {
      case 'w':
        this.intent.velocity.z = this.velocity[JackState.RUNNING];
        break;
      case 's':
        this.intent.velocity.z = -this.velocity[JackState.RUNNING];
        break;
      case 'a':
        this.intent.velocity.x = this.velocity[JackState.RUNNING];
        break;
      case 'd':
        this.intent.velocity.x = -this.velocity[JackState.RUNNING];
        break;
    }
  }

  private onKeyUp($event: KeyboardEvent) {
    console.log('key up', $event);
    switch ($event.key) {
      case 'w':
      case 's':
        this.intent.velocity.z = 0;
        break;
      case 'a':
      case 'd':
        this.intent.velocity.x = 0;
        break;
    }
  }
}
