import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';
import ProductCard from '../../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategoryName = queryParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [priceMax, setPriceMax] = useState(200);
  const [sortType, setSortType] = useState('default');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // If categories are loaded, try to map the initial category name to ID
    if (categories.length > 0 && initialCategoryName && !selectedCategory) {
      const cat = categories.find(c => c.name === initialCategoryName);
      if (cat) setSelectedCategory(cat._id);
    }
    fetchProducts();
  }, [categories, selectedCategory, selectedSize, priceMax, sortType]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?priceMax=${priceMax}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedSize) url += `size=${selectedSize}`;

      const { data } = await api.get(url);

      // Perform client side sorting for mock high fidelity
      let processed = [...data];
      if (sortType === 'low-high') {
        processed.sort((a, b) => {
          const pA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const pB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return pA - pB;
        });
      } else if (sortType === 'high-low') {
        processed.sort((a, b) => {
          const pA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const pB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return pB - pA;
        });
      } else if (sortType === 'discount') {
        processed.sort((a, b) => b.discount - a.discount);
      }

      setProducts(processed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setPriceMax(200);
    setSortType('default');
  };

  const renderFiltersContent = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Refine Selection</h3>
        <button
          onClick={handleClearFilters}
          style={{ background: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Reset All
        </button>
      </div>

      {/* Categories filter */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '1px' }} className="text-secondary">Categories</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => { setSelectedCategory(''); setIsMobileFiltersOpen(false); }}
            style={{
              background: 'none',
              color: selectedCategory === '' ? 'var(--accent-primary)' : 'var(--text-primary)',
              textAlign: 'left',
              fontWeight: selectedCategory === '' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            All Collections
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => { setSelectedCategory(c._id); setIsMobileFiltersOpen(false); }}
              style={{
                background: 'none',
                color: selectedCategory === c._id ? 'var(--accent-primary)' : 'var(--text-primary)',
                textAlign: 'left',
                fontWeight: selectedCategory === c._id ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes filter */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '1px' }} className="text-secondary">Filter by Size</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
            <button
              key={size}
              onClick={() => { setSelectedSize(selectedSize === size ? '' : size); setIsMobileFiltersOpen(false); }}
              className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: 0, width: '42px', height: '42px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }} className="text-secondary">Max Budget</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatCurrency(0)}</span>
          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{formatCurrency(priceMax)}</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="price-slider"
        />
      </div>
    </>
  );

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <Helmet>
        <title>Shop Collection - Axis Wear</title>
        <meta name="description" content="Browse our entire collection of premium clothing." />
      </Helmet>

      <div style={{ display: 'flex', gap: '2.5rem' }}>

        {/* Desktop Sticky Filters Panel */}
        <aside className="desktop-filters" style={{ width: '260px', flexShrink: 0 }}>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '105px' }}>
            {renderFiltersContent()}
          </div>
        </aside>

        {/* Product Catalogue Display */}
        <div style={{ flex: 1 }}>

          {/* Header toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>Discover</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Showing {products.length} design styles</p>
            </div>

            {/* Quick Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

              {/* Mobile Filter toggle */}
              <button
                className="mobile-filters-trigger btn btn-secondary"
                onClick={() => setIsMobileFiltersOpen(true)}
                style={{ padding: '0.6rem 1rem', display: 'none', gap: '0.5rem', alignItems: 'center' }}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>

              {/* Sorting triggers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--glass-border)' }}>
                <ArrowUpDown size={16} className="text-secondary" />
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem' }}
                >
                  <option value="default" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Trending Options</option>
                  <option value="low-high" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Price: Low to High</option>
                  <option value="high-low" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Price: High to Low</option>
                  <option value="discount" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Biggest Discount</option>
                </select>
              </div>

            </div>
          </div>

          {/* Product Feed Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-panel animate-pulse-glow" style={{ height: '385px', borderRadius: 'var(--border-radius-lg)' }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="glass-panel animate-fade-in" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: 'var(--border-radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1.25rem', borderRadius: '50%' }}>
                <X size={36} />
              </div>
              <h3 style={{ margin: 0 }}>No items match your criteria</h3>
              <p className="text-secondary" style={{ fontSize: '0.95rem', maxWidth: '340px', margin: 0 }}>
                We couldn't find any designs fitting those details. Try lowering the max price limit or choosing another size.
              </p>
              <button className="btn btn-primary" onClick={handleClearFilters} style={{ marginTop: '0.5rem' }}>
                Reset Catalogue filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Overlay and Content */}
      {isMobileFiltersOpen && (
        <div className="modal-overlay" onClick={() => setIsMobileFiltersOpen(false)} style={{ display: 'flex', alignItems: 'flex-end', padding: 0 }}>
          <div
            className="modal-content animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '24px 24px 0 0',
              maxWidth: '100%',
              width: '100%',
              padding: '2.5rem 2rem',
              transform: 'translateY(0)',
              background: 'var(--bg-secondary)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="close-circle-btn" onClick={() => setIsMobileFiltersOpen(false)}>✕</button>
            </div>
            {renderFiltersContent()}
            <button
              className="btn btn-primary"
              onClick={() => setIsMobileFiltersOpen(false)}
              style={{ width: '100%', marginTop: '2.5rem', padding: '1rem' }}
            >
              Apply Filter Selections
            </button>
          </div>
        </div>
      )}

      {/* Media Queries Styles Injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 767px) {
          .desktop-filters { display: none !important; }
          .mobile-filters-trigger { display: inline-flex !important; }
        }
      `}} />
    </div>
  );
};

export default Shop;
