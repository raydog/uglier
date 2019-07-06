const blah = "blah1234567890";

type Foo = {
  (a: number): string;
};

type Bar = {
  [blah]: string,
  (b?: boolean): void
};

interface StaticCallProp {
  foo(c: boolean): void;
}
