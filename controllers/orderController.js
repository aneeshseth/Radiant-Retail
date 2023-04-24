const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const createOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.create(req.body);
  res.json({
    message: "Order created!",
    orderAdded: order,
  });
});

const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler("No order with this id!"));
  }
  res.json({
    success: true,
    order,
  });
});

const getAllOrdersOfAUser = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });
  if (!orders) {
    return next(new ErrorHandler("No orders with this id!"));
  }
  res.json({
    success: true,
    orders,
  });
});

//admin
const allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  for (let i = 0; i < orders.length; i++) {
    totalAmount += orders[i].totalPrice;
  }
  res.json({
    success: true,
    orders,
    totalAmount: totalAmount,
  });
});

const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  return res.json({
    sucess: true,
    message: "Order deleted!",
  });
});

module.exports = {
  createOrder,
  getSingleOrder,
  getAllOrdersOfAUser,
  allOrders,
  deleteOrder,
};
