const moment = require("moment");
const mongoose = require("mongoose");
const { body } = require("express-validator");
const Responder = require("@service/ResponderService");
const User = require("@model/User");

class BodyValidations {
  // primitieves

  // string
  static requiredString(field) {
    return body(field)
      .exists({ checkFalsy: true })
      .withMessage(`${field} is required`)
      .trim()
      .isString()
      .withMessage(`${field} must be a string`);
  }

  static optionalString(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .isString()
      .withMessage(`${field} must be a string`);
  }

  static requiredStringWithMinLength(field, length) {
    return this.requiredString(field)
      .isLength({ min: length })
      .withMessage(`${field} must contain at least ${length} characters`);
  }

  static optionalStringWithMinLength(field, length) {
    return this.optionalString(field)
      .isLength({ min: length })
      .withMessage(`${field} must contain at least ${length} characters`);
  }

  static requiredStringWithMinAndMaxLength(field, min, max) {
    return this.requiredString(field)
      .isLength({ min, max })
      .withMessage(`${field} must be between ${min} and ${max} characters`);
  }

  // boolean
  static requiredBoolean(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isBoolean()
      .withMessage(`${field} must be a boolean`)
      .toBoolean();
  }

  static optionalBoolean(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .isBoolean()
      .withMessage(`${field} must be a boolean`)
      .toBoolean();
  }

  // Number
  static requiredNumber(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isNumeric({ no_symbols: true })
      .withMessage(`${field} must be a number`);
  }

  static optionalNumber(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .isNumeric({ no_symbols: true })
      .withMessage(`${field} must be a number`);
  }

  //Float
  static requiredFloat(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isFloat()
      .withMessage(`${field} must be a number`);
  }

  static optionalFloat(field) {
    return body(field)
      .optional({ values: "falsy" })
      .withMessage(`${field} is required`)
      .trim()
      .isFloat()
      .withMessage(`${field} must be a number`);
  }

  //Float
  static requiredFloat(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isFloat()
      .withMessage(`${field} must be a float`);
  }

  static optionalFloat(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .isFloat()
      .withMessage(`${field} must be a float`);
  }

  // Email
  static requiredEmail(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage("must be a valid email");
  }

  static optionalEmail(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage("must be a valid email");
  }

  // URL
  static requiredUrl(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isURL()
      .withMessage(`${field} must be a valid URL`);
  }

  static optionalUrl(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .isURL()
      .withMessage(`${field} must be a valid URL`);
  }

  // ObjectID
  static requiredObjectId(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .custom((value) => mongoose.isValidObjectId(value))
      .withMessage(`${field} must be a valid ObjectId`);
  }

  static optionalObjectId(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .custom((value) => mongoose.isValidObjectId(value))
      .withMessage(`${field} must be a valid ObjectId`);
  }

  // Object
  static requiredObject(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .isObject()
      .withMessage(`${field} must be an object`);
  }

  static optionalObject(field) {
    return body(field)
      .optional({ values: "falsy" })
      .isObject()
      .withMessage(`${field} must be an object`);
  }

