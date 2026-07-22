// Cart.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag } from 'react-icons/fi';
import { fetchCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon, selectCart } from '../store/slices/cartSlice';
import { EmptyState } from '../components/ui/LoadingScreen';
import { useState } from 'react';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, billing, couponCode, isLoading } = useSelector(selectCart);
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleQtyChange = (itemId, qty) => {
    if (qty < 1) return;
    dispatch(updateCartItem({ itemId, quantity: qty })).then(() => dispatch(fetchCart()));
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId)).then(() => dispatch(fetchCart()));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    await dispatch(applyCoupon(couponInput.trim()));
    setApplying(false);
    dispatch(fetchCart());
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon()).then(() => dispatch(fetchCart()));
    setCouponInput('');
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="pt-16 min-h-screen">
        <div className="container-custom py-20">
          <EmptyState
            icon={FiShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet"
            action={() => navigate('/shop')}
            actionLabel="Start Shopping"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div key={item._id} layout exit={{ opacity: 0, x: -50 }} className="card p-5">
                  <div className="flex gap-4">
                    <Link to={`/product/${item.product?._id}`} className="shrink-0">
                      <img
                        src={item.product?.images?.[0]?.url || ''}
                        alt={item.product?.name}
                        className="w-24 h-24 rounded-xl object-cover bg-dark-lighter"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product?._id}`} className="font-semibold text-white hover:text-primary transition-colors line-clamp-2">
                        {item.product?.name}
                      </Link>
                      <div className="text-sm text-slate-500 mt-1">{item.product?.brand}</div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center bg-dark-lighter rounded-xl border border-white/10">
                          <button onClick={() => handleQtyChange(item._id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white">
                            <FiMinus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-white">{item.quantity}</span>
                          <button onClick={() => handleQtyChange(item._id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white">
                            <FiPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                          <button onClick={() => handleRemove(item._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Coupon */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiTag className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white text-sm">Coupon Code</span>
              </div>
              {couponCode ? (
                <div className="flex items-center gap-3">
                  <span className="badge-success">{couponCode}</span>
                  <span className="text-emerald-400 text-sm">-₹{billing?.discount?.toLocaleString()}</span>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-400 hover:underline ml-auto">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="input text-sm py-2 flex-1"
                  />
                  <button onClick={handleApplyCoupon} disabled={applying} className="btn-primary py-2 px-5 text-sm">
                    {applying ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-semibold text-white text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{billing?.subtotal?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span>{billing?.shipping === 0 ? <span className="text-emerald-400">FREE</span> : `₹${billing?.shipping}`}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18%)</span>
                  <span>₹{billing?.tax?.toLocaleString() || 0}</span>
                </div>
                {billing?.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{billing.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-white text-base">
                  <span>Total</span>
                  <span>₹{billing?.total?.toLocaleString() || 0}</span>
                </div>
              </div>
              {billing?.shipping === 0
                ? <p className="text-xs text-emerald-400 mt-3">🎉 Free shipping on this order!</p>
                : <p className="text-xs text-slate-500 mt-3">Add ₹{999 - (billing?.subtotal || 0)} more for free shipping</p>
              }
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-6">
                Proceed to Checkout
              </button>
              <Link to="/shop" className="block text-center text-sm text-primary hover:underline mt-3">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
