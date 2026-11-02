import { useState, useRef } from 'react';
import { Modal, ModalHeader } from '../ui';
import { apiRequest } from '../lib/api';
import { FiUploadCloud, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export function FeedbackModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    // Maximum 5 attachments allowed by backend
    const combined = [...files, ...selected].slice(0, 5);
    setFiles(combined);

    const newPreviews = combined.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const nextFiles = files.filter((_, i) => i !== index);
    const nextPreviews = previews.filter((_, i) => i !== index);
    setFiles(nextFiles);
    setPreviews(nextPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a feedback title.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe your feedback.');
      return;
    }
    if (description.length > 1000) {
      setError('Description cannot exceed 1000 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await apiRequest('/feedback', {
        method: 'POST',
        body: formData,
      });

      setSubmitted(true);
      if (onSuccess) onSuccess(res?.data);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={540}>
      <ModalHeader
        title="Send In-App Feedback"
        sub="Help us improve Turn & Burn with your ideas, feature requests, or bug reports."
        onClose={onClose}
      />

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <FiCheckCircle size={52} color="#16a34a" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
            Thank You for Your Feedback!
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '380px', margin: '0 auto' }}>
            Our product and engineering teams review all feedback to continually improve the Turn & Burn experience.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '13px',
              }}
            >
              <FiAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Title / Summary <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Booking calendar enhancement or dark mode suggestion"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span
                style={{
                  fontSize: '12px',
                  color: description.length > 950 ? '#ef4444' : '#64748b',
                  fontWeight: 600,
                }}
              >
                {description.length}/1000
              </span>
            </div>
            <textarea
              rows={5}
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what happened, what you'd like to see, or any improvements..."
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Screenshots / Attachments <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional, up to 5)</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '14px',
                border: '1px dashed #94a3b8',
                borderRadius: '8px',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <FiUploadCloud size={18} />
              <span>Click to attach screenshots or recording</span>
            </button>

            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      width: '64px',
                      height: '64px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <img src={src} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '14px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !title.trim() || !description.trim()}
              style={{ padding: '8px 22px', borderRadius: '8px', fontSize: '14px' }}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

