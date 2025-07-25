const Product = require("../model/productModel");
const {
  cloudinaryUploader,
  cloudinaryDestroyer,
} = require("../util/cloudinaryHelper");

// 🔷 Create a product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;

    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinaryUploader(req.file.path);

    const product = new Product({
      name,
      description,
      price,
      quantity,
      category,
      image: [
        {
          url: uploadResult.secure_url,
          public_Id: uploadResult.public_id,
        },
      ],
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 🔷 Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const numProduct = await Product.countDocuments();


    res.json({
      success: true,
      message: "Product fetched successfully",
      products,
      allProduct: numProduct,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔷 Get specific product by ID
const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔷 Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, image } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "No product found with that ID" });
    }

    // If a new image file is uploaded
    if (req.file) {
      // optionally destroy the old image if it exists
      if (product.image?.[0]?.public_Id) {
        await cloudinaryDestroyer(product.image[0].public_Id);
      }

      // upload new image to cloudinary
      const uploadResult = await cloudinaryUploader(req.file.path);

      product.image = [
        {
          url: uploadResult.secure_url,
          public_Id: uploadResult.public_id,
        },
      ];
    }

    // update the rest of the fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (quantity) product.quantity = quantity;

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// 🔷 Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, message: "Product created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
