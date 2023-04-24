const express = require("express");
const {
  createOrder,
  getSingleOrder,
  getAllOrdersOfAUser,
  deleteOrder,
  allOrders,
} = require("../controllers/orderController");
const router = express.Router();
const { verify, authorizeRoles } = require("../middleware/auth");

router.route("/order/new").post(verify, createOrder);
router.route("/order/:id").get(verify, authorizeRoles("admin"), getSingleOrder);
router.route("/myorders").get(verify, getAllOrdersOfAUser);
router.route("/allorders").get(verify, authorizeRoles("admin"), allOrders);
router.route("/delete/order/:id").delete(verify, deleteOrder);

module.exports = router;
