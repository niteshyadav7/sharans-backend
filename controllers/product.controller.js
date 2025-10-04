// import Product from "../models/Product.js";

import Product from "../models/product.model.js";

// Create new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      originalPrice,
      currentPrice,
      stock,
      category,
      images,
      sku,
    } = req.body;

    const product = new Product({
      name,
      description,
      originalPrice,
      currentPrice,
      stock,
      category,
      images,
      sku,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all products (Public)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single product by ID (Public)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name,
      description,
      originalPrice,
      currentPrice,
      stock,
      category,
      images,
      sku,
    } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.originalPrice = originalPrice || product.originalPrice;
    product.currentPrice = currentPrice || product.currentPrice;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    product.images = images || product.images;
    product.sku = sku || product.sku;

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.remove();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
