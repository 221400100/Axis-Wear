import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import ProductCard from '../../components/ProductCard';

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setAllProducts(data); // Show all products
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="animate-fade-in">
      <Helmet>
        <title>Axis Wear - Premium Clothing E-Commerce</title>
        <meta name="description" content="Shop premium T-Shirts, Trousers, and Track Suits. Free Cash on Delivery available." />
      </Helmet>

      {/* Hero Section */}
      <section style={{ position: 'relative', height: '80vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(10, 10, 15, 0.2), rgba(10, 10, 15, 0.9)), url("https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2070") center/cover', zIndex: -1 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1.1 }}>
              Redefine Your <span className="text-gradient">Style</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
              Discover premium clothing designed for comfort and built for the modern individual.
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Shop Collection <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '5rem 0' }} className="container">
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Our Complete Collection</h2>
          <p className="text-secondary">Explore all our premium clothing items directly.</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-panel animate-pulse-glow" style={{ height: '400px' }}></div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {allProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
            {allProducts.length === 0 && (
              <p className="text-muted">No products available at the moment.</p>
            )}
          </div>
        )}
      </section>

      {/* Categories Banner */}
      <section style={{ background: 'var(--bg-secondary)', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Shop by Category</h2>
            <p className="text-secondary">Find exactly what you're looking for.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800' },
              { name: 'Trousers', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800' },
              { name: 'Track Suits', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800' }
            ].map((cat, idx) => (
              <Link 
                to={`/shop?category=${cat.name}`} 
                key={idx} 
                style={{ position: 'relative', height: '400px', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', display: 'block', textDecoration: 'none', boxShadow: 'var(--glass-shadow)' }}
                onMouseOver={(e) => e.currentTarget.querySelector('img').style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
              >
                <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem', color: 'white' }}>
                  <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{cat.name}</h3>
                  <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>
                    Explore Collection <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
