const {userSchema} = require("../validation/userSchema")


function register(req, res) {
  const {error, value} = userSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {
    return res.status(400).json({
      message: "Cannot register"
    })
  }  

  const {name, email, password} = value;
  const user = {
    name,
    email,
    password
  }
  global.users.push(user)
  global.user_id = user
  return res.status(201).json({
    name: user.name,
    email: user.email
  })
}

function logon(req, res) {
  const {email, password} = req.body;
  const user = global.users.find(user => user.email === email);
  if(!user || user.password !== password) {
    return res.status(401).json({
      message: "Email/Password not correct"
    })
  } 
  global.user_id = user
  res.status(200).json({
    name: user.name,
    email: user.email
  })
}

function logoff(req, res) {
  global.user_id = null
  res.status(200).send()
}



module.exports = {register, logon, logoff}