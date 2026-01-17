import React, { memo } from 'react';
import { Search, Trash2 } from 'lucide-react';

const ProductSpotlightEditor = memo(function ProductSpotlightEditor({ layout, setLayout, setPickingForIndex, setPickingSection, setSearchQuery, setIsProductPickerOpen }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative group">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black uppercase">Product Spotlight</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase text-gray-400">
            {layout.productSpotlight?.isActive ? 'Section Active' : 'Section Hidden'}
          </span>
          <button 
            type="button"
            onClick={() => setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, isActive: !layout.productSpotlight.isActive } })}
            className={`h-6 w-12 rounded-full transition-colors relative ${layout.productSpotlight?.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${layout.productSpotlight?.isActive ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Product Selection & Image */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Featured Product</label>
            {layout.productSpotlight?.product ? (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-16 w-16 bg-white rounded-xl overflow-hidden border border-gray-100">
                    <img 
                      src={layout.productSpotlight.product.images?.[0]?.url || layout.productSpotlight.product.images?.[0]} 
                      alt="" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{layout.productSpotlight.product.name}</p>
                    <p className="text-xs text-gray-500">₹{layout.productSpotlight.product.currentPrice || layout.productSpotlight.product.price}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setPickingForIndex(0);
                      setPickingSection('productSpotlight');
                      setSearchQuery('');
                      setIsProductPickerOpen(true);
                    }}
                    className="text-xs font-bold text-fuchsia-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  setPickingForIndex(0);
                  setPickingSection('productSpotlight');
                  setSearchQuery('');
                  setIsProductPickerOpen(true);
                }}
                className="w-full py-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:border-fuchsia-400 hover:text-fuchsia-600 transition-all flex flex-col items-center gap-2"
              >
                <Search size={24} />
                Select Featured Product
              </button>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Hero Background Image</label>
            <div className="space-y-3">
              <div className="h-48 w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                {layout.productSpotlight?.backgroundImage && (
                  <img 
                    src={layout.productSpotlight.backgroundImage} 
                    alt="" 
                    className="h-full w-full object-cover" 
                  />
                )}
              </div>
              <input 
                type="text" 
                value={layout.productSpotlight?.backgroundImage || ''}
                onChange={(e) => setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, backgroundImage: e.target.value } })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
                placeholder="Background image URL"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Display Title (Optional)</label>
            <input 
              type="text" 
              value={layout.productSpotlight?.customTitle || ''}
              onChange={(e) => setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, customTitle: e.target.value } })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold"
              placeholder={layout.productSpotlight?.product?.name || "Product Name"}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Tagline</label>
            <input 
              type="text" 
              value={layout.productSpotlight?.tagline || ''}
              onChange={(e) => setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, tagline: e.target.value } })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-medium"
              placeholder="e.g. All-Day Moisture, All-Day Smooth."
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Description</label>
            <textarea 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-fuchsia-400 h-24 resize-none"
              value={layout.productSpotlight?.description || ''}
              onChange={(e) => setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, description: e.target.value } })}
              placeholder="Main product description..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase block">Feature Bullets</label>
              <button 
                type="button"
                onClick={() => setLayout({ 
                  ...layout, 
                  productSpotlight: { 
                    ...layout.productSpotlight, 
                    features: [...(layout.productSpotlight.features || []), ''] 
                  } 
                })}
                className="text-xs font-bold text-fuchsia-600 hover:underline"
              >
                + Add Bullet
              </button>
            </div>
            <div className="space-y-2">
              {(layout.productSpotlight?.features || []).map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    type="text" 
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...layout.productSpotlight.features];
                      newFeatures[index] = e.target.value;
                      setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, features: newFeatures } });
                    }}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
                    placeholder="e.g. Deeply moisturizes lips"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const newFeatures = layout.productSpotlight.features.filter((_, i) => i !== index);
                      setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, features: newFeatures } });
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">CTA Button Text</label>
            <input 
              type="text" 
              value={layout.productSpotlight?.ctaText || ''}
              onChange={(e) => setLayout({ ...layout, productSpotlight: { ...layout.productSpotlight, ctaText: e.target.value } })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
              placeholder="Shop Now"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductSpotlightEditor;
