import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { User, Shield, Ban, CheckCircle, Trash2, Search, Filter, Mail, Calendar, Award, ChevronLeft, ChevronRight } from "lucide-react";

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      const userList = Array.isArray(data) ? data : data.users || [];
      setUsers(userList);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    // Optimistic Update
    const newStatus = !user.isActive;
    const action = newStatus ? "activated" : "deactivated";
    
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`)) return;

    try {
      await api.patch(`/users/${user._id}/status`);
      setUsers(users.map(u => u._id === user._id ? { ...u, isActive: newStatus } : u));
      toast.success(`User ${action}`);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
      // Revert if needed, but fetch usually handles it on refresh
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Customers</h1>
          <p className="text-gray-500 text-sm">Manage and monitor your store's customer base.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <User size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
             <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
             <Shield size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Full Admins</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.admins}</h3>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-40">
             <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <select 
               className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none bg-white text-sm appearance-none cursor-pointer"
               value={roleFilter}
               onChange={(e) => setRoleFilter(e.target.value)}
             >
               <option value="all">All Roles</option>
               <option value="user">User</option>
               <option value="admin">Admin</option>
             </select>
          </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
               <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">User Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">Points & Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12">
                       <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                          <p>Gathering customer data...</p>
                       </div>
                    </td>
                  </tr>
               ) : displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                       <div className="flex flex-col items-center justify-center">
                          <User size={48} className="text-gray-200 mb-2" />
                          <p className="font-medium">No customers found</p>
                          <p className="text-sm">Try adjusting your filters or search term.</p>
                       </div>
                    </td>
                  </tr>
               ) : (
                  displayedUsers.map(user => (
                     <tr key={user._id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center">
                              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-4 shadow-sm group-hover:scale-110 transition-transform">
                                 {user.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                 <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                 <div className="text-sm text-gray-400 flex items-center gap-1">
                                    <Mail size={12} /> {user.email}
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-tight ${
                              user.role === 'admin' 
                                ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                           }`}>
                              {user.role === 'admin' ? <Shield size={12} className="mr-1" /> : <User size={12} className="mr-1" />}
                              {user.role.toUpperCase()}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                 <Award size={14} className="text-amber-500" />
                                 {user.loyaltyPoints || 0} pts
                              </div>
                              <div>
                                 {user.isActive ? (
                                    <span className="px-2 py-0.5 inline-flex text-[10px] font-black uppercase rounded bg-green-100 text-green-700">
                                       Active
                                    </span>
                                 ) : (
                                    <span className="px-2 py-0.5 inline-flex text-[10px] font-black uppercase rounded bg-red-100 text-red-700">
                                       Banned
                                    </span>
                                 )}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                              <Calendar size={14} className="text-gray-400" />
                              {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {user.role !== 'admin' && (
                                 <>
                                   <button 
                                     onClick={() => handleToggleStatus(user)}
                                     className={`p-2 rounded-xl transition-all ${user.isActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                                     title={user.isActive ? "Deactivate User" : "Activate User"}
                                   >
                                     {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                                   </button>
                                   <button 
                                     onClick={() => handleDelete(user._id)}
                                     className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                                     title="Delete User"
                                   >
                                     <Trash2 size={18} />
                                   </button>
                                 </>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))
               )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900">{startIndex + 1}</span> to <span className="text-gray-900">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> of <span className="text-gray-900">{filteredUsers.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                   <button
                     key={i + 1}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                       currentPage === i + 1 
                         ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                         : 'text-gray-600 hover:bg-gray-100'
                     }`}
                   >
                     {i + 1}
                   </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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

export default Customers;
