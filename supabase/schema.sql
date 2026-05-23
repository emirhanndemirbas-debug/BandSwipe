-- BandSwipe Supabase Schema
-- Supabase SQL Editor'da bu dosyayı çalıştır

-- ─────────────────────────────────────────────
-- 1. MUSICIAN PROFILES
-- ─────────────────────────────────────────────
create table if not exists musician_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age int,
  city text,
  instrument text,
  experience_years int default 0,
  genres text[] default '{}',
  goals text[] default '{}',
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'professional')),
  bio text,
  avatar_url text,
  audio_demo_url text,
  video_demo_url text,
  instagram_url text,
  youtube_url text,
  spotify_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 2. BAND PROFILES
-- ─────────────────────────────────────────────
create table if not exists band_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  band_name text not null,
  city text,
  active_since int,
  genres text[] default '{}',
  current_members text[] default '{}',
  required_roles text[] default '{}',
  min_experience_years int default 0,
  goals text[] default '{}',
  bio text,
  avatar_url text,
  demo_url text,
  instagram_url text,
  youtube_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 3. USER META (profil tipi)
-- ─────────────────────────────────────────────
create table if not exists user_meta (
  id uuid primary key references auth.users(id) on delete cascade,
  profile_type text not null check (profile_type in ('musician', 'band')),
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 4. SWIPES
-- ─────────────────────────────────────────────
create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('right', 'left')),
  created_at timestamptz default now(),
  unique (actor_id, target_id)
);

-- ─────────────────────────────────────────────
-- 5. MATCHES VIEW (mutual right swipe)
-- ─────────────────────────────────────────────
create or replace view matches as
  select
    s1.actor_id  as user1_id,
    s1.target_id as user2_id,
    s1.created_at
  from swipes s1
  join swipes s2
    on s1.actor_id  = s2.target_id
   and s1.target_id = s2.actor_id
   and s2.direction = 'right'
  where s1.direction = 'right';

-- ─────────────────────────────────────────────
-- 6. UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists musician_profiles_updated_at on musician_profiles;
create trigger musician_profiles_updated_at
  before update on musician_profiles
  for each row execute function update_updated_at();

drop trigger if exists band_profiles_updated_at on band_profiles;
create trigger band_profiles_updated_at
  before update on band_profiles
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table musician_profiles enable row level security;
alter table band_profiles      enable row level security;
alter table user_meta          enable row level security;
alter table swipes             enable row level security;

-- musician_profiles: herkes okuyabilir, yalnızca sahibi yazabilir
drop policy if exists "musician_profiles_select" on musician_profiles;
drop policy if exists "musician_profiles_insert" on musician_profiles;
drop policy if exists "musician_profiles_update" on musician_profiles;
drop policy if exists "musician_profiles_delete" on musician_profiles;
create policy "musician_profiles_select" on musician_profiles for select using (true);
create policy "musician_profiles_insert" on musician_profiles for insert with check (auth.uid() = id);
create policy "musician_profiles_update" on musician_profiles for update using (auth.uid() = id);
create policy "musician_profiles_delete" on musician_profiles for delete using (auth.uid() = id);

-- band_profiles: herkes okuyabilir, yalnızca sahibi yazabilir
drop policy if exists "band_profiles_select" on band_profiles;
drop policy if exists "band_profiles_insert" on band_profiles;
drop policy if exists "band_profiles_update" on band_profiles;
drop policy if exists "band_profiles_delete" on band_profiles;
create policy "band_profiles_select" on band_profiles for select using (true);
create policy "band_profiles_insert" on band_profiles for insert with check (auth.uid() = id);
create policy "band_profiles_update" on band_profiles for update using (auth.uid() = id);
create policy "band_profiles_delete" on band_profiles for delete using (auth.uid() = id);

-- user_meta: yalnızca sahibi okur/yazar
drop policy if exists "user_meta_select" on user_meta;
drop policy if exists "user_meta_insert" on user_meta;
drop policy if exists "user_meta_update" on user_meta;
create policy "user_meta_select" on user_meta for select using (auth.uid() = id);
create policy "user_meta_insert" on user_meta for insert with check (auth.uid() = id);
create policy "user_meta_update" on user_meta for update using (auth.uid() = id);

-- swipes: actor kendi swipe'larını yazar, okur
drop policy if exists "swipes_insert" on swipes;
drop policy if exists "swipes_select" on swipes;
create policy "swipes_insert" on swipes for insert with check (auth.uid() = actor_id);
create policy "swipes_select" on swipes for select using (auth.uid() = actor_id or auth.uid() = target_id);

-- ─────────────────────────────────────────────
-- 8. STORAGE BUCKET (avatars)
-- ─────────────────────────────────────────────
-- Supabase Dashboard > Storage > New Bucket:
--   Name: avatars
--   Public: true
--   Allowed MIME types: image/jpeg, image/png, image/webp
--   Max file size: 5MB
