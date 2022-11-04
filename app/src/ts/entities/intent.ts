import {Quaternion, Vector3} from "three";

export interface EntityPov {
  position: Vector3;
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
      position: new Vector3(0, 0, 0),
      rotation: new Quaternion().normalize(),
    };
  }
}

export class ControllerIntent {
  position ?: Vector3;
  velocity ?: Vector3;
  force ?: Vector3;
}
