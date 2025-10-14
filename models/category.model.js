import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String, // Optional image URL for category
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Before saving, automatically generate slug
categorySchema.pre("save", function (next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/ /g, "-");
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
