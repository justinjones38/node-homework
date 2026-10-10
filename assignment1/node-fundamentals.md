# Node.js Fundamentals

## What is Node.js?
A run tine that allows JS to run on the server. 

## How does Node.js differ from running JavaScript in the browser?
You can interact with file, environmental variables, backend services like express. But you cannot interact
with the DOM, document or window.

## What is the V8 engine, and how does Node use it?
V8 engine allows you to convert your written code into a low level language that Node can understand.

## What are some key use cases for Node.js?
You can use Node to build apps that use the command line or apps that update in real time

## Explain the difference between CommonJS and ES Modules. Give a code example of each.
CommonJs and ES Modules are both ways of importing and exporting files. The main difference is that CommonJS is mainly used for Node and ES Modules is mainly used for React and JS. ES Modules can be used for Node, but requires more setup. They also differ in the key words as shown in the example below.

**CommonJS (default in Node.js):**
```js
// Exporting files
function add(a, b) {
  return a + b
}

module.exports = {add}

// Importing files
const {add} = require("./util-files.js")
```

**ES Modules (supported in modern Node.js):**
```js
// Exporting files
function add(a, b) {
  return a + b
}

export {add}

// Importing files
import {add} from "./util-files.js"
``` 