export type Role = 'owner' | 'client';
export type Impact = 'bassa' | 'media' | 'alta';
export type Urgency = 'bassa' | 'media' | 'alta';
export type TaskStatus = 'non_iniziato' | 'in_corso' | 'completato' | 'on_hold';
export type TaskOwner = 'Leonardo' | 'Amina';

export interface Profile {
  id: string;
  role: Role;
  created_at: string;
}

export interface Settings {
  id: number;
  project_name: string;
  hourly_rate: number;
  client_logo_url: string | null;
  supplier_logo_url: string | null;
  updated_at: string;
}

export interface HourPurchase {
  id: string;
  hours: number;
  purchased_on: string;
  note: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  hours: number;
  impact: Impact;
  urgency: Urgency;
  status: TaskStatus;
  owner: TaskOwner;
  completed_on: string | null;
  created_at: string;
}
