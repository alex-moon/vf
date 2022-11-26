import {Ui} from "@/ts/ui/ui";
import {World} from "@/ts/world";

export class ReticleUi extends Ui {
  constructor($parent: HTMLDivElement) {
    super(
      $parent,
      $parent.offsetWidth/2 - 6,
      $parent.offsetHeight/2 + 24, // @todo where does this 24 come from?
      13,
      13
    );
    this.$el.style.backgroundImage = 'url(/reticle.png)';
  }

  draw(world: World): void {
    // don't need to do anything here or?
  }
}
