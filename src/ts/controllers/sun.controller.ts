import {Controller} from '@/ts/controllers/controller';
import {SunEntity} from '@/ts/entities/sun.entity';
import {ModelHandler} from '@/ts/handlers/model.handler.ts';
import {DirectionalLight} from 'three';

export class SunController extends Controller<SunEntity> {
  protected light!: DirectionalLight;
  protected target!: ModelHandler<any>;

  public setTarget(target: ModelHandler<any>) {
    this.target = target;
  }

  public getTarget() {
    return this.target;
  }

  public setLight(light: DirectionalLight) {
    this.light = light;
  }

  public move(delta: number, cut = false) {
    super.move(delta);
    if (this.target && this.light) {
      const object = this.target.getObject();
      this.light.lookAt(object.position);
    }
  }
}
