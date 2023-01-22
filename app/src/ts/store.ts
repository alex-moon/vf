import {OreStore} from "@/ts/stores/ore.store";
import {MessageStore} from "@/ts/stores/message.store";

type StoreType = OreStore|MessageStore;
type StoreField = 'ore'|'message';

export class Store {
  public ore !: OreStore;
  public message !: MessageStore;

  public register(field: StoreField, obj: StoreType) {
    (this as any)[field] = obj;
  }
}
