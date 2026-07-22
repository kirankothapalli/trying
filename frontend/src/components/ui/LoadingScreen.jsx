import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiStar, FiX, FiAlertCircle } from 'react-icons/fi';
import { addToCart, fetchCart } from '../../store/allSlices';
import { toggleWishlist, selectIsInWishlist } from '../../store/allSlices';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

// ─── Loading Screen ───────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-2xl">S</div>
          <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20" />
        </div>
        <div className="text-slate-400 text-sm">Loading ShopSphere...</div>
      </div>
    </div>
  );
}
export default LoadingScreen;

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className={`${sizes[size]} border-2 border-white/10 border-t-primary rounded-full animate-spin`} />
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
export function StarRating({ rating, max = 5, size = 'sm', showCount, count }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => (
        <FiStar
          key={i}
          className={`${sizes[size]} ${i < Math.round(rating) ? 'star-filled fill-current' : 'star-empty'}`}
        />
      ))}
      {showCount && <span className="text-xs text-slate-500 ml-1">({count || 0})</span>}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { currentPage, totalPages } = meta;
  const pages = [];
  const delta = 2;
  const range = { start: Math.max(1, currentPage - delta), end: Math.min(totalPages, currentPage + delta) };
  if (range.start > 1) { pages.push(1); if (range.start > 2) pages.push('...'); }
  for (let i = range.start; i <= range.end; i++) pages.push(i);
  if (range.end < totalPages) { if (range.end < totalPages - 1) pages.push('...'); pages.push(totalPages); }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="btn-secondary py-2 px-4 text-sm disabled:opacity-30">Previous</button>
      {pages.map((p, i) => p === '...' ? (
        <span key={i} className="text-slate-500 px-2">...</span>
      ) : (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
            p === currentPage ? 'bg-primary text-white' : 'btn-secondary'
          }`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="btn-secondary py-2 px-4 text-sm disabled:opacity-30">Next</button>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInWishlist = useSelector(selectIsInWishlist(product._id));

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(fetchCart());
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login'); return; }
    dispatch(toggleWishlist(product._id));
  };

  const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
  const hasDiscount = product.discountPercent > 0;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link to={`/product/${product._id}`} className="card-hover group block">
        <div className="relative aspect-square overflow-hidden bg-dark-lighter">
          {primaryImage ? (
            <img src={primaryImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <FiShoppingCart className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && <span className="badge-primary text-xs">{product.discountPercent}% OFF</span>}
            {product.stock === 0 && <span className="badge-danger text-xs">Out of Stock</span>}
            {product.isFeatured && <span className="badge-info text-xs">Featured</span>}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4 group-hover:translate-x-0">
            <button onClick={handleWishlist} className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-card transition-colors ${
              isInWishlist ? 'bg-primary text-white' : 'bg-dark/80 backdrop-blur text-white hover:bg-primary'
            }`}>
              <FiHeart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-primary font-medium mb-1">{product.brand}</div>
          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
          <StarRating rating={product.rating} showCount count={product.numReviews} />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-white">₹{(product.discountedPrice || product.price).toLocaleString()}</span>
            {hasDiscount && <span className="text-sm text-slate-500 line-through">₹{product.price.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-24 rounded" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-dark-lighter flex items-center justify-center mb-6">
        {Icon && <Icon className="w-10 h-10 text-slate-600" />}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-sm mb-6">{description}</p>
      {action && (
        <button onClick={action} className="btn-primary">{actionLabel}</button>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${sizes[size]} card border border-white/10 z-10 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button onClick={onClose} className="btn-icon"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Error Message ────────────────────────────────────────────────────────────
export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
      <FiAlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
    shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger',
    paid: 'badge-success', failed: 'badge-danger', refunded: 'badge-warning',
  };
  return <span className={`badge ${map[status] || 'badge-info'} capitalize`}>{status}</span>;
}
