import {Controller} from "@/ts/controllers/controller";
import {ModelEntity} from "@/ts/entities/model.entity";
import {AnimationMixer, Euler, Object3D, Quaternion, Vector3} from "three";
import {Model} from "@/ts/interfaces/model";
import {NumberHelper} from "@/ts/helpers/number.helper";
import {World} from "@/ts/world";

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

  public getIntersectable(): Object3D {
    // @todo this needs to be a collision box instead
    return this.model.scene;
  }

  public getPov() {
    const intent = this.entity.getIntent();
    const position = this.model.scene.position.clone();
    position.add(intent.pov.position);
    const rotation = new Quaternion()
      .setFromEuler(this.model.scene.rotation)
      .multiply(intent.pov.rotation);
    return {position, rotation};
  }

  public getVelocity() {
    const intent = this.entity.getIntent();
    const rotation = this.model.scene.rotation;
    const y = NumberHelper.addMod(rotation.y, intent.direction || 0, Math.PI * 2);
    const direction = new Euler(0, y, 0);
    const result = new Vector3(0, 0, intent.speed);
    result.applyEuler(direction);
    return result;
  }

  public move(delta: number, world: World) {
    const model = this.getModel();
    const mixer = this.getMixer();
    const velocity = this.getVelocity();

    model.scene.position.x += velocity.x;
    model.scene.position.y += velocity.y;
    model.scene.position.z += velocity.z;

    const entity = this.getEntity();
    const intent = entity.getIntent();
    if (intent.stateChanged) {
      const animation = model.animations[entity.getAnimation()];
      mixer.stopAllAction();
      mixer.clipAction(animation).play();
      intent.stateChanged = false;
    }
    mixer.update(delta);
  }
}
