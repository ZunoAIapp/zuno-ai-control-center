
create extension if not exists pgcrypto;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_members (
  partner_id uuid references public.partners(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner','admin','member','viewer')),
  primary key (partner_id, user_id)
);

create table if not exists public.assistants (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  name text not null,
  purpose text not null default 'lead_generation',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  business_name text not null,
  contact_name text,
  email text,
  website text,
  source text,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assistant_id uuid not null references public.assistants(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (lead_id, assistant_id)
);

create table if not exists public.outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  subject text not null,
  body text not null,
  status text not null default 'pending_approval'
    check (status in ('pending_approval','approved','rejected','sent')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.partners enable row level security;
alter table public.partner_members enable row level security;
alter table public.assistants enable row level security;
alter table public.leads enable row level security;
alter table public.lead_assignments enable row level security;
alter table public.outreach_drafts enable row level security;
alter table public.activity_log enable row level security;

create policy "Members can view their partners"
on public.partners for select to authenticated
using (
  exists (
    select 1 from public.partner_members pm
    where pm.partner_id = partners.id
      and pm.user_id = auth.uid()
  )
);

create policy "Members can view their memberships"
on public.partner_members for select to authenticated
using (user_id = auth.uid());

create policy "Members can view assistants"
on public.assistants for select to authenticated
using (
  exists (
    select 1 from public.partner_members pm
    where pm.partner_id = assistants.partner_id
      and pm.user_id = auth.uid()
  )
);

create policy "Members can view leads"
on public.leads for select to authenticated
using (
  exists (
    select 1 from public.partner_members pm
    where pm.partner_id = leads.partner_id
      and pm.user_id = auth.uid()
  )
);

create policy "Members can view assignments"
on public.lead_assignments for select to authenticated
using (
  exists (
    select 1
    from public.leads l
    join public.partner_members pm on pm.partner_id = l.partner_id
    where l.id = lead_assignments.lead_id
      and pm.user_id = auth.uid()
  )
);

create policy "Members can view outreach drafts"
on public.outreach_drafts for select to authenticated
using (
  exists (
    select 1 from public.partner_members pm
    where pm.partner_id = outreach_drafts.partner_id
      and pm.user_id = auth.uid()
  )
);

create policy "Members can view activity"
on public.activity_log for select to authenticated
using (
  exists (
    select 1 from public.partner_members pm
    where pm.partner_id = activity_log.partner_id
      and pm.user_id = auth.uid()
  )
);
