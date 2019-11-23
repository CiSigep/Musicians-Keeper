const passport = require("passport");
const jwtConfig = require("../config/passport/jwtConfig");
const jwt = require("jsonwebtoken");
require("../config/passport/passport");

module.exports = {
  // Local Strategy Register
  registerUser: (req, res, next) => {
    passport.authenticate("register", (err, user, info) =>{
      if(err){
        console.log("Error occured: " + err);
        res.status(500).json({ message: "Internal Server Error"});
      }
      if(info !== undefined){
        console.log(info.message);
        return res.status(403).json({ message: info.message });
      }
      else
        res.status(201).json({ message: "User created." });
    })(req, res, next);
  },
  // Local Strategy Login
  loginUser: (req, res, next) => {
    passport.authenticate("login", (err, user, info) => {
      if(err){
        console.log("Error occured: " + err);
        res.status(500).json({ message: "Internal Server Error"});
      }
      if(info !== undefined){
        console.log(info.message);
        res.status(401).json({ message: info.message });
      }
      else {
        const token = jwt.sign({ id: user.id }, jwtConfig.secret, { expiresIn: 60 * 60 });
        res.status(200).json({
          auth: true,
          token,
          message: "Logged in"
        });
      }
    })(req, res, next);
  },
  // Google Strategy Authorization
  googleAuth: (req, res, next) => {
    passport.authenticate("google", {
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
      ]
    })(req, res, next);
  },
  // Google Strategy Callback
  googleCallback: (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      const token = jwt.sign({ id: user.id }, jwtConfig.secret, {
        expiresIn: 60 * 60,
      });
      res.cookie("JWT", token);
      res.redirect("/expense");
    })(req, res, next);
  }
};
