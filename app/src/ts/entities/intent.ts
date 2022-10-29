import {Quaternion, Vector3} from "three";

export interface IntentPov {
  position: Vector3;
  rotation: Quaternion;
}

export class Intent {
  stateChanged = false;
  _state: string;

  speed: number = 0;
  // @todo replace with quaternion
  direction: number|null = 0;

  pov: IntentPov;

  constructor(state: string) {
    this._state = state;
    this.stateChanged = true;
    this.pov = {
      position: new Vector3(0, 0, 0),
      rotation: new Quaternion().normalize(),
    };
  }

  set state(value) {
    if (this._state !== value) {
      this.stateChanged = true;
    }
    this._state = value;
  }

  get state(): string {
    return this._state;
  }
}
