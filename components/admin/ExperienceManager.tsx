'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ExperienceItem } from '@/lib/types';

const EMPTY = { role: '', company: '', start_date: '', end_date: '', bulletsText: '' };

export default function ExperienceManager({ initialItems }: { initialItems: ExperienceItem[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<ExperienceItem[]>(initialItems);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(item: ExperienceItem) {
    setEditingId(item.id);
    setForm({
      role: item.role,
      company: item.company,
      start_date: item.start_date,
      end_date: item.end_date ?? '',
      bulletsText: item.bullets.join('\n'),
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
      role: form.role,
      company: form.company,
      start_date: form.start_date,
      end_date: form.end_date || null,
      bullets: form.bulletsText.split('\n').map((b) => b.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('experience')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => prev.map((i) => (i.id === editingId ? data : i)));
      } else {
        const { data, error } = await supabase
          .from('experience')
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
    if (!confirm('Delete this experience entry?')) return;
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <>
      {items.map((item) => (
        <div className="admin-list-item" key={item.id}>
          <div>
            <div style={{ fontFamily: "'Lexend Exa', sans-serif" }}>
              {item.role} · {item.company}
            </div>
            <div className="meta">
              {item.start_date} – {item.end_date ?? 'Present'}
            </div>
          </div>
          <div className="admin-actions">
            <button onClick={() => startEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ marginTop: 'var(--md)' }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>{editingId ? 'Edit entry' : 'Add experience'}</h3>
        <div className="field">
          <label htmlFor="role">Role</label>
          <input id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        </div>
        <div className="field">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            required
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="start_date">Start</label>
            <input
              id="start_date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              placeholder="Jan 2026"
              required
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="end_date">End (leave blank for "Present")</label>
            <input
              id="end_date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              placeholder="Apr 2024"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="bullets">Bullets (one per line)</label>
          <textarea
            id="bullets"
            value={form.bulletsText}
            onChange={(e) => setForm({ ...form, bulletsText: e.target.value })}
            rows={5}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add experience'}
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
