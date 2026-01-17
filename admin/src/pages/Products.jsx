import { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit, Trash2, Upload, Download, ChevronLeft, ChevronRight, Filter, Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const fileInputRef = useRef(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products?limit=100");
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch products");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully");
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "name", "category", "originalPrice", "currentPrice", "stock", "sku", 
      "brand", "description", "images", "tags", "features", 
      "size", "netQuantity", "capacity", "skinType", "gender", "countryOfOrigin",
      "sellerName", "sellerRating", "freeDelivery", "codAvailable"
    ];
    const sample = [
      "Face Cream,Skincare,500,399,100,SKU001,Sharans,Best cream,http://img.com/1.jpg,face,glowing,50g,50g,,All,Unisex,India,Sharans Official,4.5,true,true"
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...sample].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading products...");
    try {
      const { data } = await api.post("/products/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.failedCount > 0) {
         const errorList = data.errors.slice(0, 5).map(e => `Row ${e.row}: ${e.error}`).join('\n');
         const more = data.failedCount > 5 ? `\n...and ${data.failedCount - 5} more` : '';
         toast.error(
             <div>
                <p className="font-bold">{data.addedCount} added, {data.failedCount} failed.</p>
                <div className="text-xs mt-1 whitespace-pre-wrap">{errorList}{more}</div>
             </div>, 
             { duration: 8000 }
         );
      } else {
         toast.success(data.message || "Products uploaded successfully", { id: toastId });
      }
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed", { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category?._id === categoryFilter || product.category?.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 on filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((acc, p) => acc + (p.currentPrice * p.stock), 0)
  };

  const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".csv" 
        className="hidden" 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Products Catalog</h1>
          <p className="text-gray-500 text-sm">Manage inventory, prices, and product visibility.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button 
               onClick={handleDownloadTemplate}
               className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 border border-gray-200 shadow-sm transition-all"
            >
               <Download size={16} /> <span className="hidden sm:inline">CSV Template</span>
            </button>
            <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-50 border border-emerald-100 shadow-sm transition-all"
            >
               <Upload size={16} /> <span className="hidden sm:inline">Bulk Import</span>
            </button>
            <Link
              to="/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} /> Add Product
            </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <Package size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total SKUs</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
             <TrendingDown size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low Stock</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.lowStock}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
             <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Out of Stock</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.outOfStock}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
             <Package size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Value</p>
            <h3 className="text-xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search by name, SKU, or brand..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-3">
          <div className="relative">
             <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <select 
               className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none bg-white text-sm appearance-none cursor-pointer font-medium"
               value={categoryFilter}
               onChange={(e) => setCategoryFilter(e.target.value)}
             >
               <option value="all">All Categories</option>
               {categories.map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Product Detail</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Category</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Pricing</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Inventory</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                         <p className="text-gray-400 font-medium">Syncing products...</p>
                      </div>
                   </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                         <Package size={48} className="text-gray-100" />
                         <p className="text-gray-500 font-bold">No products found</p>
                         <p className="text-sm text-gray-400">Try adjusting your filters or add a new SKU.</p>
                      </div>
                   </td>
                </tr>
              ) : (
                displayedProducts.map((product) => (
                  <tr key={product._id} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 relative">
                          {product.images && product.images[0] ? (
                            <img className="h-full w-full rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" src={product.images[0].url || product.images[0]} alt="" />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300"><Plus size={16} /></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</div>
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{product.sku || 'NO-SKU'} • {product.brand || 'No Brand'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm font-black text-gray-900">₹{product.currentPrice.toLocaleString()}</div>
                       {product.originalPrice > product.currentPrice && (
                         <div className="text-[10px] text-red-400 line-through font-bold">₹{product.originalPrice}</div>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 inline-flex w-fit text-[10px] font-black uppercase rounded ${
                            product.stock > 10 ? 'bg-green-100 text-green-700' : 
                            product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
                          </span>
                          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full ${product.stock > 10 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(product.stock * 2, 100)}%` }}></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Link to={`/products/${product._id}`} title="Edit Product" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            title="Delete Product"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredProducts.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
               Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
               >
                 <ChevronLeft size={18} />
               </button>
               <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                        currentPage === i + 1 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
               </div>
               <button 
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages}
                 className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
               >
                 <ChevronRight size={18} />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
