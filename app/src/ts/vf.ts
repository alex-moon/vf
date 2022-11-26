import {View} from "@/ts/view";
import {World} from "@/ts/world";
import {Physics} from "@/ts/physics";

export class Vf {
  private world: World;
  private view: View;
  private physics: Physics;

  public constructor() {
    this.view = new View();
    this.physics = new Physics();
    this.world = new World(this.view, this.physics);
  }

  public init($element: HTMLDivElement) {
    this.world.init($element);
  }

  public resize() {
    this.world.resize();
  }
}
