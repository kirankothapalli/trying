import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiShare2, FiChevronRight, FiMinus, FiPlus, FiStar } from 'react-icons/fi';
import { fetchProductDetail, selectProducts } from '../store/slices/productSlice';
import { addToCart, fetchCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectIsInWishlist } from '../store/slices/wishlistSlice';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { StarRating, Spinner, ErrorMessage } from '../components/ui/LoadingScreen';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, isLoading } = useSelector(selectProducts);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isInWishlist = useSelector(selectIsInWishlist(id));
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetail(id));
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    await dispatch(addToCart({ productId: product._id, quantity }));
    dispatch(fetchCart());
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await dispatch(addToCart({ productId: product._id, quantity }));
    await dispatch(fetchCart());
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to review'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      dispatch(fetchProductDetail(id));
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!product) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Product not found</h2>
        <Link to="/shop" className="btn-primary mt-4 inline-block">Back to Shop</Link>
      </div>
    </div>
  );

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.discountPercent > 0;
  const savings = product.price - (product.discountedPrice || product.price);

  return (
    <div className="pt-16 min-h-screen">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <FiChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-slate-300 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-dark-lighter mb-4">
              <img
                src={product.images?.[activeImage]?.url || primaryImage?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === i ? 'border-primary' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="text-sm text-primary font-medium mb-1">{product.brand}</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{product.name}</h1>
              </div>
              <button onClick={handleWishlist} className={`btn-icon w-10 h-10 rounded-xl shrink-0 ${isInWishlist ? 'bg-primary/20 text-primary' : ''}`}>
                <FiHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm text-slate-400">({product.numReviews} reviews)</span>
              {product.soldCount > 0 && <span className="text-xs text-slate-500">• {product.soldCount} sold</span>}
            </div>

            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-white">₹{(product.discountedPrice || product.price).toLocaleString()}</span>
              {hasDiscount && <span className="text-xl text-slate-500 line-through mb-1">₹{product.price.toLocaleString()}</span>}
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-primary">{product.discountPercent}% OFF</span>
                <span className="text-sm text-emerald-400">You save ₹{savings.toLocaleString()}</span>
              </div>
            )}

            <p className="text-slate-400 leading-relaxed mb-6">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-slate-300">Quantity:</span>
                <div className="flex items-center bg-dark-lighter rounded-xl border border-white/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-secondary flex items-center gap-2 flex-1 justify-center disabled:opacity-50"
              >
                <FiShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            {/* Specs */}
            {product.specifications?.length > 0 && (
              <div className="border-t border-white/5 pt-6">
                <h3 className="font-semibold text-white mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="bg-dark-lighter rounded-lg px-4 py-3">
                      <div className="text-xs text-slate-500">{spec.key}</div>
                      <div className="text-sm text-white font-medium">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-slate-600 mt-4">SKU: {product.sku}</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">Customer Reviews</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating summary */}
            <div className="card p-6 text-center">
              <div className="text-6xl font-bold text-white mb-2">{product.rating || 0}</div>
              <StarRating rating={product.rating} size="lg" />
              <div className="text-slate-400 text-sm mt-2">{product.numReviews} reviews</div>
            </div>

            {/* Review list */}
            <div className="lg:col-span-2 space-y-4">
              {product.reviews?.length === 0 ? (
                <div className="card p-8 text-center text-slate-400">No reviews yet. Be the first!</div>
              ) : (
                product.reviews?.map((review) => (
                  <div key={review._id} className="card p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                        {review.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">{review.name}</span>
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-slate-500 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Write review */}
          {isAuthenticated && (
            <div className="mt-8 card p-6">
              <h3 className="font-semibold text-white mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                        className="transition-transform hover:scale-110"
                      >
                        <FiStar className={`w-7 h-7 ${star <= reviewForm.rating ? 'star-filled fill-current' : 'star-empty'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                    rows={4} placeholder="Share your experience..."
                    className="input resize-none"
                    maxLength={500}
                  />
                  <div className="text-xs text-slate-600 text-right mt-1">{reviewForm.comment.length}/500</div>
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
