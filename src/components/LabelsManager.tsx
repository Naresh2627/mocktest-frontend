import React, { useState, useEffect } from 'react';
import { useLabels } from '../contexts/LabelsContext';
import { useNavigate } from 'react-router-dom';

const LabelsManager: React.FC = () => {
  const { 
    labels, 
    categories, 
    loading, 
    fetchLabels, 
    fetchCategories,
    createLabel,
    updateLabel,
    deleteLabel,
    createCategory,
    updateCategory,
    deleteCategory
  } = useLabels();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'labels' | 'categories'>('labels');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#667eea',
    icon: '🏷️',
    description: ''
  });

  useEffect(() => {
    fetchLabels();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      color: activeTab === 'labels' ? '#667eea' : '#28a745',
      icon: activeTab === 'labels' ? '🏷️' : '📁',
      description: ''
    });
    setEditingItem(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Update existing item
        if (activeTab === 'labels') {
          await updateLabel(editingItem.id, formData);
        } else {
          await updateCategory(editingItem.id, formData);
        }
      } else {
        // Create new item
        if (activeTab === 'labels') {
          await createLabel(formData);
        } else {
          await createCategory(formData);
        }
      }
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save item');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      color: item.color,
      icon: item.icon,
      description: item.description || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        if (activeTab === 'labels') {
          await deleteLabel(id);
        } else {
          await deleteCategory(id);
        }
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete item');
      }
    }
  };

  const predefinedColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
    '#ff9a9e', '#fecfef', '#ffeaa7', '#fab1a0', '#fd79a8', '#fdcb6e'
  ];

  const predefinedIcons = {
    labels: ['🏷️', '⭐', '🔥', '💡', '📌', '🎯', '⚡', '🌟', '💎', '🎨', '🔖', '📍'],
    categories: ['📁', '📂', '🗂️', '📋', '📊', '💼', '🎯', '🏠', '💻', '📚', '🎨', '🔧']
  };

  if (loading) {
    return (
      <div className="labels-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const currentItems = activeTab === 'labels' ? labels : categories;

  return (
    <div className="labels-container">
      <div className="labels-header">
        <h1>Labels & Categories</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/notes')} 
            className="notes-btn"
          >
            📝 Back to Notes
          </button>
        </div>
      </div>

      <div className="labels-tabs">
        <button 
          className={`tab-btn ${activeTab === 'labels' ? 'active' : ''}`}
          onClick={() => setActiveTab('labels')}
        >
          🏷️ Labels ({labels.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📁 Categories ({categories.length})
        </button>
      </div>

      <div className="labels-content">
        <div className="labels-actions">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="create-btn"
          >
            ➕ Create {activeTab === 'labels' ? 'Label' : 'Category'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-form-overlay">
            <div className="create-form">
              <h3>{editingItem ? 'Edit' : 'Create'} {activeTab === 'labels' ? 'Label' : 'Category'}</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label>Icon:</label>
                  <div className="icon-selector">
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      maxLength={50}
                    />
                    <div className="predefined-icons">
                      {predefinedIcons[activeTab].map(icon => (
                        <button
                          key={icon}
                          type="button"
                          className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                          onClick={() => setFormData({...formData, icon})}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Color:</label>
                  <div className="color-selector">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                    <div className="predefined-colors">
                      {predefinedColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${formData.color === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({...formData, color})}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description (optional):</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="items-grid">
          {currentItems.length === 0 ? (
            <div className="empty-state">
              <h3>No {activeTab} found</h3>
              <p>Create your first {activeTab === 'labels' ? 'label' : 'category'} to get started!</p>
            </div>
          ) : (
            currentItems.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <div className="item-info">
                    <span className="item-icon" style={{ color: item.color }}>
                      {item.icon}
                    </span>
                    <span className="item-name">{item.name}</span>
                  </div>
                  <div className="item-actions">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="edit-btn"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, item.name)}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {item.description && (
                  <div className="item-description">
                    {item.description}
                  </div>
                )}
                
                <div className="item-meta">
                  <div 
                    className="color-indicator" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="item-date">
                    Created {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LabelsManager;