const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const registerUser = catchAsyncErrors(async (req, res, next) => {
  const exists = await User.find({ email: req.body.email });
  if (exists.length > 0) {
    return next(new ErrorHandler("User exists!"), 400);
  }
  const user = await User.create(req.body);
  const token = jwt.sign({ id: exists._id }, "ANEESH", {
    expiresIn: "5d",
  });

  await user.save();
  return res
    .cookie("token", token, {
      httpOnly: true,
      expiresIn: new Date(Date.now() + 7 * 24 * 24 * 60 * 100),
    })
    .json({
      message: "User created!",
      user: user,
      token: token,
    });
});

const loginUser = catchAsyncErrors(async (req, res, next) => {
  const exists = await User.find({ email: req.body.email });
  if (exists.length == 0) {
    return next(new ErrorHandler("User does not exist, please sign in!"), 400);
  }
  const comparePassword = bcrypt.compare(exists[0].password, req.body.password);
  if (!comparePassword) {
    return next(new ErrorHandler("Invalid id/password"), 400);
  }
  const token = jwt.sign({ id: exists[0]._id }, "ANEESH", {
    expiresIn: "5d",
  });
  return res
    .cookie("token", token, {
      httpOnly: true,
      expiresIn: new Date(Date.now() + 7 * 24 * 24 * 60 * 100),
    })
    .json({
      message: "Logged in!",
      user: exists,
      token: token,
    });
});

const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    httpOnly: true,
    expiresIn: new Date(Date.now()),
  });
  return res.json({
    success: true,
    message: "Logged outt!",
  });
});

const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find({ email: req.body.email });
  if (user.length == 0) {
    return next(new ErrorHandler("User not found"), 404);
  }
  const resetToken = crypto.randomBytes(20).toString("hex");

  user[0].resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user[0].resetPasswordExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user[0].save({ validateBeforeSave: false });
  const resetPassUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  const message = `Your password reset url is \n\n ${resetPassUrl}`;
  try {
    sendEmail({
      email: user[0].email,
      subject: "Radiant Retail Password Recovery",
      message,
    });
    res.json({
      sucess: true,
      message: "Email sent sucessfully!",
      user: user[0],
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save();
    return next(new ErrorHandler("error"), 500);
  }
});

const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const token = req.params.token;
  const resetpassToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.find({ resetPasswordToken: resetpassToken });
  if (user.length == 0) {
    return next(new ErrorHandler("Reset password token is not valid"), 400);
  }
  if (req.body.password != req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords don't match!"), 400);
  }
  user[0].password = req.body.password;
  user[0].resetPasswordToken = undefined;
  user[0].resetPasswordExpire = undefined;
  res.json({
    sucess: true,
    message: "Password changed sucessfully!",
    user: user[0],
  });
});

const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User DNE"), 400);
  }
  return res.json({
    success: true,
    user: user,
  });
});

const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User DNE"), 400);
  }
  console.log(user.password);
  console.log(req.body.oldPassword);
  const comparePassword = await bcrypt.compare(
    user.password,
    req.body.oldPassword
  );
  if (!comparePassword) {
    return next(new ErrorHandler("Invalid password"), 400);
  }
  user.password = req.body.password;
  await user.save();
  const token = jwt.sign({ id: user._id }, "ANEESH", {
    expiresIn: "5d",
  });
  return res
    .cookie("token", token, {
      httpOnly: true,
      expiresIn: new Date(Date.now() + 7 * 24 * 24 * 60 * 100),
    })
    .json({
      message: "Logged in!",
      user: user,
      token: token,
    });
});

const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newuserdata = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newuserdata, {
    new: true,
  });
  return res.json({
    message: "Profile updated!",
    user: user,
  });
});
//admin
const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  return res.json({
    users: users,
  });
});

//admin
const getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User with this id doesn't exist"), 400);
  }
  return res.json({
    user: user,
  });
});

//admin

const updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newuserdata = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, newuserdata, {
    new: true,
  });
  await user.save();
  return res.json({
    message: "Profile updated!",
    user: user,
  });
});

//admin

const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  return res.json({
    success: true,
    message: "User deleted!",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUserRole,
};
