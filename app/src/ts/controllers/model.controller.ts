import {Controller} from "@/ts/controllers/controller";
import {ModelEntity} from "@/ts/entities/model.entity";
import {AnimationMixer, Object3D} from "three";
import {Model} from "@/ts/interfaces/model";
import {Quaternion, Vec3} from "cannon-es";

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
    // const intent = this.entity.getIntent();
    // const position = new Vec3();
    // this.body.position.addScaledVector(1, intent.pov.position, position);
    // const rotation = new Quaternion();
    // this.body.quaternion.mult(intent.pov.rotation, rotation);
    // return {position, rotation};
  }

  public getVelocity() {
    // const intent = this.entity.getIntent();
    // const rotation = this.body.quaternion.clone();
    // rotation.mult(new Quaternion().setFromAxisAngle(
    //   new Vec3(0, 1, 0),
    //   intent.direction || 0
    // ), rotation);
    // const speed = new Vec3(0, 0, intent.speed);
    // return rotation.vmult(speed);
  }

  public move(delta: number) {
    const body = this.getBody();
    const mixer = this.getMixer();
    // const velocity = this.getVelocity();

    // body.velocity.x = velocity.x;
    // body.velocity.y = velocity.y;
    // body.velocity.z = velocity.z;

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