  // Enum
  static requiredEnum(field, enumValues) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isIn(enumValues)
      .withMessage(
        enumValues.length > 1
          ? `${field} must be one of ${enumValues.join(", ")}`
          : `${field} must be ${enumValues[0]}`,
      );
  }

  static optionalEnum(field, enumValues) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .isIn(enumValues)
      .withMessage(
        enumValues.length > 1
          ? `${field} must be one of ${enumValues.join(", ")}`
          : `${field} must be ${enumValues[0]}`,
      );
  }

  // Files
  static requiredValidFile(field) {
    return (req, res, next) => {
      if (req.files && req.files[field]) next();
      else
        return Responder.respondWithSingleValidationError(
          req,
          res,
          "Please upload a file for " + field,
        );
    };
  }

  static requiredImageFile(field) {
    return (req, res, next) => {
      let file = null;
      if (req.files && req.files[field]) file = req.files[field];
      if (file) {
        if (file.mimetype.startsWith("image/")) next();
        else
          return Responder.respondWithSingleValidationError(
            req,
            res,
            "Please upload a valid image for " + field,
          );
      } else
        return Responder.respondWithSingleValidationError(
          req,
          res,
          "Please upload an image for " + field,
        );
    };
  }

  // Array
  static requiredArray(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .isArray()
      .withMessage(`${field} must be an array`);
  }

  static requiredArrayNotEmpty(field) {
    return this.requiredArray(field)
      .isEmpty()
      .withMessage(`${field} must not be empty`);
  }

  static optionalArray(field) {
    return body(field)
      .optional({ values: "falsy" })
      .isArray()
      .withMessage(`${field} must be an array`);
  }

  static requiredArrayWithLength(field, length) {
    return this.requiredArray(field).custom((value) => {
      if (value.length !== length) {
        throw new Error(`${field} must contain exactly ${length} items`);
      }
      return true;
    });
  }

  // Dates
  static requiredFutureDate(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isISO8601()
      .withMessage(`${field} must be a valid date`)
      .isAfter()
      .withMessage(`${field} must be a future date`);
  }

  static requiredDate(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .isDate()
      .withMessage(`${field} must be a valid date`);
  }

  static optionalDate(field) {
    return body(field)
      .optional({ values: "falsy" })
      .isDate()
      .withMessage(`${field} must be a valid date`);
  }

  static requiredISODate(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isISO8601()
      .withMessage(`${field} must be a valid ISO date`);
  }
  static optionalISODate(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .isISO8601()
      .withMessage(`${field} must be a valid ISO date`);
  }
  static validDateRange(startField, endField, maxDays = 180) {
    return body(startField).custom((value, { req }) => {
      const startDate = moment(value);
      if (!startDate.isValid()) {
        throw new Error(`${startField} must be a valid date`);
      }
      const endDate = moment(req.body[endField]);
      if (!endDate.isValid()) {
        throw new Error(`${endField} must be a valid date`);
      }
      if (startDate > endDate) {
        throw new Error(`${startField} must be before ${endField}`);
      }
      if (maxDays && (endDate - startDate) / (1000 * 60 * 60 * 24) > maxDays) {
        throw new Error(
          `${startField} and ${endField} must be within ${maxDays} days`,
        );
      }
      return true;
    });
  }
  static requiredPastISODate(field) {
    return body(field)
      .exists()
      .withMessage(`${field} is required`)
      .trim()
      .isISO8601()
      .withMessage(`${field} must be a valid ISO date`)
      .isBefore()
      .withMessage(`${field} must be a past date`);
  }
  static optionalPastISODate(field) {
    return body(field)
      .optional({ values: "falsy" })
      .trim()
      .isISO8601()
      .withMessage(`${field} must be a valid ISO date`)
      .isBefore()
      .withMessage(`${field} must be a past date`);
  }

  // derivatives
  static requiredNumberInRange(field, min, max = null) {
    return this.requiredNumber(field)
      .isFloat(max === null ? { min } : { min, max })
      .withMessage(
        max === null
          ? `${field} must be greater than ${min}`
          : `${field} must be between ${min} and ${max}`,
      );
  }

  static optionalNumberInRange(field, min, max = null) {
    return this.optionalNumber(field)
      .isFloat(max === null ? { min } : { min, max })
      .withMessage(
        max === null
          ? `${field} must be greater than ${min}`
          : `${field} must be between ${min} and ${max}`,
      );
  }

  static requiredArrayOfStrings(field) {
    return this.requiredArray(field)
      .custom((value) => {
        if (value.length === 0) return true;
        return value.every(
          (item) => typeof item === "string" && item.length > 0,
        );
      })
      .withMessage(`${field} must be an array of strings`);
  }

  static optionalArrayOfStrings(field) {
    return this.optionalArray(field)
      .custom((value) => {
        if (!value) return true;
        if (value.length === 0) return true;
        return value.every(
          (item) => typeof item === "string" && item.length > 0,
        );
      })
      .withMessage(`${field} must be an array of strings`);
  }

  static requiredArrayOfEnum(field, enumValues) {
    return this.requiredArray(field)
      .custom((value) => {
        if (value.length === 0) return true;
        return value.every((item) => enumValues.includes(item));
      })
      .withMessage(
        enumValues.length > 1
          ? `${field} must be an array of any of ${enumValues.join(", ")}`
          : `${field} must be an array of ${enumValues[0]}`,
      );
  }

  static optionalArrayOfEnum(field, enumValues) {
    return this.optionalArray(field)
      .custom((value) => {
        if (!value) return true;
        if (value.length === 0) return true;
        return value.every((item) => enumValues.includes(item));
      })
      .withMessage(
        enumValues.length > 1
          ? `${field} must be an array of any of ${enumValues.join(", ")}`
          : `${field} must be an array of ${enumValues[0]}`,
      );
  }
  // Phone Number
  static requiredPhoneNumber(field) {
    return body(field)
      .exists({ checkFalsy: true })
      .trim()
      .withMessage(`${field} is required`)
      .custom((value) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(value);
      })
      .withMessage(`Please enter 10 digit number!`);
  }

  //userType
  static conditionalUserType(field) {
    return body(field).custom(async (value, { req }) => {
      const user = await User.findById(req.user.id).select(field);
      if (user[field] !== null) {
        return true;
      }
      if (!value) {
        throw new Error(`${field} is required`);
      }
    });
  }
  //Password Match
  static confirmedField(field1, field2) {
    return body(field2).custom((value, { req }) => {
      if (value !== req.body[field1]) {
        throw new Error(`${field1} and ${field2} do not match`);
      }
      return true;
    });
  }
}
module.exports = BodyValidations;
