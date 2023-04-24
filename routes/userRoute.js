const express = require("express");
const { verify, authorizeRoles } = require("../middleware/auth");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getSingleUser,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/reset").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/user").get(verify, getUserDetails);
router.route("/updatePass").put(verify, updatePassword);
router.route("/updateProfile").put(verify, updateProfile);
router.route("/admin/users").get(verify, authorizeRoles("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(verify, authorizeRoles("admin"), getSingleUser)
  .put(verify, authorizeRoles("admin"), updateUserRole)
  .delete(verify, authorizeRoles("admin"), deleteUser);

module.exports = router;
