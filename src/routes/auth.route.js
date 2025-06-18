const express = require("express");
const { validateRegister, validateLogin } = require("../model/auth.validator");
const { register, login } = require("../controller/auth.controller");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

module.exports = router;
