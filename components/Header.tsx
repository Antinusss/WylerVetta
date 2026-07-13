'use client';

import { useState } from 'react';
import type { Role, Settings } from '@/lib/types';
import LogoUploader from './LogoUploader';

interface HeaderProps {
  role: Role;
  projectName: string;
  clientLogoUrl: string | null;
  onUpdateSettings: (patch: Partial<Pick<Settings, 'project_name' | 'client_logo_url' | 'supplier_logo_url'>>) => Promise<void>;
}

export default function Header({ role, projectName, clientLogoUrl, onUpdateSettings }: HeaderProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(projectName);

  async function saveName() {
    setEditingName(false);
    if (nameDraft.trim() && nameDraft !== projectName) {
      await onUpdateSettings({ project_name: nameDraft.trim() });
    }
  }

  return (
    <header className="flex flex-col items-center gap-3 border-b border-neutral-800 bg-neutral-950 px-4 py-6">
      {role === 'client' && (
        <div className="w-full rounded-lg bg-skyblue/20 px-4 py-2 text-center text-sm text-skyblue">
          Stai visualizzando il portale come cliente
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        {clientLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clientLogoUrl} alt="Logo cliente" className="h-16 w-auto object-contain" />
        ) : (
          <span className="font-serif text-xl text-neutral-100">Logo cliente</span>
        )}

        {role === 'owner' && <LogoUploader kind="client" onUploaded={(url) => onUpdateSettings({ client_logo_url: url })} />}
      </div>

      {editingName && role === 'owner' ? (
        <input
          autoFocus
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => e.key === 'Enter' && saveName()}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1 text-center font-serif text-lg text-neutral-100"
        />
      ) : (
        <h1
          className={`font-serif text-lg text-neutral-100 ${role === 'owner' ? 'cursor-pointer hover:underline' : ''}`}
          onClick={() => role === 'owner' && setEditingName(true)}
        >
          {projectName}
        </h1>
      )}
    </header>
  );
}
