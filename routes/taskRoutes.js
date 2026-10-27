const express = require("express");
const {create, index, show, update, deleteTask} = require("../controllers/taskController");

const router = express.Router();

router.post("/api/tasks", create);
router.get("/api/tasks", index);
router.get("/api/tasks/:id", show);
router.patch("/api/tasks/:id", update);
router.delete("/api/tasks/:id", deleteTask);
