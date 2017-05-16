//@flow

class Stupid {
  returnsString(): string {
    return "Oh, Hi";
  }
  takesNumber(x: number): number {
    return x * Date.now() * Math.random();
  }
  ohBoyGeneric<T>(x: T, num: number): T[] {
    return Array(num).fill(x);
  }
}

var alsoObjectMethods = {
  returnsBool(): boolean {
    return Math.random() < 0.5;
  },
  takesArray(x: Array<number>): number {
    return x.reduce((a,b) => a | b, 0);
  },
  anotherGeneric<T>(x: T, name: string): { [string]: T, currentTime: number } {
    return { [name]: x, currentTime: Date.now() };
  }
};
