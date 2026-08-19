'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface ProductModalProps {
  product?: any;
  onClose: () => void;
  onSave: (productData: any) => void;
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [title, setTitle] = useState(product?.title || '');
  const [category, setCategory] = useState(product?.category || 'Apparel');
  const [price, setPrice] = useState(product?.price || '');
  const [comparePrice, setComparePrice] = useState(product?.compare_price || '');
  const [offerDiscount, setOfferDiscount] = useState<string>(() => {
    const comp = Number(product?.compare_price || 0);
    const pr = Number(product?.price || 0);
    if (comp > pr && comp > 0 && pr > 0) {
      return String(Math.round(((comp - pr) / comp) * 100));
    }
    return '';
  });
  const [stock, setStock] = useState(product?.stock ?? 10);
  const [description, setDescription] = useState(product?.description || '');
  const [images, setImages] = useState<string[]>(product?.images || ['']);
  const [customCoinsEarned, setCustomCoinsEarned] = useState<string>(
    product?.custom_coins_earned !== undefined && product?.custom_coins_earned !== null
      ? String(product.custom_coins_earned)
      : ''
  );
  const [isHidden, setIsHidden] = useState<boolean>(product?.is_hidden || false);

  // Bi-directional automatic price & offer calculation handlers
  const handleComparePriceChange = (val: string) => {
    setComparePrice(val);
    const comp = Number(val);
    const disc = Number(offerDiscount);
    const pr = Number(price);

    if (comp > 0 && disc > 0 && disc < 100) {
      const calculatedPrice = Math.round(comp * (1 - disc / 100));
      setPrice(String(calculatedPrice));
    } else if (comp > 0 && pr > 0 && comp > pr) {
      const calculatedDisc = Math.round(((comp - pr) / comp) * 100);
      setOfferDiscount(String(calculatedDisc));
    }
  };

  const handleOfferDiscountChange = (val: string) => {
    setOfferDiscount(val);
    const disc = Number(val);
    const comp = Number(comparePrice);

    if (comp > 0 && val !== '' && disc >= 0 && disc < 100) {
      const calculatedPrice = Math.round(comp * (1 - disc / 100));
      setPrice(String(calculatedPrice));
    }
  };

  const handlePriceChange = (val: string) => {
    setPrice(val);
    const pr = Number(val);
    const comp = Number(comparePrice);

    if (comp > 0 && pr > 0 && comp > pr) {
      const calculatedDisc = Math.round(((comp - pr) / comp) * 100);
      setOfferDiscount(String(calculatedDisc));
    } else if (pr >= comp) {
      setOfferDiscount('0');
    }
  };
  
  // Specs state
  const [fabricGsm, setFabricGsm] = useState(product?.specs?.fabric_gsm || '350 GSM');
  const [material, setMaterial] = useState(product?.specs?.material || '100% French Terry Cotton');
  const [fit, setFit] = useState(product?.specs?.fit || 'Oversized Boxy Fit');
  const [hsnCode, setHsnCode] = useState(product?.specs?.hsn_code || '61091000');
  const [dpi, setDpi] = useState(product?.specs?.dpi || '26,000 DPI');
  const [weight, setWeight] = useState(product?.specs?.weight || '350g');
  const [sizes, setSizes] = useState<string[]>(
    product?.sizes || (category === 'Apparel' ? ['S', 'M', 'L', 'XL', 'XXL'] : category === 'Footwear' ? ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'] : [])
  );

  useEffect(() => {
    if (category === 'Apparel') {
      setHsnCode('61091000');
      if (sizes.length === 0) setSizes(['S', 'M', 'L', 'XL', 'XXL']);
    } else if (category === 'Footwear') {
      setHsnCode('64039990');
      if (sizes.length === 0) setSizes(['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']);
    } else {
      setHsnCode('84716060');
      setSizes([]);
    }
  }, [category]);

  const handleAddImageField = () => {
    setImages([...images, '']);
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...images];
    updated[index] = val;
    setImages(updated);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      category,
      price: parseFloat(price),
      compare_price: comparePrice ? parseFloat(comparePrice) : 0,
      stock: parseInt(stock),
      description,
      images: images.filter(img => img.trim() !== ''),
      sizes,
      custom_coins_earned: customCoinsEarned !== '' ? parseFloat(customCoinsEarned) : null,
      is_hidden: isHidden,
      specs: {
        fabric_gsm: fabricGsm,
        material,
        fit,
        hsn_code: hsnCode,
        dpi,
        weight,
      },
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-origin-expand">
      <div className="bg-ops-800 text-gray-100 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-ops-700 p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-ops-700">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            {product ? 'Edit Inventory Item' : 'New Catalog Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Item Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Tactical Oversized Tee"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Apparel">Apparel</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Electronics">Electronics</option>
                <option value="Eyewear">Eyewear</option>
                <option value="Activewear">Activewear</option>
                <option value="Bags">Bags</option>
                <option value="Watches">Watches</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-mono text-amber-400 font-bold uppercase mb-1">
                🪙 ArrowCoins Earned on Purchase (Optional Override)
              </label>
              <input
                type="number"
                min="0"
                value={customCoinsEarned}
                onChange={(e) => setCustomCoinsEarned(e.target.value)}
                className="w-full bg-ops-900 border border-amber-500/40 rounded p-2 text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-400"
                placeholder="Auto-calculated tier rate if empty"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isHiddenCheck"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="w-4 h-4 rounded border-ops-700 bg-ops-900 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isHiddenCheck" className="text-xs font-mono text-gray-300 cursor-pointer select-none">
                🔒 Hidden Item (Only visible via Direct Search)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Compare Price / MRP (₹)</label>
              <input
                type="number"
                value={comparePrice}
                onChange={(e) => handleComparePriceChange(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                placeholder="e.g. 3499"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-emerald-400 font-bold uppercase mb-1">Offer Discount (% OFF)</label>
              <input
                type="number"
                min="0"
                max="99"
                value={offerDiscount}
                onChange={(e) => handleOfferDiscountChange(e.target.value)}
                className="w-full bg-ops-900 border border-emerald-500/50 rounded p-2 text-emerald-300 font-bold focus:outline-none focus:border-emerald-400 font-mono text-sm"
                placeholder="e.g. 57"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Selling Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                placeholder="e.g. 1499"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {Number(comparePrice) > Number(price) && Number(comparePrice) > 0 && Number(price) > 0 && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs font-mono text-emerald-300">
              <span>⚡ Live Customer View: <strong className="text-white">₹{price}</strong> <span className="line-through text-gray-400">₹{comparePrice}</span></span>
              <span className="font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                {offerDiscount || Math.round(((Number(comparePrice) - Number(price)) / Number(comparePrice)) * 100)}% OFF (Save ₹{Number(comparePrice) - Number(price)})
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dynamic Specs Section */}
          <div className="p-4 bg-ops-900 rounded-lg border border-ops-700 space-y-3">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">Category Specifications</h3>
            
            {category === 'Apparel' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono">Fabric GSM</label>
                  <input
                    type="text"
                    value={fabricGsm}
                    onChange={(e) => setFabricGsm(e.target.value)}
                    className="w-full bg-ops-800 border border-ops-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono">Material</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-ops-800 border border-ops-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono">Fit Type</label>
                  <input
                    type="text"
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    className="w-full bg-ops-800 border border-ops-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {category === 'Footwear' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono">Sole / Material Specs</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-ops-800 border border-ops-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full bg-ops-800 border border-ops-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {category === 'Accessories' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono">DPI / Specs</label>
                  <input
                    type="text"
                    value={dpi}
                    onChange={(e) => setDpi(e.target.value)}
                    className="w-full bg-ops-800 border border-ops-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono">Weight</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-ops-800 border border-ops-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-mono">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full bg-ops-800 border border-ops-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Multi-angle Image Manager */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-mono text-gray-400 uppercase">Product Image URLs (Multi-angle)</label>
              <button
                type="button"
                onClick={handleAddImageField}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Angle</span>
              </button>
            </div>
            {images.map((imgUrl, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-2">
                <input
                  type="url"
                  value={imgUrl}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="flex-1 bg-ops-900 border border-ops-700 rounded p-2 text-white text-xs"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-ops-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-ops-700 text-gray-300 rounded hover:bg-ops-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-500"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
