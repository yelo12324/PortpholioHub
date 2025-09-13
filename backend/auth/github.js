// In github.js (or your main passport config file)

const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const UserIntern = require("../models/userIntern"); // Assuming userIntern model is correct

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // ✅ CORRECTED to use port 5000
      callbackURL: "http://localhost:5000/api/auth/callback/github", 
      scope: ['user:email'] // It's good practice to request scope here
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          // Handle case where email is private on GitHub
          return done(new Error("Email not available from GitHub."), null);
        }

        // Find user by githubId first
        let user = await UserIntern.findOne({ githubId: profile.id });

        if (user) {
          return done(null, user); // User exists, log them in
        }

        // If no user with that githubId, check if email is already in use
        user = await UserIntern.findOne({ email: email });

        if (user) {
          // Email exists, link the GitHub account
          user.githubId = profile.id;
          await user.save();
          return done(null, user);
        }

        // If no user found, create a new one
        const newUser = new UserIntern({
          username: profile.displayName || profile.username,
          email: email,
          githubId: profile.id,
          provider: "github",
        });
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);