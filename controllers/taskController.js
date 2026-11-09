const { sanitize } = require("express-xss-sanitizer");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const { pool } = require("../app");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

async function create(req, res) {
  if (!req.body) req.body = {};

  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Cannot create account",
    });
  }
  // you do your Joi validation, and you have a validated task object. Then:
  const result = await pool.query(
    `INSERT INTO tasks (title, is_completed, user_id)
  VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,
    [value.title, value.isCompleted, global.user_id],
  );
  const task = result.rows[0];
  // You don't need a try/catch because the global error handler will handle the errors
  const { user_id, ...sanitizedTask } = task;

  return res.status(201).json(sanitizedTask);
}

async function index(req, res) {
  const result = await pool.query(
    "SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
    [global.user_id],
  );
  const tasks = result.rows;

  const sanitizedTasks = tasks.map((task) => {
    const { user_id, ...sanitizedTask } = task;
    return sanitizedTask;
  });
  return res.status(200).json(sanitizedTasks);
}

async function show(req, res) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({
      message: "Task Id is not valid",
    });
  }

  const result = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1 AND task_id = $2",
    [global.user_id, id],
  );

  if (!result.rows[0]) {
    return res.status(404).json({
      message: "No matching task exist",
    });
  }
  const { user_id, ...sanitizedTask } = result.rows[0];
  return res.status(200).json(sanitizedTask);
}

async function update(req, res) {
  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Cannot validate email",
    });
  }

  const taskId = parseInt(req.params.id);
  if (!taskId) {
    return res.status(400).json({
      message: "Cannot find find task id",
    });
  }

  let keys = Object.keys(value);
  keys = keys.map((key) => (key === "isCompleted" ? "is_completed" : key));
  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const idParm = `$${keys.length + 1}`;
  const userParm = `$${keys.length + 2}`;
  const result = await pool.query(
    `UPDATE tasks SET ${setClauses}
  WHERE id = ${idParm} AND user_id = ${userParm} RETURNING id, title, is_completed`,
    [...Object.values(value), req.params.id, global.user_id],
  );
  const updatedTask = result.rows[0];

  const { user_id, ...sanitizedTask } = updatedTask;
  return res.status(200).json(sanitizedTask);
}

async function deleteTask(req, res) {
  const taskId = parseInt(req.params.id);
  if (!taskId) {
    return res.status(400).json({
      message: "Task id is not valid",
    });
  }
  const result = await pool.query(
    "DELETE() FROM tasks WHERE user_id = $1 AND task_id = $2",
    [global.user_id, taskId],
  );

  if (!result.rows[0]) {
    return res.status(404).json({
      message: "No matching task exist",
    });
  }

  const { user_id, ...sanitizedTask } = result.rows[0];

  return res.status(200).json(sanitizedTask);
}

module.exports = { create, index, show, update, deleteTask };
