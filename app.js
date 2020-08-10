//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
///use session
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

//use passport
app.use(passport.initialize());
//use passport for dealing with the session --> passport documentation
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  if(req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.render("home");
  }
});

app.route("/login")

  .get(function(req, res){
  res.render("login");
})

  .post(function(req, res){
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err){
      if(err){
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  });

app.route("/register")

  .get(function(req, res){
  res.render("register");
})

  .post(function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  });

  app.get("/secrets", function(req, res){
    if(req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  });

  app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });







app.listen(3000, function() {
  console.log("Server started on port 3000");
});
