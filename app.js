const express = require("express");
const app = express();
const pool = require("./db/pg-pool");
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

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ message: `db not connected, error: ${ err.message }` });
  }
});

const server = app.listen(2000, () => console.log("Port running"));
let isShuttingDown = false;

async function shutdown(code = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down gracefully...");

  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("HTTP server closed.");

    // Close all PostgreSQL connections after the HTTP server has stopped.
    await pool.end();
    console.log("PostgreSQL connection pool closed.");
  } catch (err) {
    console.error("Error during shutdown:", err);
    code = 1;
  } finally {
    process.exit(code);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

module.exports = { app, server, pool };
