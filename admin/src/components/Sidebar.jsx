import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Star, 
  Users, 
  Gift, 
  LogOut, 
  Layers, 
  Tag, 
  Settings, 
  Boxes,
  Activity,
  UserCircle,
  ChevronRight,
  Maximize,
  Menu,
  Layout,
  Type,
  Megaphone,
  MessageSquareQuote,
  BookOpen,
  Trophy,
  Crown,
  Grid3x3,
  Sparkles
} from 'lucide-react';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname === path) return true; // Exact match for non-root paths
    return false;
  };

  const menuGroups = [
    {
      title: "Navigation",
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      ]
    },
    {
      title: "Catalog & Sales",
      items: [
        { path: '/products', icon: Boxes, label: 'Products' },
        { path: '/categories', icon: Layers, label: 'Categories' },
        { path: '/orders', icon: ShoppingCart, label: 'Orders' },
      ]
    },
    {
      title: "Marketing",
      items: [
        { path: '/coupons', icon: Tag, label: 'Coupons' },
        { path: '/gift-cards', icon: Gift, label: 'Gift Cards' },
      ]
    },
    {
      title: "Community",
      items: [
        { path: '/customers', icon: Users, label: 'Customers' },
        { path: '/reviews', icon: Star, label: 'Reviews' },
      ]
    },
    {
      title: "Manage Frontend",
      items: [
         { path: '/storefront/hero', icon: Maximize, label: 'Hero Slider' },
         { path: '/storefront/features', icon: Star, label: 'Brand Values' },
         { path: '/storefront/sections', icon: Boxes, label: 'Home Sections' },
         { path: '/storefront/ads', icon: Megaphone, label: 'Ad Campaigns' },
         { path: '/storefront/testimonials', icon: MessageSquareQuote, label: 'Testimonials' },
         { path: '/storefront/story', icon: BookOpen, label: 'Our Story' },
         { path: '/storefront/top-picks', icon: Trophy, label: 'Top Picks' },
         { path: '/storefront/bestsellers', icon: Crown, label: 'Bestsellers' },
         { path: '/storefront/categories-showcase', icon: Grid3x3, label: 'Category Showcase' },
         { path: '/storefront/product-spotlight', icon: Sparkles, label: 'Product Spotlight' },
         { path: '/storefront/nav', icon: Menu, label: 'Navigation' },
         { path: '/storefront/banner', icon: Layout, label: 'Announcement' },
         { path: '/storefront/footer', icon: Type, label: 'Footer & Meta' },
      ]
    },
    {
      title: "System",
      items: [
        { path: '/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  return (
    <div className="bg-white w-72 min-h-screen flex flex-col border-r border-gray-100 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.03)] z-50">
      {/* Brand Area */}
      <div className="p-8">
        <div className="flex items-center gap-3 group px-2">
          <div className="h-10 w-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:rotate-12 transition-transform">
             <ShoppingBag className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">Sharans</h1>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Admin Portal</p>
          </div>
        </div>
      </div>
      
      {/* Search Bar / Quick Action (Optional but adds 'Production' feel) */}
      <div className="px-6 mb-4">
        <div className="relative">
           <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
           <div className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              Live Monitoring Active
           </div>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-8 overflow-y-auto pt-4 custom-scrollbar">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-3">
             <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{group.title}</h3>
             <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                      isActive(item.path)
                        ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                        : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} className={isActive(item.path) ? 'text-emerald-400' : 'group-hover:scale-110 transition-transform'} />
                      <span className="text-sm font-black uppercase tracking-tight">{item.label}</span>
                    </div>
                    {isActive(item.path) && <ChevronRight size={14} className="text-emerald-400" />}
                  </Link>
                ))}
             </div>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-6 border-t border-gray-50">
        <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-3 mb-4">
           <div className="h-10 w-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <UserCircle size={24} />
           </div>
           <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{user?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-widest">{user?.role || 'Administrator'}</p>
           </div>
        </div>
        
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-red-200 font-black uppercase tracking-widest text-[10px]"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="h-20 w-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-50">
                 <LogOut size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Terminate Session?</h3>
              <p className="text-sm text-gray-500 font-medium mb-8">
                Are you sure you want to end your current session and exit the portal?
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={logout}
                   className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black transition-all"
                 >
                    Yes, Sign Out
                 </button>
                 <button 
                   onClick={() => setShowLogoutConfirm(false)}
                   className="w-full py-4 bg-white border border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:text-gray-900 hover:bg-gray-50 transition-all font-bold"
                 >
                    Stay Authenticated
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
