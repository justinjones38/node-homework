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

