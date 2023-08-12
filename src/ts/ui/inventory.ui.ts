import {Ui} from "@/ts/ui/ui";
import {World} from "@/ts/world";
import {OreStore} from "@/ts/stores/ore.store";
import {TextureHelper} from "@/ts/helpers/texture.helper";
import {StringHelper} from "@/ts/helpers/string.helper";
import {OreType} from "@/ts/enums/ore-type";

export class InventoryUi extends Ui {
  protected $items!: HTMLDivElement;
  protected values: {[key: string]: HTMLDivElement} = {};

  protected store: OreStore;

  constructor($parent: HTMLDivElement, store: OreStore) {
    super($parent, 21, $parent.offsetHeight - 21 - 132, 121, 132);

    this.store = store;

    this.$el.style.backgroundImage = 'url(/inventory.png)';

    this.$items = this.makeDiv(15, 15, 91, 102);
    this.$items.style.fontSize = '16px';
    this.$items.style.fontFamily = 'pixelmix';
    this.$items.style.color = 'white';

    let i = 0;
    for (const [key, value] of this.store.iterate()) {
      const $item = this.makeDiv(0, i * 27, 91, 22);
      const $key = this.makeDiv(0, 0, 22, 22);
      $key.style.backgroundImage = 'url(' + TextureHelper.get(key as string) + ')';
      $key.style.backgroundPosition = 'center';
      $key.style.backgroundRepeat = 'no-repeat';
      $key.style.textAlign = 'center';
      $key.style.lineHeight = '18px';
      $key.style.paddingLeft = '2px';
      $key.innerText = (key as string)[0].toUpperCase();
      const $value = this.makeDiv(27, 0, 64, 22);
      $value.style.textAlign = 'right';
      $value.style.lineHeight = '18px';
      $item.appendChild($key);
      $item.appendChild($value);
      this.values[key as OreType] = $value;
      this.$items.appendChild($item);
      i++;
    }

    this.$el.appendChild(this.$items);
  }

  public draw(world: World) {
    this.drawItems();
  }

  protected drawItems() {
    for (const [key, value] of this.store.iterate()) {
      this.values[key].innerText = StringHelper.formatNumber(value as number);
    }
  }
}
