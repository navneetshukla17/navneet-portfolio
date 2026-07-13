'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { EducationItem } from '@/lib/types';

const EMPTY = { degree: '', institution: '', details: '' };

export default function EducationManager({ initialItems }: { initialItems: EducationItem[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<EducationItem[]>(initialItems);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(item: EducationItem) {
    setEditingId(item.id);
    setForm({ degree: item.degree, institution: item.institution, details: item.details ?? '' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { degree: form.degree, institution: form.institution, details: form.details || null };
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('education')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => prev.map((i) => (i.id === editingId ? data : i)));
      } else {
        const { data, error } = await supabase
          .from('education')
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
    if (!confirm('Delete this education entry?')) return;
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <>
      {items.map((item) => (
        <div className="admin-list-item" key={item.id}>
          <div>
            <div style={{ fontFamily: "'Lexend Exa', sans-serif" }}>{item.degree}</div>
            <div className="meta">{item.institution}</div>
          </div>
          <div className="admin-actions">
            <button onClick={() => startEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ marginTop: 'var(--md)' }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>{editingId ? 'Edit entry' : 'Add education'}</h3>
        <div className="field">
          <label htmlFor="degree">Degree</label>
          <input
            id="degree"
            value={form.degree}
            onChange={(e) => setForm({ ...form, degree: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="institution">Institution</label>
          <input
            id="institution"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="details">Details (e.g. "Graduated 2026 · CGPA 8.0")</label>
          <input
            id="details"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add education'}
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
