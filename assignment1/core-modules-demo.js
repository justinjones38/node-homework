const os = require('os');
const path = require('path');
const fs = require('fs');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log("Platform", os.platform())
console.log("CPU", os.cpus()[0].model)
console.log("Total Memory", os.totalmem())

// Path module
console.log("Joined Path", (path.join(__filename)))


// fs.promises API
async function readPromise() {
  const { promisify } = require("util");
  const readFile = promisify(fs.readFile);
  try {
    const content = await readFile("./sample-files/demo.txt", "utf-8")
    console.log("fs.promises read:", content)
  } catch(err) {
    console.log("No file content found")
  }
}

readPromise()


// Streams for large files- log first 40 chars of each chunk
