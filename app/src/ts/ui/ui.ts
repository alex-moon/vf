import {World} from "@/ts/world";

export abstract class Ui {
  protected $el!: HTMLDivElement;

  constructor($parent: HTMLDivElement) {
    this.$el = this.makeEl();
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
    return div;
  }

  protected abstract makeEl(): HTMLDivElement;
  public abstract draw(world: World): void;
}
