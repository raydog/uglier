// Taken from prettier test suite, but with flow types removed:

async function* readLines(path) {
  let file = await fileOpen(path);

  try {
    while (!file.EOF) {
      yield await file.readLine();
    }
  } finally {
    file.close();
  }
}

async function f() {
  for await (const line of readLines("/path/to/file")) {
    console.log(line);
  }
}
