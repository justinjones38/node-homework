# Node.js Fundamentals

## What is Node.js?
Node.js is a runtime that lets you run JavaScript outside of the browser.

## How does Node.js differ from running JavaScript in the browser?
Node.js allows you to access files, environment variables. You can JavaScript on the server without running it in the browser. You do not have access to the DOM and window objects. You cannot adjust items on the webpage.

## What is the V8 engine, and how does Node use it?
V8 engine is the program reads your JS files and turns it into fast instructions for the computer.

## What are some key use cases for Node.js?
Some key use cases for Node.js is for reading files, starting a web server and using backend libraries.

## Explain the difference between CommonJS and ES Modules. Give a code example of each.
CommonJS is more of the classic way to import and export files. It use require to import files and module.exports to export a file. ES Modules is the more modern way of importing and exporting files. It is used commonly to import and export components

**CommonJS (default in Node.js):**
```js
// Exporting files
module.exports = {add, multiply}

// Importing files
const {add, multiply} = require("./utils.js")
```

**ES Modules (supported in modern Node.js):**
```js
// Exporting files
export {add, multiply}
// Importing files
import {add, multiply} from "./utils.js"
``` 