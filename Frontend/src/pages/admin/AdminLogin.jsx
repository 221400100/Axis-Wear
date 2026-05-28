import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      toast.success('Login Successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Helmet>
        <title>Admin Login - Axis Wear</title>
      </Helmet>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
            <img src="/logo.jpeg" alt="" className="logo-image" style={{ height: '60px', width: 'auto', marginBottom: '0.5rem' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <h1 style={{ margin: 0, letterSpacing: '2px', fontWeight: 800, lineHeight: '1', fontSize: '2rem' }} className="text-gradient">AXIS</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '2px', marginTop: '0.2rem' }}>URBAN. INNOVATION. STYLE.</span>
          </div>
          <h2>Admin Access</h2>
          <p className="text-secondary" style={{ marginTop: '0.5rem' }}>Secure portal for Axis Wear</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="admin@axiswear.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
