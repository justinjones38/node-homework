function register(req, res) {
  const {name, email, password} = req.body;
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
  
}

module.exports = {register, logon, logoff}