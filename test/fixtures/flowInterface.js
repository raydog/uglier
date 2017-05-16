//@flow

interface DoesThings {
  derp(): string;
  -world: boolean;
}

interface DoesOtherThings {
  lol(): number,
  +pi: number,
  hello: boolean,
}

interface IntA<T> {
  blah(): T
}
interface JustTaggingAlong extends DoesThings<string> {
  derp(): boolean;
}

class Lol implements DoesThings, DoesOtherThings, IntA<number> {
  derp(): string {
    return String(this.lol());
  }
  lol(): number {
    return Date.now() * Math.random();
  }
  blah(): number {
    return (Math.random() * 50) | 0;
  }
  pi = Math.PI;
  hello = true;
  world = false;
}

var a:DoesThings = new Lol();
exports.a = a;
