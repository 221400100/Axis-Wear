import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
        toast.success('Category updated');
      } else {
        await api.post('/categories', { name });
        toast.success('Category created');
      }
      setName('');
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <Helmet>
        <title>Categories - Admin | Axis Wear</title>
      </Helmet>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Category Management</h2>
        <p className="text-secondary">Add, edit or remove product categories.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>{editingId ? 'Edit Category Name' : 'New Category Name'}</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. T-Shirts"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 1.5rem' }}>
            <Plus size={18} />
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setName(''); }}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Created At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td style={{ fontWeight: 500 }}>{cat.name}</td>
                <td className="text-secondary">{new Date(cat.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => { setEditingId(cat._id); setName(cat.name); }}
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem', marginRight: '0.5rem' }}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat._id)}
                    className="btn btn-danger" 
                    style={{ padding: '0.5rem' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                  No categories found. Create one above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;
