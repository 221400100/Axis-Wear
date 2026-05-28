import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ArrowLeft, CheckCircle, Info, Users, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { CartContext } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/currency';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);

  // Hover Zoom Coordinates
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  // Size Modal Toggle
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Mock Visitor Count
  const [viewerCount, setViewerCount] = useState(12);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error(error);
        toast.error('Product details could not be loaded');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // Randomize static visitor count on load
    setViewerCount(Math.floor(10 + Math.random() * 16));
  }, [id]);

  // Auto-select first size and color to provide a high-end seamless UX
  useEffect(() => {
    if (product) {
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('M');
      }

      if (Array.isArray(product.colors) && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else {
        setSelectedColor('Default Color');
      }
    }
  }, [product]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error('Please select a size');
    if (!selectedColor) return toast.error('Please select a color');

    addToCart(product, qty, selectedSize, selectedColor);
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (!selectedSize) return toast.error('Please select a size');
    if (!selectedColor) return toast.error('Please select a color');

    addToCart(product, qty, selectedSize, selectedColor);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse-glow" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
      </div>
    );
  }

  // Graceful page level error handler
  if (!product) {
    return (
      <div className="container animate-fade-in" style={{ padding: '5rem 0', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 0 }}>Design Style Not Found</h2>
        <p className="text-secondary" style={{ maxWidth: '450px', margin: 0, fontSize: '1rem', lineHeight: 1.6 }}>
          The requested premium apparel style could not be located in our storefront database. It might have been updated or removed.
        </p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
          Explore Collection Catalog
        </button>
      </div>
    );
  }

  // Defensive defaults to absolutely guarantee no runtime crashes from legacy schema mismatches in localStorage
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://via.placeholder.com/800x800/1E293B/14B8A6?text=Axis+Wear'];

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL'];

  const colors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : ['Default Color'];

  const discount = Number(product.discount) || 0;
  const originalPrice = Number(product.price) || 0;
  const stock = Number(product.stock) || 0;

  const isDiscounted = discount > 0;
  const price = isDiscounted ? originalPrice * (1 - discount / 100) : originalPrice;
  const isLowStock = stock > 0 && stock <= 5;
  const name = product.name || 'Premium Axis Wear Style';
  const description = product.description || 'Uncompromising quality and modern aesthetics tailored for urban wear.';
  const categoryName = product.category?.name || 'Exclusive Collection';

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <Helmet>
        <title>{name} - Axis Wear</title>
        <meta name="description" content={description} />
      </Helmet>

      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2.5rem', padding: '0.6rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>

        {/* Interactive Image Gallery with Hover Zoom */}
        <div>
          <div
            className="glass-panel"
            style={{ height: '520px', overflow: 'hidden', marginBottom: '1.25rem', borderRadius: 'var(--border-radius-lg)', position: 'relative' }}
          >
            <div
              className="zoom-container"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => { setIsZooming(false); setZoomPos({ x: 50, y: 50 }); }}
            >
              <img
                src={images[selectedImage] || images[0]}
                alt={name}
                className="zoom-image"
                style={{
                  transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x800/1E293B/14B8A6?text=Axis+Wear'; }}
              />
            </div>

            {/* Discount Stamp */}
            {isDiscounted && (
              <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--accent-primary)', color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.8rem', fontWeight: 800, boxShadow: '0 4px 10px rgba(20, 184, 166, 0.4)' }}>
                {discount}% OFF
              </span>
            )}

            {/* Magnifier Tip Overlay */}
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.8rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.75rem', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--glass-border)', color: 'rgba(255, 255, 255, 0.8)' }}>
              <Sparkles size={12} /> Hover image to zoom fabric detail
            </div>
          </div>

          {/* Thumbnail Carousel */}
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                style={{
                  width: '85px', height: '85px', flexShrink: 0,
                  border: selectedImage === idx ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  borderRadius: 'var(--border-radius)', overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: 0
                }}
              >
                <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details & Purchase Panel */}
        <div>
          {/* Social Proof metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Users size={16} />
            <span>🔥 {viewerCount} shoppers are viewing this style right now</span>
          </div>

          <h1 style={{ fontSize: '2.75rem', marginBottom: '0.5rem', lineHeight: 1.1 }}>{name}</h1>
          <p className="text-secondary" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500 }}>{categoryName}</p>

          {/* Pricing Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800 }} className="text-gradient">{formatCurrency(price)}</span>
            {isDiscounted && (
              <span className="text-muted" style={{ textDecoration: 'line-through', fontSize: '1.35rem' }}>{formatCurrency(originalPrice)}</span>
            )}
          </div>

          {/* Sizing Panel */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>Select Size</h4>
              <button
                onClick={() => setIsSizeModalOpen(true)}
                style={{ background: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
              >
                <Info size={14} /> Size Guide
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '52px', height: '52px', padding: 0, borderRadius: '12px' }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Select Color</h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`btn ${selectedColor === color ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.875rem' }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Add & Quantity Inputs */}
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem', alignItems: 'flex-end' }}>
            <div className="input-group" style={{ width: '105px', marginBottom: 0 }}>
              <label>Quantity</label>
              <input
                type="number"
                className="input-field"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(stock, parseInt(e.target.value) || 1)))}
                min="1"
                max={stock}
                style={{ textAlign: 'center', padding: '0.8rem 0.5rem' }}
              />
            </div>

            <button
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.9rem', fontSize: '1rem' }}
              onClick={handleAddToCart}
              disabled={stock === 0}
            >
              <ShoppingBag size={18} />
              {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.9rem', fontSize: '1rem' }}
              onClick={handleBuyNow}
              disabled={stock === 0}
            >
              {stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>

          {/* Stock Badges with Glowing Urgency Effects */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem', padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, fontSize: '0.95rem' }}>
              <CheckCircle size={18} />
              <span>{stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <CheckCircle size={16} style={{ color: 'var(--success)' }} />
              <span>Complimentary Cash on Delivery & Free Returns</span>
            </div>
          </div>

          {/* Descriptive Content */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Product Description</h4>
            <p className="text-secondary" style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: 1.7 }}>{description}</p>
          </div>
        </div>

      </div>

      {/* Sizing Modal Overlay */}
      {isSizeModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSizeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Size Measurements Guide</h3>
              <button className="close-circle-btn" onClick={() => setIsSizeModalOpen(false)}>✕</button>
            </div>

            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              All measurements are taken flat in inches. Fabric includes standard stretch factor.
            </p>

            <table className="admin-table" style={{ width: '100%', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (in)</th>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                  <th>Length (in)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: 'S', c: '34-36', w: '28-30', h: '34-36', l: '27.5' },
                  { s: 'M', c: '38-40', w: '32-34', h: '38-40', l: '28.5' },
                  { s: 'L', c: '42-44', w: '36-38', h: '42-44', l: '29.5' },
                  { s: 'XL', c: '46-48', w: '40-42', h: '46-48', l: '30.5' },
                  { s: 'XXL', c: '50-52', w: '44-46', h: '50-52', l: '31.5' }
                ].map((row, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{row.s}</td>
                    <td>{row.c}</td>
                    <td>{row.w}</td>
                    <td>{row.h}</td>
                    <td>{row.l}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="btn btn-primary"
              onClick={() => setIsSizeModalOpen(false)}
              style={{ width: '100%', marginTop: '2rem', padding: '0.8rem' }}
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

