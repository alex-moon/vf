import {Controller} from "@/ts/controllers/controller";
import {ModelEntity} from "@/ts/entities/model.entity";
import {AnimationMixer, Object3D} from "three";
import {Model} from "@/ts/interfaces/model";
import {Quaternion, Vec3} from "cannon-es";
import {EntityPov} from "@/ts/entities/intent";

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
    const position = this.body.position.clone();
    position.addScaledVector(1, intent.pov.position, position);
    const quaternion = new Quaternion();
    this.body.quaternion.mult(intent.pov.quaternion, quaternion);
    return {position, quaternion} as EntityPov;
  }

  public getVelocity() {
    const intent = this.entity.getIntent();
    const rotation = this.body.quaternion.clone();
    rotation.mult(new Quaternion().setFromAxisAngle(
      new Vec3(0, 1, 0),
      intent.direction || 0
    ), rotation);
    const velocity = new Vec3(0, 0, intent.speed);
    rotation.vmult(velocity, velocity);
    if (intent.speed > 0) {
      console.log('velocity', velocity.x, velocity.y, velocity.z);
    }
    return velocity;
  }

  public move(delta: number) {
    const body = this.getBody();
    const mixer = this.getMixer();
    const velocity = this.getVelocity();

    body.velocity.x = velocity.x;
    body.velocity.y = velocity.y;
    body.velocity.z = velocity.z;

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
