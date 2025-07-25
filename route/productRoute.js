const {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/product");
const express = require("express");
const upload = require("../middleware/multerMiddleWare");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", auth, upload.single("productImage"), createProduct);
router.get("/products", getProducts);
router.get("/prod/:id", auth, getSingleProduct);
router.delete("/delete/:id", auth, deleteProduct);
router.patch("/update/:id", auth, upload.single("productImage"), updateProduct);

module.exports = router;
