import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { Trash2, Plus, Copy, Calendar, Tag, Zap, X, Search, ChevronLeft, ChevronRight, CheckCircle, Clock } from "lucide-react";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("single"); // 'single' or 'bulk'
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: 0,
    maxDiscount: "",
    usageLimit: "",
    expiryDate: "",
    // Bulk specific
    prefix: "SALE",
    number: 10
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data || []);
    } catch (error) {
       toast.error("Failed to load coupons");
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
            code: formData.code,
            discountType: formData.discountType,
            discountValue: Number(formData.discountValue),
            minPurchase: Number(formData.minPurchase) || 0,
            maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
            expiryDate: formData.expiryDate || undefined
      };

      if (mode === 'single') {
         await api.post("/coupons", payload);
         toast.success("Coupon created");
      } else {
         await api.post("/coupons/bulk", {
            ...payload,
            prefix: formData.prefix,
            number: Number(formData.number)
         });
         toast.success("Bulk coupons generated");
      }
      closeModal();
      fetchCoupons();
    } catch (error) {
      const msg = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors) {
          // Show first validation error
          toast.error(validationErrors[0]?.message || "Validation failed");
      } else {
          toast.error(msg || "Operation failed");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(coupons.filter(c => c._id !== id));
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
       code: "", discountType: "percentage", discountValue: "", 
       minPurchase: 0, maxDiscount: "", usageLimit: "", expiryDate: "",
       prefix: "SALE", number: 10
    });
  };

  const copyCode = (code) => {
     navigator.clipboard.writeText(code);
     toast.success("Copied to clipboard");
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCoupons = filteredCoupons.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => !c.expiryDate || new Date(c.expiryDate) > new Date()).length,
    bulk: coupons.filter(c => c.code.includes('-')).length // Simple heuristic
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Coupons & Promotions</h1>
          <p className="text-gray-500 text-sm">Create and manage marketing discounts and bulk codes.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button 
               onClick={() => { setMode('bulk'); setShowModal(true); }} 
               className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-xl text-sm font-bold border border-purple-100 shadow-sm hover:bg-purple-50 transition-all"
            >
               <Zap size={16} /> Bulk Generate
            </button>
            <button 
               onClick={() => { setMode('single'); setShowModal(true); }} 
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all"
            >
               <Plus size={16} /> Add Coupon
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <Tag size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Coupons</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
             <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Created</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
             <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bulk Codes</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.bulk}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search by coupon code..."
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
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Coupon Code</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Discount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Condition</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Usage</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Expiry</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                       <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                       Loading coupons...
                    </td>
                  </tr>
               ) : displayedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <Tag size={48} className="text-gray-100" />
                          <p className="text-gray-500 font-bold">No coupons found</p>
                       </div>
                    </td>
                  </tr>
               ) : (
                  displayedCoupons.map(coupon => (
                     <tr key={coupon._id} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                           <button onClick={() => copyCode(coupon.code)} className="flex items-center gap-2 font-mono font-bold text-blue-600 hover:text-blue-800 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100 group-hover:scale-105 transition-transform">
                              <Tag size={14} /> {coupon.code} <Copy size={12} className="opacity-50" />
                           </button>
                        </td>
                        <td className="px-6 py-4">
                           <div className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit">
                              {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                           </div>
                           {coupon.maxDiscount && <div className="text-[10px] text-gray-400 mt-1 font-bold">MAX ₹{coupon.maxDiscount}</div>}
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm font-bold text-gray-600">MIN ORDER</div>
                           <div className="text-xs text-gray-400">₹{coupon.minPurchase.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1.5 w-max">
                              <div className="text-sm font-bold text-gray-700">
                                 {coupon.usedCount} <span className="text-gray-300 font-normal">/</span> {coupon.usageLimit || '∞'}
                              </div>
                              <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500" style={{ width: `${coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0}%` }}></div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           {coupon.expiryDate ? (
                              <div className={`flex items-center gap-1.5 text-xs font-bold ${new Date(coupon.expiryDate) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                                 <Calendar size={14} />
                                 {new Date(coupon.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                           ) : (
                              <span className="text-xs font-bold text-gray-300">EVERGREEN</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => handleDelete(coupon._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={18} />
                           </button>
                        </td>
                     </tr>
                  ))
               )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredCoupons.length > 0 && (
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
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
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

      {/* Modal */}
      {showModal && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 transform transition-all scale-100">
               <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/50">
                  <div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                       {mode === 'single' ? 'New Coupon' : 'Bulk Generation'}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Configure discount rules and limits.</p>
                  </div>
                  <button onClick={closeModal} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X className="text-gray-400" size={24} /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  
                  {mode === 'single' ? (
                     <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Coupon Code</label>
                        <div className="relative">
                           <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                           <input 
                              name="code" 
                              value={formData.code} 
                              onChange={handleChange} 
                              required 
                              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-mono font-bold uppercase placeholder:text-gray-300" 
                              placeholder="SAVE50" 
                           />
                        </div>
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Code Prefix</label>
                           <input name="prefix" value={formData.prefix} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none uppercase font-bold" placeholder="SALE" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Quantity</label>
                           <input type="number" name="number" value={formData.number} onChange={handleChange} required min="1" max="100" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold" />
                        </div>
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Discount Type</label>
                        <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none bg-white font-bold appearance-none cursor-pointer">
                           <option value="percentage">Percentage (%)</option>
                           <option value="fixed">Flat Amount (₹)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Value</label>
                        <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-black" placeholder="0" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Min Purchase (₹)</label>
                        <input type="number" name="minPurchase" value={formData.minPurchase} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold" placeholder="0" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Max Discount (₹)</label>
                        <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold" placeholder="Optional" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Expiry Date</label>
                        <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Usage Limit</label>
                        <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold" placeholder="Unlimited" />
                     </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex justify-end gap-3 mt-4">
                     <button type="button" onClick={closeModal} className="px-6 py-3 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Discard</button>
                     <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                        {mode === 'single' ? 'Create Coupon' : 'Generate Codes'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default Coupons;
