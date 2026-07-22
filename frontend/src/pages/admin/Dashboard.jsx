import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';
import { StatusBadge, Spinner } from '../../components/ui/LoadingScreen';

const StatCard = ({ title, value, icon: Icon, change, color = 'primary' }) => {
  const isPositive = parseFloat(change) >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'primary' ? 'bg-primary/20 text-primary' :
          color === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
          color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
          'bg-purple-500/20 text-purple-400'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </motion.div>
  );
};

const COLORS = ['#e94560', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  );

  if (!stats) return <div className="text-red-400">Failed to load dashboard.</div>;

  const orderStatusData = stats.orders.byStatus.map((s) => ({ name: s._id, value: s.count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${(stats.revenue.total || 0).toLocaleString()}`} icon={FiDollarSign} change={stats.revenue.growth} color="primary" />
        <StatCard title="Monthly Revenue" value={`₹${(stats.revenue.monthly || 0).toLocaleString()}`} icon={FiTrendingUp} color="green" />
        <StatCard title="Total Orders" value={stats.orders.total} icon={FiShoppingCart} color="blue" />
        <StatCard title="Total Users" value={stats.users.total} icon={FiUsers} color="purple" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="This Month Orders" value={stats.orders.monthly} icon={FiPackage} color="blue" />
        <StatCard title="New Users (Month)" value={stats.users.newThisMonth} icon={FiUsers} color="green" />
        <StatCard title="Total Products" value={stats.products.total} icon={FiPackage} color="primary" />
        <StatCard title="Low Stock Items" value={stats.products.lowStock} icon={FiPackage} color="purple" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-white mb-5">Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.revenueChart} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#16213e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }}
                formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#e94560" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status Pie */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-5">Orders by Status</h2>
          {orderStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#16213e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {orderStatusData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-400 capitalize">{item.name}</span>
                    </div>
                    <span className="font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-8 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders?.length === 0 && <div className="text-slate-500 text-sm text-center py-4">No orders yet</div>}
            {stats.recentOrders?.slice(0, 6).map((order) => (
              <div key={order._id} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">#{order.orderNumber}</div>
                  <div className="text-xs text-slate-500 truncate">{order.user?.name} · {order.user?.email}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={order.orderStatus} />
                  <span className="text-sm font-semibold text-white">₹{order.billing?.total?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {stats.topProducts?.length === 0 && <div className="text-slate-500 text-sm text-center py-4">No sales data</div>}
            {stats.topProducts?.map((product, i) => (
              <div key={product._id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <img src={product.images?.[0]?.url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-dark-lighter shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{product.name}</div>
                  <div className="text-xs text-slate-500">{product.soldCount} sold</div>
                </div>
                <div className="text-sm font-semibold text-white shrink-0">₹{product.price?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
