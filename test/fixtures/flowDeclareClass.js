//@flow

declare interface AsyncIterable {
  next(): Promise<this>;
  done(): boolean;
}

declare class AsyncLinkedList {
  next(): Promise<this>;
  done(): boolean;
}

declare class AsyncDoubleLinkedList extends LinkedList {
  prev(): Promise<this>;
}

declare class Whatever {
  static <T>(thing: T): T;
}

declare class TrailingCommas {
  a: string,
  b: number,
}
