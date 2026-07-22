import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import api from '../../api/axios';
import { Modal, Spinner } from '../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.data);
    } catch (e) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditCoupon(null);
    reset({});
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditCoupon(c);
    reset({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount,
      maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit || '',
      isActive: c.isActive,
      expiresAt: new Date(c.expiresAt).toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        discountValue: parseFloat(data.discountValue),
        minOrderAmount: parseFloat(data.minOrderAmount) || 0,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        isActive: data.isActive === true || data.isActive === 'true',
      };
      if (editCoupon) {
        await api.put(`/coupons/${editCoupon._id}`, payload);
        toast.success('Coupon updated!');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created!');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-slate-400 text-sm mt-1">{coupons.length} coupons</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  {['Code', 'Type', 'Value', 'Min Order', 'Used', 'Expires', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-500">No coupons yet</td></tr>
                )}
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-white/2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiTag className="w-4 h-4 text-primary" />
                        <span className="font-mono font-semibold text-white">{c.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{c.discountType}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-slate-400">₹{c.minOrderAmount}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${isExpired(c.expiresAt) ? 'text-red-400' : 'text-slate-400'}`}>
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.isActive && !isExpired(c.expiresAt) ? 'badge-success' : 'badge-danger'}`}>
                        {isExpired(c.expiresAt) ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="btn-icon text-blue-400 hover:bg-blue-500/10">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="btn-icon text-red-400 hover:bg-red-500/10">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCoupon ? 'Edit Coupon' : 'Create Coupon'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Code *</label>
            <input
              {...register('code', { required: 'Required' })}
              className={`input uppercase ${errors.code ? 'input-error' : ''}`}
              placeholder="SAVE20"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Discount Type *</label>
            <select {...register('discountType', { required: 'Required' })} className="input">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Discount Value *</label>
            <input
              type="number" step="0.01" min="0"
              {...register('discountValue', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' } })}
              className={`input ${errors.discountValue ? 'input-error' : ''}`}
              placeholder="20"
            />
            {errors.discountValue && <p className="text-red-400 text-xs mt-1">{errors.discountValue.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Min Order Amount (₹)</label>
            <input type="number" min="0" {...register('minOrderAmount')} className="input" placeholder="0" defaultValue={0} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Discount (₹)</label>
            <input type="number" min="0" {...register('maxDiscount')} className="input" placeholder="No limit" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Usage Limit</label>
            <input type="number" min="1" {...register('usageLimit')} className="input" placeholder="No limit" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <input {...register('description')} className="input" placeholder="Get 20% off on all orders" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Expires At *</label>
            <input
              type="date"
              {...register('expiresAt', { required: 'Required' })}
              className={`input ${errors.expiresAt ? 'input-error' : ''}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.expiresAt && <p className="text-red-400 text-xs mt-1">{errors.expiresAt.message}</p>}
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" {...register('isActive')} defaultChecked id="isActiveCoupon" className="accent-primary w-4 h-4" />
            <label htmlFor="isActiveCoupon" className="text-sm text-slate-300">Active</label>
          </div>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Saving...' : editCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
