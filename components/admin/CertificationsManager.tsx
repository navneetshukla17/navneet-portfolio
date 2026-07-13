'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CertificationItem } from '@/lib/types';

const EMPTY = { name: '', issuer: '', date: '', url: '' };

export default function CertificationsManager({ initialItems }: { initialItems: CertificationItem[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<CertificationItem[]>(initialItems);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(item: CertificationItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      issuer: item.issuer ?? '',
      date: item.date ?? '',
      url: item.url ?? '',
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
      name: form.name,
      issuer: form.issuer || null,
      date: form.date || null,
      url: form.url || null,
    };
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('certifications')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => prev.map((i) => (i.id === editingId ? data : i)));
      } else {
        const { data, error } = await supabase
          .from('certifications')
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
    if (!confirm('Delete this certification?')) return;
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <>
      {items.length === 0 && (
        <p style={{ color: 'var(--text-faint)', marginBottom: 'var(--sm)', fontSize: 14 }}>
          No certifications yet.
        </p>
      )}
      {items.map((item) => (
        <div className="admin-list-item" key={item.id}>
          <div>
            <div style={{ fontFamily: "'Lexend Exa', sans-serif" }}>{item.name}</div>
            <div className="meta">
              {[item.issuer, item.date].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={() => startEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ marginTop: 'var(--md)' }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>{editingId ? 'Edit certification' : 'Add certification'}</h3>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field">
          <label htmlFor="issuer">Issuer</label>
          <input id="issuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="url">URL (optional, links the card out)</label>
          <input id="url" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add certification'}
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
