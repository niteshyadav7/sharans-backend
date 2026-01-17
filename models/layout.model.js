import mongoose from "mongoose";

const layoutSchema = new mongoose.Schema(
  {
    heroCarousel: [
      {
        image: { type: String, required: true },
        title: { type: String },
        subtitle: { type: String },
        ctaText: { type: String },
        ctaLink: { type: String },
        active: { type: Boolean, default: true }
      }
    ],
    promotionalBanner: {
      text: { type: String, default: "Free Shipping on Orders Over ₹999" },
      link: { type: String },
      isActive: { type: Boolean, default: true },
      backgroundColor: { type: String, default: "#000000" },
      textColor: { type: String, default: "#FFFFFF" }
    },
    navbar: {
      logo: { type: String }, // URL to logo
      menuItems: [
        {
          label: { type: String, required: true },
          path: { type: String, required: true },
          active: { type: Boolean, default: true },
          highlight: { type: Boolean, default: false } // e.g., for "SALE" item
        }
      ]
    },
    footer: {
      description: { type: String, default: "Your premium fashion destination." },
      socialLinks: [
        { platform: { type: String }, url: { type: String }, active: { type: Boolean, default: true } }
      ],
      contactInfo: {
        address: { type: String },
        phone: { type: String },
        email: { type: String }
      },
      copyrightText: { type: String, default: "© 2026 Sharans. All rights reserved." }
    },
    features: [ // For "Natural Ingredients", "Cruelty Free", etc.
      {
        icon: { type: String }, // URL or Lucide Icon Name
        title: { type: String, required: true },
        description: { type: String },
        active: { type: Boolean, default: true }
      }
    ],
    featuredSections: [
      {
        title: { type: String, required: true }, // e.g. "Bestsellers", "Skin Care"
        type: { type: String, enum: ['products', 'categories', 'banner', 'grid'], default: 'products' },
        data: [{ type: mongoose.Schema.Types.Mixed }], // Array of IDs or Objects
        layout: { type: String, default: 'grid' }, // 'grid', 'carousel', 'large-card'
        active: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 }
      }
    ],
    ads: [
      {
        title: { type: String },
        image: { type: String, required: true },
        link: { type: String },
        size: { type: String, enum: ['banner-full', 'banner-half', 'sidebar', 'box', 'popup', 'custom'], default: 'banner-full' },
        width: { type: String }, // e.g. "1200px" or "100%"
        height: { type: String }, // e.g. "200px"
        placement: { type: String, enum: ['home-top', 'home-middle', 'home-bottom', 'category-sidebar', 'category-feed', 'product-page-sidebar', 'cart-page'], default: 'home-middle' },
        active: { type: Boolean, default: true }
      }
    ],
    testimonials: [
      {
        name: { type: String, required: true },
        role: { type: String }, // e.g. "Wellness Blogger"
        content: { type: String, required: true },
        image: { type: String }, // User avatar
        rating: { type: Number, default: 5 },
        productName: { type: String }, // Optional: "Verified purchase: [Product]"
        active: { type: Boolean, default: true } // "Highlight" feature
      }
    ],
    ourStory: {
      heading: { type: String, default: "Our Story" },
      description: { type: String },
      image: { type: String }, // Large image URL
      ctaText: { type: String, default: "Learn More" },
      ctaLink: { type: String, default: "/about" },
      active: { type: Boolean, default: true }
    },
    topFavorites: {
      isActive: { type: Boolean, default: true },
      title: { type: String, default: "Top 5 Favorites" },
      subtitle: { type: String, default: "Handpicked by our community, loved by thousands" },
      products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        customTitle: { type: String }, // Optional override
        customBadge: { type: String }, // e.g. "Best Seller"
        customImage: { type: String } // Optional override
      }]
    },
    bestsellers: {
      isActive: { type: Boolean, default: true },
      title: { type: String, default: "Bestsellers" },
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // Manual selection for now, or could be auto
    },
    featuredCategories: {
      isActive: { type: Boolean, default: true },
      title: { type: String, default: "Shop by Category" },
      categories: [{
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        customImage: { type: String }, // Override category image
        customTitle: { type: String }, // Override category name
        customSubtitle: { type: String }, // e.g. "SKIN CARE PRODUCTS"
        ctaText: { type: String, default: "Shop Now" }
      }]
    },
    productSpotlight: {
      isActive: { type: Boolean, default: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      customTitle: { type: String }, // Override product name
      tagline: { type: String }, // e.g. "All-Day Moisture, All-Day Smooth."
      description: { type: String }, // Main description text
      features: [{ type: String }], // Bullet points
      backgroundImage: { type: String }, // Large hero image
      ctaText: { type: String, default: "Shop Now" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Layout", layoutSchema);
