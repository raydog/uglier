//@flow

class SomethingElse {
  derp: ?string;
}

class SomethingGeneric<T> {
  blah: ?T;
}

class SomethingElseGeneric<S> extends SomethingGeneric<S> {
  derp: Array<S>;
}
