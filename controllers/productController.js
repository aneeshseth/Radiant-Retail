const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

//accessed only by admin
const createProduct = catchAsyncErrors(async (req, res) => {
  const createdProduct = await Product.create(req.body);
  res.json({
    message: "Product created!",
    productAdded: createdProduct,
  });
});

const getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(5);
  const products = await apiFeature.query;
  if (!products) {
    return next(new ErrorHandler("Products not found", 404));
  }
  res.json({
    message: "Server working properly!",
    products: products,
  });
});

const getProductById = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  return res.json({
    message: "Server working properly!",
    product: product,
  });
});

//accessed only by admin
const updateProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  p.save();
  return res.json({
    message: "Product updated!",
    product: p,
  });
});

const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  return res.json({
    message: "Product deleted sucessfully!",
  });
});

const createNewRevieworUpdate = catchAsyncErrors(async (req, res, next) => {
  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(req.body.rating),
    comment: req.body.comment,
  };
  const product = await Product.findById(req.body.productId);
  let isReviewed = false;
  for (let i = 0; i < product.reviews.length; i++) {
    if (product.reviews[i].user.toString() == req.user.id.toString()) {
      isReviewed = true;
    }
  }
  if (isReviewed) {
    for (let i = 0; i < product.reviews.length; i++) {
      if (product.reviews[i].user.toString() == req.user.id.toString()) {
        product.reviews[i].comment = review.comment;
        product.reviews[i].rating = review.rating;
      }
    }
  } else {
    product.reviews.push(review);
    product.noOfReviews = product.reviews.length;
  }

  let sumOfRatings = 0;
  for (let i = 0; i < product.reviews.length; i++) {
    sumOfRatings += product.reviews[i].rating;
  }
  product.ratings = sumOfRatings / product.reviews.length;
  await product.save();
  return res.json({
    success: true,
    message: "Rating added!",
  });
});

const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler("Product not found"), 404);
  }
  return res.json({
    success: true,
    reviews: product.reviews,
  });
});

const deleteProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product not found"), 404);
  }
  for (let i = 0; i < product.reviews.length; i++) {
    if (product.reviews[i].id.toString() == req.query.id.toString()) {
      product.reviews.splice(i, 1);
      await product.save();
    }
  }
  product.noOfReviews = product.reviews.length;
  let sumOfRatings = 0;
  if (product.reviews.length == 0) {
    product.ratings = 0;
  } else {
    for (let i = 0; i < product.reviews.length; i++) {
      sumOfRatings += product.reviews[i].rating;
    }
    product.ratings = sumOfRatings / product.reviews.length;
  }
  await product.save();
  return res.json({
    success: true,
    message: "Rating deleted!",
  });
});

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  createNewRevieworUpdate,
  getProductReviews,
  deleteProductReviews,
};
