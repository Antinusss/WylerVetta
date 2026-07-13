'use client';

import type { Role, Settings } from '@/lib/types';
import LogoUploader from './LogoUploader';

interface FooterProps {
  role: Role;
  supplierLogoUrl: string | null;
  onUpdateSettings: (patch: Partial<Pick<Settings, 'project_name' | 'client_logo_url' | 'supplier_logo_url'>>) => Promise<void>;
}

export default function Footer({ role, supplierLogoUrl, onUpdateSettings }: FooterProps) {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-neutral-800 px-4 py-4">
      {supplierLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={supplierLogoUrl} alt="Logo fornitore" className="h-8 w-auto object-contain opacity-80" />
      ) : (
        <span className="text-xs text-neutral-500">Logo fornitore</span>
      )}

      {role === 'owner' && <LogoUploader kind="supplier" onUploaded={(url) => onUpdateSettings({ supplier_logo_url: url })} />}
    </footer>
  );
}
