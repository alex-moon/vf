import {Quaternion, Vec3} from "cannon-es";

export interface EntityPov {
  position: Vec3;
  quaternion: Quaternion;
}

export class Intent {
  state: string;

  speed: number = 0;
  // @todo replace with quaternion
  direction: number|null = 0;

  pov: EntityPov;

  acceleration: Vec3 = new Vec3(0, 0, 0);
  quaternion: Quaternion = new Quaternion().normalize();

  constructor(state: string) {
    this.state = state;
    this.pov = {
      position: new Vec3(0, 0, 0),
      quaternion: new Quaternion().normalize(),
    };
  }
}
