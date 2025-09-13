// ####### ONLY FOR INTERN GOOGLE AUTH ########

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserIntern = require("../models/userIntern"); // ✅ Import schema

passport.serializeUser((user, done) => {
  done(null, user.id); // store MongoDB _id, not the whole object
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserIntern.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
// In google.js (or your main passport config file)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // ✅ CORRECTED: Use the full, absolute URL
      callbackURL: "http://localhost:5000/auth/google/intern/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by googleId
        let user = await UserIntern.findOne({ googleId: profile.id });

        if (user) {
          // User exists, log them in
          return done(null, user);
        }

        // If no user found, create a new one
        const newUser = new UserIntern({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails?.[0]?.value, // Safely access email
          provider: "google",
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        console.error("❌ Google Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);