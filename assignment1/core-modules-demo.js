const os = require('os');
const path = require('path');
const fs = require('fs');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log("Platform", os.platform())
console.log("CPU", os.cpus()[0].model);
console.log("Total Memory", os.totalmem());

// Path module
console.log(path.join(__dirname, "core-modules-demo.js"))

// fs.promises API
async function getSampleFile() {
  const fs = require("fs/promises")
  try {
    await fs.writeFile("sample-files/demo.txt", "Hello from fs.promises!");
    const content = await fs.readFile("sample-files/demo.txt", "utf8");
    console.log("fs.promises read", content)
  } catch(err) {
    console.log(err.message)
  }
}

getSampleFile()
// Streams for large files- log first 40 chars of each chunk
