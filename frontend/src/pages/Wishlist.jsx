// Wishlist.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { fetchWishlist, selectWishlist } from '../store/allSlices';
import { ProductCard, EmptyState } from '../components/ui/LoadingScreen';

export function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlist = useSelector(selectWishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  return (
    <div className="pt-16 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Wishlist ({wishlist.length})</h1>
        {wishlist.length === 0 ? (
          <EmptyState icon={FiHeart} title="Wishlist is empty" description="Save items you love for later"
            action={() => navigate('/shop')} actionLabel="Explore Products" />
        ) : (
          <div className="products-grid">
            {wishlist.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}
export default Wishlist;
