import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialFormState = {
    name: '',
    category: '',
    price: '',
    discount: 0,
    sizes: [],
    colors: '',
    stock: '',
    description: '',
    images: [],
  };
  const [formData, setFormData] = useState(initialFormState);

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleSizeToggle = (size) => {
    setFormData((prev) => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData);
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...data.images] }));
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || error.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      return toast.error('Please upload at least one image');
    }
    if (formData.sizes.length === 0) {
      return toast.error('Please select at least one size');
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount) || 0,
      stock: Number(formData.stock),
      colors: formData.colors.split(',').map((c) => c.trim()),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category._id,
      price: product.price,
      discount: product.discount || 0,
      sizes: product.sizes,
      colors: product.colors.join(', '),
      stock: product.stock,
      description: product.description,
      images: product.images,
    });
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const openAddModal = () => {
    setShowModal(true);
    setTimeout(() => {
      document.body.style.overflow = 'hidden';
      const modal = document.getElementById('product-modal');
      if (modal) modal.scrollTop = 0;
    }, 0);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
    document.body.style.overflow = '';
  };

  return (
    <div className="animate-fade-in">
      <Helmet>
        <title>Products - Admin | Axis Wear</title>
      </Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Product Management</h2>
          <p className="text-secondary">Manage your inventory and listings.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openAddModal}
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Pehle ek category banayein' : ''}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {categories.length === 0 && (
        <div style={{
          background: 'rgba(255,170,0,0.15)',
          border: '1px solid rgba(255,170,0,0.4)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          color: '#ffaa00',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          ⚠️ <span>Pehle <strong>Categories</strong> page par ja kar ek category banayein, phir product add kar sakte hain.</span>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </td>
                <td style={{ fontWeight: 500 }}>{product.name}</td>
                <td>{product.category?.name}</td>
                <td>{formatCurrency(product.price)}</td>
                <td>
                  <span className={`badge ${product.stock > 0 ? 'badge-delivered' : 'badge-cancelled'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => openEditModal(product)} className="btn btn-secondary" style={{ padding: '0.5rem', marginRight: '0.5rem' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="btn btn-danger" style={{ padding: '0.5rem' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                  No products found. Add your first product!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 1000,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '2rem 1rem',
          overflowY: 'auto'
        }}>
          <div id="product-modal" className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '700px', padding: '2rem', background: 'var(--bg-secondary)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="btn btn-secondary" style={{ padding: '0.5rem' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Product Name</label>
                  <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Category</label>
                  <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Price (PKR)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Discount (%)</label>
                  <input type="number" className="input-field" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Stock Quantity</label>
                  <input type="number" className="input-field" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Colors (comma separated)</label>
                  <input type="text" className="input-field" placeholder="Red, Blue, Black" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} required />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Available Sizes</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {availableSizes.map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`btn ${formData.sizes.includes(size) ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Description</label>
                <textarea className="input-field" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required></textarea>
              </div>

              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Images</label>
                <input type="file" multiple accept="image/*" onChange={uploadFileHandler} style={{ display: 'none' }} id="image-upload" />
                <label htmlFor="image-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', width: 'fit-content' }}>
                  <ImageIcon size={18} /> {uploading ? 'Uploading...' : 'Upload Images'}
                </label>

                {formData.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={img} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '2px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
