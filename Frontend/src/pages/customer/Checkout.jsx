import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from "../../utils/api";
import { formatCurrency } from '../../utils/currency';

const Checkout = () => {
  const { cart, removeFromCart, updateQty, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    city: ''
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [isCouponApplying, setIsCouponApplying] = useState(false);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const SHIPPING_THRESHOLD = 15000;
  const SHIPPING_FEE = cartTotal >= SHIPPING_THRESHOLD ? 0 : 400;
  const couponDiscount = coupon ? (coupon.discountAmount ?? Math.round(cartTotal * (coupon.discountPercent / 100))) : 0;
  const totalPayable = Math.max(0, cartTotal + SHIPPING_FEE - couponDiscount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error('Your cart is empty');

    if (paymentMethod === 'JazzCash' || paymentMethod === 'Easypaisa') {
      setShowPaymentModal(true);
      return;
    }

    if (paymentMethod === 'Bank Transfer') {
      submitOrder('Bank Transfer', 'Pending');
      return;
    }

    submitOrder('Cash on Delivery', 'Pending');
  };

  const submitOrder = async (method, status) => {
    setPlacingOrder(true);
    try {
      const payload = {
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        shippingAddress: {
          name: formData.customerName,
          phone: formData.phoneNumber,
          address: formData.address,
          city: formData.city
        },
        orderItems: cart,
        paymentMethod: method,
        paymentStatus: status,
        shippingFee: SHIPPING_FEE,
        coupon: coupon ? {
          code: coupon.code,
          discountAmount: coupon.discountAmount,
          discountPercent: coupon.discountPercent
        } : null,
        totalPrice: totalPayable
      };

      const { data } = await api.post('/orders', payload);
      setOrderSuccess(data);
      clearCart();
      setShowPaymentModal(false);
      toast.success('Order placed successfully!');
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleOnlinePayment = () => {
    setProcessingPayment(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      setProcessingPayment(false);
      submitOrder(paymentMethod, 'Paid');
    }, 2000);
  };

  if (orderSuccess) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 0', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
          <ShoppingBag size={64} />
        </div>
        <h1 className="text-gradient" style={{ marginBottom: '1rem' }}>Order Confirmed!</h1>
        <p className="text-secondary" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Thank you for shopping with Axis Wear.</p>
        <p style={{ marginBottom: '0.75rem' }}>Your Order ID is: <strong style={{ fontFamily: 'monospace', fontSize: '1.25rem' }}>{orderSuccess.orderNumber}</strong></p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/track-order" className="btn btn-secondary">Track Order Status</Link>
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0', minHeight: '80vh' }}>
      <Helmet>
        <title>Checkout - Axis Wear</title>
      </Helmet>

      <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

        {/* Cart Summary */}
        <div style={{ order: 2 }}>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p className="text-muted" style={{ marginBottom: '1rem' }}>Your cart is empty.</p>
                <Link to="/shop" className="btn btn-secondary">Browse Shop</Link>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</p>
                        <p className="text-secondary" style={{ fontSize: '0.75rem' }}>{item.color} | Size: {item.size}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateQty(item.product, item.size, item.color, e.target.value)}
                            style={{ width: '50px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.25rem', borderRadius: '4px' }}
                          />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>x {formatCurrency(item.price)}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product, item.size, item.color)} style={{ background: 'none', color: 'var(--danger)', padding: '0.5rem' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="text-secondary">Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="text-secondary">Shipping</span>
                    <span style={{ fontWeight: 600 }}>{SHIPPING_FEE === 0 ? 'Free' : formatCurrency(SHIPPING_FEE)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="text-secondary">Coupon discount</span>
                    <span style={{ fontWeight: 600 }}>{couponDiscount > 0 ? `-${formatCurrency(couponDiscount)}` : formatCurrency(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Total</span>
                    <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalPayable)}</span>
                  </div>
                  <p className="text-secondary" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                    {cartTotal >= SHIPPING_THRESHOLD
                      ? 'Free shipping applies for orders over PKR 15,000 across Pakistan.'
                      : 'Standard delivery via TCS / Leopards / Royal Express.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Shipping Form */}
        <div style={{ order: 1 }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Shipping Details</h3>
            <form onSubmit={handlePlaceOrder}>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                  placeholder="03XX XXXXXXX"
                />
              </div>
              <div className="input-group">
                <label>Shipping Address</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="House #, Street, Area, e.g. DHA Phase 5"
                ></textarea>
              </div>
              <div className="input-group">
                <label>City</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  required
                  placeholder="Lahore"
                />
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ marginBottom: '1rem' }}>Coupon Code</h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    style={{ flex: 1, minWidth: '180px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={async () => {
                      if (!couponCode.trim()) {
                        setCouponMessage('Please enter a coupon code');
                        return;
                      }
                      setIsCouponApplying(true);
                      try {
                        const { data } = await api.get(`/coupons?code=${couponCode.trim()}`);
                        setCoupon(data);
                        setCouponMessage(`Coupon applied: ${data.description}`);
                      } catch (error) {
                        setCoupon(null);
                        setCouponMessage(error.message || 'Coupon invalid');
                      } finally {
                        setIsCouponApplying(false);
                      }
                    }}
                    disabled={isCouponApplying}
                    style={{ minWidth: '120px' }}
                  >
                    {isCouponApplying ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-secondary" style={{ margin: 0, fontSize: '0.9rem' }}>{couponMessage}</p>
                )}
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ marginBottom: '1rem' }}>Payment Method / ادائیگی کا طریقہ</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { value: 'COD', label: 'Cash on Delivery (COD)', description: 'Pay when you receive your order anywhere in Pakistan' },
                    { value: 'JazzCash', label: 'JazzCash', description: 'Single-click mobile wallet payment' },
                    { value: 'Easypaisa', label: 'Easypaisa', description: 'Secure payment via Easypaisa wallet' },
                    { value: 'Bank Transfer', label: 'Bank Transfer', description: 'Deposit to bank account and send payment proof' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        padding: '1rem',
                        border: paymentMethod === option.value ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        background: paymentMethod === option.value ? 'rgba(76, 106, 122, 0.1)' : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.value}
                        checked={paymentMethod === option.value}
                        onChange={() => setPaymentMethod(option.value)}
                        style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--accent-primary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, display: 'block' }}>{option.label}</span>
                        <span className="text-secondary" style={{ fontSize: '0.875rem' }}>{option.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.125rem' }}
                disabled={placingOrder || cart.length === 0}
              >
                {placingOrder ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order via COD' : paymentMethod === 'Bank Transfer' ? 'Request Bank Transfer' : `Proceed with ${paymentMethod}`}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', background: 'var(--bg-secondary)', position: 'relative' }}>
            <button onClick={() => setShowPaymentModal(false)} disabled={processingPayment} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', color: 'var(--text-secondary)' }}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f57224', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 800, letterSpacing: '1px', marginBottom: '1rem', fontSize: '1.25rem' }}>
                {paymentMethod} Mock
              </div>
              <h3>Secure Checkout</h3>
              <p className="text-secondary">Amount to pay: <span className="text-gradient" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{formatCurrency(totalPayable)}</span></p>
            </div>
            <div className="input-group">
              <label>Card Number</label>
              <input type="text" className="input-field" placeholder="4111 1111 1111 1111" disabled={processingPayment} pattern="\d*" minLength="16" maxLength="16" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Expiry Date</label>
                <input type="text" className="input-field" placeholder="MM/YY" disabled={processingPayment} />
              </div>
              <div className="input-group">
                <label>CVV</label>
                <input type="password" className="input-field" placeholder="123" disabled={processingPayment} maxLength="3" />
              </div>
            </div>
            <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.125rem' }} disabled={processingPayment} onClick={handleOnlinePayment}>
              {processingPayment ? 'Processing Payment...' : `Pay ${formatCurrency(totalPayable)}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
              This is a simulated payment gateway. No real charges will be made.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
