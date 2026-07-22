import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { fetchFeaturedProducts, fetchCategories, selectProducts } from '../store/slices/productSlice';
import { ProductCard, SkeletonCard } from '../components/ui/LoadingScreen';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const features = [
  { icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: FiShield, title: 'Secure Payment', desc: '100% safe & encrypted' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'We\'re always here to help' },
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, categories, isLoading } = useSelector(selectProducts);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container-custom relative z-10 py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              New Collection Available
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Discover
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-400">
                Premium Products
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-slate-400 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed">
              Shop the latest trends with unbeatable prices. Free shipping on orders above ₹999. Secure payments guaranteed.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary group flex items-center gap-2 text-base px-8 py-4">
                Shop Now
                <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/shop?featured=true" className="btn-secondary text-base px-8 py-4">
                View Featured
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex items-center gap-8">
              {[['10K+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Rating']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white">{val}</div>
                  <div className="text-sm text-slate-500">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-dark-secondary border-y border-white/5">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-white">{title}</div>
                  <div className="text-sm text-slate-400">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">Shop by Category</h2>
                <p className="text-slate-400 mt-1">Find exactly what you're looking for</p>
              </div>
              <Link to="/shop" className="btn-ghost flex items-center gap-2 text-primary">
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/shop?category=${cat._id}`}
                    className="card-hover block p-5 text-center group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-200 text-2xl font-bold">
                      {cat.name[0]}
                    </div>
                    <div className="text-sm font-semibold text-white">{cat.name}</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Featured Products</h2>
              <p className="text-slate-400 mt-1">Handpicked just for you</p>
            </div>
            <Link to="/shop?featured=true" className="btn-ghost flex items-center gap-2 text-primary">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="products-grid">
            {isLoading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : featured.map((product) => <ProductCard key={product._id} product={product} />)
            }
          </div>
          {!isLoading && featured.length === 0 && (
            <div className="text-center py-12 text-slate-400">No featured products yet.</div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/20 p-10 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-600/5" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Get 20% Off Your First Order
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Sign up today and use code <span className="text-primary font-bold">WELCOME20</span> at checkout.
              </p>
              <Link to="/register" className="btn-primary text-base px-8 py-4 inline-flex">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
