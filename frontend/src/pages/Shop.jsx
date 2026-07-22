import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { fetchProducts, selectProducts, setFilters, resetFilters } from '../store/slices/productSlice';
import { ProductCard, SkeletonCard, Pagination, EmptyState } from '../components/ui/LoadingScreen';
import { FiShoppingBag } from 'react-icons/fi';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

export default function Shop() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, meta, isLoading, categories, filters } = useSelector(selectProducts);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Sync URL params to filters
  useEffect(() => {
    const params = {};
    if (searchParams.get('category')) params.category = searchParams.get('category');
    if (searchParams.get('search')) params.search = searchParams.get('search');
    if (searchParams.get('featured')) params.featured = searchParams.get('featured');
    if (Object.keys(params).length > 0) dispatch(setFilters(params));
  }, [searchParams]);

  const loadProducts = useCallback(() => {
    dispatch(fetchProducts({ ...filters, page, limit: 12 }));
  }, [dispatch, filters, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    setPage(1);
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setPage(1);
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <button onClick={handleReset} className="text-xs text-primary hover:underline">Reset all</button>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="category" value="" checked={!filters.category}
              onChange={() => handleFilterChange('category', '')}
              className="accent-primary" />
            <span className="text-sm text-slate-400 hover:text-white">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="category" value={cat._id}
                checked={filters.category === cat._id}
                onChange={() => handleFilterChange('category', cat._id)}
                className="accent-primary" />
              <span className="text-sm text-slate-400 hover:text-white">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Price Range</h4>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="input text-sm py-2" />
          <input type="number" placeholder="Max" value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="input text-sm py-2" />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Min Rating</h4>
        <div className="space-y-2">
          {['', '4', '3', '2'].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rating" value={r} checked={filters.rating === r}
                onChange={() => handleFilterChange('rating', r)}
                className="accent-primary" />
              <span className="text-sm text-slate-400">{r ? `${r}★ & Above` : 'All Ratings'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={filters.inStock === 'true'}
            onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
            className="accent-primary w-4 h-4 rounded" />
          <span className="text-sm text-slate-300">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="pt-16 min-h-screen">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Shop</h1>
            <p className="text-slate-400 mt-1">{meta?.totalItems || 0} products found</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden btn-secondary flex items-center gap-2 text-sm py-2">
              <FiFilter className="w-4 h-4" /> Filters
            </button>
            <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="input text-sm py-2 w-48 cursor-pointer">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="card p-5 sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Search indicator */}
            {filters.search && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-slate-400 text-sm">Results for:</span>
                <span className="badge-primary">{filters.search}</span>
                <button onClick={() => handleFilterChange('search', '')} className="btn-icon w-6 h-6 rounded-full">
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="products-grid">
                {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={FiShoppingBag}
                title="No products found"
                description="Try adjusting your filters or search query"
                action={handleReset}
                actionLabel="Clear Filters"
              />
            ) : (
              <>
                <div className="products-grid">
                  {items.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
                <Pagination meta={meta} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-dark-secondary border-l border-white/5 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white text-lg">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="btn-icon">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
          </motion.div>
        </div>
      )}
    </div>
  );
}
