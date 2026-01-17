import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.model.js';

const configurePassport = (passport) => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              // User exists, update Google ID if not set
              if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
              }
              return done(null, user);
            }

            // Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              isEmailVerified: true, // Google emails are verified
              avatar: profile.photos[0]?.value,
              authProvider: 'google',
            });

            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  } else {
    console.log('⚠️  Google OAuth not configured - check .env file');
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`,
          scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // GitHub might not provide email in profile, get from emails array
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            
            if (!email) {
              return done(new Error('No email found from GitHub'), null);
            }

            // Check if user already exists
            let user = await User.findOne({ email });

            if (user) {
              // User exists, update GitHub ID if not set
              if (!user.githubId) {
                user.githubId = profile.id;
                await user.save();
              }
              return done(null, user);
            }

            // Create new user
            user = await User.create({
              name: profile.displayName || profile.username,
              email: email,
              githubId: profile.id,
              isEmailVerified: true, // GitHub emails are verified
              avatar: profile.photos[0]?.value,
              authProvider: 'github',
            });

            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  } else {
    console.log('⚠️  GitHub OAuth not configured - check .env file');
  }

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
