import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { Truck, Shield, Bell, Settings as SettingsIcon, Save, Heart, Coins, Users } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('logistics');
  const [settings, setSettings] = useState({
    shippingFee: 0,
    loyaltyPointsPer100: 1,
    referralPoints: 50,
    pointsToRupeeRate: 1,
    lowStockThreshold: 5,
    storeName: 'Sharans Store',
    maintenanceMode: false,
    contactEmail: 'admin@sharans.com'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        if (data.success && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load environment configurations");
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/settings", settings);
      if (data.success) {
        toast.success("System configurations published");
      }
    } catch (error) {
      toast.error("Deployment failed: Authorization or Network error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Preferences</h1>
          <p className="text-gray-500 text-sm font-medium">Fine-tune your store's global parameters and logic.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
           <Shield size={14} /> System Secure
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
           {[
             { id: 'logistics', icon: Truck, label: 'Logistics' },
             { id: 'loyalty', icon: Heart, label: 'Loyalty' },
             { id: 'alerts', icon: Bell, label: 'Alerts' },
             { id: 'core', icon: SettingsIcon, label: 'Core' },
             { id: 'security', icon: Shield, label: 'Security' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center gap-3 px-5 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all border ${
                 activeTab === tab.id 
                 ? 'bg-gray-900 text-white border-gray-900 shadow-2xl shadow-gray-200 translate-x-1' 
                 : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200 hover:text-emerald-600'
               }`}
             >
                <tab.icon size={18} /> {tab.label}
             </button>
           ))}
        </div>

        <div className="md:col-span-3 space-y-8">
          <form onSubmit={handleUpdate} className="space-y-8">
            {activeTab === 'logistics' && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8">
                    <div className="h-32 w-32 bg-blue-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                 </div>

                 <div className="relative">
                    <h3 className="flex items-center gap-2 text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
                       Logistics Blueprint
                    </h3>
                    <p className="text-sm text-gray-400 font-medium mb-10 max-w-md">
                       Standardized fulfillment fee applied to digital and physical shipments globally.
                    </p>

                    <div className="max-w-xs">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Global Shipping Fee</label>
                        <div className="relative group/input">
                           <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg group-hover/input:text-emerald-500 transition-colors">₹</span>
                           <input 
                              type="number" 
                              name="shippingFee"
                              value={settings.shippingFee} 
                              onChange={handleInputChange} 
                              className="w-full pl-12 pr-6 py-4 border-2 border-gray-100 rounded-[24px] focus:ring-8 focus:ring-emerald-50 focus:border-emerald-400 outline-none transition-all font-black text-2xl bg-gray-50/30"
                              min="0"
                              required
                           />
                        </div>
                     </div>
                 </div>
              </div>
            )}

            {activeTab === 'loyalty' && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="relative">
                    <h3 className="flex items-center gap-2 text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">
                       Loyalty Mechanics
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <div>
                             <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                <Coins size={14} className="text-amber-500" /> Points per ₹100
                             </label>
                             <input 
                                type="number" 
                                name="loyaltyPointsPer100"
                                value={settings.loyaltyPointsPer100}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-amber-400 outline-none font-black text-xl"
                             />
                          </div>
                          <div>
                             <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                <Users size={14} className="text-blue-500" /> Referral Bonus
                             </label>
                             <input 
                                type="number" 
                                name="referralPoints"
                                value={settings.referralPoints}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-blue-400 outline-none font-black text-xl"
                             />
                          </div>
                       </div>

                       <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100">
                          <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-4">Value Conversion</h4>
                          <div className="space-y-4">
                             <div className="flex items-center justify-between text-sm font-bold text-gray-700">
                                <span>1 Loyalty Point</span>
                                <span>=</span>
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-200">
                                   <span className="text-emerald-600">₹</span>
                                   <input 
                                      type="number" 
                                      step="0.1"
                                      name="pointsToRupeeRate"
                                      value={settings.pointsToRupeeRate}
                                      onChange={handleInputChange}
                                      className="w-12 bg-transparent outline-none font-black text-emerald-600"
                                   />
                                </div>
                             </div>
                             <p className="text-[10px] text-emerald-600 font-medium italic">
                                This rate defines the discount value during point redemption.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Threshold Logic</h3>
                 <p className="text-sm text-gray-400 font-medium mb-10">Configure triggers for automated inventory alerts.</p>

                 <div className="max-w-xs">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Low Stock Trigger (Units)</label>
                    <input 
                       type="number" 
                       name="lowStockThreshold"
                       value={settings.lowStockThreshold}
                       onChange={handleInputChange}
                       className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-emerald-400 outline-none font-black text-xl"
                       min="1"
                    />
                 </div>
              </div>
            )}

            {activeTab === 'core' && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Primary Identity</h3>
                 <p className="text-sm text-gray-400 font-medium mb-10">Global store settings that define your presence.</p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Store Name</label>
                          <input 
                             type="text" 
                             name="storeName"
                             value={settings.storeName}
                             onChange={handleInputChange}
                             className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-emerald-400 outline-none font-bold"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Admin Email Pipeline</label>
                          <input 
                             type="email" 
                             name="contactEmail"
                             value={settings.contactEmail}
                             onChange={handleInputChange}
                             className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-emerald-400 outline-none font-bold"
                          />
                       </div>
                    </div>
                    
                    <div className="bg-gray-50 p-8 rounded-[32px] border border-dashed border-gray-200">
                       <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Service State</h4>
                       <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                          <div>
                             <p className="text-xs font-black text-gray-900 uppercase">Maintenance Mode</p>
                             <p className="text-[10px] text-gray-400 font-bold">Restrict public access to store</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setSettings(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                            className={`h-6 w-12 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                          >
                             <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm text-center py-20">
                 <Shield size={64} className="mx-auto text-gray-100 mb-6" />
                 <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Security Vault Locked</h3>
                 <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8 font-medium">Multi-factor authentication and credential rotation are managed by the Root Administrator.</p>
                 <button className="px-8 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Access Denied</button>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button type="submit" className="flex items-center gap-3 bg-gray-900 text-white px-12 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all">
                <Save size={18} /> Deploy Changes
              </button>
            </div>
          </form>

          <div className="bg-gray-900 p-10 rounded-[40px] text-white overflow-hidden relative group">
             <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <SettingsIcon size={240} />
             </div>
             <div className="relative">
                <h4 className="text-2xl font-black uppercase tracking-tight mb-2">Takedown Protocols</h4>
                <p className="text-gray-400 text-sm font-medium mb-8 max-w-sm">Emergency override controls for store purge, mass export, and database migration.</p>
                <div className="flex gap-4">
                   <button className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest border border-white/5">
                      Reveal Root Controls
                   </button>
                   <button className="px-6 py-4 border border-white/10 hover:border-white/30 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest text-gray-400">
                      Download Logs
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
