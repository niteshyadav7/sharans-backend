import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import csv from "csvtojson";
import fs from "fs";

// ✅ Create product (Admin)
export const createProduct = async (req, res) => {
  try {
    let { category } = req.body;

    let categoryDoc;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findById(category);
    } else {
      categoryDoc = await Category.findOne({ name: category });
    }
    if (!categoryDoc)
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });

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

// ✅ Get all products
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

// ✅ Get product by ID
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
    if (category) {
      let categoryDoc;
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
      } else {
        categoryDoc = await Category.findOne({ name: category });
      }
      if (!categoryDoc)
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" });
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

// ✅ Bulk upload products (Admin) - Detailed Error Handling
export const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "CSV file required" });

    const filePath = req.file.path;
    const jsonArray = await csv().fromFile(filePath);
    fs.unlinkSync(filePath); // Cleanup

    const products = [];
    const errors = [];
    let rowIndex = 1; // Assuming header is row 1, first data row is 2

    for (const row of jsonArray) {
      rowIndex++;
      
      // 1. Check Missing Fields
      if (!row.name || !row.category || !row.currentPrice || !row.images) {
        errors.push({ row: rowIndex, name: row.name || 'Unknown', error: "Missing required fields (Name, Category, Price, Images)" });
        continue;
      }

      // 2. Validate Category
      let categoryDoc;
      if (mongoose.Types.ObjectId.isValid(row.category)) {
        categoryDoc = await Category.findById(row.category);
      } else {
        categoryDoc = await Category.findOne({ name: row.category });
      }

      if (!categoryDoc) {
        errors.push({ row: rowIndex, name: row.name, error: `Category '${row.category}' not found` });
        continue;
      }

      // 3. Prepare Product Object
      const productData = {
        name: row.name.trim(),
        description: row.description || "",
        originalPrice: Number(row.originalPrice) || 0,
        currentPrice: Number(row.currentPrice) || 0,
        currency: row.currency || "INR",
        stock: Number(row.stock) || 0,
        sku: row.sku || "",
        category: categoryDoc._id,
        brand: row.brand || "Sharans",
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
        size: row.size || "Free Size",
        netQuantity: row.netQuantity || "",
        capacity: row.capacity || "",
        type: row.type || "",
        skinType: row.skinType || "All Skin Types",
        gender: row.gender || "Unisex",
        features: row.features
          ? row.features.split(",").map((f) => f.trim())
          : [],
        countryOfOrigin: row.countryOfOrigin || "India",
        images: row.images.split(",").map((img) => img.trim()),
        seller: {
          name: row.sellerName || "",
          rating: Number(row.sellerRating) || 0,
          totalRatings: Number(row.sellerTotalRatings) || 0,
          followers: Number(row.sellerFollowers) || 0,
        },
        delivery: {
          freeDelivery: row.freeDelivery?.toLowerCase() === "true",
          codAvailable: row.codAvailable?.toLowerCase() === "true",
        },
        status: row.status || "active",
      };

      products.push(productData);
    }

    // 4. Insert Batch with Ordered: false
    let addedCount = 0;
    if (products.length > 0) {
      try {
        await Product.insertMany(products, { ordered: false });
        addedCount = products.length;
      } catch (err) {
        // Handle Partial Failures (BulkWriteError)
        if (err.insertedDocs) addedCount = err.insertedDocs.length;
        if (err.writeErrors) {
           err.writeErrors.forEach(e => {
              // Try to identify which product failed. e.index relates to the array passed to insertMany
              const failedProd = products[e.index];
              errors.push({ 
                 row: 'DB Insert', 
                 name: failedProd?.name || 'Unknown', 
                 error: e.errmsg 
              });
           });
        } else {
           // Other error
           errors.push({ row: 'General', error: err.message });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Completed: ${addedCount} added, ${errors.length} failed.`,
      addedCount,
      failedCount: errors.length,
      errors // [{ row, name, error }]
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
};
