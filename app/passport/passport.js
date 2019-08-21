
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';


module.exports = function (app, passport) {

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));

  passport.serializeUser(function (user, done) {
    if (user.active) {
      token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
    } else {
      token = 'inactive/error';
    }
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy({
    clientID: '104165576957785',
    clientSecret: 'b729403a8de27ac6a57b3f9df07f0cdd',
    callbackURL: "http://localhost:8000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']

  },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({ email: profile._json.email }).select('username email active password').exec(function (err, user) {
        if (err) done(err);
        if (user && user != null) {
          done(null, user);
        } else {
          done(err);
        }
      });
    }
  ));


  passport.use(new TwitterStrategy({
    consumerKey: '5unLrCeg3pRmOhf9JegzXCKYI',
    consumerSecret: 'LZXhPgZhxBHGTKfU9iuc2sW3tXkbTUc9Y79iWmURkKWkzVUIdr',
    callbackURL: "http://localhost:8000/auth/twitter/callback",
    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
  },
    function (token, tokenSecret, profile, done) {
      User.findOne({ email: profile.emails[0].value }).select('username email active password').exec(function (err, user) {
        if (err) done(err);
        if (user && user != null) {
          done(null, user);
        } else {
          done(err);
        }
      });
    }
  ));

  passport.use(new GoogleStrategy({
    clientID: '1090664983003-o780lkf8muinr4ctd56155bv8as8t5m3.apps.googleusercontent.com',
    clientSecret: 'l2nHY-E_OXjHYt6512sJ6oGR',
    callbackURL: "http://localhost:8000/auth/google/callback"
  },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({ email: profile.emails[0].value }).select('username email active password').exec(function (err, user) {
        if (err) done(err);
        if (user && user != null) {
          done(null, user);
        } else {
          done(err);
        }
      });
    }
  ));
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/googleerror' }),
    function (req, res) {
      res.redirect('/google/' + token);
    });


  app.get('/auth/twitter', passport.authenticate('twitter'));

  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/twittererror' }),
    function (req, res) {
      res.redirect('/twitter/' + token);
    });

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/facebookerror' }),
    function (req, res) {
      res.redirect('/facebook/' + token);
    });

  app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));


  return passport;
}