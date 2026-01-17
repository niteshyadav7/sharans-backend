import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { X, Plus, Upload } from "lucide-react";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [categories, setCategories] = useState([]);
  
  // Form State matching the extensive model
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    originalPrice: "",
    currentPrice: "",
    stock: "",
    brand: "Sharans",
    size: "Free Size",
    netQuantity: "",
    capacity: "",
    skinType: "All Skin Types",
    gender: "Unisex",
    countryOfOrigin: "India",
    category: "",
    description: "",
    images: "", // Text input for URLs
    tags: "", // Comma separated
    features: "", // Comma separated
    sellerName: "",
    sellerRating: 0,
    sellerTotalRatings: 0,
    sellerFollowers: 0,
    freeDelivery: true,
    codAvailable: true,
    status: "active"
  });

  useEffect(() => {
    // Fetch Categories
    const loadCategories = async () => {
       try {
          const { data } = await api.get("/categories");
          setCategories(Array.isArray(data) ? data : data.categories || []);
       } catch (error) {
          toast.error("Failed to load categories");
       }
    };
    loadCategories();

    // Fetch Product if Edit Mode
    if (id) {
       const fetchProduct = async () => {
          try {
             const { data } = await api.get(`/products/${id}`);
             const p = data.product;
             setFormData({
                name: p.name,
                sku: p.sku || "",
                originalPrice: p.originalPrice,
                currentPrice: p.currentPrice,
                stock: p.stock,
                brand: p.brand || "Sharans",
                size: p.size || "Free Size",
                netQuantity: p.netQuantity || "",
                capacity: p.capacity || "",
                skinType: p.skinType || "All Skin Types",
                gender: p.gender || "Unisex",
                countryOfOrigin: p.countryOfOrigin || "India",
                category: p.category?._id || p.category,
                description: p.description || "",
                images: p.images.join(", "),
                tags: p.tags.join(", "),
                features: p.features.join(", "),
                sellerName: p.seller?.name || "",
                sellerRating: p.seller?.rating || 0,
                sellerTotalRatings: p.seller?.totalRatings || 0,
                sellerFollowers: p.seller?.followers || 0,
                freeDelivery: p.delivery?.freeDelivery ?? true,
                codAvailable: p.delivery?.codAvailable ?? true,
                status: p.status || "active"
             });
          } catch (error) {
             toast.error("Failed to load product");
             navigate("/products");
          } finally {
             setLoading(false);
          }
       };
       fetchProduct();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
     const { name, value, type, checked } = e.target;
     setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
     }));
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
     try {
        const payload = {
           ...formData,
           originalPrice: Number(formData.originalPrice),
           currentPrice: Number(formData.currentPrice),
           stock: Number(formData.stock),
           images: formData.images.split(",").map(s => s.trim()).filter(Boolean),
           tags: formData.tags.split(",").map(s => s.trim()).filter(Boolean),
           features: formData.features.split(",").map(s => s.trim()).filter(Boolean),
           seller: {
              name: formData.sellerName,
              rating: Number(formData.sellerRating),
              totalRatings: Number(formData.sellerTotalRatings),
              followers: Number(formData.sellerFollowers)
           },
           delivery: {
              freeDelivery: formData.freeDelivery,
              codAvailable: formData.codAvailable
           }
        };

        if (id) {
           await api.put(`/products/${id}`, payload);
           toast.success("Product updated");
        } else {
           await api.post("/products", payload);
           toast.success("Product created");
        }
        navigate("/products");
     } catch (error) {
        toast.error(error.response?.data?.message || "Operation failed");
     }
  };

  if (loading) return <div className="p-8 text-center bg-white rounded-xl shadow-sm">Loading...</div>;

  return (
    <div className="flex justify-center items-start min-h-screen bg-transparent p-4">
      {/* Container simulating Modal look but on a page */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl overflow-hidden border border-gray-100">
         <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800">{id ? "Edit Product" : "Add Product"}</h2>
            <button onClick={() => navigate("/products")} className="text-gray-500 hover:text-gray-700">
               <X size={24} />
            </button>
         </div>

         <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Row 1: Name & SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name*</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
            </div>

            {/* Row 2: Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Original Price*</label>
                  <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} required className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Current Price*</label>
                  <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} required className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
            </div>

            {/* Row 3: Stock & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
            </div>

            {/* Row 4: Size & Net Qty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Size</label>
                  <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Net Quantity</label>
                  <input type="text" name="netQuantity" value={formData.netQuantity} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
            </div>

            {/* Row 5: Capacity & Skin Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Capacity</label>
                  <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Skin Type</label>
                  <input type="text" name="skinType" value={formData.skinType} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
            </div>

            {/* Row 6: Gender & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50">
                     <option value="Unisex">Unisex</option>
                     <option value="Men">Men</option>
                     <option value="Women">Women</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Country of Origin</label>
                  <input type="text" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
            </div>

            {/* Category & Description */}
            <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Category</label>
               <select name="category" value={formData.category} onChange={handleChange} required className="w-full border rounded-lg p-2.5 bg-gray-50">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
               </select>
            </div>

            <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
               <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full border rounded-lg p-2.5 bg-gray-50" />
            </div>

            {/* Images */}
            <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Images (Comma separated URLs)</label>
               <input type="text" name="images" value={formData.images} onChange={handleChange} placeholder="http://..., http://..." className="w-full border rounded-lg p-2.5 bg-gray-50" />
               <p className="text-xs text-gray-400 mt-1">This matches the bulk input style. You can also paste multiple URLs.</p>
               {formData.images && (
                   <div className="flex gap-2 mt-2 flex-wrap">
                       {formData.images.split(",").map((url, i) => url.trim() && (
                           <img key={i} src={url.trim()} alt="" className="h-16 w-16 object-cover rounded border" onError={(e) => e.target.style.display='none'} />
                       ))}
                   </div>
               )}
            </div>

            {/* Tags & Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tags (Comma separated)</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
               <div>
                   <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Features (Comma separated)</label>
                   <input type="text" name="features" value={formData.features} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
               </div>
            </div>

            {/* Seller Info */}
            <div className="border-t pt-4">
               <h3 className="text-sm font-bold text-gray-700 mb-3">Seller Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Seller Name</label>
                     <input type="text" name="sellerName" value={formData.sellerName} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
                  </div>
                  <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Seller Rating (0-5)</label>
                     <input type="number" step="0.1" name="sellerRating" value={formData.sellerRating} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
                  </div>
                  <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Total Ratings</label>
                     <input type="number" name="sellerTotalRatings" value={formData.sellerTotalRatings} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
                  </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Followers</label>
                     <input type="number" name="sellerFollowers" value={formData.sellerFollowers} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-gray-50" />
                  </div>
               </div>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6 items-center border-t pt-4">
               <label className="flex items-center gap-2">
                  <input type="checkbox" name="freeDelivery" checked={formData.freeDelivery} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium">Free Delivery</span>
               </label>
               <label className="flex items-center gap-2">
                   <input type="checkbox" name="codAvailable" checked={formData.codAvailable} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                   <span className="text-sm font-medium">COD Available</span>
               </label>
            </div>

            <div className="flex justify-end gap-3 pt-6">
               <button type="button" onClick={() => navigate("/products")} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
               <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200">
                  {id ? "Update Product" : "Add Product"}
               </button>
            </div>

         </form>
      </div>
    </div>
  );
};

export default ProductForm;
