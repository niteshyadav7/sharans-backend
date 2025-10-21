
import Category from "../models/category.model.js";
import csv from "csvtojson";
import fs from "fs";
import slugify from "slugify";

export const bulkUploadCategories = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "CSV file is required" });

    const filePath = req.file.path;
    const jsonArray = await csv().fromFile(filePath);

    const categories = [];
    const slugsInBatch = new Set();

    for (const row of jsonArray) {
      if (!row.name) continue;

      const slug = slugify(row.name, { lower: true, strict: true });

      // Skip if slug already processed in this batch
      if (slugsInBatch.has(slug)) continue;

      const exists = await Category.findOne({ slug });
      if (!exists) {
        categories.push({
          name: row.name.trim(),
          slug,
          description: row.description || "",
          image: row.image || "",
          isActive: row.isActive?.toLowerCase() === "true",
        });
        slugsInBatch.add(slug);
      }
    }

    if (categories.length > 0) {
      await Category.insertMany(categories, { ordered: false });
    }

    fs.unlinkSync(filePath); // delete uploaded file
    res
      .status(201)
      .json({ message: `${categories.length} categories added successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Create category (Admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const existing = await Category.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const slug = slugify(name, { lower: true, strict: true });
    const category = await Category.create({ name, slug, description, image });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories (Public)
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID (Public)
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category (Admin)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category) return res.status(404).json({ message: "Not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
