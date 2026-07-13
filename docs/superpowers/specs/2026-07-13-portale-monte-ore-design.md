# Portale Monte-Ore — Design

Data: 2026-07-13

## Obiettivo
Portale web a monte-ore: cliente acquista ore, task consumano ore quando completate. Fornitore (owner) e cliente hanno login separato, stesso dato in realtime.

## Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS, UI custom curata
- Supabase: Postgres + Auth (email/password, signup pubblica OFF) + Realtime + Storage
- Deploy: Vercel, versionato Git/GitHub
- Nessun localStorage come fonte di verità

## Auth & ruoli
- 2 utenze fisse create manualmente in Supabase Auth: owner (fornitore), client (cliente)
- Tabella `profiles(id, role)` collegata a `auth.users`
- Ruolo determina permessi sia in UI che via RLS
- `/login` dedicata, middleware protegge tutto il resto, logout in header

## Schema DB (come da spec utente, invariato)
`profiles`, `settings`, `hour_purchases`, `tasks`, view `v_hours_summary`. Vedi spec originale per DDL completo — verrà riportato in `supabase/schema.sql`.

## Decisioni implementative (dove la spec lasciava scelta libera)

**1. Tariffa oraria (`hourly_rate`)**
Resta colonna in `settings`, leggibile da tutti via RLS (nessuna tabella `owner_settings` separata). Il calcolo economico (ore × tariffa) avviene solo lato componente React renderizzato quando `role === 'owner'`. Scelta per semplicità: la spec stessa la offre come opzione valida, evita tabella extra e RLS aggiuntiva senza reale beneficio (il cliente non ha comunque accesso a UI che mostri il calcolo).

**2. Enforcement "client non tocca status/hours su tasks"**
Oltre alla policy RLS `with check` per colonne permesse, aggiungo un trigger Postgres `BEFORE UPDATE ON tasks` che, se il chiamante non è owner, verifica `NEW.status = OLD.status AND NEW.hours = OLD.hours` e solleva eccezione altrimenti. Motivo: le RLS policy non supportano nativamente restrizioni per-colonna in modo affidabile (serve confrontare OLD/NEW), il trigger è il meccanismo standard e verificabile.

## RLS — riepilogo
- Lettura: tutti gli autenticati leggono tutte le tabelle
- `is_owner()` helper function
- Owner: insert/update/delete ovunque
- Client: insert su `hour_purchases` e `tasks`; update su `tasks` solo title/impact/urgency/owner (bloccato da trigger su status/hours); no delete su tasks; no scrittura su settings

## Struttura file
Come da spec: `/app` (login, portal, layout), `/components` (Header, Footer, LogoUploader, HoursSummary, AddHoursControl, TaskList, TaskItem, CompletionSummary), `/lib` (supabase client/server/middleware, calculations, types), `/middleware.ts`, `/supabase/schema.sql`, `.env.local.example`, `README.md`.

## Logica calcoli (`lib/calculations.ts`)
purchasedHours, usedHours, remainingHours, usagePercent (clamp 0-100, overBudget flag), economics(rate) solo owner, completionPercent, priorityScore (impact*2+urgency*2, completate in fondo, on_hold sotto attive, tie-break per created_at). Copertura con test unitari (Vitest).

## Estetica
Sfondo scuro caldo, bagliori dorati/salvia, card chiare, angoli ~18px. Font: Fraunces (titoli/numeri), Inter Tight (corpo), Spline Sans Mono (numeri). Palette: oro #c89456, salvia #5d7d57, blu #4a6c8f, rosa/rosso #b0584c, ambra #c8902f, viola #7a5c8f. Stati/impatto/urgenza/owner colorati come da spec. Responsive, `prefers-reduced-motion` rispettato. Testi in italiano.

## Realtime
Supabase Realtime su `settings`, `hour_purchases`, `tasks` (postgres_changes), insert/update/delete gestiti, stato React aggiornato senza reload.

## Deploy
Come da spec §10: schema.sql su Supabase, Realtime abilitato, bucket `logos` (public read), 2 utenti Auth + righe `profiles`, `.env.local`, poi GitHub + Vercel.

## Criteri di completamento
Checklist §11 della spec originale, invariata.

## Fuori scope (non richiesto)
Niente signup pubblica, niente ruoli aggiuntivi, niente notifiche email, niente multi-progetto (riga `settings` singola, id=1 fisso).
