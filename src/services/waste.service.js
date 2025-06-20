const { prisma } = require("../config/database");

const getAllWaste = async () => {
  try {
    const waste = await prisma.wasteCategory.findMany({
      select: {
        name: true,
        pricePerKg: true,
      },
    });
    return waste;
  } catch (error) {
    console.error("Error fetching waste data:", error);
    throw error;
  }
};

const getWasteById = async (id) => {
  try {
    const wasteData = await prisma.wasteCategory.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        name: true,
        pricePerKg: true,
      },
    });
    if (!wasteData) {
      throw new Error("Waste not found with this ID");
    }
    return wasteData;
  } catch (error) {
    console.error("Error fetching waste by ID:", error);
    throw error;
  }
};

const createWaste = async (data) => {
  try {
    const newWaste = await prisma.wasteCategory.create({
      data: {
        name: data.name,
        pricePerKg: parseFloat(data.pricePerKg),
      },
      select: {
        id: true,
        name: true,
        pricePerKg: true,
      },
    });
    return newWaste;
  } catch (error) {
    console.error("Error creating waste data:", error);
    throw error;
  }
};

const updateWaste = async (id, data) => {
  try {
    const updateWasteData = await prisma.wasteCategory.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: data.name,
        pricePerKg: parseFloat(data.pricePerKg),
      },
      select: {
        id: true,
        name: true,
        pricePerKg: true,
      },
    });
    return updateWasteData;
  } catch (error) {
    console.error("Error updating waste data:", error);
    throw error;
  }
};

const deleteWaste = async (id) => {
  try {
    const deletedWaste = await prisma.wasteCategory.delete({
      where: {
        id: parseInt(id),
      },
    });
    return deletedWaste;
  } catch (error) {
    console.error("Error deleting waste data:", error);
    throw error;
  }
};

module.exports = {
  getAllWaste,
  getWasteById,
  updateWaste,
  deleteWaste,
  createWaste,
};
