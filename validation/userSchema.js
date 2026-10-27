const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().trim().lowercase().email(),
  name: Joi.string().required().trim().min(3).max(30),
  password: Joi.string().required()
    .pattern(/^ (?=.*[A-Z]) (?=.*[a-z]) (?=.*\d) (?=.*[^a-zA-Z0-9]) .+$/)
})

module.exports = {userSchema}

