import("some-library")
  .then(module => {
    module.default();
    module.otherThing();
  });
