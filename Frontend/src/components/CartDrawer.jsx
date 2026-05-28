import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, Truck, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

const CartDrawer = () => {
  const { cart, removeFromCart, updateQty, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const navigate = useNavigate();

  // Close drawer on escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCartOpen]);

  if (!isCartOpen) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Free Express Shipping target (PKR 15,000)
  const SHIPPING_TARGET = 15000;
  const progressPercent = Math.min(100, (subtotal / SHIPPING_TARGET) * 100);
  const awayAmount = SHIPPING_TARGET - subtotal;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Drawer Blurred Overlay */}
      <div
        className="cart-drawer-overlay"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-out Panel */}
      <div className="cart-drawer">

        {/* Drawer Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Shopping Cart</h3>
            <span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--border-radius-full)', fontWeight: 600 }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            className="close-circle-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        {cart.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(20, 184, 166, 0.05)', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Truck size={20} className={subtotal >= SHIPPING_TARGET ? '' : 'animate-pulse-glow'} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {subtotal >= SHIPPING_TARGET ? (
                  <span style={{ color: 'var(--success)' }}>Congratulations! Free Express Shipping unlocked! 🚚</span>
                ) : (
                  <span>Add <strong style={{ color: 'var(--accent-primary)' }}>{formatCurrency(awayAmount)}</strong> more for Free Shipping!</span>
                )}
              </span>
            </div>
            <div className="shipping-progress-bg">
              <div
                className="shipping-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cart.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '50%', color: 'var(--text-muted)' }}>
                <Trash2 size={40} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.25rem' }}>Your Bag is Empty</h4>
              <p className="text-secondary" style={{ fontSize: '0.875rem', maxWidth: '280px', margin: 0 }}>
                Browse our premium urban styles and add items to your cart to get started.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
                style={{ marginTop: '0.5rem' }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="glass-panel"
                style={{ padding: '1rem', display: 'flex', gap: '1rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius)' }}
              >
                {/* Product Thumbnail */}
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-tertiary)' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2, color: 'var(--text-primary)' }}>
                        {item.name}
                      </h4>
                      <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Size: <strong style={{ color: 'var(--text-primary)' }}>{item.size}</strong> | Color: <strong style={{ color: 'var(--text-primary)' }}>{item.color}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product, item.size, item.color)}
                      style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    {/* Quantity Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-full)', padding: '0.15rem' }}>
                      <button
                        onClick={() => updateQty(item.product, item.size, item.color, Math.max(1, item.qty - 1))}
                        style={{ background: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, width: '26px', textAlign: 'center' }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.product, item.size, item.color, item.qty + 1)}
                        style={{ background: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Panel */}
        {cart.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-secondary" style={{ fontWeight: 500 }}>Subtotal</span>
              <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {formatCurrency(subtotal)}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Shipping and taxes calculated at checkout. Free shipping applies above PKR 15,000.
            </p>

            <button
              className="btn btn-primary"
              onClick={handleCheckout}
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', gap: '0.75rem' }}
            >
              Secure Checkout <ArrowRight size={20} />
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default CartDrawer;
