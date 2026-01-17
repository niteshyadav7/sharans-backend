import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { Eye, Search, Filter, ShoppingBag, Truck, CheckCircle, XCircle, ChevronLeft, ChevronRight, Clock, CreditCard } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders?limit=50"); 
      // Backend getAllOrders supports pagination.
      // Adjust limit as needed.
      setOrders(data.orders);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      
      // Update local state
      setOrders(orders.map(o => 
        o._id === id ? { ...o, orderStatus: newStatus } : o
      ));
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

   const filteredOrders = orders.filter(order => {
      const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
      const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
   });

   // Pagination Logic
   const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const displayedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

   // Reset to page 1 on filter
   useEffect(() => {
     setCurrentPage(1);
   }, [searchTerm, filterStatus]);

   const stats = {
     total: orders.length,
     processing: orders.filter(o => o.orderStatus === 'processing').length,
     delivered: orders.filter(o => o.orderStatus === 'delivered').length,
     revenue: orders.filter(o => o.orderStatus !== 'cancelled').reduce((acc, o) => acc + o.totalAmount, 0)
   };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Orders Lifecycle</h1>
          <p className="text-gray-500 text-sm">Monitor shipments, payments, and fulfillment status.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase">Live Pulse</span>
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
             <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processing</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.processing}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
             <Truck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivered</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.delivered}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
             <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search by Order ID or Customer Name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-3">
          <div className="relative">
             <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <select 
               className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none bg-white text-sm appearance-none cursor-pointer font-bold uppercase tracking-tight"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="all">Fulfillment: All</option>
               <option value="processing">Processing</option>
               <option value="shipped">Shipped</option>
               <option value="delivered">Delivered</option>
               <option value="cancelled">Cancelled</option>
             </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Order Ref</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Customer</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Details</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Payment</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Fulfillment</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Syncing orders...</p>
                   </td>
                </tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                         <ShoppingBag size={48} className="text-gray-100" />
                         <p className="text-gray-500 font-black uppercase tracking-tight">No orders match your pulse</p>
                      </div>
                   </td>
                </tr>
              ) : (
                displayedOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs font-black text-gray-900 bg-gray-50 px-2 py-1 rounded w-fit border border-gray-100">
                        #{order._id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1.5 flex items-center gap-1 uppercase">
                         <Clock size={10} /> {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-gray-900 tracking-tight">{order.user?.name || "Guest Checkout"}</div>
                      <div className="text-xs text-gray-400 font-medium">{order.user?.email || "No email provided"}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm font-black text-blue-600">₹{order.totalAmount.toLocaleString()}</div>
                       <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{order.orderItems?.length || 0} ITEMS</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                             order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {order.paymentStatus}
                          </span>
                       </div>
                       <div className="text-[10px] text-gray-400 font-bold uppercase mt-1.5">{order.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4">
                       <select 
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className={`text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 border-none focus:ring-4 focus:ring-blue-50 cursor-pointer appearance-none transition-all shadow-sm ${getStatusColor(order.orderStatus)}`}
                       >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                       </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                          <Eye size={20} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
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
               <div className="flex gap-1" md:flex>
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
    </div>
  );
};

export default Orders;
