import {View} from "@/ts/view";
import {World} from "@/ts/world";
import {Physics} from "@/ts/physics";

export class Vf {
  private repository: World;
  private view: View;
  private physics: Physics;

  public constructor() {
    this.view = new View();
    this.physics = new Physics();
    this.repository = new World(this.view, this.physics);
  }

  public init($element: HTMLDivElement) {
    this.repository.init($element);
  }
}
