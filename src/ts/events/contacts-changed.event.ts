import {Contact} from "@/ts/helpers/contacts.helper";

export class ContactsChangedEvent {
  on: Contact[];
  off: Contact[];

  constructor(on: Contact[], off: Contact[]) {
    this.on = on;
    this.off = off;
  }
}
