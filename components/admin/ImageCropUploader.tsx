'use client';

import { useCallback, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { createClient } from '@/lib/supabase/client';
import { getCroppedImageBlob } from '@/lib/cropImage';

interface Props {
  label: string;
  currentUrl: string | null;
  aspect: number; // 1 for circle avatar, wide (e.g. 4) for banner
  shape: 'round' | 'rect';
  storageFolder: string; // 'photo' | 'banner'
  onSaved: (url: string | null) => Promise<void> | void;
}

export default function ImageCropUploader({
  label,
  currentUrl,
  aspect,
  shape,
  storageFolder,
  onSaved,
}: Props) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawImage, setRawImage] = useState<string | null>(null); // object URL of picked file, pre-crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setRawImage(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirmCrop() {
    if (!rawImage || !croppedAreaPixels) return;
    setSaving(true);
    setError(null);

    try {
      const blob = await getCroppedImageBlob(rawImage, croppedAreaPixels, aspect === 1 ? 800 : 1600);
      const fileName = `${storageFolder}/${storageFolder}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      await onSaved(publicUrlData.publicUrl);
      setRawImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!confirm(`Remove your ${label.toLowerCase()}?`)) return;
    setSaving(true);
    setError(null);
    try {
      await onSaved(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove image.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelCrop() {
    if (rawImage) URL.revokeObjectURL(rawImage);
    setRawImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="field">
      <label>{label}</label>

      <div className="uploader-preview">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt={label}
            width={aspect === 1 ? 72 : 160}
            height={72}
            style={{ borderRadius: shape === 'round' ? '50%' : '8px' }}
          />
        ) : (
          <div
            style={{
              width: aspect === 1 ? 72 : 160,
              height: 72,
              borderRadius: shape === 'round' ? '50%' : '8px',
              background: 'var(--card-dark)',
              border: '1px solid var(--border)',
            }}
          />
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
          >
            {currentUrl ? 'Change' : 'Upload'}
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
          accept="image/*"
          onChange={handleFilePicked}
          style={{ display: 'none' }}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      {rawImage && (
        <div className="crop-modal-backdrop">
          <div className="crop-modal">
            <h3 style={{ marginBottom: 12 }}>Crop {label.toLowerCase()}</h3>
            <div className="crop-area">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={shape}
                showGrid={shape === 'rect'}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="crop-controls">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
            <div className="crop-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={handleCancelCrop} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmCrop} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
