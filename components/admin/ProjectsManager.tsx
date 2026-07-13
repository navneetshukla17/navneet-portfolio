'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import FileUploader from './FileUploader';
import type { ProjectItem } from '@/lib/types';

const EMPTY = { title: '', description: '', live_url: '' };

export default function ProjectsManager({ initialItems }: { initialItems: ProjectItem[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<ProjectItem[]>(initialItems);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(item: ProjectItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? '',
      live_url: item.live_url ?? '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || null,
      live_url: form.live_url || null,
    };
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => prev.map((i) => (i.id === editingId ? data : i)));
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert({ ...payload, display_order: items.length })
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => [...prev, data]);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handlePdfSaved(id: string, url: string | null) {
    const { data, error } = await supabase
      .from('projects')
      .update({ pdf_url: url })
      .eq('id', id)
      .select()
      .single();
    if (!error) setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
  }

  return (
    <>
      {items.map((item) => (
        <div
          className="admin-list-item"
          key={item.id}
          style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Lexend Exa', sans-serif" }}>{item.title}</div>
              {item.description && <div className="meta" style={{ marginTop: 4 }}>{item.description}</div>}
              {item.live_url && <div className="meta">{item.live_url}</div>}
            </div>
            <div className="admin-actions">
              <button onClick={() => startEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
          <FileUploader
            label="PRD / Deck PDF"
            currentUrl={item.pdf_url}
            accept="application/pdf"
            folder="project-pdfs"
            onSaved={(url) => handlePdfSaved(item.id, url)}
          />
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ marginTop: 'var(--md)' }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>{editingId ? 'Edit project' : 'Add a project'}</h3>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="field">
          <label htmlFor="live_url">Live URL (optional)</label>
          <input
            id="live_url"
            type="url"
            value={form.live_url}
            onChange={(e) => setForm({ ...form, live_url: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add project'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
        {!editingId && (
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8 }}>
            Add the project first, then upload its PDF from the list above.
          </p>
        )}
      </form>
    </>
  );
}
