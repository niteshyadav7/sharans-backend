import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { 
  Image as ImageIcon, 
  Menu, 
  Type, 
  Layout, 
  Maximize, 
  Save, 
  Plus, 
  Trash2,
  ArrowRight,
  Monitor,
  Star,
  Boxes,
  Megaphone,
  MessageSquareQuote,
  BookOpen,
  Trophy,
  Search,
  X,
  Check
} from "lucide-react";

import { useParams } from "react-router-dom";

// Lazy load heavy editor components
const ProductSpotlightEditor = lazy(() => import("./ProductSpotlightEditor"));



const Storefront = () => {
  const { section } = useParams();
  const [activeTab, setActiveTab] = useState(section || 'hero');
  const [layout, setLayout] = useState({
    heroCarousel: [],
    navbar: { menuItems: [] },
    footer: { socialLinks: [], description: '' },
    ourStory: { heading: '', description: '', image: '', ctaText: '', ctaLink: '', active: true },
    topFavorites: { isActive: true, title: '', subtitle: '', products: [] },
    bestsellers: { isActive: true, title: '', products: [] },
    featuredCategories: { isActive: true, title: '', categories: [] },
    productSpotlight: { isActive: true, product: null, customTitle: '', tagline: '', description: '', features: [], backgroundImage: '', ctaText: 'Shop Now' }
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product Picker State
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [pickingForIndex, setPickingForIndex] = useState(null);
  const [pickingSection, setPickingSection] = useState('topFavorites'); // 'topFavorites' or 'bestsellers'
  const [searchQuery, setSearchQuery] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);

  useEffect(() => {
    if (section) {
      setActiveTab(section);
      // Scroll to top when navigating to a new section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    fetchLayout();
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get("/products");
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  const fetchLayout = useCallback(async () => {
    try {
      const { data } = await api.get("/layout");
      if (data.success && data.layout) {
        setLayout(data.layout);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load storefront data");
      setLoading(false);
    }
  }, []);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    try {
      // Sanitize data for backend (ensure products are IDs)
      const submissionLayout = {
        ...layout,
        topFavorites: {
          ...layout.topFavorites,
          products: layout.topFavorites.products.map(p => ({
            ...p,
            product: p.product?._id || p.product
          }))
        },
        bestsellers: {
          ...layout.bestsellers,
          products: (layout.bestsellers?.products || []).map(p => p?._id || p)
        },
        featuredCategories: {
          ...layout.featuredCategories,
          categories: (layout.featuredCategories?.categories || []).map(c => ({
            ...c,
            category: c.category?._id || c.category
          }))
        },
        productSpotlight: {
          ...layout.productSpotlight,
          product: layout.productSpotlight?.product?._id || layout.productSpotlight?.product
        }
      };

      const { data } = await api.post("/layout", submissionLayout);
      if (data.success) {
        toast.success("Storefront updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update storefront");
    }
  }, [layout]);

  // Helper to handle nested state updates
  const updateHeroSlide = useCallback((index, field, value) => {
    const newSlides = [...layout.heroCarousel];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setLayout({ ...layout, heroCarousel: newSlides });
  }, [layout]);

  const addHeroSlide = useCallback(() => {
    setLayout({
      ...layout,
      heroCarousel: [
        ...layout.heroCarousel, 
        { 
          image: '', 
          title: 'New Slide', 
          subtitle: 'Description', 
          ctaText: 'Shop Now', 
          ctaLink: '/shop' 
        }
      ]
    });
  }, [layout]);

  const removeHeroSlide = useCallback((index) => {
    const newSlides = layout.heroCarousel.filter((_, i) => i !== index);
    setLayout({ ...layout, heroCarousel: newSlides });
  }, [layout]);

  const updateMenuItem = useCallback((index, field, value) => {
    const newItems = [...layout.navbar.menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLayout({ ...layout, navbar: { ...layout.navbar, menuItems: newItems } });
  }, [layout]);

  const addMenuItem = () => {
    setLayout({
      ...layout,
      navbar: {
        ...layout.navbar,
        menuItems: [...layout.navbar.menuItems, { label: 'New Link', path: '/' }]
      }
    });
  };

  const removeMenuItem = (index) => {
    const newItems = layout.navbar.menuItems.filter((_, i) => i !== index);
    setLayout({ ...layout, navbar: { ...layout.navbar, menuItems: newItems } });
  };

  // Memoize filtered products to avoid recalculating on every render
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = p.averageRating >= minRatingFilter;
      return matchesSearch && matchesRating;
    });
  }, [products, searchQuery, minRatingFilter]);


  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="animate-spin h-10 w-10 border-4 border-fuchsia-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Visual Editor</h1>
          <p className="text-gray-500 text-sm font-medium">Manage your storefront's look and feel.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-fuchsia-600 uppercase tracking-[0.2em] bg-fuchsia-50 px-4 py-2 rounded-xl border border-fuchsia-100">
           <Monitor size={14} /> Live Preview
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="md:col-span-4">
          <form onSubmit={handleUpdate} className="space-y-8">
            {/* HERO SECTION EDITOR */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black uppercase">Hero Slides</h3>
                   <button type="button" onClick={addHeroSlide} className="flex items-center gap-2 text-[10px] font-black uppercase bg-fuchsia-50 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-100 transition-colors">
                      <Plus size={14} /> Add Slide
                   </button>
                </div>

                {layout.heroCarousel.map((slide, index) => (
                  <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group">
                    <div className="flex justify-between mb-4">
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Slide {index + 1}</span>
                       <button type="button" onClick={() => removeHeroSlide(index)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Image URL</label>
                          <div className="flex gap-4">
                             <div className="h-12 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {slide.image && <img src={slide.image} alt="" className="h-full w-full object-cover" />}
                             </div>
                             <input 
                               type="text" 
                               value={slide.image}
                               onChange={(e) => updateHeroSlide(index, 'image', e.target.value)}
                               className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:border-fuchsia-400 transition-colors"
                               placeholder="https://..."
                             />
                          </div>
                       </div>
                       
                       <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Title</label>
                          <input 
                            type="text" 
                            value={slide.title}
                            onChange={(e) => updateHeroSlide(index, 'title', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-fuchsia-400"
                          />
                       </div>

                       <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Subtitle</label>
                          <input 
                            type="text" 
                            value={slide.subtitle}
                            onChange={(e) => updateHeroSlide(index, 'subtitle', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-fuchsia-400"
                          />
                       </div>

                       <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Button Text</label>
                          <input 
                            type="text" 
                            value={slide.ctaText}
                            onChange={(e) => updateHeroSlide(index, 'ctaText', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-fuchsia-400"
                          />
                       </div>

                       <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Link URL</label>
                          <input 
                            type="text" 
                            value={slide.ctaLink}
                            onChange={(e) => updateHeroSlide(index, 'ctaLink', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-fuchsia-400"
                          />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FEATURES / VALUES EDITOR */}
            {activeTab === 'features' && (
               <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase">Brand Values</h3>
                    <button 
                      type="button" 
                      onClick={() => setLayout({
                        ...layout, 
                        features: [...(layout.features || []), { icon: 'Star', title: 'New Value', description: '' }] 
                      })}
                      className="flex items-center gap-2 text-[10px] font-black uppercase bg-fuchsia-50 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-100 transition-colors"
                    >
                       <Plus size={14} /> Add Value
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {(layout.features || []).map((feature, index) => (
                     <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
                        <button 
                          type="button"
                          onClick={() => {
                             const newFeatures = layout.features.filter((_, i) => i !== index);
                             setLayout({ ...layout, features: newFeatures });
                          }}
                          className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                        >
                           <Trash2 size={16} />
                        </button>

                        <div className="space-y-4">
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Icon Name (Lucide)</label>
                              <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Star size={20} />
                                 </div>
                                 <input 
                                   type="text" 
                                   value={feature.icon}
                                   onChange={(e) => {
                                      const newFeatures = [...layout.features];
                                      newFeatures[index].icon = e.target.value;
                                      setLayout({ ...layout, features: newFeatures });
                                   }}
                                   className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
                                   placeholder="e.g. Leaf, Heart, Recycle"
                                 />
                              </div>
                           </div>
                           
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Title</label>
                              <input 
                                type="text" 
                                value={feature.title}
                                onChange={(e) => {
                                   const newFeatures = [...layout.features];
                                   newFeatures[index].title = e.target.value;
                                   setLayout({ ...layout, features: newFeatures });
                                }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                              />
                           </div>
                           
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Description</label>
                              <input 
                                type="text" 
                                value={feature.description}
                                onChange={(e) => {
                                   const newFeatures = [...layout.features];
                                   newFeatures[index].description = e.target.value;
                                   setLayout({ ...layout, features: newFeatures });
                                }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
                              />
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {/* SECTIONS EDITOR */}
            {activeTab === 'sections' && (
               <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase">Homepage Sections</h3>
                    <button 
                      type="button" 
                      onClick={() => setLayout({
                        ...layout, 
                        featuredSections: [...(layout.featuredSections || []), { title: 'New Section', type: 'products', active: true }]
                      })}
                      className="flex items-center gap-2 text-[10px] font-black uppercase bg-fuchsia-50 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-100 transition-colors"
                    >
                       <Plus size={14} /> Add Section
                    </button>
                  </div>

                  {(layout.featuredSections || []).map((section, index) => (
                     <div key={index} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative">
                        <button 
                          type="button"
                          onClick={() => {
                             const newSections = layout.featuredSections.filter((_, i) => i !== index);
                             setLayout({ ...layout, featuredSections: newSections });
                          }}
                          className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors"
                        >
                           <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Section Title</label>
                                 <input 
                                   type="text" 
                                   value={section.title}
                                   onChange={(e) => {
                                      const newSections = [...layout.featuredSections];
                                      newSections[index].title = e.target.value;
                                      setLayout({ ...layout, featuredSections: newSections });
                                   }}
                                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xl font-black"
                                 />
                              </div>
                              
                              <div className="flex gap-4">
                                 <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Content Type</label>
                                    <select 
                                       value={section.type}
                                       onChange={(e) => {
                                          const newSections = [...layout.featuredSections];
                                          newSections[index].type = e.target.value;
                                          setLayout({ ...layout, featuredSections: newSections });
                                       }}
                                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                    >
                                       <option value="products">Product Grid</option>
                                       <option value="categories">Category Cards</option>
                                       <option value="banner">Promo Banner</option>
                                    </select>
                                 </div>
                                 <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Layout Style</label>
                                    <select 
                                       value={section.layout || 'grid'}
                                       onChange={(e) => {
                                          const newSections = [...layout.featuredSections];
                                          newSections[index].layout = e.target.value;
                                          setLayout({ ...layout, featuredSections: newSections });
                                       }}
                                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                    >
                                       <option value="grid">Standard Grid</option>
                                       <option value="carousel">Carousel/Slider</option>
                                       <option value="large-card">Large Feature Card</option>
                                    </select>
                                 </div>
                              </div>
                           </div>

                           <div className="bg-gray-50 rounded-3xl p-6 border border-dashed border-gray-200 flex items-center justify-center">
                              <p className="text-gray-400 text-xs font-medium text-center max-w-xs">
                                 Data for this section will be automatically populated from your {section.type} catalog based on popularity and new arrivals.
                              </p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* ADS EDITOR */}
            {activeTab === 'ads' && (
              <div className="space-y-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase">Ad Campaigns</h3>
                    <button 
                      type="button" 
                      onClick={() => setLayout({
                        ...layout, 
                        ads: [...(layout.ads || []), { image: '', title: 'New Ad', size: 'banner-full', placement: 'home-middle', active: true }]
                      })}
                      className="flex items-center gap-2 text-[10px] font-black uppercase bg-fuchsia-50 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-100 transition-colors"
                    >
                       <Plus size={14} /> Create Ad
                    </button>
                 </div>

                 {(layout.ads || []).map((ad, index) => (
                    <div key={index} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative group">
                       <button 
                          type="button"
                          onClick={() => {
                             const newAds = layout.ads.filter((_, i) => i !== index);
                             setLayout({ ...layout, ads: newAds });
                          }}
                          className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors"
                       >
                          <Trash2 size={16} />
                       </button>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                             <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Ad Image</label>
                                <div className="flex gap-4">
                                   <div className="h-16 w-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                      {ad.image && <img src={ad.image} alt="" className="h-full w-full object-cover" />}
                                   </div>
                                   <input 
                                     type="text" 
                                     value={ad.image}
                                     onChange={(e) => {
                                        const newAds = [...layout.ads];
                                        newAds[index].image = e.target.value;
                                        setLayout({ ...layout, ads: newAds });
                                     }}
                                     className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
                                     placeholder="Image URL..."
                                   />
                                </div>
                             </div>

                             <div className="flex gap-4">
                                <div className="flex-1">
                                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Internal Name</label>
                                   <input 
                                     type="text" 
                                     value={ad.title}
                                     onChange={(e) => {
                                        const newAds = [...layout.ads];
                                        newAds[index].title = e.target.value;
                                        setLayout({ ...layout, ads: newAds });
                                     }}
                                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                                     placeholder="e.g. Summer Sale Banner"
                                   />
                                </div>
                                <div className="flex-1">
                                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Target Link</label>
                                   <input 
                                     type="text" 
                                     value={ad.link}
                                     onChange={(e) => {
                                        const newAds = [...layout.ads];
                                        newAds[index].link = e.target.value;
                                        setLayout({ ...layout, ads: newAds });
                                     }}
                                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-500"
                                     placeholder="/collection/sale"
                                   />
                                </div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <div className="flex gap-4">
                                <div className="flex-1">
                                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Size Variant</label>
                                   <select 
                                      value={ad.size}
                                      onChange={(e) => {
                                         const newAds = [...layout.ads];
                                         newAds[index].size = e.target.value;
                                         setLayout({ ...layout, ads: newAds });
                                      }}
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                   >
                                      <option value="banner-full">Full Width Banner</option>
                                      <option value="banner-half">Half Width (Split)</option>
                                      <option value="sidebar">Sidebar (Tall)</option>
                                      <option value="box">Box (Square/Rectangle)</option>
                                      <option value="popup">Modal Popup</option>
                                      <option value="custom">Custom Dimensions</option>
                                   </select>
                                </div>
                                <div className="flex-1">
                                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Placement</label>
                                   <select 
                                      value={ad.placement}
                                      onChange={(e) => {
                                         const newAds = [...layout.ads];
                                         newAds[index].placement = e.target.value;
                                         setLayout({ ...layout, ads: newAds });
                                      }}
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                   >
                                      <option value="home-top">Homepage Top</option>
                                      <option value="home-middle">Homepage Middle</option>
                                      <option value="home-bottom">Homepage Bottom</option>
                                      <option value="category-sidebar">Category Page Sidebar</option>
                                      <option value="category-feed">In-Feed (Between Products)</option>
                                      <option value="product-page-sidebar">Product Page Sidebar</option>
                                      <option value="cart-page">Cart Page</option>
                                   </select>
                                </div>
                             </div>

                             {ad.size === 'custom' && (
                                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                   <div className="flex-1">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Width</label>
                                      <input 
                                         type="text" 
                                         value={ad.width}
                                         onChange={(e) => {
                                            const newAds = [...layout.ads];
                                            newAds[index].width = e.target.value;
                                            setLayout({ ...layout, ads: newAds });
                                         }}
                                         placeholder="100% or 500px"
                                         className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono"
                                      />
                                   </div>
                                   <div className="flex-1">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Height</label>
                                      <input 
                                         type="text" 
                                         value={ad.height}
                                         onChange={(e) => {
                                            const newAds = [...layout.ads];
                                            newAds[index].height = e.target.value;
                                            setLayout({ ...layout, ads: newAds });
                                         }}
                                         placeholder="200px"
                                         className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono"
                                      />
                                   </div>
                                </div>
                             )}

                             <div className="flex items-center justify-between pt-2">
                                <span className="text-xs font-bold uppercase text-gray-500">Ad Status</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                      const newAds = [...layout.ads];
                                      newAds[index].active = !newAds[index].active;
                                      setLayout({ ...layout, ads: newAds });
                                  }}
                                  className={`h-6 w-12 rounded-full transition-colors relative ${ad.active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                >
                                   <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${ad.active ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            )}

            {/* TESTIMONIALS EDITOR */}
            {activeTab === 'testimonials' && (
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black uppercase">Customer Reviews</h3>
                   <button 
                     type="button" 
                     onClick={() => setLayout({
                       ...layout, 
                       testimonials: [...(layout.testimonials || []), { name: '', role: '', content: '', rating: 5, active: true }]
                     })}
                     className="flex items-center gap-2 text-[10px] font-black uppercase bg-fuchsia-50 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-100 transition-colors"
                   >
                      <Plus size={14} /> Add Review
                   </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                {(layout.testimonials || []).map((review, index) => (
                   <div key={index} className={`bg-white p-6 rounded-3xl border shadow-sm relative group transition-all ${review.active ? 'border-emerald-100' : 'border-gray-100 opacity-60'}`}>
                      <button 
                         type="button"
                         onClick={() => {
                            const newTestimonials = layout.testimonials.filter((_, i) => i !== index);
                            setLayout({ ...layout, testimonials: newTestimonials });
                         }}
                         className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                      >
                         <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                         {/* Avatar & Basic Info */}
                         <div className="md:col-span-3 flex flex-col items-center text-center space-y-3 pt-2">
                            <div className="h-20 w-20 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-md">
                               {review.image ? (
                                  <img src={review.image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                                    <ImageIcon size={24} />
                                  </div>
                                )}
                            </div>
                            <input 
                              type="text" 
                              value={review.image}
                              onChange={(e) => {
                                 const newTestimonials = [...layout.testimonials];
                                 newTestimonials[index].image = e.target.value;
                                 setLayout({ ...layout, testimonials: newTestimonials });
                              }}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] text-center"
                              placeholder="Avatar URL"
                            />
                            
                            <div className="flex items-center gap-0.5 text-yellow-400">
                               {[1,2,3,4,5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => {
                                       const newTestimonials = [...layout.testimonials];
                                       newTestimonials[index].rating = star;
                                       setLayout({ ...layout, testimonials: newTestimonials });
                                    }} 
                                    className={`${star <= review.rating ? 'fill-current' : 'text-gray-200'}`}
                                  >
                                    <Star size={12} fill={star <= review.rating ? "currentColor" : "none"} />
                                  </button>
                               ))}
                            </div>
                         </div>

                         {/* Content Editor */}
                         <div className="md:col-span-9 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Customer Name</label>
                                  <input 
                                    type="text" 
                                    value={review.name}
                                    onChange={(e) => {
                                       const newTestimonials = [...layout.testimonials];
                                       newTestimonials[index].name = e.target.value;
                                       setLayout({ ...layout, testimonials: newTestimonials });
                                    }}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                                    placeholder="e.g. Priya Sharma"
                                  />
                               </div>
                               <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Role / Title</label>
                                  <input 
                                    type="text" 
                                    value={review.role}
                                    onChange={(e) => {
                                       const newTestimonials = [...layout.testimonials];
                                       newTestimonials[index].role = e.target.value;
                                       setLayout({ ...layout, testimonials: newTestimonials });
                                    }}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
                                    placeholder="e.g. Wellness Blogger"
                                  />
                               </div>
                            </div>

                            <div>
                               <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Review Content</label>
                               <textarea 
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-fuchsia-400 h-20 resize-none"
                                  value={review.content}
                                  onChange={(e) => {
                                     const newTestimonials = [...layout.testimonials];
                                     newTestimonials[index].content = e.target.value;
                                     setLayout({ ...layout, testimonials: newTestimonials });
                                  }}
                                  placeholder="What did they say?"
                               />
                            </div>

                            <div className="flex items-center justify-between">
                               <div className="flex-1 mr-8">
                                  <input 
                                    type="text" 
                                    value={review.productName}
                                    onChange={(e) => {
                                       const newTestimonials = [...layout.testimonials];
                                       newTestimonials[index].productName = e.target.value;
                                       setLayout({ ...layout, testimonials: newTestimonials });
                                    }}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs font-mono text-gray-500"
                                    placeholder="Verified purchase: [Product Name]"
                                  />
                               </div>
                               
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase text-gray-400">{review.active ? 'Highlighted' : 'Hidden'}</span>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                        const newTestimonials = [...layout.testimonials];
                                        newTestimonials[index].active = !newTestimonials[index].active;
                                        setLayout({ ...layout, testimonials: newTestimonials });
                                    }}
                                    className={`h-6 w-12 rounded-full transition-colors relative ${review.active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                  >
                                     <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${review.active ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
                </div>
             </div>
           )}

            {/* OUR STORY EDITOR */}
            {activeTab === 'story' && (
               <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative group">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-xl font-black uppercase">Our Story Section</h3>
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-gray-400">{layout.ourStory?.active ? 'Section Active' : 'Section Hidden'}</span>
                        <button 
                           type="button"
                           onClick={() => setLayout({ ...layout, ourStory: { ...layout.ourStory, active: !layout.ourStory.active } })}
                           className={`h-6 w-12 rounded-full transition-colors relative ${layout.ourStory?.active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                        >
                           <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${layout.ourStory?.active ? 'translate-x-6' : 'translate-x-1'}`}></div>
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Left Column: Image */}
                     <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Feature Image</label>
                        <div className="h-64 w-full bg-gray-100 rounded-3xl overflow-hidden border-2 border-white shadow-lg relative bg-cover bg-center" style={{ backgroundImage: `url(${layout.ourStory?.image})` }}>
                           {!layout.ourStory?.image && (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                 <ImageIcon size={48} />
                              </div>
                           )}
                        </div>
                        <input 
                           type="text" 
                           value={layout.ourStory?.image || ''}
                           onChange={(e) => setLayout({ ...layout, ourStory: { ...layout.ourStory, image: e.target.value } })}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
                           placeholder="https://... (Image URL)"
                        />
                     </div>

                     {/* Right Column: Content */}
                     <div className="space-y-6">
                        <div>
                           <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Heading</label>
                           <input 
                              type="text" 
                              value={layout.ourStory?.heading || ''}
                              onChange={(e) => setLayout({ ...layout, ourStory: { ...layout.ourStory, heading: e.target.value } })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-2xl font-serif text-gray-800" // Serif font for "Story" feel
                              placeholder="Our Story"
                           />
                        </div>

                        <div>
                           <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Story Description</label>
                           <textarea 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-fuchsia-400 h-40 resize-none leading-relaxed"
                              value={layout.ourStory?.description || ''}
                              onChange={(e) => setLayout({ ...layout, ourStory: { ...layout.ourStory, description: e.target.value } })}
                              placeholder="Tell your brand's story here..."
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">CTA Button Text</label>
                              <input 
                                 type="text" 
                                 value={layout.ourStory?.ctaText || ''}
                                 onChange={(e) => setLayout({ ...layout, ourStory: { ...layout.ourStory, ctaText: e.target.value } })}
                                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                                 placeholder="Learn More"
                              />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">CTA Link</label>
                              <input 
                                 type="text" 
                                 value={layout.ourStory?.ctaLink || ''}
                                 onChange={(e) => setLayout({ ...layout, ourStory: { ...layout.ourStory, ctaLink: e.target.value } })}
                                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-500"
                                 placeholder="/about"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* TOP FAVORITES EDITOR */}
            {activeTab === 'top-picks' && (
               <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative group">
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black uppercase">Top 5 Favorites</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase text-gray-400">{layout.topFavorites?.isActive ? 'Section Active' : 'Section Hidden'}</span>
                           <button 
                              type="button"
                              onClick={() => setLayout({ ...layout, topFavorites: { ...layout.topFavorites, isActive: !layout.topFavorites.isActive } })}
                              className={`h-6 w-12 rounded-full transition-colors relative ${layout.topFavorites?.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
                           >
                              <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${layout.topFavorites?.isActive ? 'translate-x-6' : 'translate-x-1'}`}></div>
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                           <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Section Title</label>
                           <input 
                              type="text" 
                              value={layout.topFavorites?.title || ''}
                              onChange={(e) => setLayout({ ...layout, topFavorites: { ...layout.topFavorites, title: e.target.value } })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xl font-black text-gray-900"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Subtitle</label>
                           <input 
                              type="text" 
                              value={layout.topFavorites?.subtitle || ''}
                              onChange={(e) => setLayout({ ...layout, topFavorites: { ...layout.topFavorites, subtitle: e.target.value } })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-bold text-gray-400 uppercase block">Selected Products (Max 5 Recommended)</label>
                           <button 
                              type="button" 
                              onClick={() => setLayout({
                                 ...layout, 
                                 topFavorites: { 
                                    ...layout.topFavorites, 
                                    products: [...(layout.topFavorites.products || []), { product: '', customBadge: 'Best Seller' }] 
                                 }
                              })}
                              className="flex items-center gap-2 text-[10px] font-black uppercase bg-fuchsia-50 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-100 transition-colors"
                           >
                              <Plus size={14} /> Add Product
                           </button>
                        </div>

                        {(layout.topFavorites?.products || []).map((item, index) => {
                           // Resolve product object for display
                           const productDetails = typeof item.product === 'object' ? item.product : products.find(p => p._id === item.product);

                           return (
                              <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative group">
                                 <button 
                                    type="button"
                                    onClick={() => {
                                       const newProducts = layout.topFavorites.products.filter((_, i) => i !== index);
                                       setLayout({ ...layout, topFavorites: { ...layout.topFavorites, products: newProducts } });
                                    }}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors z-10"
                                 >
                                    <Trash2 size={16} />
                                 </button>

                                 <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    <div className="md:col-span-1 flex justify-center">
                                       <span className="h-8 w-8 bg-white rounded-full flex items-center justify-center font-black text-xs text-gray-400 border border-gray-100">#{index + 1}</span>
                                    </div>
                                    
                                    <div className="md:col-span-5">
                                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Product</label>
                                       
                                       {productDetails ? (
                                          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200">
                                             <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={productDetails.images?.[0]?.url || productDetails.images?.[0]} alt="" className="h-full w-full object-cover" />
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{productDetails.name}</p>
                                                <p className="text-[10px] text-gray-500">₹{productDetails.price}</p>
                                             </div>
                                             <button 
                                                type="button"
                                                onClick={() => {
                                                   setPickingForIndex(index);
                                                   setSearchQuery('');
                                                   setIsProductPickerOpen(true);
                                                }}
                                                className="text-xs font-bold text-fuchsia-600 hover:bg-fuchsia-50 p-2 rounded-lg transition-colors"
                                             >
                                                Change
                                             </button>
                                          </div>
                                       ) : (
                                          <button 
                                             type="button"
                                             onClick={() => {
                                                setPickingForIndex(index);
                                                setPickingSection('topFavorites');
                                                setSearchQuery('');
                                                setIsProductPickerOpen(true);
                                             }}
                                             className="w-full py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-fuchsia-400 hover:text-fuchsia-600 transition-all flex items-center justify-center gap-2"
                                          >
                                             <Search size={14} /> Select Product
                                          </button>
                                       )}
                                    </div>

                                    <div className="md:col-span-3">
                                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Custom Badge</label>
                                       <input 
                                          type="text" 
                                          value={item.customBadge || ''}
                                          onChange={(e) => {
                                             const newProducts = [...layout.topFavorites.products];
                                             newProducts[index].customBadge = e.target.value;
                                             setLayout({ ...layout, topFavorites: { ...layout.topFavorites, products: newProducts } });
                                          }}
                                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-emerald-600"
                                          placeholder="e.g. Fan Favorite"
                                       />
                                    </div>

                                    <div className="md:col-span-3">
                                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Override Title</label>
                                       <input 
                                          type="text" 
                                          value={item.customTitle || ''}
                                          onChange={(e) => {
                                             const newProducts = [...layout.topFavorites.products];
                                             newProducts[index].customTitle = e.target.value;
                                             setLayout({ ...layout, topFavorites: { ...layout.topFavorites, products: newProducts } });
                                          }}
                                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium"
                                          placeholder="Default Name"
                                       />
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            )}

            {/* NAVIGATION EDITOR */}
            {activeTab === 'nav' && (
               <div className="space-y-6">
                 <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black uppercase mb-6">Menu Items</h3>
                    <div className="space-y-3">
                       {layout.navbar.menuItems.map((item, index) => (
                          <div key={index} className="flex gap-4 items-center">
                             <div className="handle cursor-move text-gray-300">
                                <Menu size={16} />
                             </div>
                             <input 
                               type="text"
                               value={item.label}
                               onChange={(e) => updateMenuItem(index, 'label', e.target.value)} 
                               className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                               placeholder="Label"
                             />
                             <input 
                               type="text"
                               value={item.path}
                               onChange={(e) => updateMenuItem(index, 'path', e.target.value)} 
                               className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-500"
                               placeholder="/path"
                             />
                             <button type="button" onClick={() => removeMenuItem(index)} className="p-3 text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       ))}
                       <button type="button" onClick={addMenuItem} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-black uppercase text-gray-400 hover:border-fuchsia-200 hover:text-fuchsia-500 transition-all mt-4">
                          + Add Menu Item
                       </button>
                    </div>
                 </div>
               </div>
            )}
            
            {/* BANNER EDITOR */}
            {activeTab === 'banner' && (
               <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Layout size={120} />
                  </div>
                  <h3 className="text-xl font-black uppercase mb-8">Top Announcement Bar</h3>
                  
                  <div className="space-y-6 relative">
                     <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Announcement Text</label>
                        <textarea 
                           className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-fuchsia-400 h-24 resize-none"
                           value={layout.promotionalBanner.text}
                           onChange={(e) => setLayout({...layout, promotionalBanner: {...layout.promotionalBanner, text: e.target.value}})}
                        />
                     </div>
                     <div className="flex gap-6">
                        <div className="flex-1">
                           <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Link (Optional)</label>
                           <input 
                              type="text"
                              value={layout.promotionalBanner.link}
                              onChange={(e) => setLayout({...layout, promotionalBanner: {...layout.promotionalBanner, link: e.target.value}})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
                           />
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                           <span className="text-xs font-bold uppercase text-gray-500">Active Status</span>
                           <button 
                             type="button"
                             onClick={() => setLayout({...layout, promotionalBanner: {...layout.promotionalBanner, isActive: !layout.promotionalBanner.isActive}})}
                             className={`h-6 w-12 rounded-full transition-colors relative ${layout.promotionalBanner.isActive ? 'bg-fuchsia-500' : 'bg-gray-200'}`}
                           >
                              <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${layout.promotionalBanner.isActive ? 'translate-x-6' : 'translate-x-1'}`}></div>
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}
            
            {/* FOOTER EDITOR */}
            {activeTab === 'footer' && (
               <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black uppercase mb-8">Footer & Copyright</h3>
                  
                  <div className="space-y-6">
                     <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Brand Description</label>
                        <textarea 
                           className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-fuchsia-400 h-24 resize-none"
                           value={layout.footer.description}
                           onChange={(e) => setLayout({...layout, footer: {...layout.footer, description: e.target.value}})}
                        />
                     </div>
                  </div>
               </div>
            )}

            <div className="fixed bottom-8 right-8 z-50">
              <button type="submit" className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-gray-400 hover:bg-black hover:scale-105 transition-all">
                <Save size={18} /> Publish to Live
              </button>
            </div>

          </form>
        </div>
      </div>
            {/* BESTSELLERS EDITOR */}
            {activeTab === 'bestsellers' && (
               <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative group">
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black uppercase">Bestsellers Section</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase text-gray-400">{layout.bestsellers?.isActive ? 'Section Active' : 'Section Hidden'}</span>
                           <button 
                              type="button"
                              onClick={() => setLayout({ ...layout, bestsellers: { ...layout.bestsellers, isActive: !layout.bestsellers.isActive } })}
                              className={`h-6 w-12 rounded-full transition-colors relative ${layout.bestsellers?.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
                           >
                              <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${layout.bestsellers?.isActive ? 'translate-x-6' : 'translate-x-1'}`}></div>
                           </button>
                        </div>
                     </div>

                     <div className="mb-8">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Section Title</label>
                        <input 
                           type="text" 
                           value={layout.bestsellers?.title || ''}
                           onChange={(e) => setLayout({ ...layout, bestsellers: { ...layout.bestsellers, title: e.target.value } })}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xl font-black text-gray-900"
                        />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-bold text-gray-400 uppercase block">Curated Bestsellers</label>
                           <button 
                              type="button" 
                              onClick={() => setLayout({
                                 ...layout, 
                                 bestsellers: { 
                                    ...layout.bestsellers, 
                                    products: [...(layout.bestsellers.products || []), ''] 
                                 }
                              })}
                              className="flex items-center gap-2 text-[10px] font-black uppercase bg-fuchsia-50 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-100 transition-colors"
                           >
                              <Plus size={14} /> Add Product
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {(layout.bestsellers?.products || []).map((item, index) => {
                              const productDetails = typeof item === 'object' ? item : products.find(p => p._id === item);

                              return (
                                 <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative group">
                                    <button 
                                       type="button"
                                       onClick={() => {
                                          const newProducts = layout.bestsellers.products.filter((_, i) => i !== index);
                                          setLayout({ ...layout, bestsellers: { ...layout.bestsellers, products: newProducts } });
                                       }}
                                       className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors z-10"
                                    >
                                       <Trash2 size={14} />
                                    </button>

                                    {productDetails ? (
                                       <div className="flex items-center gap-3">
                                          <div className="h-12 w-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                             <img src={productDetails.images?.[0]?.url || productDetails.images?.[0]} alt="" className="h-full w-full object-cover" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <p className="text-xs font-bold text-gray-900 truncate">{productDetails.name}</p>
                                             <p className="text-[10px] text-gray-500 font-medium">₹{productDetails.price}</p>
                                          </div>
                                          <button 
                                             type="button"
                                             onClick={() => {
                                                setPickingForIndex(index);
                                                setPickingSection('bestsellers');
                                                setSearchQuery('');
                                                setIsProductPickerOpen(true);
                                             }}
                                             className="text-[10px] font-bold text-fuchsia-600 hover:underline"
                                          >
                                             Change
                                          </button>
                                       </div>
                                    ) : (
                                       <button 
                                          type="button"
                                          onClick={() => {
                                             setPickingForIndex(index);
                                             setPickingSection('bestsellers');
                                             setSearchQuery('');
                                             setIsProductPickerOpen(true);
                                          }}
                                          className="w-full py-4 text-xs font-bold text-gray-400 flex flex-col items-center gap-2 hover:text-fuchsia-600 transition-colors"
                                       >
                                          <Search size={16} /> Select Product
                                       </button>
                                    )}
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               </div>
            )}
            {/* FEATURED CATEGORIES EDITOR */}
            {activeTab === 'categories-showcase' && (
               <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative group">
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black uppercase">Category Showcase</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase text-gray-400">{layout.featuredCategories?.isActive ? 'Section Active' : 'Section Hidden'}</span>
                           <button 
                              type="button"
                              onClick={() => setLayout({ ...layout, featuredCategories: { ...layout.featuredCategories, isActive: !layout.featuredCategories.isActive } })}
                              className={`h-6 w-12 rounded-full transition-colors relative ${layout.featuredCategories?.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
                           >
                              <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${layout.featuredCategories?.isActive ? 'translate-x-6' : 'translate-x-1'}`}></div>
                           </button>
                        </div>
                     </div>

                     <div className="mb-8">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Section Title</label>
                        <input 
                           type="text" 
                           value={layout.featuredCategories?.title || ''}
                           onChange={(e) => setLayout({ ...layout, featuredCategories: { ...layout.featuredCategories, title: e.target.value } })}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xl font-black text-gray-900"
                        />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-bold text-gray-400 uppercase block">Featured Categories</label>
                           <button 
                              type="button" 
                              onClick={() => setLayout({
                                 ...layout, 
                                 featuredCategories: { 
                                    ...layout.featuredCategories, 
                                    categories: [...(layout.featuredCategories.categories || []), { category: '', customSubtitle: '', ctaText: 'Shop Now' }] 
                                 }
                              })}
                              className="flex items-center gap-2 text-[10px] font-black uppercase bg-fuchsia-50 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-100 transition-colors"
                           >
                              <Plus size={14} /> Add Category
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {(layout.featuredCategories?.categories || []).map((item, index) => {
                              const categoryDetails = typeof item.category === 'object' ? item.category : categories.find(c => c._id === item.category);

                              return (
                                 <div key={index} className="bg-gray-50 p-6 rounded-3xl border border-gray-200 relative group">
                                    <button 
                                       type="button"
                                       onClick={() => {
                                          const newCategories = layout.featuredCategories.categories.filter((_, i) => i !== index);
                                          setLayout({ ...layout, featuredCategories: { ...layout.featuredCategories, categories: newCategories } });
                                       }}
                                       className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors z-10"
                                    >
                                       <Trash2 size={16} />
                                    </button>

                                    <div className="space-y-4">
                                       {/* Category Selection */}
                                       <div>
                                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Select Category</label>
                                          <select 
                                             value={item.category?._id || item.category || ''} 
                                             onChange={(e) => {
                                                const newCategories = [...layout.featuredCategories.categories];
                                                const selectedCategory = categories.find(c => c._id === e.target.value);
                                                newCategories[index].category = selectedCategory;
                                                setLayout({ ...layout, featuredCategories: { ...layout.featuredCategories, categories: newCategories } });
                                             }}
                                             className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-fuchsia-400"
                                          >
                                             <option value="">-- Choose Category --</option>
                                             {categories.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                             ))}
                                          </select>
                                       </div>

                                       {/* Custom Image */}
                                       <div>
                                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Custom Image (Optional)</label>
                                          <div className="space-y-2">
                                             <div className="h-32 w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                                                {(item.customImage || categoryDetails?.image) && (
                                                   <img 
                                                      src={item.customImage || categoryDetails?.image} 
                                                      alt="" 
                                                      className="h-full w-full object-cover" 
                                                   />
                                                )}
                                             </div>
                                             <input 
                                                type="text" 
                                                value={item.customImage || ''}
                                                onChange={(e) => {
                                                   const newCategories = [...layout.featuredCategories.categories];
                                                   newCategories[index].customImage = e.target.value;
                                                   setLayout({ ...layout, featuredCategories: { ...layout.featuredCategories, categories: newCategories } });
                                                }}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium"
                                                placeholder="Override image URL"
                                             />
                                          </div>
                                       </div>

                                       {/* Custom Title */}
                                       <div>
                                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Display Title (Optional)</label>
                                          <input 
                                             type="text" 
                                             value={item.customTitle || ''}
                                             onChange={(e) => {
                                                const newCategories = [...layout.featuredCategories.categories];
                                                newCategories[index].customTitle = e.target.value;
                                                setLayout({ ...layout, featuredCategories: { ...layout.featuredCategories, categories: newCategories } });
                                             }}
                                             className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                                             placeholder={categoryDetails?.name || "Category Name"}
                                          />
                                       </div>

                                       {/* Subtitle */}
                                       <div>
                                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Subtitle</label>
                                          <input 
                                             type="text" 
                                             value={item.customSubtitle || ''}
                                             onChange={(e) => {
                                                const newCategories = [...layout.featuredCategories.categories];
                                                newCategories[index].customSubtitle = e.target.value;
                                                setLayout({ ...layout, featuredCategories: { ...layout.featuredCategories, categories: newCategories } });
                                             }}
                                             className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-600"
                                             placeholder="e.g. SKIN CARE PRODUCTS"
                                          />
                                       </div>

                                       {/* CTA Text */}
                                       <div>
                                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Button Text</label>
                                          <input 
                                             type="text" 
                                             value={item.ctaText || ''}
                                             onChange={(e) => {
                                                const newCategories = [...layout.featuredCategories.categories];
                                                newCategories[index].ctaText = e.target.value;
                                                setLayout({ ...layout, featuredCategories: { ...layout.featuredCategories, categories: newCategories } });
                                             }}
                                             className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold"
                                             placeholder="Shop Now"
                                          />
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               </div>
            )}
            
            {/* PRODUCT SPOTLIGHT EDITOR */}
            {activeTab === 'product-spotlight' && (
               <Suspense fallback={
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px]">
                     <div className="animate-spin h-10 w-10 border-4 border-fuchsia-500 border-t-transparent rounded-full"></div>
                  </div>
               }>
                  <ProductSpotlightEditor 
                     layout={layout}
                     setLayout={setLayout}
                     setPickingForIndex={setPickingForIndex}
                     setPickingSection={setPickingSection}
                     setSearchQuery={setSearchQuery}
                     setIsProductPickerOpen={setIsProductPickerOpen}
                  />
               </Suspense>
            )}
            
            {/* PRODUCT PICKER MODAL */}
      {isProductPickerOpen && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
               {/* Modal Header */}
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                     <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Select Product</h3>
                     <p className="text-xs font-medium text-gray-500">Pick a product for slot #{pickingForIndex + 1}</p>
                  </div>
                  <button 
                     onClick={() => setIsProductPickerOpen(false)}
                     className="h-10 w-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all"
                  >
                     <X size={20} />
                  </button>
               </div>

               {/* Search Bar & Filter */}
               <div className="p-6 pb-2 flex gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                     <input 
                        type="text" 
                        autoFocus
                        placeholder="Search by name, category, or price..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-fuchsia-100 focus:bg-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                     />
                  </div>
                  <div className="w-40 relative">
                     <select 
                        value={minRatingFilter}
                        onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                        className="w-full h-full bg-gray-50 border-2 border-transparent focus:border-fuchsia-100 focus:bg-white rounded-2xl px-4 text-sm font-bold outline-none appearance-none cursor-pointer text-gray-600"
                     >
                        <option value={0}>All Ratings</option>
                        <option value={4.5}>4.5+ Stars</option>
                        <option value={4}>4.0+ Stars</option>
                        <option value={3}>3.0+ Stars</option>
                     </select>
                     <Star size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
               </div>

               {/* Results List */}
               <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                  {filteredProducts.map((product) => (
                        <button
                           key={product._id}
                           onClick={() => {
                              // Select product based on active section
                              if (pickingSection === 'topFavorites') {
                                 const newProducts = [...layout.topFavorites.products];
                                 newProducts[pickingForIndex].product = product; 
                                 setLayout({ ...layout, topFavorites: { ...layout.topFavorites, products: newProducts } });
                              } else if (pickingSection === 'bestsellers') {
                                 const newProducts = [...layout.bestsellers.products];
                                 newProducts[pickingForIndex] = product;
                                 setLayout({ ...layout, bestsellers: { ...layout.bestsellers, products: newProducts } });
                              } else if (pickingSection === 'productSpotlight') {
                                 setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, product: product } });
                              }
                              setIsProductPickerOpen(false);
                           }}
                           className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-fuchsia-50 hover:border-fuchsia-100 border border-transparent transition-all group text-left"
                        >
                           <div className="h-14 w-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                              <img src={product.images?.[0]?.url || product.images?.[0]} alt="" className="h-full w-full object-cover" />
                           </div>
                           <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-sm group-hover:text-fuchsia-700">{product.name}</h4>
                              <p className="text-xs text-gray-500 font-medium">₹{product.price} • {product.category?.name || 'Uncategorized'}</p>
                           </div>
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-fuchsia-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg">Select</span>
                           </div>
                        </button>
                     ))}
                  {products.length === 0 && (
                     <div className="text-center py-10 text-gray-400 text-sm font-medium">
                        No products found.
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Storefront;
