import {Quaternion, Vec3} from "cannon-es";

export interface EntityPov {
  position: Vec3;
  rotation: Quaternion;
}

export class Intent {
  state: string;

  speed: number = 0;
  // @todo replace with quaternion
  direction: number|null = 0;

  pov: EntityPov;

  constructor(state: string) {
    this.state = state;
    this.pov = {
      position: new Vec3(0, 0, 0),
      rotation: new Quaternion().normalize(),
    };
  }
}

export class ControllerIntent {
  position ?: Vec3;
  velocity ?: Vec3;
  force ?: Vec3;
}
