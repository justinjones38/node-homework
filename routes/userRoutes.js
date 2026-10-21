const {register, logon, logoff} = require("../controllers/userController")

app.post("/register", register)
app.post("/logon", logon)
app.post("/logoff", logoff)