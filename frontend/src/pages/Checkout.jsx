import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiCreditCard, FiSmartphone, FiPackage, FiChevronRight } from 'react-icons/fi';
import { fetchCart, selectCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import { selectUser } from '../store/slices/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const paymentMethods = [
  { id: 'stripe', label: 'Credit / Debit Card', icon: FiCreditCard, desc: 'Powered by Stripe' },
  { id: 'razorpay', label: 'UPI / Net Banking', icon: FiSmartphone, desc: 'Powered by Razorpay' },
  { id: 'cod', label: 'Cash on Delivery', icon: FiPackage, desc: 'Pay when delivered' },
];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, billing, couponCode } = useSelector(selectCart);
  const user = useSelector(selectUser);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [step, setStep] = useState(1);
  const [isPlacing, setIsPlacing] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchCart());
    if (user) {
      setValue('fullName', user.name);
      setValue('phone', user.phone || '');
      if (user.addresses?.length > 0) {
        const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setValue('street', def.street);
        setValue('city', def.city);
        setValue('state', def.state);
        setValue('zipCode', def.zipCode);
        setValue('country', def.country);
      }
    }
  }, [dispatch, user, setValue]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const onSubmit = async (data) => {
    setIsPlacing(true);
    try {
      const orderData = {
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country || 'India',
        },
        paymentMethod,
        couponCode,
        notes: data.notes,
      };

      const res = await dispatch(createOrder(orderData));
      if (res.error) { toast.error(res.error.message || 'Order failed'); return; }

      const order = res.payload;

      if (paymentMethod === 'cod') {
        navigate(`/order-success/${order._id}`);
        return;
      }

      if (paymentMethod === 'stripe') {
        try {
          const intentRes = await api.post('/payments/stripe/create-intent', { orderId: order._id });
          const { clientSecret } = intentRes.data.data;
          // In real app, use Stripe.js to confirm payment; simulating success for demo
          await api.post('/payments/stripe/confirm', { orderId: order._id, paymentIntentId: 'pi_demo_' + Date.now() });
          navigate(`/order-success/${order._id}`);
        } catch (e) {
          toast.error('Payment failed. Order placed as pending.');
          navigate(`/order-success/${order._id}`);
        }
        return;
      }

      if (paymentMethod === 'razorpay') {
        try {
          const rpRes = await api.post('/payments/razorpay/create-order', { orderId: order._id });
          const { orderId: rpOrderId, amount, currency, keyId } = rpRes.data.data;
          // Load Razorpay script
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            const rzp = new window.Razorpay({
              key: keyId,
              amount,
              currency,
              name: 'ShopSphere',
              description: `Order #${order.orderNumber}`,
              order_id: rpOrderId,
              handler: async (response) => {
                await api.post('/payments/razorpay/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order._id,
                });
                navigate(`/order-success/${order._id}`);
              },
              prefill: { name: user?.name, email: user?.email, contact: data.phone },
              theme: { color: '#e94560' },
            });
            rzp.open();
          };
          document.body.appendChild(script);
        } catch (e) {
          toast.error('Payment failed');
        }
        return;
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Shipping', 'Payment', 'Review'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i + 1 <= step ? 'text-primary' : 'text-slate-500'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 <= step ? 'bg-primary text-white' : 'bg-dark-lighter text-slate-500'}`}>{i + 1}</div>
                <span className="text-sm font-medium hidden sm:block">{s}</span>
              </div>
              {i < 2 && <FiChevronRight className="w-4 h-4 text-slate-600" />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping */}
              <div className="card p-6">
                <h2 className="font-semibold text-white mb-5">Shipping Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                    <input {...register('fullName', { required: 'Required' })} className={`input ${errors.fullName ? 'input-error' : ''}`} placeholder="John Doe" />
                    {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone *</label>
                    <input {...register('phone', { required: 'Required' })} className={`input ${errors.phone ? 'input-error' : ''}`} placeholder="+91 9999999999" />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Street Address *</label>
                    <input {...register('street', { required: 'Required' })} className={`input ${errors.street ? 'input-error' : ''}`} placeholder="123 Main Street, Apt 4B" />
                    {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">City *</label>
                    <input {...register('city', { required: 'Required' })} className={`input ${errors.city ? 'input-error' : ''}`} placeholder="Hyderabad" />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">State *</label>
                    <input {...register('state', { required: 'Required' })} className={`input ${errors.state ? 'input-error' : ''}`} placeholder="Telangana" />
                    {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">ZIP Code *</label>
                    <input {...register('zipCode', { required: 'Required' })} className={`input ${errors.zipCode ? 'input-error' : ''}`} placeholder="500001" />
                    {errors.zipCode && <p className="text-red-400 text-xs mt-1">{errors.zipCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
                    <input {...register('country')} defaultValue="India" className="input" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="card p-6">
                <h2 className="font-semibold text-white mb-5">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map(({ id, label, icon: Icon, desc }) => (
                    <label key={id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === id ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'}`}>
                      <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="accent-primary" />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === id ? 'bg-primary/20 text-primary' : 'bg-dark-lighter text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{label}</div>
                        <div className="text-xs text-slate-500">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="card p-6">
                <h2 className="font-semibold text-white mb-3">Order Notes (Optional)</h2>
                <textarea {...register('notes')} rows={3} placeholder="Special instructions..." className="input resize-none" />
              </div>
            </div>

            {/* Right: Summary */}
            <div>
              <div className="card p-6 sticky top-24">
                <h2 className="font-semibold text-white mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img src={item.product?.images?.[0]?.url} alt={item.product?.name} className="w-12 h-12 rounded-lg object-cover bg-dark-lighter shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white font-medium line-clamp-2">{item.product?.name}</div>
                        <div className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-semibold text-white shrink-0">₹{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/5 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{billing?.subtotal?.toLocaleString()}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Shipping</span><span>{billing?.shipping === 0 ? <span className="text-emerald-400">FREE</span> : `₹${billing?.shipping}`}</span></div>
                  <div className="flex justify-between text-slate-400"><span>GST (18%)</span><span>₹{billing?.tax?.toLocaleString()}</span></div>
                  {billing?.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-₹{billing.discount.toLocaleString()}</span></div>}
                  <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-white text-base">
                    <span>Total</span><span>₹{billing?.total?.toLocaleString()}</span>
                  </div>
                </div>
                <button type="submit" disabled={isPlacing} className="btn-primary w-full mt-6 text-base py-4">
                  {isPlacing ? 'Placing Order...' : `Place Order · ₹${billing?.total?.toLocaleString()}`}
                </button>
                <p className="text-xs text-slate-500 text-center mt-3">🔒 Secured by 256-bit SSL encryption</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
