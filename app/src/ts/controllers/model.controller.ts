import {Controller} from "@/ts/controllers/controller";
import {ModelEntity} from "@/ts/entities/model.entity";
import {AnimationMixer, Euler, Object3D, Quaternion, Vector3} from "three";
import {Model} from "@/ts/interfaces/model";
import {NumberHelper} from "@/ts/helpers/number.helper";

export abstract class ModelController<M extends ModelEntity> extends Controller<M> {
  protected model!: Model;
  protected mixer!: AnimationMixer;
  protected animation = 0;

  public setModel(model: Model) {
    this.model = model;
    this.object = model.scene;
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

  public getObject(): Object3D {
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

  public move(delta: number) {
    const body = this.getBody();
    const mixer = this.getMixer();
    const velocity = this.getVelocity();

    body.position.x += velocity.x;
    body.position.y += velocity.y;
    body.position.z += velocity.z;

    const entity = this.getEntity();
    const animation = entity.getAnimation();
    if (animation !== this.animation) {
      this.animation = animation;
      mixer.stopAllAction();
      mixer.clipAction(this.getModel().animations[entity.getAnimation()]).play();
    }
    mixer.update(delta);
  }
}
