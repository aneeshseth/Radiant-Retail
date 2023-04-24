const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");

const verify = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login first!"), 400);
  }
  const decodedData = jwt.verify(token, "ANEESH");
  req.user = await User.findById(decodedData.id);
  next();
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler("This role is not allowed to access this!", 403)
      );
    }
    next();
  };
};

module.exports = { verify, authorizeRoles };
