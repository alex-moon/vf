import {Ui} from "@/ts/ui/ui";
import {World} from "@/ts/world";

export class HudUi extends Ui {
  protected $name!: HTMLDivElement;

  constructor($parent: HTMLDivElement) {
    super($parent);
    this.$name = this.makeDiv(144, 17, 420, 16);
    this.$name.style.fontSize = '16px';
    this.$name.style.lineHeight = '8px';
    this.$name.style.fontFamily = 'pixelmix';
    this.$name.style.color = 'white';
    this.$el.appendChild(this.$name);
  }

  protected makeEl() {
    const $el = this.makeDiv(21, 21, 579, 121);
    $el.style.backgroundImage = 'url(/hud.png)';
    return $el;
  }

  public draw(world: World) {
    this.$name.innerText = world.getAsteroid()?.getCube()?.name || '???';
  }
}
