//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useUnifiedTopology: true, useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.route("/login")

  .get(function(req, res){
  res.render("login");
})

  .post(function(req, res){
      const username = req.body.username;
      const password = md5(req.body.password);

      User.findOne({email: username}, function(err, foundUser){
      if(err) {
        console.log(err);
      } else {
        if(foundUser) {
          if (foundUser.password === password) {
            res.render("secrets");
            console.log(foundUser.password);
          }
          else {
            console.log("wrong password " + password);
          }
        } else {
          console.log("wrong user " + username);
        }
      }
    });
  });

app.route("/register")

  .get(function(req, res){
  res.render("register");
})

  .post(function(req, res) {
    const newUser = new User({
      email: req.body.username,
      password: md5(req.body.password)
    });

    newUser.save(function(err){
      if(!err) {
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  });







app.listen(3000, function() {
  console.log("Server started on port 3000");
});
