import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { Users, ShoppingBag, DollarSign, Package, TrendingUp, ArrowUpRight, ArrowDownRight, MoreVertical, Bell, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setData(data);
      } catch (error) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center">No data available</div>;

  const { stats, recentOrders, dailySales } = data;

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {trend && (
           <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
             trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
           }`}>
             {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
             {trendValue}
           </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        <p className="text-2xl font-black mt-1 text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Control Center</h1>
            <p className="text-gray-500 text-sm font-medium">Real-time overview of your store's vital signs.</p>
          </div>
          <div className="flex gap-3">
             <div className="hidden lg:flex flex-col items-end">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Global Pulse</p>
                <p className="text-sm font-black text-emerald-500 uppercase tracking-tight">System Optimal</p>
             </div>
             <button className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-gray-900 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                <Activity size={16} /> Data Export
             </button>
          </div>
       </div>
       
       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="emerald" trend="up" trendValue="+12.5%" />
          <StatCard title="Volume" value={stats.orders} icon={ShoppingBag} color="blue" trend="up" trendValue="+8.2%" />
          <StatCard title="Community" value={stats.users} icon={Users} color="purple" trend="down" trendValue="-2.1%" />
          <StatCard title="Inventory" value={stats.products} icon={Package} color="amber" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm lg:col-span-2">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Performance Matrix</h3>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                      <TrendingUp size={12} className="text-emerald-500" /> Sales velocity over 7 days
                   </p>
                </div>
                <div className="bg-gray-50 p-1 rounded-xl flex">
                   <button className="px-4 py-1.5 bg-white text-gray-800 rounded-lg text-[10px] font-black uppercase shadow-sm">Daily</button>
                   <button className="px-4 py-1.5 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-gray-600 transition-colors">Weekly</button>
                </div>
             </div>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={dailySales}>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="_id" 
                        tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        tickFormatter={(val) => val.toUpperCase().slice(0, 3)}
                      />
                      <YAxis 
                        tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip 
                        cursor={{fill: '#f8fafc', radius: 12}}
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '12px'}}
                      />
                      <Bar 
                        dataKey="sales" 
                        fill="#3b82f6" 
                        radius={[10, 10, 10, 10]} 
                        barSize={32}
                      />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8">
                <div className="h-24 w-24 bg-red-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
             </div>
             
             <div className="flex items-center justify-between mb-8 relative">
                <h3 className="text-xl font-black text-red-900 uppercase tracking-tight">Alert Hub</h3>
                <MoreVertical size={20} className="text-gray-300" />
             </div>

             <div className="space-y-6 relative">
                <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                         <Package size={20} />
                      </div>
                      <span className="text-[10px] font-black text-red-900 uppercase tracking-widest">Inventory Crisis</span>
                   </div>
                   <p className="text-4xl font-black text-red-950 tracking-tighter">{stats.lowStock}</p>
                   <p className="text-xs text-red-700 font-bold uppercase tracking-tight mt-1 opacity-60">Products under critical threshold</p>
                </div>

                <div className="flex flex-col gap-3">
                   <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black transition-all">
                      Replenish Stocks
                   </button>
                   <button className="w-full py-4 bg-white border border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:text-gray-900 hover:bg-gray-50 transition-all">
                      Dismiss Alerts
                   </button>
                </div>
             </div>
          </div>
       </div>

       {/* Recent Activity */}
       <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
             <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Recent Flows</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                   <Activity size={12} /> Last 5 Transactions
                </p>
             </div>
             <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Ledger</button>
          </div>
          <div className="overflow-x-auto px-4 pb-4">
             <table className="min-w-full">
                <thead>
                   <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hash</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identity</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Values</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">State</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stamp</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {recentOrders.map(order => (
                      <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                         <td className="px-6 py-6 text-xs font-black text-gray-900">
                           <span className="bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                              #{order._id.slice(-6).toUpperCase()}
                           </span>
                         </td>
                         <td className="px-6 py-6">
                            <div className="text-sm font-black text-gray-900 tracking-tight">{order.user?.name || 'Guest User'}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{order.user?.email || 'N/A'}</div>
                         </td>
                         <td className="px-6 py-6 text-sm font-black text-blue-600">₹{order.totalAmount.toLocaleString()}</td>
                         <td className="px-6 py-6">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                               order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                               order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                               'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                               {order.orderStatus}
                            </span>
                         </td>
                         <td className="px-6 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;
