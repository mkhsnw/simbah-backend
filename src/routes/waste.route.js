const express = require("express");
const { validateAuth } = require("../middleware/auth.middleware.");
const {
  getAllWasteController,
  getWasteByIdController,
  createWasteController,
  deleteWasteController,
  updateWasteController,
} = require("../controller/waste.controller");
const { validateWaste } = require("../model/waste.validator");

const router = express.Router();

router.get("/", validateAuth, getAllWasteController);
router.get("/:id", validateAuth, getWasteByIdController);
router.post("/", validateAuth, validateWaste, createWasteController);
router.put("/:id", validateAuth, validateWaste, updateWasteController);
router.delete("/:id", validateAuth, deleteWasteController);

module.exports = router;
