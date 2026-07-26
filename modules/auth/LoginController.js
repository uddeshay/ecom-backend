const Responder = require("@service/ResponderService");
const User = require("@model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class LoginController {
  static async emailVerify(req, res) {
    try {
      console.log("Email check request received:", req.body);
      const { email } = req.body;
      console.log("Looking for email:", email);

      const existingUser = await User.findOne({ email });
      console.log("User found:", existingUser);

      if (existingUser) {
        return Responder.respondWithSuccess(
          req,
          res,
          { exists: true },
          "Email exists",
        );
      }
      return Responder.respondWithSuccess(
        req,
        res,
        { exists: false },
        "Email does not exist",
      );
    } catch (error) {
      console.error("Error in emailVerify:", error);
      return Responder.respondWithError(req, res, error);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return Responder.respondWithError(
          req,
          res,
          "Invalid email or password",
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return Responder.respondWithError(
          req,
          res,
          "Invalid email or password",
        );
      }

      const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_SECRET, {
        expiresIn: "7d",
      });
      user.refreshToken = refreshToken;
      await user.save();

      res.cookies("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });


      return Responder.respondWithSuccess(
        req,
        res,
       { _id: user._id, name: user.name, email: user.email, accessToken },
        "Login successful",
      );
    } catch (error) {
      return Responder.respondWithError(req, res, error);
    }
  }

  static async register(req, res) {
    const saltRounds = 10;
    try {
      const { email, password, name, phone, address, pincode } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return Responder.respondWithError(req, res, "Email already registered");
      }

      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        pincode,
        isVerified: true,
      });

      console.log("User created:", user);
      return Responder.respondWithSuccess(
        req,
        res,
     { _id: user._id, name: user.name, email: user.email },
        "User registered successfully",
      );
    } catch (error) {
      console.error("Error in register:", error);
      return Responder.respondWithError(req, res, error);
    }
  }
}
module.exports = LoginController;
