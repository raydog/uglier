var i;
switch (true) {}
switch(0) {
  case i%2: console.log(2); break;
  case i%3: console.log(3); break;
  case i%4: console.log(4); break;
  default: console.log("?");
}
function lol(x) {
  switch (x) { 
    case "foo": return "foo";
    case "bar": return "bar";
    default: return "other";
  }
}
switch(i%4) {
  case 0: i++;
  case 1: i++;
  case 2: i++;
  case 3: i++;
}
switch (lol("something else").slice(2)) {
  case "o":
    i = 0;
    console.log("Was foo");
    break;
  
  case "r":
    i = 1;
    console.log("Was bar");
    break;
  
  case "her":
    i = 2;
    console.log("Was other");
    break;
  
  default:
    i = -1;
    console.log("UNKNOWN");
    break;
}