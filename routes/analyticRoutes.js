const express = require("express");
const {getUserAnalytics, getUserWithStats, searchTasks} = require("../controllers/analyticsController");
const router = express.Router();

router.get("/users/:id", getUserAnalytics)
router.get("/users", getUserWithStats)
router.get("/tasks/search", searchTasks)
module.exports = router