const {
  getAllWaste,
  getWasteById,
  deleteWaste,
  createWaste,
  updateWaste,
} = require("../services/waste.service");

const getAllWasteController = async (req, res, next) => {
  try {
    const wasteData = await getAllWaste();
    if (!wasteData || wasteData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No waste data found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Waste data retrieved successfully",
      data: wasteData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getWasteByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wasteData = await getWasteById(id);
    if (!wasteData) {
      return res.status(404).json({
        success: false,
        message: "Waste not found with this ID",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Waste data retrieved successfully",
      data: wasteData,
    });
  } catch (error) {
    console.error("Error fetching waste by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const createWasteController = async (req, res, next) => {
  try {
    const newWaste = await createWaste(req.body);
    return res.status(201).json({
      success: true,
      message: "Waste created successfully",
      data: newWaste,
    });
  } catch (error) {
    console.error("Error creating waste data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateWasteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dataWaste = await updateWaste(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Waste updated successfully",
      data: dataWaste,
    });
  } catch (error) {
    console.error("Error updating waste data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteWasteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedWaste = await deleteWaste(id);
    if (!deletedWaste) {
      return res.status(404).json({
        success: false,
        message: "Waste not found with this ID",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Waste deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting waste data:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllWasteController,
  getWasteByIdController,
  createWasteController,
  updateWasteController,
  deleteWasteController,
};
