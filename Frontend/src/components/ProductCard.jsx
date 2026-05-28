import React from 'react';
import { Link } from 'react-router-dom';

import { ShoppingBag, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
const ProductCard = ({ product }) => {
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://via.placeholder.com/800x800/1E293B/14B8A6?text=Axis+Wear'];
  const isDiscounted = Number(product.discount) > 0;
  const price = isDiscounted ? Number(product.price || 0) * (1 - Number(product.discount || 0) / 100) : Number(product.price || 0);

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'var(--transition-normal)' }}>
      <Link
        to={`/product/${product._id}`}
        style={{ position: 'relative', display: 'block', height: '280px', overflow: 'hidden' }}
        onMouseOver={(e) => {
          const imgs = e.currentTarget.querySelectorAll('img');
          imgs.forEach(img => img.style.transform = 'scale(1.05)');
          if (imgs.length > 1) imgs[1].style.opacity = '1';
        }}
        onMouseOut={(e) => {
          const imgs = e.currentTarget.querySelectorAll('img');
          imgs.forEach(img => img.style.transform = 'scale(1)');
          if (imgs.length > 1) imgs[1].style.opacity = '0';
        }}
      >
        <img
          src={images[0]}
          alt={product.name || 'Axis Wear product'}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x800/1E293B/14B8A6?text=Axis+Wear'; }}
        />
        {images.length > 1 && (
          <img
            src={images[1]}
            alt={`${product.name} alternate`}
            loading="lazy"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0, transition: 'all 0.5s ease' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        {isDiscounted && (
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {product.discount}% OFF
          </div>
        )}

      </Link>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/product/${product._id}`}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', transition: 'color 0.2s' }} className="hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          {product.category?.name}
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatCurrency(price)}</span>
            {isDiscounted && (
              <span className="text-muted" style={{ textDecoration: 'line-through', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                {formatCurrency(Number(product.price || 0))}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.95rem' }}>
            <CheckCircle size={18} />
            <span>In Stock</span>
          </div>
          <Link to={`/product/${product._id}`} className="btn btn-primary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ShoppingBag size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
