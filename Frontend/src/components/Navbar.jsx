import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const { cart, setIsCartOpen } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      <nav className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.jpeg" alt="" className="logo-image" style={{ height: '45px', width: 'auto' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '2px', fontWeight: 800, lineHeight: '1' }} className="text-gradient">AXIS</h1>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>URBAN. INNOVATION. STYLE.</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className="desktop-menu">
            <Link to="/" style={{ fontWeight: 500 }} className="text-secondary hover:text-primary">Home</Link>
            <Link to="/shop" style={{ fontWeight: 500 }} className="text-secondary hover:text-primary">Shop Collection</Link>
            <Link to="/track-order" style={{ fontWeight: 500 }} className="text-secondary hover:text-primary">Track Order</Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn btn-secondary"
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ShoppingBag size={18} />
              Cart
              {cartItemCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent-primary)', color: 'white', fontSize: '0.75rem', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'flex', background: 'transparent', color: 'var(--text-primary)' }}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '80px', left: 0, right: 0, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Home</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Shop Collection</Link>
            <Link to="/track-order" onClick={() => setIsMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Track Order</Link>
            <button
              onClick={() => { setIsMenuOpen(false); setIsCartOpen(true); }}
              className="btn btn-primary"
              style={{ justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}
            >
              <ShoppingBag size={18} />
              Cart ({cartItemCount})
            </button>
          </div>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
          @media (min-width: 768px) {
            .desktop-menu { display: flex !important; }
            .mobile-menu-toggle { display: none !important; }
          }
        `}} />
      </nav>

      {/* Global Sliding Cart Drawer */}
      <CartDrawer />
    </>
  );
};

export default Navbar;
