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
    redirect('/login');
  }

  if (settingsError || !settings) {
    redirect('/login');
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
