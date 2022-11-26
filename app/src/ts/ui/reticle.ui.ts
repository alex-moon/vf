import {Ui} from "@/ts/ui/ui";
import {World} from "@/ts/world";

export class ReticleUi extends Ui {
  constructor($parent: HTMLDivElement) {
    super(
      $parent,
      $parent.offsetWidth/2 - 6,
      $parent.offsetHeight/2 - 6,
      13,
      13
    );
    this.$el.style.backgroundImage = 'url(/reticle.png)';
  }

  public resize(width: number, height: number) {
    this.$el.style.left = (width / 2 - 6) + 'px';
    this.$el.style.top = (height / 2 - 6) + 'px';
  }

  draw(world: World): void {
    // don't need to do anything here or?
  }
}
