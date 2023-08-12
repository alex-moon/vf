import {World} from "@/ts/world";

export abstract class Ui {
  protected $el!: HTMLDivElement;

  constructor($parent: HTMLDivElement, left = 0, top = 0, width = 0, height = 0) {
    if (width === 0) {
      width = $parent.offsetWidth;
    }
    if (height === 0) {
      height = $parent.offsetHeight;
    }
    this.$el = this.makeDiv(left, top, width, height);
    $parent.appendChild(this.$el);
  }

  protected makeDiv(left: number, top: number, width: number, height: number) {
    const div = document.createElement('div');
    div.style.pointerEvents = 'none';
    div.style.position = 'absolute';
    div.style.top = top + 'px';
    div.style.left = left + 'px';
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.zIndex = '10000';
    div.style.overflow = 'hidden';
    return div;
  }

  public resize(width: number, height: number) {
    // implement in children if necessary
  }

  public abstract draw(world: World): void;
}
