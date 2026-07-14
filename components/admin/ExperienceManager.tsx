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

  async function updateOrder(newItems: ExperienceItem[]) {
    setSaving(true);
    try {
      const promises = newItems.map((item, index) =>
        supabase
          .from('experience')
          .update({ display_order: index })
          .eq('id', item.id)
      );
      await Promise.all(promises);
      setItems(newItems.map((item, index) => ({ ...item, display_order: index })));
    } catch (err) {
      console.error('Failed to update order:', err);
      alert('Failed to update order in database.');
    } finally {
      setSaving(false);
    }
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    updateOrder(newItems);
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    updateOrder(newItems);
  }

  function parseDateString(dateStr: string): Date {
    const clean = dateStr.trim().toLowerCase();
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };

    const parts = clean.split(/\s+/);
    let year = new Date().getFullYear();
    let month = 0;

    if (parts.length === 1) {
      const y = parseInt(parts[0], 10);
      if (!isNaN(y)) year = y;
    } else if (parts.length >= 2) {
      const mStr = parts[0];
      const yStr = parts[1];
      if (months[mStr] !== undefined) {
        month = months[mStr];
      }
      const y = parseInt(yStr, 10);
      if (!isNaN(y)) year = y;
    }

    return new Date(year, month, 1);
  }

  async function sortByDateLatestFirst() {
    const sorted = [...items].sort((a, b) => {
      const dateA = parseDateString(a.start_date);
      const dateB = parseDateString(b.start_date);
      return dateB.getTime() - dateA.getTime();
    });
    await updateOrder(sorted);
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
        // Shift existing display_order in DB
        const promises = items.map((item) =>
          supabase
            .from('experience')
            .update({ display_order: item.display_order + 1 })
            .eq('id', item.id)
        );
        await Promise.all(promises);

        // Insert new item at 0 (latest by default)
        const { data, error } = await supabase
          .from('experience')
          .insert({ ...payload, display_order: 0 })
          .select()
          .single();
        if (error) throw error;
        setItems((prev) => [
          data,
          ...prev.map((i) => ({ ...i, display_order: i.display_order + 1 })),
        ]);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          Rearrange manually using Up/Down arrows, or sort automatically:
        </span>
        <button
          type="button"
          onClick={sortByDateLatestFirst}
          disabled={saving || items.length <= 1}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            background: 'var(--card-white)',
            color: 'var(--card-white-text)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
        >
          Sort by Date (Latest First)
        </button>
      </div>

      {items.map((item, index) => (
        <div className="admin-list-item" key={item.id}>
          <div>
            <div style={{ fontFamily: "'Lexend Exa', sans-serif" }}>
              {item.role} · {item.company}
            </div>
            <div className="meta">
              {item.start_date} – {item.end_date ?? 'Present'}
            </div>
          </div>
          <div className="admin-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0 || saving}
              title="Move Up"
              style={{ padding: '4px 8px', fontSize: 12 }}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === items.length - 1 || saving}
              title="Move Down"
              style={{ padding: '4px 8px', fontSize: 12 }}
            >
              ↓
            </button>
            <button type="button" onClick={() => startEdit(item)}>Edit</button>
            <button type="button" onClick={() => handleDelete(item.id)}>Delete</button>
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
