const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const { pool } = require("../db/pg-pool");

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

async function register(req, res) {
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }
  let result = null;
  value.hashed_password = await hashPassword(value.password);
  // the code to here is like the in-memory version
  try {
    result = await pool.query(
      `INSERT INTO users (email, name, hashed_password)
      VALUES ($1, $2, $3) RETURNING id, email, name`,
      [value.email, value.name, value.hashed_password],
    ); // note that you use a parameterized query
    global.user_id =result.rows[0].id
  } catch (e) {
    // the email might already be registered
    if (e.code === "23505") {
      return res.status(400).json({
        message: "Cannot register"
      })
    }
    return next(e); // all other errors get passed to the error handler
  }
  // otherwise user now contains the new user.  You can return a 201 and the appropriate
  // object.  Be sure to also set global.user_id with the id of the user record you just created.
  return res.status(201).json({
    name: result.rows[0].name,
    email: result.rows[0].email,
  });
}

async function logon(req, res) {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Email and/or password not found" });
  }
  const goodCredentials =
    result.rows[0] && (await comparePassword(password, result.rows[0].hashed_password));
  if (!goodCredentials) {
    return res.status(401).json({
      message: "Email/Password not correct",
    });
  }
  global.user_id = result.rows[0].id;
  res.status(200).json({
    name: result.rows[0].name,
    email: result.rows[0].email,
  });
}

function logoff(req, res) {
  global.user_id = null;
  res.status(200).send();
}

module.exports = { register, logon, logoff };
