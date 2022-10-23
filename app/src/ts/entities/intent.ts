export class Intent {
  stateChanged = false;
  _state: string;
  speed: number = 0;
  direction: number|null = 0;
  constructor(state: string) {
    this._state = state;
    this.stateChanged = true;
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
