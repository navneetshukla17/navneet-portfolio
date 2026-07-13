'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  label: string;
  currentUrl: string | null;
  accept: string; // e.g. 'application/pdf'
  folder: string; // storage subfolder, e.g. 'resume' or 'project-pdfs'
  onSaved: (url: string | null) => Promise<void> | void;
}

export default function FileUploader({ label, currentUrl, accept, folder, onSaved }: Props) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError(null);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `${folder}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-files')
        .upload(path, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('portfolio-files').getPublicUrl(path);
      await onSaved(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemove() {
    if (!confirm(`Remove ${label.toLowerCase()}?`)) return;
    setSaving(true);
    setError(null);
    try {
      await onSaved(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove file.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {currentUrl ? (
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'underline' }}
          >
            View current file ↗
          </a>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>No file uploaded</span>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
        >
          {currentUrl ? 'Replace' : 'Upload'}
        </button>
        {currentUrl && (
          <button type="button" className="btn btn-danger" onClick={handleRemove} disabled={saving}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFilePicked}
        style={{ display: 'none' }}
      />
      {saving && <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6 }}>Working…</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
