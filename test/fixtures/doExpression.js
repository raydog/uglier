var a = do {
  if (Math.random() > 0.5) {
    console.log("50%")
  } else if (Math.random() > 0.5) {
    console.log("25%");
  } else {
    console.log("25% (again)")
  }
};

console.log(a);