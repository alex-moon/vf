import {Handler} from "@/ts/handlers/handler";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {AnimationMixer} from "three";

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
}
