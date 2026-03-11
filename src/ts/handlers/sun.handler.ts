import {Handler} from '@/ts/handlers/handler';
import {SunController} from '@/ts/controllers/sun.controller';
import {ModelHandler} from '@/ts/handlers/model.handler.ts';
import {DirectionalLight} from 'three';

export class SunHandler extends Handler<SunController> {
  public setTarget(target: ModelHandler<any>) {
    this.controller.setTarget(target);
  }

  public setLight(light: DirectionalLight) {
    this.controller.setLight(light);
  }

  getDescription(): string {
    return 'Sun';
  }
}
