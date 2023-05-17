const dbInterface=require('./usersDbInterface')
// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const express = require('express');
const morgan = require('morgan');

module.exports.useApi = function useApi(app){

  // Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const user = await dbInterface.getUser(username, password);
    if (!user){
        return cb(null, false, 'Incorrect username or password.');
    }
    return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
    return cb(null, user);
    // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

  const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
      return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
  }

app.use(session({
    secret: "This is a secret.",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.authenticate('session'));

/* If we aren't interested in sending error messages... */
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).send(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);

        // req.user contains the authenticated user, we send all the user info back
        return res.status(201).json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    }
    else{
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        res.end();
    });
});

}
