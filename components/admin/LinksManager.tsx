'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LinkItem } from '@/lib/types';

const EMPTY = { label: '', url: '', badge: '', show_in_header: false };

export default function LinksManager({ initialLinks }: { initialLinks: LinkItem[] }) {
  const supabase = createClient();
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(link: LinkItem) {
    setEditingId(link.id);
    setForm({
      label: link.label,
      url: link.url,
      badge: link.badge ?? '',
      show_in_header: link.show_in_header,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('links')
          .update({ ...form, badge: form.badge || null })
          .eq('id', editingId)
          .select()
          .single();
        if (error) throw error;
        setLinks((prev) => prev.map((l) => (l.id === editingId ? data : l)));
      } else {
        const { data, error } = await supabase
          .from('links')
          .insert({ ...form, badge: form.badge || null, display_order: links.length })
          .select()
          .single();
        if (error) throw error;
        setLinks((prev) => [...prev, data]);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this link?')) return;
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <>
      {links.map((link) => (
        <div className="admin-list-item" key={link.id}>
          <div>
            <div style={{ fontFamily: "'Lexend Exa', sans-serif" }}>{link.label}</div>
            <div className="meta">
              {link.url}
              {link.show_in_header ? ' · shown in header' : ''}
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={() => startEdit(link)}>Edit</button>
            <button onClick={() => handleDelete(link.id)}>Delete</button>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ marginTop: 'var(--md)' }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>{editingId ? 'Edit link' : 'Add a link'}</h3>
        <div className="field">
          <label htmlFor="label">Label</label>
          <input
            id="label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="LinkedIn"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="url">URL</label>
          <input
            id="url"
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://linkedin.com/in/yourname"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="badge">Badge (optional label shown on the card, e.g. "Profile", "Article")</label>
          <input
            id="badge"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
          />
        </div>
        <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input
            id="show_in_header"
            type="checkbox"
            checked={form.show_in_header}
            onChange={(e) => setForm({ ...form, show_in_header: e.target.checked })}
            style={{ width: 'auto' }}
          />
          <label htmlFor="show_in_header" style={{ margin: 0 }}>
            Also show at the top of the page, next to Resume
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add link'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}
