-- Focus Submarine Database Schema
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. Users 테이블
-- ============================================
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  nickname text,
  rank text default 'apprentice',
  created_at timestamptz default now(),
  last_synced_at timestamptz default now()
);

-- 2. User Stats 테이블
create table if not exists user_stats (
  user_id uuid primary key references users(id) on delete cascade,
  total_focus_minutes integer default 0,
  completed_sessions integer default 0,
  failed_sessions integer default 0,
  longest_session integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  updated_at timestamptz default now()
);

-- 3. Voyages 테이블 (잠항 기록)
create table if not exists voyages (
  id text primary key,
  user_id uuid references users(id) on delete cascade,
  departure_port text not null,
  arrival_port text not null,
  duration integer not null,
  distance integer not null,
  cabin_number text,
  focus_purpose text,
  completed_at timestamptz not null,
  created_at timestamptz default now()
);

-- 4. Daily Goals 테이블
create table if not exists daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  goal_minutes integer default 60,
  achieved_minutes integer default 0,
  unique(user_id, date)
);

-- 5. User Achievements 테이블
create table if not exists user_achievements (
  user_id uuid references users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

-- 6. Visited Ports 테이블
create table if not exists visited_ports (
  user_id uuid references users(id) on delete cascade,
  port_id text not null,
  first_visited_at timestamptz default now(),
  visit_count integer default 1,
  primary key (user_id, port_id)
);

-- 7. Analytics Events 테이블 (이벤트 트래킹)
create table if not exists analytics_events (
  id bigserial primary key,
  user_id uuid references users(id) on delete set null,
  event_type text not null,
  event_data jsonb default '{}',
  session_id text,
  created_at timestamptz default now()
);

-- ============================================
-- 인덱스
-- ============================================
create index if not exists idx_voyages_user_id on voyages(user_id);
create index if not exists idx_voyages_completed_at on voyages(completed_at);
create index if not exists idx_daily_goals_user_date on daily_goals(user_id, date);
create index if not exists idx_events_type on analytics_events(event_type);
create index if not exists idx_events_created on analytics_events(created_at);
create index if not exists idx_events_user on analytics_events(user_id);

-- ============================================
-- 어드민 체크 함수
-- ============================================
create or replace function public.is_admin()
returns boolean as $$
begin
  return (select email from auth.users where id = auth.uid()) in ('k01077679687@gmail.com', 'kingapple1369@gmail.com');
end;
$$ language plpgsql security definer;

-- ============================================
-- RLS (Row Level Security)
-- ============================================
alter table users enable row level security;
alter table user_stats enable row level security;
alter table voyages enable row level security;
alter table daily_goals enable row level security;
alter table user_achievements enable row level security;
alter table visited_ports enable row level security;
alter table analytics_events enable row level security;

-- users
create policy "Users can view own data" on users
  for select using (auth.uid() = id or public.is_admin());
create policy "Users can update own data" on users
  for update using (auth.uid() = id);
create policy "Users can insert own data" on users
  for insert with check (auth.uid() = id);

-- user_stats
create policy "Users can manage own stats" on user_stats
  for all using (auth.uid() = user_id or public.is_admin());

-- voyages
create policy "Users can manage own voyages" on voyages
  for all using (auth.uid() = user_id or public.is_admin());

-- daily_goals
create policy "Users can manage own daily goals" on daily_goals
  for all using (auth.uid() = user_id or public.is_admin());

-- user_achievements
create policy "Users can manage own achievements" on user_achievements
  for all using (auth.uid() = user_id or public.is_admin());

-- visited_ports
create policy "Users can manage own visited ports" on visited_ports
  for all using (auth.uid() = user_id or public.is_admin());

-- analytics_events (select: 어드민만, insert: service role key로 API route에서 처리)
create policy "Admin can read all events" on analytics_events
  for select using (public.is_admin());

-- ============================================
-- 트리거: 새 사용자 생성 시 자동으로 users + user_stats 생성
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nickname)
  values (new.id, new.email, new.raw_user_meta_data->>'nickname');

  insert into public.user_stats (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
