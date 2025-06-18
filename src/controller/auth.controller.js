const bcrypt = require("bcryptjs");
const { registerUser, loginUser } = require("../services/auth.services");

const register = async (req, res, next) => {
  try {
    await registerUser(req.body);
    res.status(201).json({
      status: true,
      message: "User registered succesfully",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    if (!user) {
      res.status(401).json({
        status: false,
        message: "User not found or invalid credentials",
      });
    }
    res.status(200).json({
      status: true,
      message: "Login Successful",
      token: user.token,
    });
    next();
  } catch (error) {}
};

module.exports = {
  register, login
};
