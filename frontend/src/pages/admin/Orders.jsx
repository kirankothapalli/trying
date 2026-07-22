// Admin Orders
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { StatusBadge, Spinner, Modal } from '../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNum, setTrackingNum] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', { params: { status: statusFilter, limit: 100 } });
      setOrders(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      await api.put(`/admin/orders/${selectedOrder._id}/status`, { status: newStatus, trackingNumber: trackingNum });
      toast.success('Order status updated');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) { toast.error('Failed'); }
  };

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} orders</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input text-sm py-2 w-48">
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-slate-500">No orders</td></tr>}
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-white/2">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">#{o.orderNumber?.slice(-8)}</td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-medium">{o.user?.name}</div>
                      <div className="text-xs text-slate-500">{o.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{o.items?.length}</td>
                    <td className="px-4 py-3 font-semibold text-white">₹{o.billing?.total?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={o.orderStatus} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelectedOrder(o); setNewStatus(o.orderStatus); setTrackingNum(o.trackingNumber || ''); }}
                        className="text-xs text-primary hover:underline">Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Update Order Status" size="sm">
        {selectedOrder && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Order: <span className="text-white">#{selectedOrder.orderNumber}</span></p>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input">
                {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tracking Number</label>
              <input value={trackingNum} onChange={(e) => setTrackingNum(e.target.value)} className="input" placeholder="Optional" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleStatusUpdate} className="btn-primary flex-1">Update</button>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default AdminOrders;
