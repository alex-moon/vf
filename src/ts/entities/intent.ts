import {Quaternion, Vec3} from "cannon-es";

export interface EntityPov {
  position: Vec3;
  quaternion: Quaternion;
}

export class Intent {
  state: string;
  pov: EntityPov;

  constructor(state: string) {
    this.state = state;
    this.pov = {
      position: new Vec3(0, 1, 0),
      quaternion: new Quaternion().normalize(),
    };
  }
}
