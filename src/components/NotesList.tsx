import React, { useEffect, useState } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { useLabels } from '../contexts/LabelsContext';
import { useNavigate } from 'react-router-dom';

const NotesList: React.FC = () => {
  const { notes, loading, fetchNotes, deleteNote, stats, fetchStats } = useNotes();
  const { labels, categories, fetchLabels, fetchCategories, assignLabelsToNote, assignCategoriesToNote } = useLabels();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrafts, setFilterDrafts] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedNoteForLabels, setSelectedNoteForLabels] = useState<any>(null);
  const [noteLabels, setNoteLabels] = useState<number[]>([]);
  const [noteCategories, setNoteCategories] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
    fetchStats();
    fetchLabels();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterDrafts, selectedTag, selectedLabel, selectedCategory]);

  const loadNotes = () => {
    const params: any = {};
    
    if (searchTerm) params.search = searchTerm;
    if (filterDrafts !== 'all') params.draft_only = filterDrafts === 'drafts';
    if (selectedTag) params.tag = selectedTag;
    
    fetchNotes(params);
  };

  const handleDeleteNote = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteNote(id);
        fetchStats(); // Refresh stats after deletion
      } catch (error) {
        alert('Failed to delete note');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAllTags = () => {
    const allTags = notes.flatMap(note => note.tags || []);
    return Array.from(new Set(allTags));
  };

  const handleAssignLabels = (note: any) => {
    setSelectedNoteForLabels(note);
    setNoteLabels([]); // Reset selections
    setNoteCategories([]); // Reset selections
    setShowLabelModal(true);
  };

  const handleLabelToggle = (labelId: number) => {
    setNoteLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleCategoryToggle = (categoryId: number) => {
    setNoteCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSaveLabels = async () => {
    if (!selectedNoteForLabels) return;

    try {
      await assignLabelsToNote(selectedNoteForLabels.id, noteLabels);
      await assignCategoriesToNote(selectedNoteForLabels.id, noteCategories);
      
      setShowLabelModal(false);
      setSelectedNoteForLabels(null);
      
      // Refresh notes to show updated labels
      fetchNotes();
    } catch (error: any) {
      alert('Failed to assign labels: ' + (error.response?.data?.error || error.message));
    }
  };

  const closeLabelModal = () => {
    setShowLabelModal(false);
    setSelectedNoteForLabels(null);
    setNoteLabels([]);
    setNoteCategories([]);
  };

  if (loading) {
    return (
      <div className="notes-container">
        <div className="loading-spinner"></div>
        <p>Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1>My Notes</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/labels')} 
            className="labels-btn"
          >
            🏷️ Manage Labels
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="dashboard-btn"
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => navigate('/notes/new')} 
            className="create-note-btn"
          >
            ✏️ New Note
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="notes-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.drafts}</span>
            <span className="stat-label">Drafts</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.published}</span>
            <span className="stat-label">Published</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.public}</span>
            <span className="stat-label">Public</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.encrypted}</span>
            <span className="stat-label">🔒 Encrypted</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="notes-filters">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={filterDrafts} 
          onChange={(e) => setFilterDrafts(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Notes</option>
          <option value="drafts">Drafts Only</option>
          <option value="published">Published Only</option>
        </select>

        <select 
          value={selectedTag} 
          onChange={(e) => setSelectedTag(e.target.value)}
          className="filter-select"
        >
          <option value="">All Tags</option>
          {getAllTags().map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <select 
          value={selectedLabel} 
          onChange={(e) => setSelectedLabel(e.target.value)}
          className="filter-select"
        >
          <option value="">All Labels</option>
          {labels.map(label => (
            <option key={label.id} value={label.id}>
              {label.icon} {label.name}
            </option>
          ))}
        </select>

        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {notes.length === 0 ? (
          <div className="empty-state">
            <h3>No notes found</h3>
            <p>Create your first note to get started!</p>
            <button 
              onClick={() => navigate('/notes/new')} 
              className="create-note-btn"
            >
              Create Note
            </button>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h3 
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="note-title"
                >
                  {note.title}
                </h3>
                <div className="note-badges">
                  {note.is_draft && <span className="badge draft">Draft</span>}
                  {note.is_public && <span className="badge public">Public</span>}
                  {note.is_encrypted && <span className="badge encrypted">🔒</span>}
                </div>
              </div>
              
              <div className="note-content-preview">
                {note.content ? 
                  note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '') 
                  : 'No content'
                }
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="note-meta">
                <span className="note-date">
                  {note.auto_saved_at && note.auto_saved_at > note.updated_at ? 
                    `Auto-saved ${formatDate(note.auto_saved_at)}` :
                    `Updated ${formatDate(note.updated_at)}`
                  }
                </span>
                <div className="note-actions">
                  <button 
                    onClick={() => handleAssignLabels(note)}
                    className="action-btn labels"
                    title="Assign Labels"
                  >
                    🏷️
                  </button>
                  <button 
                    onClick={() => navigate(`/notes/${note.id}/edit`)}
                    className="action-btn edit"
                  >
                    ✏️
                  </button>
                  {note.is_public && note.public_share_id && (
                    <button 
                      onClick={() => window.open(`/public/${note.public_share_id}`, '_blank')}
                      className="action-btn share"
                    >
                      🔗
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteNote(note.id, note.title)}
                    className="action-btn delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Label Assignment Modal */}
      {showLabelModal && selectedNoteForLabels && (
        <div className="label-modal-overlay">
          <div className="label-modal">
            <div className="modal-header">
              <h3>Assign Labels to "{selectedNoteForLabels.title}"</h3>
              <button onClick={closeLabelModal} className="close-btn">×</button>
            </div>
            
            <div className="modal-content">
              {labels.length > 0 && (
                <div className="modal-section">
                  <h4>Labels</h4>
                  <div className="labels-grid">
                    {labels.map(label => (
                      <label key={label.id} className="label-option">
                        <input
                          type="checkbox"
                          checked={noteLabels.includes(label.id)}
                          onChange={() => handleLabelToggle(label.id)}
                        />
                        <span 
                          className="label-display"
                          style={{ borderColor: label.color }}
                        >
                          <span className="label-icon" style={{ color: label.color }}>
                            {label.icon}
                          </span>
                          <span className="label-name">{label.name}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {categories.length > 0 && (
                <div className="modal-section">
                  <h4>Categories</h4>
                  <div className="categories-grid">
                    {categories.map(category => (
                      <label key={category.id} className="category-option">
                        <input
                          type="checkbox"
                          checked={noteCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                        />
                        <span 
                          className="category-display"
                          style={{ borderColor: category.color }}
                        >
                          <span className="category-icon" style={{ color: category.color }}>
                            {category.icon}
                          </span>
                          <span className="category-name">{category.name}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {labels.length === 0 && categories.length === 0 && (
                <div className="no-labels-message">
                  <p>No labels or categories available.</p>
                  <button 
                    onClick={() => navigate('/labels')}
                    className="create-labels-btn"
                  >
                    Create Labels & Categories
                  </button>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button onClick={handleSaveLabels} className="save-btn">
                Save Labels
              </button>
              <button onClick={closeLabelModal} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesList;