const bcrypt = require("bcrypt");

const BCRYPT_SALT_ROUNDS = 10;

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../../models");

// Local Register
passport.use(
  "register",
  new LocalStrategy({
    username: "username",
    password: "password",
    passReqToCallback: true,
    session: false
  },
  (req, username, password, done) => {
    try{
      // Check if user already Exists
      db.User.findOne({ where: {username: username}}).then(user => {
        // User Exists, send an error
        if(user != null)
          return done(null, false, { message: "Username Taken"});
        
        // Hash the users password
        bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then(hash =>{
          db.User.create({
            username: username,
            password: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            address: req.body.address
          }).then(user => {
            return done(null, user);
          });
        });
      });
    } catch(err) {
      return done(err);
    }
  })
);

// Local Login
passport.use(
  "login",
  new LocalStrategy({
    username: "username",
    password: "password",
    session: false
  },
  (username, password, done) => {
    db.User.findOne({ where: {username: username}}).then(user => {
      if(user === null)
        return done(null, false, { message: "Incorrect username or password"});

      // Check the password against the hash
      bcrypt.compare(password, user.password).then(result => {
        if(result !== true)
          return done(null, false, { message: "Incorrect username or password"});

        return done(null, user);
      });
    });
  })
);

// Google Strategy
passport.use(
  "google",
  new GoogleStrategy({
    clientID: process.env.GCLIENT_ID,
    clientSecret: process.env.GCLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => {
    // Check if user already exists in the database, create if not.
    db.User.findOne({ where: { google: profile.id} }).then(user => {
      if(user)
        return done(null, user);
      else {
        db.User.create({
          username: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          google: profile.id,
          email: profile.emails[0].value
        }).then(newUser => {
          return done(null, newUser);
        });
      }
    });
  })
);