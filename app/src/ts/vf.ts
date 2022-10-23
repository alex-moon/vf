import {View} from "@/ts/view";
import {World} from "@/ts/world";

export class Vf {
  private world: World;
  private view: View;

  public constructor() {
    this.view = new View();
    this.world = new World(this.view);
  }

  public init($element: HTMLDivElement) {
    this.view.init($element);
  }
}
