const express=require('express');
const router=express.Router();
const LoginController = require('./LoginController');
const { defaultApiLimiter } = require('@validator/RateLimiter');
const Responder = require('@service/ResponderService');
const BodyValidations = require('@validator/BodyValidators');

// const loginController = new LoginController();

router.post("/email-check", 
    defaultApiLimiter,
    [BodyValidations.requiredString("email")],
    Responder.validate.bind(Responder),
    LoginController.emailVerify.bind(LoginController)
);

router.post("/login", 
    defaultApiLimiter,
    [BodyValidations.requiredString("email"), BodyValidations.requiredString("password")],
    Responder.validate.bind(Responder),
    LoginController.login.bind(LoginController)
);

router.post("/register", 
    defaultApiLimiter,
    [BodyValidations.requiredString("email"), BodyValidations.requiredString("password"),
        BodyValidations.requiredString("name"), BodyValidations.requiredString("phone"),
        BodyValidations.requiredString("address"),BodyValidations.requiredString("pincode")
    ],
    Responder.validate.bind(Responder),
    LoginController.register.bind(LoginController)
);

module.exports=router;

