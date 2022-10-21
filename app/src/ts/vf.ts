import {View} from "@/ts/view";
import {Jack} from "@/ts/entities/jack";

export class Vf {
  private view: View;
  private jack: Jack;

  public constructor(view: View) {
    this.view = view;
    this.jack = new Jack();
  }

  public init($element: HTMLDivElement) {
    this.view.init($element);
    this.view.load(this.jack);
  }
}
