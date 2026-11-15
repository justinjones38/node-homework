const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const prisma = require("./db/prisma");

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
  let user = null;
  // global.user_id = result.rows[0].id;

  value.hashed_password = await hashPassword(value.password);
  // the code to here is like the in-memory version
  // Do the Joi validation, so that value contains the user entry you want.
  // hash the password, and put it in value.hashedPassword
  // delete value.password as that doesn't get stored
  try {
    user = await prisma.user.create({
      data: { name, email, hashedPassword },
      select: { name: true, email: true, id: true }, // specify the column values to return
    });
  } catch (err) {
    if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
      // send the appropriate error back -- the email was already registered
    } else {
      return next(err); // the error handler takes care of other errors
    }
  }
  // otherwise register succeeded, so set global.user_id with user.id, and do the
  // appropriate res.status().json().
  return res.status(201).json({
    name: user.name,
    email: user.email,
  });
}

async function logon(req, res) {
  const { email, password } = req.body;
  lowercaseEmail = email.toLowerCase(); // Joi validation always converts the email to lower case
  // but you don't want logon to fail if the user types mixed case
  const user = await prisma.user.findUnique({
    where: { email: lowercaseEmail },
  });
  // also Prisma findUnique can't do a case insensitive search
  if (!user) {
    return res.status(401).json({ error: "Email and/or password not found" });
  }
  const goodCredentials =
    user && (await comparePassword(password, user.hashed_password));
  if (!goodCredentials) {
    return res.status(401).json({
      message: "Email/Password not correct",
    });
  }
  global.user_id = user.id;
  res.status(200).json({
    name: user.name,
    email: user.email,
  });
}

function logoff(req, res) {
  global.user_id = null;
  res.status(200).send();
}

module.exports = { register, logon, logoff };
