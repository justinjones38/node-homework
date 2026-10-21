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