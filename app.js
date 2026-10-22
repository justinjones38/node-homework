const express = require("express");
const app = express();
const {errorHandler} = require("./middleware/error-handler")
const {notFound} = require("./middleware/not-found")

global.user_id = null
global.users = [];
global.tasks = [];

app.use(express.json());

app.use("/api/users");

app.use(notFound)
app.use(errorHandler)

app.listen(2000, () => console.log("Port running"))

module.exports = {app, server}