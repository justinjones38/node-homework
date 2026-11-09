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
  const newTask = {
    id: taskCounter(),
    userId: global.user_id.email,
    ...value,
  };
  global.tasks.push(newTask);
  // you do your Joi validation, and you have a validated task object. Then:
  const result = await pool.query(
    `INSERT INTO tasks (title, is_completed, user_id)
  VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,
    [value.title, value.isCompleted, global.user_id],
  );
  const task = result.rows[0];
  // You don't need a try/catch because the global error handler will handle the errors

  const { userId, ...sanitizedTask } = newTask;

  return res.status(201).json(sanitizedTask);
}

async function index(req, res) {
  const result = await pool.query(
    "SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
    [global.user_id],
  );
  const tasks = result.rows;

  const sanitizedTasks = tasks.map((task) => {
    const { userId, ...sanitizedTask } = task;
    return sanitizedTask;
  });
  return res.status(200).json(sanitizedTasks);
}

function show(req, res) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({
      message: "Task Id is not valid",
    });
  }

  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );
  if (!task) {
    return res.status(404).json({
      message: "No matching task found",
    });
  }
  const { userId, ...sanitizedTask } = task;
  return res.status(200).json(sanitizedTask);
}

function update(req, res) {
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

  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );
  if (!task) {
    return res.status(404).json({
      message: "No matching task found",
    });
  }

  Object.assign(task, value);

  const { userId, ...sanitizedTask } = task;
  return res.status(200).json(sanitizedTask);
}

function deleteTask(req, res) {
  const taskId = parseInt(req.params.id);
  if (!taskId) {
    return res.status(400).json({
      message: "Task id is not valid",
    });
  }
  const index = global.tasks.findIndex(
    (task) => taskId === task.id && task.userId === global.user_id.email,
  );
  if (index === -1) {
    return res.status(404).json({
      message: "No matching task exist",
    });
  }

  const { userId, ...sanitizedTask } = global.tasks[index];

  global.tasks.splice(index, 1);

  return res.status(200).json(sanitizedTask);
}

module.exports = { create, index, show, update, deleteTask };
