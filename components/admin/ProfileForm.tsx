'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ImageCropUploader from './ImageCropUploader';
import FileUploader from './FileUploader';
import type { Profile } from '@/lib/types';

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(profile?.name ?? '');
  const [tagline, setTagline] = useState(profile?.tagline ?? '');
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url ?? null);
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url ?? null);
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url ?? null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function upsertProfile(fields: Partial<Profile>) {
    if (profile?.id) {
      const { error } = await supabase.from('profile').update(fields).eq('id', profile.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('profile').insert(fields);
      if (error) throw error;
    }
    router.refresh();
  }

  async function handleSaveText(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    try {
      await upsertProfile({ name, tagline });
      setSavedMsg('Saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lg)' }}>
      <form onSubmit={handleSaveText}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="tagline">Tagline</label>
          <textarea
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="One or two lines under your name"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save name & tagline'}
        </button>
        {savedMsg && <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-dim)' }}>{savedMsg}</span>}
      </form>

      <ImageCropUploader
        label="Profile photo"
        currentUrl={photoUrl}
        aspect={1}
        shape="round"
        storageFolder="photo"
        onSaved={async (url) => {
          await upsertProfile({ photo_url: url });
          setPhotoUrl(url);
        }}
      />

      <ImageCropUploader
        label="Banner image"
        currentUrl={bannerUrl}
        aspect={4}
        shape="rect"
        storageFolder="banner"
        onSaved={async (url) => {
          await upsertProfile({ banner_url: url });
          setBannerUrl(url);
        }}
      />

      <FileUploader
        label="Resume (PDF)"
        currentUrl={resumeUrl}
        accept="application/pdf"
        folder="resume"
        onSaved={async (url) => {
          await upsertProfile({ resume_url: url });
          setResumeUrl(url);
        }}
      />
    </div>
  );
}
