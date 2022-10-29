import {Entity} from "@/ts/entities/entity";
import {ModelEntity} from "@/ts/entities/model.entity";
import {ModelController} from "@/ts/controllers/model.controller";

export class CameraEntity extends Entity {
  protected target!: ModelController<ModelEntity>;

  public setTarget(target: ModelController<ModelEntity>) {
    this.target = target;
  }

  public getTarget() {
    return this.target;
  }
}
