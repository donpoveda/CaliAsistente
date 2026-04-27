-- =================================================================
-- CaliAsistente - Supabase SQL Schema
-- Run this in Supabase Dashboard → SQL Editor → New query
-- =================================================================

-- 1. PROFILES (extended user data for regular users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user', -- 'user' | 'provider' | 'admin'
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. PROVIDERS (service provider profiles)
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  service_title text not null,
  category text not null,
  description text,
  phone text,
  avatar_url text,
  -- Identity verification fields
  cedula_number text,                -- Número de cédula colombiana
  cedula_photo_url text,             -- Foto de la cédula (Storage)
  selfie_url text,                   -- Selfie sosteniendo la cédula (Storage)
  verification_status text not null default 'pending', -- 'pending' | 'verified' | 'rejected'
  verification_notes text,
  thumbs_up integer default 0,
  thumbs_down integer default 0,
  created_at timestamptz default now()
);

-- ALTER for existing tables (run only if table already exists)
alter table public.providers add column if not exists cedula_number text;
alter table public.providers add column if not exists cedula_photo_url text;
alter table public.providers add column if not exists selfie_url text;
alter table public.providers enable row level security;
create policy "Anyone can view verified providers" on public.providers for select using (verification_status = 'verified');
create policy "Provider owners can view their own" on public.providers for select using (auth.uid() = user_id);
create policy "Authenticated users can insert providers" on public.providers for insert with check (auth.uid() = user_id);
create policy "Provider owners can update their own" on public.providers for update using (auth.uid() = user_id);

-- 3. REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  text text not null,
  vote text not null check (vote in ('up', 'down')),
  created_at timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Authenticated users can insert reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Review owners can delete" on public.reviews for delete using (auth.uid() = user_id);

-- 4. USER VOTES (to prevent double voting per provider)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamptz default now(),
  unique(provider_id, user_id)
);
alter table public.votes enable row level security;
create policy "Anyone can read votes" on public.votes for select using (true);
create policy "Auth users can insert votes" on public.votes for insert with check (auth.uid() = user_id);
create policy "Users can update own vote" on public.votes for update using (auth.uid() = user_id);
create policy "Users can delete own vote" on public.votes for delete using (auth.uid() = user_id);

-- 5. REPORTS
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  reason text not null,
  status text not null default 'pending', -- 'pending' | 'reviewed' | 'dismissed'
  created_at timestamptz default now()
);
alter table public.reports enable row level security;
create policy "Auth users can insert reports" on public.reports for insert with check (auth.uid() = user_id);
create policy "Admins can read reports" on public.reports for select using (true);

-- =================================================================
-- FUNCTION: Auto-create profile on signup
-- =================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =================================================================
-- FUNCTION: Update provider vote counts automatically
-- =================================================================
create or replace function public.update_provider_votes()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    if NEW.vote_type = 'up' then
      update public.providers set thumbs_up = thumbs_up + 1 where id = NEW.provider_id;
    else
      update public.providers set thumbs_down = thumbs_down + 1 where id = NEW.provider_id;
    end if;
  elsif (TG_OP = 'DELETE') then
    if OLD.vote_type = 'up' then
      update public.providers set thumbs_up = greatest(thumbs_up - 1, 0) where id = OLD.provider_id;
    else
      update public.providers set thumbs_down = greatest(thumbs_down - 1, 0) where id = OLD.provider_id;
    end if;
  elsif (TG_OP = 'UPDATE') then
    if NEW.vote_type = 'up' then
      update public.providers set thumbs_up = thumbs_up + 1, thumbs_down = greatest(thumbs_down - 1, 0) where id = NEW.provider_id;
    else
      update public.providers set thumbs_down = thumbs_down + 1, thumbs_up = greatest(thumbs_up - 1, 0) where id = NEW.provider_id;
    end if;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

drop trigger if exists on_vote_change on public.votes;
create trigger on_vote_change
  after insert or update or delete on public.votes
  for each row execute procedure public.update_provider_votes();

-- =================================================================
-- STORAGE: Bucket for verification documents
-- Run in Supabase Dashboard → SQL Editor
-- =================================================================

-- Create private bucket for identity documents
insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

-- Allow authenticated providers to upload their own docs
create policy "Providers can upload verification docs"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-docs'
    and auth.role() = 'authenticated'
  );

-- Only admins (service_role) can read verification docs
create policy "Only service role can read verification docs"
  on storage.objects for select
  using (
    bucket_id = 'verification-docs'
    and auth.role() = 'service_role'
  );
