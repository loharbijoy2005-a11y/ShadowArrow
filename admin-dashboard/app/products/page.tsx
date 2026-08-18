'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ProductModal from '@/components/ProductModal';
import axios from 'axios';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Layers,
  RefreshCw,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  TrendingUp,
  Filter,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ProductsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

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
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/v1/products?limit=100`);
      // Robust array extraction supporting both raw arrays and { products: [...] } or { data: [...] }
      const rawProducts = Array.isArray(res.data)
        ? res.data
        : res.data?.products || res.data?.data || [];
      setProducts(rawProducts);
    } catch (err: any) {
      console.error('Failed to fetch products', err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Unable to connect to API backend server.'
      );
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
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save product. Ensure admin token is active.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from inventory?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete product.');
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
    } catch (err: any) {
      console.error('Failed to toggle stock', err);
      alert('Failed to update stock status.');
    }
  };

  // Filtered Products Computation
  const filteredProducts = products.filter((prod) => {
    if (categoryFilter !== 'ALL' && (prod.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (stockFilter === 'IN_STOCK' && (prod.stock || 0) <= 0) return false;
    if (stockFilter === 'OUT_OF_STOCK' && (prod.stock || 0) > 0) return false;
    if (stockFilter === 'LOW_STOCK' && ((prod.stock || 0) <= 0 || (prod.stock || 0) > 10)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTitle = (prod.title || '').toLowerCase().includes(q);
      const matchCat = (prod.category || '').toLowerCase().includes(q);
      const matchHSN = (prod.specs?.hsn_code || '').toLowerCase().includes(q);
      const matchDesc = (prod.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchHSN && !matchDesc) return false;
    }

    return true;
  });

  // Metrics Summary Calculations
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) <= 0).length;
  const lowStockCount = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-ops-700">
          <div>
            <h1 className="text-2xl font-black font-sans tracking-tight text-white">INVENTORY & CATALOG MANAGEMENT</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Catalog specs, real-time stock allocation & MongoDB inventory sync</p>
          </div>
          <div className="flex items-center space-x-3 font-mono">
            <button
              onClick={fetchProducts}
              className="p-2.5 bg-ops-800 border border-ops-700 rounded-lg text-gray-300 hover:text-white transition"
              title="Refresh Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setSelectedProduct(null); setModalOpen(true); }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </header>

        {/* API Error Notification Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between font-mono text-xs text-red-400 shadow-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
              <div>
                <p className="font-bold">Catalog Fetch Warning: {error}</p>
                <p className="text-[11px] text-red-400/80 mt-0.5">Check if backend API server (`{API_URL}`) is running on port 8080.</p>
              </div>
            </div>
            <button
              onClick={fetchProducts}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/40 rounded-lg font-bold transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Inventory Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 shadow-xl space-y-1">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs uppercase font-bold">Total Products</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{totalProducts}</p>
            <p className="text-[11px] text-gray-400">{filteredProducts.length} items currently visible</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 shadow-xl space-y-1">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs uppercase font-bold">Total Stock Units</span>
              <Boxes className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">{totalUnits}</p>
            <p className="text-[11px] text-gray-400">Units allocated in inventory</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 shadow-xl space-y-1">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs uppercase font-bold">Low Stock Warning</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">{lowStockCount}</p>
            <p className="text-[11px] text-amber-400/80">Items with &le; 10 units left</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 shadow-xl space-y-1">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs uppercase font-bold">Out Of Stock</span>
              <Tag className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400">{outOfStockCount}</p>
            <p className="text-[11px] text-rose-400/80">Needs stock replenishment</p>
          </div>
        </div>

        {/* Search & Category Filter Control Bar */}
        <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Search Box */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by Product Title, Category, HSN Code, or Specs..."
                className="w-full bg-ops-900 border border-ops-700 rounded-xl pl-9 pr-8 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Tab Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'Apparel', label: 'Apparel' },
                { id: 'Footwear', label: 'Footwear' },
                { id: 'Accessories', label: 'Accessories' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg border transition font-bold text-[11px] ${
                    categoryFilter === cat.id
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-ops-900 text-gray-300 border-ops-700 hover:bg-ops-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Stock Level Selector */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="bg-ops-900 border border-ops-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock Only</option>
                <option value="LOW_STOCK font-bold">Low Stock (&le; 10)</option>
                <option value="OUT_OF_STOCK">Out of Stock Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Product Table */}
        <div className="bg-ops-800 border border-ops-700 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-ops-900/80 border-b border-ops-700 text-gray-400 text-xs font-mono uppercase">
                <th className="p-4">Item & Specifications</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price & Offer</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ops-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-mono">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                        <span>Fetching products from backend catalog...</span>
                      </div>
                    ) : (
                      'No inventory items matched your filter criteria.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const id = prod.id || prod._id;
                  const isOut = (prod.stock || 0) <= 0;
                  const isLow = (prod.stock || 0) > 0 && (prod.stock || 0) <= 10;
                  return (
                    <tr key={id} className="hover:bg-ops-700/50 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-4">
                          {prod.images && prod.images[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.title}
                              className="w-12 h-12 object-cover rounded-lg border border-ops-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-ops-700 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-base">{prod.title}</p>
                            <div className="text-xs text-gray-400 font-mono flex items-center space-x-3 mt-1 flex-wrap gap-y-1">
                              <span>HSN: {prod.specs?.hsn_code || 'N/A'}</span>
                              {prod.specs?.fabric_gsm && <span>GSM: {prod.specs.fabric_gsm}</span>}
                              {prod.specs?.dpi && <span>Specs: {prod.specs.dpi}</span>}
                              {prod.sizes && prod.sizes.length > 0 && (
                                <span className="text-blue-400">Sizes: {prod.sizes.join(', ')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-ops-900 border border-ops-700 rounded text-xs font-mono font-bold text-blue-400">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        <span className="text-white font-bold text-base">₹{prod.price}</span>
                        {prod.compare_price > prod.price && (
                          <>
                            <span className="text-xs text-gray-500 line-through ml-2">₹{prod.compare_price}</span>
                            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold ml-2 border border-red-500/30">
                              -{Math.round(((prod.compare_price - prod.price) / prod.compare_price) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </td>
                      <td className="p-4 font-mono">
                        <button
                          onClick={() => handleToggleStock(prod)}
                          title="Click to toggle stock status"
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 ${
                            isOut
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                              : isLow
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOut ? 'bg-red-500' : isLow ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                            }`}
                          />
                          <span>
                            {isOut
                              ? 'OUT OF STOCK (0)'
                              : isLow
                              ? `LOW STOCK (${prod.stock})`
                              : `IN STOCK (${prod.stock})`}
                          </span>
                        </button>
                      </td>
                      <td className="p-4 text-right font-mono">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => { setSelectedProduct(prod); setModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-ops-700 transition"
                            title="Edit Item Specs & Price"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-ops-700 transition"
                            title="Delete Item from Inventory"
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

      {/* Product Add / Edit Modal */}
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

