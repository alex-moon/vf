import {Controller} from "@/ts/controllers/controller";
import {ModelEntity} from "@/ts/entities/model.entity";
import {AnimationMixer, Euler, Vector3} from "three";
import {Model} from "@/ts/interfaces/model";

export abstract class ModelController<M extends ModelEntity> extends Controller<M> {
  protected model!: Model;
  protected mixer!: AnimationMixer;
  public setModel(model: Model) {
    this.model = model;
  }
  public getModel() {
    return this.model;
  }
  public setMixer(mixer: AnimationMixer) {
    this.mixer = mixer;
  }
  public getMixer() {
    return this.mixer;
  }
  public getVelocity() {
    const intent = this.entity.getIntent();
    const rotation = this.model.scene.rotation;
    const y = (rotation.y + (intent.direction || 0)) % (Math.PI * 2);
    const direction = new Euler(0, y, 0);
    const result = new Vector3(0, 0, intent.speed);
    result.applyEuler(direction);
    return result;
  }
}
