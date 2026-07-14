'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Settings, HourPurchase, Task, Role, Impact, Urgency, TaskOwner } from '@/lib/types';
import Header from './Header';
import Footer from './Footer';
import HoursSummary from './HoursSummary';
import AddHoursControl from './AddHoursControl';
import TaskList from './TaskList';
import CompletionSummary from './CompletionSummary';

interface PortalClientProps {
  role: Role;
  initialSettings: Settings;
  initialPurchases: HourPurchase[];
  initialTasks: Task[];
}

export default function PortalClient({ role, initialSettings, initialPurchases, initialTasks }: PortalClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('portal-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setSettings(payload.new as Settings);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hour_purchases' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPurchases((prev) => [...prev, payload.new as HourPurchase]);
        } else if (payload.eventType === 'UPDATE') {
          setPurchases((prev) => prev.map((p) => (p.id === (payload.new as HourPurchase).id ? (payload.new as HourPurchase) : p)));
        } else if (payload.eventType === 'DELETE') {
          setPurchases((prev) => prev.filter((p) => p.id !== (payload.old as HourPurchase).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks((prev) => [...prev, payload.new as Task]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks((prev) => prev.map((t) => (t.id === (payload.new as Task).id ? (payload.new as Task) : t)));
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== (payload.old as Task).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddHours = useCallback(async (hours: number, purchasedOn: string, note: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('hour_purchases').insert({ hours, purchased_on: purchasedOn, note });
    if (error) throw error;
  }, []);

  const handleAddTask = useCallback(async (title: string, impact: Impact, urgency: Urgency, owner: TaskOwner) => {
    const supabase = createClient();
    const { error } = await supabase.from('tasks').insert({ title, impact, urgency, owner });
    if (error) throw error;
  }, []);

  const handleUpdateTask = useCallback(
    async (
      id: string,
      patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours' | 'completed_on'>>
    ) => {
      const supabase = createClient();
      const { error } = await supabase.from('tasks').update(patch).eq('id', id);
      if (error) throw error;
    },
    []
  );

  const handleDeleteTask = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }, []);

  const handleUpdateSettings = useCallback(
    async (patch: Partial<Pick<Settings, 'project_name' | 'client_logo_url' | 'supplier_logo_url'>>) => {
      const supabase = createClient();
      const { error } = await supabase.from('settings').update(patch).eq('id', 1);
      if (error) throw error;
    },
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <Header
        role={role}
        projectName={settings.project_name}
        clientLogoUrl={settings.client_logo_url}
        onUpdateSettings={handleUpdateSettings}
      />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
        <HoursSummary role={role} settings={settings} purchases={purchases} tasks={tasks} />
        {role === 'owner' && <AddHoursControl onAddHours={handleAddHours} />}
        <CompletionSummary role={role} tasks={tasks} onUpdateTask={handleUpdateTask} />
        <TaskList
          role={role}
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </main>

      <Footer role={role} supplierLogoUrl={settings.supplier_logo_url} onUpdateSettings={handleUpdateSettings} />
    </div>
  );
}
