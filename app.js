const express = require("express");
const app = express();
const authMiddleware = require("./middleware/auth");
const taskRouter = require("./routes/taskRoutes");
const router = require("./routes/userRoutes");
const { errorHandler } = require("./middleware/error-handler");
const { notFound } = require("./middleware/not-found");

global.user_id = null;
global.users = [];
global.tasks = [];

app.use(express.json());

app.use("/api/users", router);
app.use("/api/tasks", authMiddleware, taskRouter)

app.use(notFound);
app.use(errorHandler);

const server = app.listen(2000, () => console.log("Port running"));

module.exports = { app, server };
