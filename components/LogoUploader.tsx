'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LogoUploaderProps {
  kind: 'client' | 'supplier';
  onUploaded: (publicUrl: string) => Promise<void>;
}

export default function LogoUploader({ kind, onUploaded }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const path = `${kind}-${Date.now()}-${file.name}`;

    try {
      const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from('logos').getPublicUrl(path);
      await onUploaded(data.publicUrl);
    } catch {
      // upload or settings update failed; button resets below so the user can retry
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="cursor-pointer text-xs text-gold hover:underline">
      {uploading ? 'Caricamento…' : 'Carica logo'}
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
    </label>
  );
}
