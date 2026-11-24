const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const prisma = require("../db/prisma");

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

async function register(req, res, next) {
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }
  let user = null;

  value.hashed_password = await hashPassword(value.password);
  // the code to here is like the in-memory version
  // Do the Joi validation, so that value contains the user entry you want.
  // hash the password, and put it in value.hashedPassword
  // delete value.password as that doesn't get stored
  // In your register method, after validation and password hashing:
  // Do the Joi validation, so that value contains the user entry you want.
  // hash the password, and put it in value.hashedPassword
  // delete value.password as that doesn't get stored
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create user account (similar to Assignment 6, but using tx instead of prisma)
      const newUser = await tx.user.create({
        data: { email: value.email, name: value.name, hashedPassword: value.hashed_password },
        select: { id: true, email: true, name: true },
      });

      // Create 3 welcome tasks using createMany
      const welcomeTaskData = [
        {
          title: "Complete your profile",
          userId: newUser.id,
          priority: "medium",
        },
        { title: "Add your first task", userId: newUser.id, priority: "high" },
        { title: "Explore the app", userId: newUser.id, priority: "low" },
      ];
      await tx.task.createMany({ data: welcomeTaskData });

      // Fetch the created tasks to return them
      const welcomeTasks = await tx.task.findMany({
        where: {
          userId: newUser.id,
          title: { in: welcomeTaskData.map((t) => t.title) },
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
          userId: true,
          priority: true,
        },
      });

      return { user: newUser, welcomeTasks };
    });

    // Store the user ID globally for session management (not secure for production)
    global.user_id = result.user.id;

    // Send response with status 201
    res.status(201);
    res.json({
      user: result.user,
      welcomeTasks: result.welcomeTasks,
      transactionStatus: "success",
    });
    return;
  } catch (err) {
    if (err.code === "P2002") {
      // send the appropriate error back -- the email was already registered
      return res.status(400).json({ error: "Email already registered" });
    } else {
      return next(err); // the error handler takes care of other errors
    }
  }
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
    user && (await comparePassword(password, user.hashedPassword));
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
