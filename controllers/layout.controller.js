import Layout from "../models/layout.model.js";

// Get Content Layout
export const getLayout = async (req, res) => {
  try {
    let layout = await Layout.findOne()
      .populate('topFavorites.products.product')
      .populate('bestsellers.products')
      .populate('featuredCategories.categories.category')
      .populate('productSpotlight.product');
    if (!layout) {
      // Create default layout if none exists
      layout = await Layout.create({
        heroCarousel: [
          {
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
            title: "Summer Collection 2026",
            subtitle: "Discover the hottest trends of the season.",
            ctaText: "Shop Now",
            ctaLink: "/shop"
          }
        ],
        navbar: {
          menuItems: [
             { label: "New Arrivals", path: "/new-arrivals" },
             { label: "Men", path: "/category/men" },
             { label: "Women", path: "/category/women" },
             { label: "Sale", path: "/sale", highlight: true }
          ]
        }
      });
    }
    res.status(200).json({ success: true, layout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Layout
export const updateLayout = async (req, res) => {
  try {
    const updateData = req.body;
    
    // Ensure we are updating the singleton layout document
    let layout = await Layout.findOne();
    if (layout) {
      layout = await Layout.findOneAndUpdate({}, updateData, { new: true });
    } else {
      layout = await Layout.create(updateData);
    }
    
    res.status(200).json({
      success: true,
      message: "Storefront updated successfully",
      layout,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
