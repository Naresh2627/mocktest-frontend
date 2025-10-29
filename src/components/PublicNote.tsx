import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';

const PublicNote: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { fetchPublicNote } = useNotes();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shareId) {
      loadPublicNote();
    }
  }, [shareId]);

  const loadPublicNote = async () => {
    if (!shareId) return;
    
    try {
      setLoading(true);
      const publicNote = await fetchPublicNote(shareId);
      setNote(publicNote);
    } catch (error) {
      setError('Note not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="public-note-container">
        <div className="loading-spinner"></div>
        <p>Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="public-note-container">
        <div className="error-state">
          <h2>Note Not Found</h2>
          <p>{error || 'This note may have been removed or made private.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-note-container">
      <div className="public-note-header">
        <div className="public-note-badge">
          🌐 Public Note
        </div>
        <h1 className="public-note-title">{note.title}</h1>
        <div className="public-note-meta">
          <span>Published {formatDate(note.published_at || note.created_at)}</span>
          {note.updated_at !== note.created_at && (
            <span> • Updated {formatDate(note.updated_at)}</span>
          )}
        </div>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="public-note-tags">
          {note.tags.map((tag: string) => (
            <span key={tag} className="public-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="public-note-content">
        {note.content ? (
          <div className="content-text">
            {note.content.split('\n').map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className="no-content">This note has no content.</p>
        )}
      </div>

      <div className="public-note-footer">
        <p>This note was shared publicly. Create your own notes at our platform!</p>
      </div>
    </div>
  );
};

export default PublicNote;