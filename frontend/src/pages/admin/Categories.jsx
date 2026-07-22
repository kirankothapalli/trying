// Categories.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../api/axios';
import { Modal, Spinner } from '../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditCat(null); reset({}); setModalOpen(true); };
  const openEdit = (c) => { setEditCat(c); reset({ name: c.name, description: c.description, image: c.image }); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editCat) {
        await api.put(`/categories/${editCat._id}`, data);
        toast.success('Category updated');
      } else {
        await api.post('/categories', data);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" />Add Category</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c._id} className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{c.name}</div>
                {c.description && <div className="text-xs text-slate-500 truncate mt-0.5">{c.description}</div>}
                <div className={`text-xs mt-1 ${c.isActive ? 'text-emerald-400' : 'text-red-400'}`}>{c.isActive ? 'Active' : 'Inactive'}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(c)} className="btn-icon text-blue-400"><FiEdit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(c._id)} className="btn-icon text-red-400"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <div className="col-span-3 text-center py-10 text-slate-500">No categories yet</div>}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
            <input {...register('name', { required: 'Required' })} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Electronics" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Category description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
            <input {...register('image')} className="input" placeholder="https://..." />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : editCat ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default AdminCategories;
