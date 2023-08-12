import {Controller} from "@/ts/controllers/controller";
import {ModelEntity} from "@/ts/entities/model.entity";
import {AnimationMixer, LoopOnce, Object3D} from "three";
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
    const quaternion = new Quaternion();
    this.body.quaternion.mult(intent.pov.quaternion, quaternion);
    this.body.quaternion.vmult(intent.pov.position, position);
    this.body.position.addScaledVector(1, position, position);
    return {position, quaternion} as EntityPov;
  }

  public move(delta: number) {
    const mixer = this.getMixer();

    const entity = this.getEntity();
    const animation = entity.getAnimation();
    if (animation !== this.animation) {
      mixer.stopAllAction();
      this.animation = animation;
      if (animation) {
        const animations = this.getModel().animations;
        if (animations.hasOwnProperty(animation)) {
          mixer.clipAction(animations[animation]).play();
        }
      }
    }
    mixer.update(delta);
  }

  public onAnimationFinished(callback: () => void) {
    let fn: (e: any) => void;
    fn = (e: any) => {
      callback();
      this.mixer.removeEventListener('finished', fn);
    }
    this.mixer.addEventListener('finished', fn);
    const mixer = this.getMixer();

    // @todo clean this up (duplicated from above)
    const animation = this.getEntity().getAnimation();
    if (animation !== this.animation) {
      mixer.stopAllAction();
      this.animation = animation;
      if (animation) {
        const animations = this.getModel().animations;
        if (animations.hasOwnProperty(animation)) {
          const clip = mixer.clipAction(animations[animation]);
          clip.setLoop(LoopOnce, 1);
          clip.play();
        }
      }
    }
  }
}
