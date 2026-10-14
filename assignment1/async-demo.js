const fs = require('fs');
const path = require('path');


// Write a sample file for demonstration
fs.writeFileSync("sample-files/sample.txt", "Hello, async world!")
// 1. Callback style
fs.readFile("sample-files/sample.txt", "utf8", (err, content) => {
  if(err) {
    console.log("Error opening file", err.message)
  } else {
    console.log("Callback style: ", content);
  }
})


  // Callback hell example (test and leave it in comments):
  // fs.readFile("file1.txt", "utf8", (err, content) => {
  // if(err) {
  //   console.log("Error opening file", err.message)
  // } else {
  //   fs.readFile("file2.txt", "utf8", (err2, content2) => {
  //     if(err2) {
  //       console.log("Error opening file", err2.message)
  //     }
  //     else {
  //       fs.readFile("file3.text", "utf8", (err3, content3) => {
  //         if(err3) {
  //           console.log("error opening file", err3.message)
  //         }
  //       })
  //     }
  //   })
  // }
  // })

  // 2. Promise style
  function readFile() {
    return new Promise((resolve, reject) => {
      fs.readFile("sample-files/sample.txt", "utf8", (err, content) => {
        if(err) {
          reject(err.message)
        }
        resolve(content)
      })
    })
    .then(value => console.log("Promise Style:", value))
    .catch(err => console.log(err))
  }

  readFile()


      // 3. Async/Await style
    function readNewFile() {
      return new Promise((resolve, reject) => {
        fs.readFile("sample-files/sample.txt", "utf8", (err, content) => {
          if(err) {
            reject(err.message)
          }
          resolve(content)
        })
      })
    }

    async function getFileRead() {
      try {
        const content = await readNewFile();
        console.log("Async-Await:", content)
      } catch(err) {
        console.log(err.message)
      }
    }
  
getFileRead()