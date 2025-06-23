const bcrypt = require("bcryptjs");
const { registerUser, loginUser } = require("../services/auth.services");
const { getUserLogin } = require("../services/user.service");
const { getToken } = require("../middleware/auth.middleware.");

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
        success: false,
        message: "User not found or invalid credentials",
      });
    }
    res.status(200).json({
      success: true,
      message: "Login Successful",
      token: user.token,
    });
    next();
  } catch (error) {
    next(error);
  }
};

const getLoginDetail = async (req, res, next) => {
  try {
    const token = getToken(req);
    const user = await getUserLogin(token);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getLoginDetail,
};
