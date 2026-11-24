const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).required(),
  isCompleted: Joi.boolean().default(false).not(null),
  priority: Joi.string().valid("low", "medium", "high").default("medium").not(null)
})

const patchTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30),
  isCompleted: Joi.boolean().not(null),
  priority: Joi.string().valid("low", "medium", "high").default("medium").not(null)
}).min(1)

module.exports = {taskSchema, patchTaskSchema}