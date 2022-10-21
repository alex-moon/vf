import {Intent} from "@/ts/entities/intent";

export abstract class Entity {
  public model: any;

  protected abstract path: string;
  protected abstract animations: string[];
  protected abstract intent: Intent;
  protected constructor() {
    this.bindEvents();
  }
  protected abstract bindEvents(): void;
  public getPath() {
    return this.path;
  }
  public getAnimation(key: string|null = null) {
    if (key === null) {
      key = this.intent.state;
    }
    return this.animations.indexOf(key);
  }
  public getIntent() {
    return this.intent;
  }
}
