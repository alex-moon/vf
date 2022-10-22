export class Intent {
  stateChanged = false;
  state: string;
  velocity = {
    x: 0,
    y: 0,
    z: 0,
  };
  constructor(state: string) {
    this.state = state;
    this.stateChanged = true;
  }
}
