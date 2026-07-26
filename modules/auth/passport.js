const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("@model/UserModel");
const config = require("@config/config");


passport.use(
  "jwt",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async function (jwtPayload, cb) {
      try {
        const user = await User.findOne({ _id: jwtPayload._id });
        if (!user) {
          return cb({ message: "Invalid Token", status: 401 });
        }
        if (!user.isActive) {
          return cb({ message: "User banned", status: 401 });
        }
        return cb(null, user);
      } catch (err) {
        debug("JWTStrategy", err);
        return cb({ message: "Internal Server Error", status: 500 });
      }
    }
  )
);