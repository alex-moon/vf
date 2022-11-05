import {Handler} from "@/ts/handlers/handler";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {AnimationMixer} from "three";
import {Vec3} from "cannon-es";
import {Box} from "shapes/Box";

export class ModelHandler<C extends ModelController<any>> extends Handler<C> {
  public setModel(model: Model) {
    this.controller.setModel(model);
  }

  public getModel() {
    return this.controller.getModel();
  }

  public setMixer(mixer: AnimationMixer) {
    this.controller.setMixer(mixer);
  }

  public getMixer() {
    return this.controller.getMixer();
  }

  public getPov() {
    return this.controller.getPov();
  }

  protected getOffset() {
    const body = this.controller.getBody();
    const shape = body.shapes[0] as Box;
    const halfHeight = shape.halfExtents.y;
    return new Vec3(0, -halfHeight, 0);
  }
}
