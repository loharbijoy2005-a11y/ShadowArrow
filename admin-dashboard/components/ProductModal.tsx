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
  const [stock, setStock] = useState(product?.stock ?? 10);
  const [description, setDescription] = useState(product?.description || '');
  const [images, setImages] = useState<string[]>(product?.images || ['']);
  
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Compare Price (₹)</label>
              <input
                type="number"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 3499"
              />
              {Number(comparePrice) > Number(price) && Number(comparePrice) > 0 && Number(price) > 0 && (
                <p className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">
                  ⚡ Offer: {Math.round(((Number(comparePrice) - Number(price)) / Number(comparePrice)) * 100)}% OFF (Save ₹{Number(comparePrice) - Number(price)})
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

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
