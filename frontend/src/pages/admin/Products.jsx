import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import { Modal, Spinner, StatusBadge } from '../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products', { params: { limit: 100, search } }),
        api.get('/categories'),
      ]);
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditProduct(null); reset({}); setModalOpen(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    reset({
      name: p.name, description: p.description, price: p.price,
      discountPercent: p.discountPercent, brand: p.brand,
      category: p.category?._id, stock: p.stock, sku: p.sku,
      isFeatured: p.isFeatured, isActive: p.isActive,
      imageUrl: p.images?.[0]?.url || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name, description: data.description, price: parseFloat(data.price),
        discountPercent: parseFloat(data.discountPercent) || 0,
        brand: data.brand, category: data.category,
        stock: parseInt(data.stock), sku: data.sku,
        isFeatured: data.isFeatured === true || data.isFeatured === 'true',
        isActive: data.isActive === undefined ? true : (data.isActive === true || data.isActive === 'true'),
        images: data.imageUrl ? [{ url: data.imageUrl, alt: data.name, isPrimary: true }] : [],
      };
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="input pl-11 py-2.5 text-sm" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><FiX className="w-4 h-4 text-slate-500" /></button>}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-500">No products found</td></tr>
                )}
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-dark-lighter shrink-0" />
                        <div>
                          <div className="font-medium text-white line-clamp-1 max-w-48">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{p.category?.name || '–'}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">₹{(p.discountedPrice || p.price)?.toLocaleString()}</div>
                      {p.discountPercent > 0 && <div className="text-xs text-slate-500 line-through">₹{p.price?.toLocaleString()}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock > 10 ? 'text-emerald-400' : p.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="btn-icon text-blue-400 hover:bg-blue-500/10"><FiEdit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="btn-icon text-red-400 hover:bg-red-500/10"><FiTrash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Product Name *</label>
            <input {...register('name', { required: 'Required' })} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Premium Wireless Headphones" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea {...register('description', { required: 'Required', minLength: { value: 10, message: 'Min 10 chars' } })}
              rows={3} className={`input resize-none ${errors.description ? 'input-error' : ''}`} placeholder="Detailed product description..." />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price (₹) *</label>
            <input type="number" step="0.01" {...register('price', { required: 'Required', min: { value: 0, message: 'Must be positive' } })}
              className={`input ${errors.price ? 'input-error' : ''}`} placeholder="999" />
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Discount (%)</label>
            <input type="number" min="0" max="100" {...register('discountPercent')} className="input" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Brand *</label>
            <input {...register('brand', { required: 'Required' })} className={`input ${errors.brand ? 'input-error' : ''}`} placeholder="Sony" />
            {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
            <select {...register('category', { required: 'Required' })} className={`input ${errors.category ? 'input-error' : ''}`}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Stock *</label>
            <input type="number" min="0" {...register('stock', { required: 'Required' })} className={`input ${errors.stock ? 'input-error' : ''}`} placeholder="50" />
            {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">SKU</label>
            <input {...register('sku')} className="input" placeholder="Auto-generated if empty" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Primary Image URL</label>
            <input {...register('imageUrl')} className="input" placeholder="https://example.com/image.jpg" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-slate-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} defaultChecked className="accent-primary w-4 h-4" />
              <span className="text-sm text-slate-300">Active</span>
            </label>
          </div>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
