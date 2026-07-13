import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalClient from '@/components/PortalClient';

export default async function PortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: profile }, { data: settings, error: settingsError }, { data: purchases }, { data: tasks }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('settings').select('*').eq('id', 1).single(),
    supabase.from('hour_purchases').select('*').order('created_at', { ascending: true }),
    supabase.from('tasks').select('*').order('created_at', { ascending: true }),
  ]);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md rounded-card bg-neutral-50 p-8 text-center shadow-xl">
          <h1 className="mb-2 font-serif text-xl text-neutral-900">Profilo non configurato</h1>
          <p className="text-sm text-neutral-600">
            Il tuo account esiste ma non ha un ruolo assegnato. Contatta il fornitore per completare la configurazione (vedi README, sezione Setup Supabase).
          </p>
        </div>
      </main>
    );
  }

  if (settingsError || !settings) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md rounded-card bg-neutral-50 p-8 text-center shadow-xl">
          <h1 className="mb-2 font-serif text-xl text-neutral-900">Errore di configurazione</h1>
          <p className="text-sm text-neutral-600">
            Impossibile caricare le impostazioni del progetto. Riprova più tardi o contatta il fornitore.
          </p>
        </div>
      </main>
    );
  }

  return (
    <PortalClient
      role={profile.role}
      initialSettings={settings}
      initialPurchases={purchases ?? []}
      initialTasks={tasks ?? []}
    />
  );
}
