const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/userModel');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

// Google Strategy
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        user = await new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id
        }).save();
      }

      done(null, user);
    } catch (err) {
      done(err, null);  // Properly handle errors
    }
  })
);


// GitHub Strategy
passport.use(
    new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/github/callback`,
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
         const currentUser = await User.findOne({ githubId: profile.id });
         if (currentUser) {
            return done(null, currentUser);
        }

        const newUser = await new User({
            name: profile.displayName || profile.username,
            email: profile.emails[0].value,
            githubId: profile.id
        }).save();
        done(null, newUser);
    })
);