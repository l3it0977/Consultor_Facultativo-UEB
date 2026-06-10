-- =============================================================================
-- AMPLIACIÓN DEL ESQUEMA — Chatbot Facultad de Ingeniería (UEB)
-- Añade tablas estructuradas para el plan de estudios (materias) y el contacto.
-- NO borra nada de lo que ya tienes (carreras / secciones_carrera).
-- Ejecutar en el SQL Editor de Supabase. Es seguro re-ejecutarlo.
-- Orden recomendado:
--   1) sql/setup.sql                 (ya ejecutado)
--   2) seed/sembrar-carreras.sql     (ya ejecutado)
--   3) sql/02-ampliar-esquema.sql    <-- ESTE
--   4) seed/sembrar-info-carreras.sql
--   5) seed/sembrar-pensum-sistemas.sql
-- =============================================================================

-- 1. Materias (plan de estudios / pensum) por carrera ─────────────────────────
create table if not exists public.materias (
  id            serial primary key,
  carrera_id    int  not null references public.carreras(id) on delete cascade,
  semestre      int,                         -- 1..8 ; NULL = materia electiva
  sigla         text not null,               -- ej. 'INF111'
  nombre        text not null,               -- ej. 'Programación I'
  creditos      int  not null,
  prerequisitos text,                        -- texto libre: 'INF111' o 'GHE111, IE1334'
  es_electiva   boolean not null default false
);

create index if not exists materias_carrera_idx  on public.materias (carrera_id);
create index if not exists materias_semestre_idx  on public.materias (semestre);

-- 2. Contacto (campus, unidad en el centro, etc.) ─────────────────────────────
--    carrera_id NULL = contacto general de la facultad.
create table if not exists public.contacto (
  id         serial primary key,
  carrera_id int references public.carreras(id) on delete cascade,
  tipo       text not null,                  -- 'Campus UEB', 'Unidad en el Centro'
  detalle    text not null
);

-- 3. Row Level Security: lectura pública (igual que las demás tablas) ──────────
alter table public.materias enable row level security;
alter table public.contacto enable row level security;

drop policy if exists "Lectura pública de materias" on public.materias;
create policy "Lectura pública de materias"
  on public.materias for select to anon, authenticated using (true);

drop policy if exists "Lectura pública de contacto" on public.contacto;
create policy "Lectura pública de contacto"
  on public.contacto for select to anon, authenticated using (true);
