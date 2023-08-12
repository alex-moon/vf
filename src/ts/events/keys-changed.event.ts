export class KeysChangedEvent {
  keys: string[];

  constructor(keys: string[]) {
    this.keys = keys;
  }
}
