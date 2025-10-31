import React, { useEffect, useState } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { useLabels } from '../contexts/LabelsContext';
import { useNavigate } from 'react-router-dom';


interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  meta?: {
    query_time?: number;
  };
}

const NotesList: React.FC = () => {
  const { notes, loading, fetchNotes, deleteNote, stats, fetchStats } = useNotes();
  const { labels, categories, fetchLabels, fetchCategories, fetchNotesWithLabels } = useLabels();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrafts, setFilterDrafts] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [notesWithLabels, setNotesWithLabels] = useState<any[]>([]);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasMoreNotes, setHasMoreNotes] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
    fetchStats();
    fetchLabels();
    fetchCategories();
    loadNotesWithLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    loadNotes();
    loadNotesWithLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterDrafts, selectedTag, selectedLabel, selectedCategory, visibility, sortBy, sortOrder]);

  useEffect(() => {
    if (!infiniteScrollEnabled) {
      loadNotes();
    }
    loadNotesWithLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Infinite scroll effect
  useEffect(() => {
    if (!infiniteScrollEnabled) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 &&
        hasMoreNotes &&
        !isLoadingMore &&
        !loading
      ) {
        loadNotes(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infiniteScrollEnabled, hasMoreNotes, isLoadingMore, loading]);

  // Reset when switching between pagination modes
  useEffect(() => {
    setCurrentPage(1);
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infiniteScrollEnabled]);

  const loadNotes = async (isLoadMore = false) => {
    const params = {
      page: isLoadMore ? currentPage + 1 : currentPage,
      limit: infiniteScrollEnabled ? 20 : 5,
      sort_by: sortBy,
      sort_order: sortOrder,
      infinite_scroll: infiniteScrollEnabled,
      ...(searchTerm && { search: searchTerm }),
      ...(filterDrafts !== 'all' && { draft_only: filterDrafts === 'drafts' ? 'true' : 'false' }),
      ...(selectedTag && { tag: selectedTag }),
      ...(visibility !== 'all' && { visibility }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo })
    };
    
    console.log('loadNotes called with params:', params);
    console.log('currentPage state:', currentPage);
    
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      }
      
      const response = await fetchNotes(params, isLoadMore);
      console.log('fetchNotes response:', response);
      
      if (response && response.pagination) {
        console.log('Setting pagination:', response.pagination);
        setPagination(response.pagination);
        setHasMoreNotes(response.pagination.hasNext);
        
        if (isLoadMore) {
          setCurrentPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      }
    }
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

  const loadNotesWithLabels = async () => {
    try {
      const filters: any = {};
      if (selectedLabel) filters.label_id = selectedLabel;
      if (selectedCategory) filters.category_id = selectedCategory;
      if (searchTerm) filters.search = searchTerm;
      
      const notesData = await fetchNotesWithLabels(filters);
      setNotesWithLabels(notesData);
    } catch (error) {
      console.error('Failed to load notes with labels:', error);
    }
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

      {/* Simple Filters */}
      <div className="notes-filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="updated_at">Last Updated</option>
            <option value="created_at">Date Created</option>
            <option value="title">Alphabetical</option>
          </select>

          <select 
            value={filterDrafts} 
            onChange={(e) => setFilterDrafts(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notes</option>
            <option value="drafts">Drafts</option>
            <option value="published">Published</option>
          </select>
        </div>
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
          (selectedLabel || selectedCategory ? notesWithLabels : notes).map(note => (
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
              
              {/* Labels Display */}
              {note.labels && note.labels.length > 0 && (
                <div className="note-labels">
                  {note.labels.map((label: any) => (
                    <span 
                      key={label.id} 
                      className="note-label"
                      style={{ 
                        borderColor: label.color,
                        color: label.color 
                      }}
                    >
                      <span className="label-icon">{label.icon}</span>
                      <span className="label-name">{label.name}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Categories Display */}
              {note.categories && note.categories.length > 0 && (
                <div className="note-categories">
                  {note.categories.map((category: any) => (
                    <span 
                      key={category.id} 
                      className="note-category"
                      style={{ 
                        borderColor: category.color,
                        color: category.color 
                      }}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-name">{category.name}</span>
                    </span>
                  ))}
                </div>
              )}
              
              {note.tags && note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map((tag: string) => (
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





      {/* Pagination Controls */}
      {!infiniteScrollEnabled && pagination && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notes
          </div>
          <div className="pagination-controls">
            <button 
              onClick={() => {
                console.log('First button clicked, setting page to 1');
                setCurrentPage(1);
              }}
              disabled={currentPage <= 1}
              className="pagination-btn first"
              title="First page"
            >
              « First
            </button>
            <button 
              onClick={() => {
                console.log('Previous button clicked, current page:', currentPage, 'going to:', currentPage - 1);
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
              disabled={currentPage <= 1}
              className="pagination-btn previous"
              title="Previous page"
            >
              ‹ Previous
            </button>
            <span className="pagination-current">
              Page {currentPage} of {pagination.totalPages} (API: {pagination.page})
            </span>
            <button 
              onClick={() => {
                console.log('Next button clicked, current page:', currentPage, 'going to:', currentPage + 1);
                if (currentPage < pagination.totalPages) {
                  setCurrentPage(currentPage + 1);
                }
              }}
              disabled={currentPage >= pagination.totalPages}
              className="pagination-btn next"
              title="Next page"
            >
              Next ›
            </button>
            <button 
              onClick={() => {
                console.log('Last button clicked, setting page to:', pagination.totalPages);
                setCurrentPage(pagination.totalPages);
              }}
              disabled={currentPage >= pagination.totalPages}
              className="pagination-btn last"
              title="Last page"
            >
              Last »
            </button>
          </div>
        </div>
      )}

      {/* Infinite Scroll Loading */}
      {infiniteScrollEnabled && (
        <div className="infinite-scroll-status">
          {isLoadingMore && (
            <div className="loading-more">
              <div className="loading-spinner"></div>
              <p>Loading more notes...</p>
            </div>
          )}
          {!hasMoreNotes && notes.length > 0 && (
            <div className="no-more-notes">
              <p>🎉 You've reached the end! No more notes to load.</p>
            </div>
          )}
          {pagination && (
            <div className="infinite-scroll-info">
              Loaded {notes.length} of {pagination.total} notes
            </div>
          )}
        </div>
      )}



    </div>
  );
};

export default NotesList;