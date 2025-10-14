// // import Product from "../models/Product.js";

// import Product from "../models/product.model.js";

// // Create new product (Admin only)
// export const createProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       originalPrice,
//       currentPrice,
//       stock,
//       category,
//       images,
//       sku,
//     } = req.body;

//     const product = new Product({
//       name,
//       description,
//       originalPrice,
//       currentPrice,
//       stock,
//       category,
//       images,
//       sku,
//     });

//     await product.save();
//     res.status(201).json({ message: "Product created successfully", product });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get all products (Public)
// export const getProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get single product by ID (Public)
// export const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Update product (Admin only)
// export const updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     const {
//       name,
//       description,
//       originalPrice,
//       currentPrice,
//       stock,
//       category,
//       images,
//       sku,
//     } = req.body;

//     product.name = name || product.name;
//     product.description = description || product.description;
//     product.originalPrice = originalPrice || product.originalPrice;
//     product.currentPrice = currentPrice || product.currentPrice;
//     product.stock = stock || product.stock;
//     product.category = category || product.category;
//     product.images = images || product.images;
//     product.sku = sku || product.sku;

//     await product.save();
//     res.json({ message: "Product updated successfully", product });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Delete product (Admin only)
// export const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     await product.remove();
//     res.json({ message: "Product deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// // };
// import Product from "../models/product.model.js";
// import Category from "../models/category.model.js";

// // ✅ Create new product (Admin)
// export const createProduct = async (req, res) => {
//   try {
//     const { category } = req.body;

//     // ✅ Check if category exists
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid category ID" });
//     }

//     const product = new Product(req.body);
//     await product.save();

//     res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       product,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Get all products (Public)
// export const getProducts = async (req, res) => {
//   try {
//     // ✅ Populate category for each product
//     const products = await Product.find()
//       .populate("category", "name slug")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ success: true, products });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Get product by ID (Public)
// export const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).populate(
//       "category",
//       "name slug"
//     );

//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     res.status(200).json({ success: true, product });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Update product (Admin)
// export const updateProduct = async (req, res) => {
//   try {
//     const { category } = req.body;

//     // ✅ Validate category if updated
//     if (category) {
//       const categoryExists = await Category.findById(category);
//       if (!categoryExists) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Invalid category ID" });
//       }
//     }

//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       product,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Delete product (Admin)
// export const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     await Product.deleteOne({ _id: req.params.id });
//     res
//       .status(200)
//       .json({ success: true, message: "Product deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

// ✅ Create new product (Admin)
export const createProduct = async (req, res) => {
  try {
    let { category } = req.body;

    // Find category by ID or name
    let categoryDoc;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findById(category);
    } else {
      categoryDoc = await Category.findOne({ name: category });
    }

    if (!categoryDoc) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }

    // Replace category with valid _id
    req.body.category = categoryDoc._id;

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all products (Public)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get product by ID (Public)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update product (Admin)
export const updateProduct = async (req, res) => {
  try {
    let { category } = req.body;

    // Validate category if provided
    if (category) {
      let categoryDoc;
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
      } else {
        categoryDoc = await Category.findOne({ name: category });
      }

      if (!categoryDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" });
      }

      req.body.category = categoryDoc._id;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    await Product.deleteOne({ _id: req.params.id });
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
