// OrderDetail.jsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiPackage } from 'react-icons/fi';
import { fetchOrderById, cancelOrder, selectOrders } from '../store/allSlices';
import { StatusBadge, Spinner } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, isLoading } = useSelector(selectOrders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id, dispatch]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    const res = await dispatch(cancelOrder({ id, reason: 'Cancelled by customer' }));
    if (!res.error) dispatch(fetchOrderById(id));
  };

  if (isLoading || !order) return (
    <div className="pt-16 min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  );

  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);

  return (
    <div className="pt-16 min-h-screen">
      <div className="container-custom py-8">
        <Link to="/orders" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <FiArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
            <p className="text-slate-400 text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.orderStatus} />
            <StatusBadge status={order.paymentStatus} />
            {canCancel && (
              <button onClick={handleCancel} className="btn-secondary py-2 px-4 text-sm text-red-400 border-red-500/30 hover:bg-red-500/10">
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-4">Items Ordered</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-dark-lighter shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-1">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</div>
                    </div>
                    <div className="font-semibold text-white text-sm">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-4">Shipping Address</h2>
              <div className="text-sm text-slate-400 space-y-1">
                <p className="text-white font-medium">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Status history */}
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.statusHistory?.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1 shrink-0" />
                      {i < order.statusHistory.length - 1 && <div className="w-0.5 flex-1 bg-white/10 my-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="text-sm font-medium text-white capitalize">{s.status}</div>
                      {s.note && <div className="text-xs text-slate-500 mt-0.5">{s.note}</div>}
                      <div className="text-xs text-slate-600 mt-0.5">{new Date(s.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-4">Payment Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{order.billing?.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between text-slate-400"><span>Shipping</span><span>{order.billing?.shipping === 0 ? 'FREE' : `₹${order.billing?.shipping}`}</span></div>
                <div className="flex justify-between text-slate-400"><span>Tax</span><span>₹{order.billing?.tax?.toLocaleString()}</span></div>
                {order.billing?.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-₹{order.billing.discount.toLocaleString()}</span></div>}
                <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-white">
                  <span>Total</span><span>₹{order.billing?.total?.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-sm text-slate-400">
                <div className="flex justify-between"><span>Payment Method</span><span className="capitalize text-white">{order.paymentMethod}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OrderDetail;
