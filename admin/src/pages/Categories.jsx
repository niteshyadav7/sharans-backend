import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { Trash2, Edit2, Plus, Upload, Download, Search, LayoutGrid, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      // Handle direct array response from backend
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (error) {
       toast.error("Failed to load categories");
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ["name", "description", "image", "isActive"];
    const sample = ["Skincare,Best skincare products,http://img.com/skin.jpg,true"];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...sample].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "categories_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading categories...");
    try {
      const { data } = await api.post("/categories/bulk", formData, {
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
         toast.success(data.message || "Categories uploaded successfully", { id: toastId });
      }
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed", { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length
  };

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
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Categories</h1>
          <p className="text-gray-500 text-sm">Organize your products into logical departments.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 shadow-sm hover:bg-emerald-50 transition-all"
            >
               <Upload size={16} /> Bulk Upload
            </button>
            <button 
               onClick={handleDownloadTemplate}
               className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl text-sm font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
            >
               <Download size={16} /> Template
            </button>
            <Link 
               to="/categories/new" 
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all"
            >
               <Plus size={18} /> Add Category
            </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <LayoutGrid size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Departments</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
             <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
             <XCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hidden</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.inactive}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search by category name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
               <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Visual</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Category Info</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Visibility</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                       <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                       <p className="text-gray-400 font-medium">Loading catalog...</p>
                    </td>
                  </tr>
               ) : displayedCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <LayoutGrid size={48} className="text-gray-100" />
                          <p className="text-gray-500 font-bold">No categories found</p>
                       </div>
                    </td>
                  </tr>
               ) : (
                  displayedCategories.map(cat => (
                     <tr key={cat._id} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                           <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                              {cat.image ? (
                                 <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                              ) : (
                                 <LayoutGrid size={20} className="text-gray-200" />
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{cat.name}</div>
                           <div className="text-xs text-gray-400 font-medium mt-0.5 line-clamp-1 max-w-sm">{cat.description || 'No description provided.'}</div>
                        </td>
                        <td className="px-6 py-4">
                           {cat.isActive ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-100">Live</span>
                           ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider border border-red-100">Hidden</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <Link to={`/categories/${cat._id}`} title="Edit" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                 <Edit2 size={18} />
                              </Link>
                              <button onClick={() => handleDelete(cat._id)} title="Delete" className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
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
        {!loading && filteredCategories.length > 0 && (
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

export default Categories;
