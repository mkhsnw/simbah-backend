const express = require("express");
const { validateRegister, validateLogin } = require("../model/auth.validator");
const {
  register,
  login,
  getLoginDetail,
} = require("../controller/auth.controller");
const { validateAuth } = require("../middleware/auth.middleware.");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", validateAuth, getLoginDetail);

module.exports = router;
