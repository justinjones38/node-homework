const { sanitize } = require("express-xss-sanitizer");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");

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

  const task = await prisma.task.create({
    data: {
      title: value.title,
      isCompleted: value.isCompleted,
      userId: global.user_id,
    },
    select: { id: true, title: true, isCompleted: true }, // specify the column values to return
  });
  // You don't need a try/catch because the global error handler will handle the errors
  const { user_id, ...sanitizedTask } = task;

  return res.status(201).json(sanitizedTask);
}

async function index(req, res) {
  const whereClause = { userId: global.user_id };

  if (req.query.find) {
    whereClause.title = {
      contains: req.query.find, // Matches %find% pattern
      mode: "insensitive", // Case-insensitive search (ILIKE in PostgreSQL)
    };
  }

  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get tasks with pagination and eager loading
  const tasks = await prisma.task.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      isCompleted: true,
      priority: true,
      createdAt: true,
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    skip: skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  // Get total count for pagination metadata
  const totalTasks = await prisma.task.count({
    where: whereClause,
  });

  // Build pagination object with complete metadata
  // Hint: The test expects page, limit, total, pages, hasNext, hasPrev
  // Use Math.ceil() to calculate pages, and compare page * limit with total for hasNext
  const pagination = {
    // ... you need to build this object
    page,
    limit,
    total: totalTasks,
    pages: Math.ceil(totalTasks / limit),
    hasNext: page * limit < totalTasks,
    hasPrev: page > 1,
  };

  if (!tasks) {
    return res.status(404).json({
      message: "No tasks available",
    });
  }

  const sanitizedTasks = tasks.map((task) => {
    const { user_id, ...sanitizedTask } = task;
    return sanitizedTask;
  });
  // return res.status(200).json(sanitizedTasks);
  // Return tasks with pagination information
  res.status(200).json({
    // ... you need to return tasks and pagination
    tasks: sanitizedTasks,
    pagination,
  });
}

async function show(req, res) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({
      message: "Task Id is not valid",
    });
  }

  const task = await prisma.task.findUnique({
    where: { userId: global.user_id, id: taskId },
  });

  if (!task) {
    return res.status(404).json({
      message: "No matching task exist",
    });
  }
  const { user_id, ...sanitizedTask } = task;
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
  // assuming that value contains the validated change coming back from Joi, and that
  // you have a valid req.params.id:
  try {
    const task = await prisma.task.update({
      data: value,
      where: {
        id: taskId,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, id: true },
    });
    const updatedTask = task;
    if (!updatedTask) {
      return res.status(404).json({
        message: "No matching task exist",
      });
    }

    const { user_id, ...sanitizedTask } = updatedTask;
    return res.status(200).json(sanitizedTask);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      return next(err); // pass other errors to the global error handler
    }
  }
}

async function deleteTask(req, res) {
  try {
    const taskId = parseInt(req.params.id);
    if (!taskId) {
      return res.status(400).json({
        message: "Task id is not valid",
      });
    }
    const task = await prisma.task.delete({
      where: { userId: global.user_id, id: taskId },
    });
    const { user_id, ...sanitizedTask } = task;

    return res.status(200).json(sanitizedTask);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "No matching task exist",
      });
    }
    return res.status(400).json({
      message: "Error",
    });
  }
}

const getOrderBy = (query) => {
  const validSortFields = [
    "title",
    "priority",
    "createdAt",
    "id",
    "isCompleted",
  ];
  const sortBy = query.sortBy || "createdAt";
  const sortDirection = query.sortDirection === "asc" ? "asc" : "desc";

  if (validSortFields.includes(sortBy)) {
    return { [sortBy]: sortDirection };
  }
  return { createdAt: "desc" }; // default fallback
};

// Use in your findMany query
const tasks = await prisma.task.findMany({
  where: whereClause,
  // ... other options
  orderBy: getOrderBy(req.query),
});

// Bulk create with validation
const bulkCreate = async (req, res, next) => {
  const { tasks } = req.body;

  // Validate the tasks array
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({
      error: "Invalid request data. Expected an array of tasks.",
    });
  }

  // Validate all tasks before insertion
  const validTasks = [];
  for (const task of tasks) {
    const { error, value } = taskSchema.validate(task);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }
    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted || false,
      priority: value.priority || "medium",
      userId: global.user_id,
    });
  }

  // Use createMany for batch insertion
  try {
    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false,
    });

    res.status(201).json({
      message: "success!",
      tasksCreated: result.count,
      totalRequested: validTasks.length,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, index, show, update, deleteTask, bulkCreate};
