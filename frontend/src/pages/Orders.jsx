import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { fetchMyOrders, selectOrders } from '../store/allSlices';
import { EmptyState, StatusBadge, Spinner } from '../components/ui/LoadingScreen';

export default function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: orders, isLoading } = useSelector(selectOrders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (isLoading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="pt-16 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>
        {orders.length === 0 ? (
          <EmptyState icon={FiPackage} title="No orders yet" description="Your orders will appear here after you make a purchase"
            action={() => navigate('/shop')} actionLabel="Start Shopping" />
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/orders/${order._id}`} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/30 transition-all block">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-white text-sm">#{order.orderNumber}</span>
                      <StatusBadge status={order.orderStatus} />
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                    <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="text-xs text-slate-500 mt-1">{order.items?.length} item(s)</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-white">₹{order.billing?.total?.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 capitalize">{order.paymentMethod}</div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
