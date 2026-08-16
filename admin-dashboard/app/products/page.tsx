'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ProductModal from '@/components/ProductModal';
import axios from 'axios';
import { Package, Plus, Edit2, Trash2, Tag, Layers, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ProductsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProducts();
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/products?limit=100`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (selectedProduct) {
        // Edit existing product
        const id = selectedProduct.id || selectedProduct._id;
        await axios.put(`${API_URL}/api/v1/admin/products/${id}`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new product
        await axios.post(`${API_URL}/api/v1/admin/products`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to save product. Ensure admin token is active.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from inventory?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const handleToggleStock = async (prod: any) => {
    const id = prod.id || prod._id;
    const newStock = prod.stock > 0 ? 0 : 25;
    try {
      await axios.put(
        `${API_URL}/api/v1/admin/products/${id}`,
        { ...prod, stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (err) {
      console.error('Failed to toggle stock', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center pb-6 border-b border-ops-700">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-white">INVENTORY MANAGEMENT HUB</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Catalog items, category specifications & stock allocation</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchProducts}
              className="p-2.5 bg-ops-800 border border-ops-700 rounded-lg text-gray-300 hover:text-white"
              title="Refresh Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setSelectedProduct(null); setModalOpen(true); }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Catalog Item</span>
            </button>
          </div>
        </header>

        {/* Product Table */}
        <div className="bg-ops-800 border border-ops-700 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-ops-900/80 border-b border-ops-700 text-gray-400 text-xs font-mono uppercase">
                <th className="p-4">Item & Specifications</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ops-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-mono">
                    {loading ? 'Loading catalog items...' : 'No inventory items found.'}
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const id = prod.id || prod._id;
                  const isOut = prod.stock <= 0;
                  return (
                    <tr key={id} className="hover:bg-ops-700/50 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-4">
                          {prod.images && prod.images[0] ? (
                            <img src={prod.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg border border-ops-700" />
                          ) : (
                            <div className="w-12 h-12 bg-ops-700 rounded-lg flex items-center justify-center text-gray-500">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-base">{prod.title}</p>
                            <div className="text-xs text-gray-400 font-mono flex items-center space-x-3 mt-1">
                              <span>HSN: {prod.specs?.hsn_code || 'N/A'}</span>
                              {prod.specs?.fabric_gsm && <span>GSM: {prod.specs.fabric_gsm}</span>}
                              {prod.specs?.dpi && <span>Specs: {prod.specs.dpi}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-ops-900 border border-ops-700 rounded text-xs font-mono text-blue-400">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        <span className="text-white font-bold">₹{prod.price}</span>
                        {prod.compare_price > 0 && (
                          <span className="text-xs text-gray-500 line-through ml-2">₹{prod.compare_price}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStock(prod)}
                          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition flex items-center space-x-1.5 ${
                            isOut
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isOut ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <span>{isOut ? 'OUT OF STOCK (0)' : `IN STOCK (${prod.stock})`}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => { setSelectedProduct(prod); setModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-ops-700"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-ops-700"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
