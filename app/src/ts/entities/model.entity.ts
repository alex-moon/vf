import {Intent} from "@/ts/entities/intent";
import {Entity} from "@/ts/entities/entity";

export abstract class ModelEntity extends Entity {
  protected abstract path: string;
  protected abstract animations: string[];
  protected abstract intent: Intent;
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
