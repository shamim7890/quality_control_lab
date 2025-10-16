'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  X, 
  BarChart3,
  TrendingUp,
  Database,
  Eye,
  ArrowUpDown
} from 'lucide-react';

export interface Product {
    id?: number;
    name: string;
    unit: string;
    uses?: string | null;
}

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export default function ProductsHistoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'unit'>('name');


  // Simulate router for demo
  const router = {
    push: (path: string) => console.log('Navigating to:', path)
  };

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products when search term or sort option changes
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.uses && product.uses.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort products
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.unit.localeCompare(b.unit);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      const response: ApiResponse<Product[]> = await res.json();
      if (response.error) {
        setError(response.error);
      } else {
        setProducts(response.data || []);
      }
    } catch {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Update a product
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const response: ApiResponse<Product> = await res.json();
      if (response.error) {
        setError(response.error);
      } else {
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? response.data! : p))
        );
        setEditingProduct(null);
      }
    } catch {
      setError('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Delete a product
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const response: ApiResponse<null> = await res.json();
      if (response.error) {
        setError(response.error);
      } else {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch {
      setError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const uniqueUnits = new Set(products.map(p => p.unit)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">Products History</h1>
                <p className="text-slate-600 text-lg">Manage and monitor your product inventory</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold text-slate-800">{products.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Filtered Results</p>
                    <p className="text-3xl font-bold text-slate-800">{filteredProducts.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Unique Units</p>
                    <p className="text-3xl font-bold text-slate-800">{uniqueUnits}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions and Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Left side - Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/products/add')}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Product
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Right side - Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'unit')}
                      className="pl-10 pr-8 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none appearance-none"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="unit">Sort by Unit</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Edit Product Form */}
          {editingProduct && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-8 mb-8 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-800">Edit Product</h2>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Product Name</label>
                  <input
                    type="text"
                    placeholder="Product name"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Unit</label>
                  <input
                    type="text"
                    placeholder="Unit"
                    value={editingProduct.unit}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, unit: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Uses</label>
                  <input
                    type="text"
                    placeholder="Uses (optional)"
                    value={editingProduct.uses || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, uses: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">
                    All Products ({filteredProducts.length})
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-slate-300" />
                  <span className="text-slate-300 text-sm">Sorted by {sortBy}</span>
                </div>
              </div>
            </div>

            {loading && !products.length ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center gap-3 text-slate-600">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Loading products...</span>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg mb-2">
                  {searchTerm ? 'No products match your search.' : 'No products found.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-6 hover:bg-slate-50/50 transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-slate-800 mb-2 truncate">
                          {product.name}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                              Unit
                            </span>
                            <span className="text-slate-700 font-medium">{product.unit}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                              Uses
                            </span>
                            <span className="text-slate-700 text-sm leading-relaxed">
                              {product.uses || 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id!)}
                          disabled={loading}
                          className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}