const express = require("express")
const app = express()
const mustache = require("mustache-express")
const bodyParser = require("body-parser")
const url = require("url")
const session = require("express-session")
const users = require("./users")
app.engine("mustache", mustache())
app.set("view engine", "mustache")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: false }))

var sess = {
  secret: "keyboard cat",
  cookie: {},
  saveUninitialized: true,
  resave: true
}
app.use(session(sess))

app.use(function(req, res, next) {
  if (!req.session.pageLoads) {
    req.session.pageLoads = 0
  }
  req.session.pageLoads += 1
  next()
})

app.get("/", function(req, res) {
  req.session.authorized = false
  res.redirect("/login")
})

app.get("/login", function(req, res) {
  res.render("login", {
  })
})

app.post("/authorization", function(req, res) {

  const username = req.body.username
  const password = req.body.password
  const pageLoads = req.session.pageLoads

  let user
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
        user = users[i]
    }
  } if (user) {
    req.session.user = user
    req.session.authorized = true
    res.redirect("/index")
  } else {
    res.render("login", {
      pageLoads: "You have tried to log in " + pageLoads + " times.",
      errorMessage : "You are not worthy, FOOL!"
    })
  }
})

app.use(function(req, res, next) {
  req.user = req.session.user
  next()
})



app.get("/index", function (req, res, next){
  const name = req.user
  res.render("index", {
    name: name,
  })
})

app.get("/logout", function (req, res, next){
  req.session.authorized = false
  res.redirect("/login")
})

app.listen(3000, function() {
  console.log("Listening on port 3000")
})
