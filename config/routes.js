const express = require('express');
const router = express.Router();
const LoginRoutes=require("../modules/auth/routes")
const passport = require("passport");
const Responder = require('@service/ResponderService');


router.use("/auth",LoginRoutes)

router.use((req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user) => {
    if (error) {
      return Responder.respondWithError(req, res, error.message);
    } else if (!user) {
      return Responder.respondWithUnauthorized(req, res, "Invalid User");
    } else {
      req.user = user;
      return next();
    }
  })(req, res, next);
});


module.exports = router;