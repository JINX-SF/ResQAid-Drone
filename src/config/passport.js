const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: FacebookStrategy } = require("passport-facebook");

const User = require("../models/User");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
          return done(null, false, {
            message: "No account found with that email",
          });
        }

        if (!user.password) {
          return done(null, false, {
            message: "This account uses Google or Facebook login. Please sign in that way.",
          });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        if (!user.isVerified) {
          return done(null, false, {
            message: "Please verify your email before logging in",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        /*callbackURL: "/api/auth/google/callback",*/
        callbackURL: "http://localhost:5000/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase() || null;
          const name = profile.displayName || "Google User";

          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }

          if (email) {
            user = await User.findOne({ email });

            if (user) {
              user.googleId = profile.id;
              user.isVerified = true;
              await user.save();
              return done(null, user);
            }
          }

          if (!email) {
            return done(null, false, {
              message: "Google account did not provide an email address",
            });
          }

          user = await User.create({
            name,
            email,
            googleId: profile.id,
            provider: "google",
            isVerified: true,
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        /*callbackURL: "/api/auth/facebook/callback",*/
        callbackURL: "http://localhost:5000/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase() || null;
          const name = profile.displayName || "Facebook User";

          let user = await User.findOne({ facebookId: profile.id });
          if (user) {
            return done(null, user);
          }

          if (email) {
            user = await User.findOne({ email });

            if (user) {
              user.facebookId = profile.id;
              user.isVerified = true;
              await user.save();
              return done(null, user);
            }
          }

          if (!email) {
            return done(null, false, {
              message: "Facebook account did not provide an email address",
            });
          }

          user = await User.create({
            name,
            email,
            facebookId: profile.id,
            provider: "facebook",
            isVerified: true,
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;