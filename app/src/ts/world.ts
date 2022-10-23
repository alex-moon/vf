import {JackEntity} from "@/ts/entities/jack.entity";
import {JackController} from "@/ts/controllers/jack.controller";
import {BoxController} from "@/ts/controllers/box.controller";
import {BoxEntity} from "@/ts/entities/box.entity";
import {View} from "@/ts/view";
import {Controller} from "@/ts/controllers/controller";
import {ModelController} from "@/ts/controllers/model.controller";
import {Vector3} from "three";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";

export class World {
  protected view: View;
  protected controllers: Controller<any>[] = [];
  protected floor!: BoxController;
  protected jack!: JackController;

  constructor(view: View) {
    this.view = view;
    this.view.setWorld(this);
  }

  public init() {
    this.loadFloor();
    this.loadJack();
  }

  public getTarget() {
    if (this.jack) {
      const model = this.jack.getModel();
      if (model) {
        return model.scene.position;
      }
    }
    return new Vector3(0, 1, 0);
  }

  protected loadJack() {
    this.jack = new JackController(new JackEntity());
    this.controllers.push(this.jack);
    this.view.load(this.jack);
  }

  protected loadFloor() {
    this.floor = new BoxController(new BoxEntity(
      '/floor.png',
      1000,
      0,
      1000
    ));
    this.controllers.push(this.floor);
    this.view.load(this.floor);
  }

  public onKeysChanged($event: KeysChangedEvent) {
    this.controllers.forEach(controller => controller.onKeysChanged($event));
  }

  public onPointerMove($event: MouseEvent) {
    this.controllers.forEach(controller => controller.onPointerMove($event));
  }

  public move(delta: number) {
    this.controllers.forEach((controller) => {
      controller.move(delta);
    });
  }
}
