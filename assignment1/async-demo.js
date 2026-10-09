const fs = require("fs");
const path = require("path");

// Write a sample file for demonstration
fs.writeFileSync("./sample-files/sample.txt", "Hello, async world!");

// 1. Callback style
fs.readFile("./sample-files/sample.txt", "utf8", (err, content) => {
  if (err) {
    console.log("File read failed", err.message);
  }
  console.log("File content", content);
});

// Callback hell example (test and leave it in comments):
function storeTrip(user, callback) {
  return storeDistance("5km", "Costco");
}

function storeDistance(user, distance, store) {
  return itemsBrought(["Water", "Sushi", "Broccoli"]);
}

function itemsBrought(items) {
  return `Iwent to the store and bought ${items.join(",")}.`;
}

console.log(storeTrip)
// 2. Promise style
function readTextFile() {
  return new Promise((resolve, reject) => {
    fs.readFile("./sample-files/sample.txt", "utf8", (err, content) => {
      if (err) {
        reject(err);
        return;
      }
      console.log("File content - promise style", content);
      resolve(content);
    });
  });
}

readTextFile();

// 3. Async/Await style
async function readAsyncText() {
  const { promisify } = require("util");
  const readFile = promisify(fs.readFile);
  try {
    const content = await readFile("./sample-files/sample.txt", "utf8");
    console.log("Async code", content);
  } catch (err) {
    console.log(err.message);
  }
}
readAsyncText();
