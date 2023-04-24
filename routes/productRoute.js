const express = require("express");
const { verify, authorizeRoles } = require("../middleware/auth");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  createNewRevieworUpdate,
  getProductReviews,
  deleteProductReviews,
} = require("../controllers/productController");

router.route("/products").get(verify, getAllProducts);
router
  .route("/product/new")
  .post(verify, authorizeRoles("admin"), createProduct);
router.route("/product/:id").get(verify, getProductById);
router
  .route("/product/update/:id")
  .put(verify, authorizeRoles("admin"), updateProduct);
router
  .route("/product/del/:id")
  .delete(verify, authorizeRoles("admin"), deleteProduct);
router.route("/review").put(verify, createNewRevieworUpdate);

router
  .route("/reviews")
  .get(verify, getProductReviews)
  .delete(verify, authorizeRoles("admin"), deleteProductReviews);
module.exports = router;
