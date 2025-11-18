-- Tabelas baseadas no CSV "BD.csv" como seed inicial
-- Colunas esperadas no CSV:
-- "Setor Executor","EIXO","ITEM","SUBITEM","DEADLINE","Pontos Aplicáveis 2025"

create extension if not exists pgcrypto;

create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  setor_executor text not null,
  eixo text not null,
  item text not null,
  subitem text not null,
  deadline date,
  pontos numeric not null default 0,
  created_at timestamp with time zone default now()
);

-- status: 'pendente' | 'em_andamento' | 'concluido'
create type if not exists public.status_enum as enum ('pendente','em_andamento','concluido');

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  status public.status_enum not null default 'pendente',
  evidencia_url text,
  observacoes text,
  updated_at timestamp with time zone default now(),
  unique (requirement_id)
);

create index if not exists idx_requirements_setor on public.requirements (setor_executor);
create index if not exists idx_requirements_eixo on public.requirements (eixo);
create index if not exists idx_updates_requirement on public.updates (requirement_id);
