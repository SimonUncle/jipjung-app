-- Focus Voyage Database Schema
-- Supabase SQL Editor에서 실행하세요

-- 1. Users 테이블
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  nickname text,
  rank text default 'apprentice', -- 선원 등급: apprentice, sailor, navigator, captain, admiral
  created_at timestamptz default now()
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
  last_active_date date
);

-- 3. Voyages 테이블 (항해 기록)
create table if not exists voyages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  departure_port text not null,
  arrival_port text not null,
  duration integer not null, -- 분
  distance integer not null, -- km
  cabin_number text,
  focus_purpose text,
  completed_at timestamptz default now()
);

-- 4. Daily Goals 테이블 (일일 목표)
create table if not exists daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  goal_minutes integer default 60,
  achieved_minutes integer default 0,
  unique(user_id, date)
);

-- 5. User Achievements 테이블 (달성 업적)
create table if not exists user_achievements (
  user_id uuid references users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

-- 6. Visited Ports 테이블 (방문 항구)
create table if not exists visited_ports (
  user_id uuid references users(id) on delete cascade,
  port_id text not null,
  first_visited_at timestamptz default now(),
  visit_count integer default 1,
  primary key (user_id, port_id)
);

-- 인덱스 추가 (성능 최적화)
create index if not exists idx_voyages_user_id on voyages(user_id);
create index if not exists idx_voyages_completed_at on voyages(completed_at);
create index if not exists idx_daily_goals_user_date on daily_goals(user_id, date);

-- RLS (Row Level Security) 활성화
alter table users enable row level security;
alter table user_stats enable row level security;
alter table voyages enable row level security;
alter table daily_goals enable row level security;
alter table user_achievements enable row level security;
alter table visited_ports enable row level security;

-- RLS 정책: 사용자는 자신의 데이터만 접근 가능
create policy "Users can view own data" on users
  for select using (auth.uid() = id);

create policy "Users can update own data" on users
  for update using (auth.uid() = id);

create policy "Users can view own stats" on user_stats
  for all using (auth.uid() = user_id);

create policy "Users can manage own voyages" on voyages
  for all using (auth.uid() = user_id);

create policy "Users can manage own daily goals" on daily_goals
  for all using (auth.uid() = user_id);

create policy "Users can manage own achievements" on user_achievements
  for all using (auth.uid() = user_id);

create policy "Users can manage own visited ports" on visited_ports
  for all using (auth.uid() = user_id);

-- 함수: 새 사용자 생성 시 자동으로 stats 레코드 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  insert into public.user_stats (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- 트리거: auth.users에 새 사용자 생성 시 실행
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
