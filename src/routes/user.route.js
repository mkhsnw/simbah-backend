const express = require("express");
const { validateAuth } = require("../middleware/auth.middleware.");
const {
  getAllUsersController,
  getUserByIdController,
  editUserController,
  deleteUserController,
} = require("../controller/user.controller");
const { validateRegister } = require("../model/auth.validator");
const { validateUser } = require("../model/user.validator");

const router = express.Router();

router.get("/", validateAuth, getAllUsersController);
router.get("/:id", validateAuth, getUserByIdController);
router.put("/:id", validateAuth, validateUser, editUserController);
router.delete("/:id", validateAuth, deleteUserController);

module.exports = router;
