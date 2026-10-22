const {register, logon, logoff} = require("../controllers/userController")
const {app} = require("../app") 

app.post("/register", register)
app.post("/logon", logon)
app.post("/logoff", logoff)