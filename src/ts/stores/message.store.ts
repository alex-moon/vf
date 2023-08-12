export enum MessagePriority {
  LOW = -1,
  DEFAULT = 0,
  HIGH = 1,
  URGENT = 2,
}

interface Message {
  text: string,
  priority: MessagePriority,
  duration: number,
}

export class MessageStore {
  private messages: {[key in MessagePriority]: Message[]} = {
    [MessagePriority.LOW]: [],
    [MessagePriority.DEFAULT]: [],
    [MessagePriority.HIGH]: [],
    [MessagePriority.URGENT]: [],
  };

  public push(text: string, priority: MessagePriority = MessagePriority.DEFAULT, duration: number = 3) {
    const message = {text, priority, duration};
    this.messages[priority].push(message);
    setTimeout(() => {
      this.messages[priority].splice(this.messages[priority].indexOf(message), 1);
    }, duration * 1000);
  }

  public get() {
    for (const message of this.messages[MessagePriority.URGENT]) {
      return message;
    }
    for (const message of this.messages[MessagePriority.HIGH]) {
      return message;
    }
    for (const message of this.messages[MessagePriority.DEFAULT]) {
      return message;
    }
    for (const message of this.messages[MessagePriority.LOW]) {
      return message;
    }
  }
}
