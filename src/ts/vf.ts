import {View} from "@/ts/view";
import {World} from "@/ts/world";
import {Physics} from "@/ts/physics";
import {Store} from "@/ts/store";
import {OreStore} from "@/ts/stores/ore.store";
import {MessageStore} from "@/ts/stores/message.store";

export class Vf {
  private world: World;
  private view: View;
  private physics: Physics;
  private store: Store;

  public constructor() {
    this.view = new View();
    this.physics = new Physics();

    // store
    this.store = new Store();
    this.store.register('ore', new OreStore());
    this.store.register('message', new MessageStore());

    this.world = new World(this.view, this.physics, this.store);
  }

  public init($element: HTMLDivElement) {
    this.world.init($element);
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  public resize() {
    this.world.resize();
  }
}
