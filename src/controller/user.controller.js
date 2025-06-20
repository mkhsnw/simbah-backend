const {
  getAllUser,
  getUserById,
  deleteUser,
  editUser,
} = require("../services/user.service");

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUser();
    if (!users || users.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No users found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found with this ID",
      });
    }
    return res.status(200).json({
      status: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const editUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const updatedUser = await editUser(id, userData);
    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found or could not be updated",
      });
    }
    return res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error editing user:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found or could not be deleted",
      });
    }
    return res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllUsersController,
  getUserByIdController,
  editUserController,
  deleteUserController,
};
