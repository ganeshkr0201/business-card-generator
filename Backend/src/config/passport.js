import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import GitHubStrategy from "passport-github";
import User from "../models/User.js";


export const configurePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async(accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if(!user) {
                user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                isVerified: true,
                });
            }
            done(null, user);
        }
        catch(error) {
            done(error, null);
        }
    }));

//   passport.use(new GitHubStrategy.Strategy({
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`,
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ githubId: profile.id });
//       if (!user) {
//         user = await User.create({
//           name: profile.username,
//           email: profile.emails[0].value,
//           githubId: profile.id,
//           isVerified: true,
//         });
//       }
//       done(null, user);
//     } catch (err) {
//       done(err, null);
//     }
//   }));
};