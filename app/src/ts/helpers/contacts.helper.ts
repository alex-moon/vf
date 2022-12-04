import {Handler} from "@/ts/handlers/handler";
import {ContactEquation} from "equations/ContactEquation";
import {Body} from "cannon-es";

export class Contact {
  readonly i: Handler<any>;
  readonly j: Handler<any>;

  public constructor(i: Handler<any>, j: Handler<any>) {
    this.i = i;
    this.j = j;
  }

  public equals(contact: Contact) {
    return this.i === contact.i && this.j === contact.j
      || this.j === contact.i && this.i === contact.j;
  }
}

export class ContactsHelper {
  static contacts: Contact[] = [];

  public static parse(contacts: ContactEquation[], handlers: Handler<any>[]) {
    const seen: Contact[] = [];
    const on: Contact[] = [];
    const off: Contact[] = [];
    for (const candidate of contacts) {
      const hi = ContactsHelper.handlerForBody(candidate.bi, handlers);
      const hj = ContactsHelper.handlerForBody(candidate.bj, handlers);
      if (hi && hj) {
        const contact = new Contact(hi, hj);
        if (!ContactsHelper.has(contact)) {
          on.push(contact);
        }
        seen.push(contact);
      }
    }
    for (const candidate of ContactsHelper.contacts) {
      if (!ContactsHelper.has(candidate, seen)) {
        off.push(candidate);
      }
    }
    ContactsHelper.contacts = seen;
    return {on, off};
  }

  private static handlerForBody(body: Body, handlers: Handler<any>[]) {
    for (const handler of handlers) {
      if (handler.getBody() === body) {
        return handler;
      }
    }
    return null;
  }

  private static has(contact: Contact, contacts ?: Contact[]) {
    if (contacts === undefined) {
      contacts = ContactsHelper.contacts;
    }
    for (const candidate of contacts) {
      if (candidate.equals(contact)) {
        return true;
      }
    }
    return false;
  }
}
