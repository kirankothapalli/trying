// OrderSuccess.jsx
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';
import { fetchOrderById, selectOrders } from '../store/slices/orderSlice';
import { useSelector } from 'react-redux';
import { resetCart } from '../store/slices/cartSlice';

export function OrderSuccess() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order } = useSelector(selectOrders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    dispatch(resetCart());
  }, [id, dispatch]);

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md w-full">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="w-12 h-12 text-emerald-400" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Placed! 🎉</h1>
        <p className="text-slate-400 mb-2">Thank you for shopping with ShopSphere</p>
        {order && (
          <div className="badge-success mx-auto mb-6 text-sm">Order #{order.orderNumber}</div>
        )}
        <div className="card p-5 text-left mb-6 space-y-2">
          {order && <>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Total</span><span className="font-bold text-white">₹{order.billing?.total?.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Payment</span><span className="text-white capitalize">{order.paymentMethod}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Status</span><span className="text-emerald-400 capitalize">{order.orderStatus}</span></div>
          </>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${id}`} className="btn-primary flex items-center justify-center gap-2">
            <FiPackage className="w-4 h-4" />Track Order
          </Link>
          <Link to="/shop" className="btn-secondary flex items-center justify-center gap-2">
            Continue Shopping <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
export default OrderSuccess;
