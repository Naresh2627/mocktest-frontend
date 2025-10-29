import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';

const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchNote, createNote, updateNote, autoSaveNote } = useNotes();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isEditing = !!id;

  // Auto-save functionality
  const debouncedAutoSave = useCallback(
    debounce(async (noteId: string, content: string, title: string) => {
      if (noteId && (content || title)) {
        try {
          setAutoSaveStatus('Saving...');
          await autoSaveNote(noteId, content, title);
          setAutoSaveStatus('Auto-saved');
          setLastSaved(new Date());
          setTimeout(() => setAutoSaveStatus(''), 2000);
        } catch (error) {
          setAutoSaveStatus('Save failed');
          setTimeout(() => setAutoSaveStatus(''), 2000);
        }
      }
    }, 2000),
    [autoSaveNote]
  );

  useEffect(() => {
    if (isEditing && id) {
      loadNote();
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing && id && (content || title)) {
      debouncedAutoSave(id, content, title);
    }
  }, [content, title, id, isEditing, debouncedAutoSave]);

  const loadNote = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const note = await fetchNote(id);
      setTitle(note.title);
      setContent(note.content || '');
      setTags(note.tags || []);
      setIsEncrypted(note.is_encrypted);
      setIsPublic(note.is_public);
      setIsDraft(note.is_draft);
      
      // Load existing labels and categories for this note
      // Note: This would require updating the fetchNote function to include labels/categories
      // For now, we'll leave them empty when editing existing notes
      // TODO: Implement loading existing labels and categories
      
    } catch (error) {
      alert('Failed to load note');
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setSaving(true);
      const noteData = {
        title: title.trim(),
        content,
        tags,
        is_encrypted: isEncrypted,
        is_public: isPublic,
        is_draft: publishNow ? false : isDraft
      };

      if (isEditing && id) {
        await updateNote(id, noteData);
      } else {
        const newNote = await createNote(noteData);
        navigate(`/notes/${newNote.id}/edit`, { replace: true });
      }

      setLastSaved(new Date());
      setAutoSaveStatus(publishNow ? 'Published!' : 'Saved!');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      alert('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndGoToNotes = async (publishNow = false) => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setSaving(true);
      const noteData = {
        title: title.trim(),
        content,
        tags,
        is_encrypted: isEncrypted,
        is_public: isPublic,
        is_draft: publishNow ? false : isDraft
      };

      if (isEditing && id) {
        await updateNote(id, noteData);
      } else {
        await createNote(noteData);
      }

      // Redirect to notes list after saving
      navigate('/notes');
    } catch (error) {
      alert('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };



  const getShareUrl = () => {
    // This would need to be implemented based on your public note route
    return `${window.location.origin}/public/share-id`;
  };

  if (loading) {
    return (
      <div className="editor-container">
        <div className="loading-spinner"></div>
        <p>Loading note...</p>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-nav">
          <button 
            onClick={() => navigate('/notes')} 
            className="back-btn"
          >
            ← Back to Notes
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="dashboard-btn"
          >
            📊 Dashboard
          </button>
        </div>
        
        <div className="editor-actions">
          <div className="auto-save-status">
            {autoSaveStatus && <span className="save-status">{autoSaveStatus}</span>}
            {lastSaved && !autoSaveStatus && (
              <span className="last-saved">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <button 
            onClick={() => handleSave(false)} 
            disabled={saving}
            className="save-btn"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button 
            onClick={() => handleSave(true)} 
            disabled={saving}
            className="publish-btn"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
          
          <button 
            onClick={() => handleSaveAndGoToNotes(false)} 
            disabled={saving}
            className="save-and-go-btn"
          >
            Save & Go to Notes
          </button>
          
          <button 
            onClick={() => navigate('/notes/new')} 
            disabled={saving}
            className="new-note-btn"
          >
            ➕ New Note
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-main">
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
          
          <textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="content-textarea"
          />
        </div>

        <div className="editor-sidebar">
          <div className="editor-section">
            <h3>Settings</h3>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isEncrypted}
                onChange={(e) => setIsEncrypted(e.target.checked)}
              />
              🔒 Encrypt content
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              🌐 Make public
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
              />
              📝 Keep as draft
            </label>
          </div>



          <div className="editor-section">
            <h3>Tags</h3>
            <div className="tag-input-container">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="tag-input"
              />
              <button onClick={handleAddTag} className="add-tag-btn">
                Add
              </button>
            </div>
            
            <div className="tags-list">
              {tags.map(tag => (
                <span key={tag} className="tag-item">
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag-btn"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {isPublic && (
            <div className="editor-section">
              <h3>Public Sharing</h3>
              <p className="share-info">
                This note will be publicly accessible via a share link.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default NoteEditor;