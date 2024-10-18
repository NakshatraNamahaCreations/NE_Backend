const express = require("express");
const { refreshToken } = require("../../controllers/authController");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  deleteUser,
} = require("../../controllers/user/userController");
// const authMiddleware = require("../../controllers/middleware/authMiddleware");

// Route for refreshing token
router.post("/refresh-token", refreshToken);
router.post("/user-register", register);
router.post("/user-login", login);
router.get("/get-user-profile/:id", getProfile);
router.put("/update-profile/:id", updateProfile);
router.put("/save-delivery-address/:id", addAddress);
router.delete("/profile", deleteUser);

module.exports = router;
