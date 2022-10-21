import * as THREE from 'three';
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

  private recalculateVelocity(fb: number, lr: number) {
    let rotSum = 0;
    if (fb === 0 && lr === 0) {
      rotSum = 0;
    }
    if (fb > 0 && lr === 0) {
      rotSum = 0;
    }
    if (fb > 0 && lr > 0) {
      rotSum = Math.PI / 4;
    }
    if (fb === 0 && lr > 0) {
      rotSum = Math.PI / 2;
    }
    if (fb < 0 && lr > 0) {
      rotSum = 3 * Math.PI / 4;
    }
    if (fb < 0 && lr === 0) {
      rotSum = Math.PI;
    }
    if (fb < 0 && lr < 0) {
      rotSum = 5 * Math.PI / 4;
    }
    if (fb === 0 && lr < 0) {
      rotSum = 3 * Math.PI / 2;
    }
    if (fb > 0 && lr < 0) {
      rotSum = 7 * Math.PI / 4;
    }
    const rotation = (this.model.scene.rotation.y + rotSum) % (Math.PI * 2);
    const distance = Math.sqrt(fb * fb + lr * lr);
    this.intent.velocity.x = distance * Math.sin(rotation);
    this.intent.velocity.z = distance * Math.cos(rotation);
  }

  public onKeyDown($event: KeyboardEvent) {
    switch ($event.key) {
      case 'w':
        this.recalculateVelocity(this.velocity[JackState.RUNNING], 0);
        break;
      case 's':
        this.recalculateVelocity(-this.velocity[JackState.RUNNING], 0);
        break;
      case 'a':
        this.recalculateVelocity(0, this.velocity[JackState.RUNNING]);
        break;
      case 'd':
        this.recalculateVelocity(0, -this.velocity[JackState.RUNNING]);
        break;
    }
  }

  public onKeyUp($event: KeyboardEvent) {
    switch ($event.key) {
      case 'w':
      case 's':
        this.recalculateVelocity(0, 0);
        break;
      case 'a':
      case 'd':
        this.recalculateVelocity(0, 0);
        break;
    }
  }

  public onPointerMove($event: MouseEvent) {
    this.model.scene.rotation.y -= $event.movementX * 0.01;
    this.model.scene.rotation.y %= (2 * Math.PI);
    const rotation = this.model.scene.rotation.y;
  }

  public onPoint(point: THREE.Vector3) {
    // this.model.scene.lookAt(point);
  }
}
