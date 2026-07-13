# Portale Monte-Ore

Portale web a monte-ore: il cliente acquista un pacchetto di ore, le task lo consumano al completamento. Fornitore e cliente vedono lo stesso dato in tempo reale.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, backend/auth/realtime su Supabase, deploy su Vercel.

## Setup Supabase

1. Crea un progetto su [supabase.com](https://supabase.com).
2. Apri l'SQL Editor ed esegui tutto il contenuto di `supabase/schema.sql`.
3. Il Realtime sulle tabelle `settings`, `hour_purchases`, `tasks` è già abilitato automaticamente da `schema.sql` (sezione finale `alter publication supabase_realtime add table ...`): non serve alcun passaggio manuale da **Database → Replication**.

   Nota di fallback: se l'esecuzione dello schema fallisce su quelle righe con un errore tipo "publication supabase_realtime does not exist" (può capitare su alcuni tier/versioni di progetto Supabase che non creano la pubblicazione di default), crea prima la pubblicazione a mano nell'SQL Editor e poi rilancia lo schema:

   ```sql
   create publication supabase_realtime for table settings, hour_purchases, tasks;
   ```
4. Vai su **Storage** e verifica che il bucket `logos` esista (creato dallo schema) con accesso pubblico in lettura.
5. Vai su **Authentication → Providers** e disabilita "Allow new users to sign up".
6. Vai su **Authentication → Users** e crea manualmente 2 utenti: uno per il fornitore, uno per il cliente (email + password).
7. Nell'SQL Editor, inserisci le righe profilo (sostituisci gli UUID con quelli reali degli utenti creati al passo 6, visibili nella tabella Authentication → Users):

   ```sql
   insert into profiles (id, role) values ('UUID-FORNITORE', 'owner');
   insert into profiles (id, role) values ('UUID-CLIENTE', 'client');
   ```

## Decisioni di implementazione

- **Tariffa oraria**: `settings.hourly_rate` resta leggibile da tutti via RLS; il calcolo economico (ore × tariffa) viene fatto solo nel componente `HoursSummary`, condizionato a `role === 'owner'`. Non esiste una tabella `owner_settings` separata (semplicità, nessun beneficio reale aggiuntivo).
- **Blocco modifica status/ore da parte del cliente**: oltre alle policy RLS, un trigger Postgres (`prevent_client_task_status_hours_change`) rifiuta con eccezione qualsiasi update che cambi `status` o `hours` se il chiamante non è owner. Vedi `supabase/schema.sql`.

Dettagli completi in `docs/superpowers/specs/2026-07-13-portale-monte-ore-design.md`.

## Sviluppo locale

1. Copia `.env.local.example` in `.env.local` e inserisci `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` del tuo progetto Supabase.
2. `npm install`
3. `npm run dev`
4. Apri `http://localhost:3000`, verrai reindirizzato a `/login`.

## Test

```bash
npm run test
```

Copre la logica di calcolo in `lib/calculations.ts` (ore acquistate/utilizzate/residue, percentuali, priorità).

## Deploy

1. `git push` su un repository GitHub.
2. Importa il repository su [Vercel](https://vercel.com).
3. Nelle Environment Variables del progetto Vercel, aggiungi `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (stessi valori di `.env.local`).
4. Deploy.

## Verifica realtime

Apri il portale in due browser diversi (o una finestra normale + una in incognito), login come fornitore in uno e come cliente nell'altro. Aggiungi ore o una task in una sessione: l'altra si aggiorna entro pochi istanti senza reload.
