const { sanitize } = require("express-xss-sanitizer");
const {taskSchema, patchTaskSchema} = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

function create(req, res) {
  if(!req.body) req.body = {};

  const {error,value} = taskSchema.validate(req.body, {
    abortEarly: false
  })
  if(error) {
    return res.status(400).json({
      message: "Cannot create account"
    })
  }
  const newTask = {
    id: taskCounter(),
    userId: global.user_id.email,
    ...value
  }
  global.tasks.push(newTask);
  const {userId, ...sanitizedTask} = newTask;

  return res.status(201).json(newTask)
}

function index(req, res) {
  const tasks = global.tasks.filter(task => task.userId === global.user_id.email);
  if(!tasks.length) {
    return res.status(404).json({
      message: "No tasks available"
    })
  }
  const sanitizedTasks = tasks.map(task => {
    const {userId, sanitizedTask} = task;
    return sanitizedTask
  })
  return res.status(200).json(sanitizedTasks);
}

function show(req, res) {
  const taskId = parseInt(req.params?.id);
  if(!taskId) {
    return res.status(400).json({
      message: "Task Id is not valid"
    })
  }

  const task = global.tasks.find(task => task.id === taskId && task.userId === global.user_id.email);
  if(!task) {
    return res.status(404).json({
      message: "No matching task found"
    })
  }
  const {userId, sanitizedTask} = task
  return res.status(200).json(sanitizedTask)
}
