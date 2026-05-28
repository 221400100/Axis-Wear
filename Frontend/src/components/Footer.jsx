import React from 'react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)', padding: '4rem 0 2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <img src="/logo.jpeg" alt="" className="logo-image" style={{ height: '40px', width: 'auto' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{ margin: 0, letterSpacing: '2px', fontWeight: 800, lineHeight: '1' }} className="text-gradient">AXIS</h2>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>URBAN. INNOVATION. STYLE.</span>
              </div>
            </div>
            <p className="text-secondary">Premium clothing for the modern individual. Designed for comfort, built for style.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/" className="text-secondary hover:text-primary">Home</a>
              <a href="/shop" className="text-secondary hover:text-primary">Shop</a>
              <a href="/admin/login" className="text-secondary hover:text-primary">Admin Portal</a>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Customer Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="text-secondary">Contact Us</span>
              <span className="text-secondary">Shipping & Returns</span>
              <span className="text-secondary">FAQ</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>&copy; {new Date().getFullYear()} Axis Wear. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
