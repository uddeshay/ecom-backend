const { validationResult } = require("express-validator");

class Responder {
  constructor() {}

  respondWithSuccess(req, res, data, message = "OK") {
    res.status(200);
    return this.respond(req, res, 1, message, data);
  }

  respondWithError(req, res, error) {
    res.status(500);
    return this.respond(
      req,
      res,
      0,
      "Something went wrong" + " | " + error.toString()
    );
  }

  respondWithPaymentRequired(req, res, msg = "This action requires payment") {
    res.status(402);
    return this.respond(req, res, 0, msg);
  }

  respondWithValidationError(req, res, errors, msg = "Validation Failed") {
    res.status(422);
    return this.respond(req, res, 0, msg, errors);
  }

  respondWithNotFound(req, res, msg = "Data not found") {
    res.status(404);
    return this.respond(req, res, 0, msg);
  }

  respondWithForbidden(req, res, msg = "Forbidden Access") {
    res.status(403);
    return this.respond(req, res, 0, msg);
  }

  respondWithUnauthorized(req, res, msg = "Unauthorized") {
    res.status(401);
    return this.respond(req, res, 0, msg);
  }

  respondWithApiLimiter(
    req,
    res,
    msg = "Too Many Requests. Please try again later."
  ) {
    res.status(429);
    return this.respond(req, res, 0, msg);
  }

  respondWithSingleValidationError(req, res, msg = "Validation Failed") {
    res.status(422);
    return this.respond(req, res, 0, msg);
  }

  respondWithServiceUnavailable(req, res, msg = "Service Unavailable") {
    res.status(503);
    return this.respond(req, res, 0, msg);
  }

  respondWithBadRequest(req, res, msg = "Bad Request") {
    res.status(400);
    return this.respond(req, res, 0, msg);
  }

  respond(req, res, status, message, data) {
    if (status) {
      return res.json({
        status,
        data,
        message,
      });
    } else {
      return res.json({
        status,
        message,
        error: data,
      });
    }
  }

  validate(req, res, next) {
    const errors = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });
    if (!errors.isEmpty()) {
      return this.respondWithValidationError(req, res, errors.mapped());
    }
    next();
  }
}

module.exports = new Responder();
