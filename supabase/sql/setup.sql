-- =============================================================================
-- Configuración de base de datos — Chatbot Facultad de Ingeniería (UEB)
-- Ejecutar en el SQL Editor de Supabase.
-- Si ya tenías tablas anteriores con vectores, este script las elimina primero.
-- =============================================================================

-- Eliminar tablas anteriores (si existen) para empezar limpio
drop table if exists public.secciones_carrera cascade;
drop table if exists public.carreras cascade;
drop table if exists public.documentos_facultad cascade;
drop function if exists public.match_documentos cascade;

-- 1. Tabla principal de carreras
create table public.carreras (
  id   serial primary key,
  nombre   text not null,
  duracion text not null
);

-- 2. Tabla de secciones por carrera (descripción, perfil, formación, etc.)
create table public.secciones_carrera (
  id         serial primary key,
  carrera_id int  not null references public.carreras(id) on delete cascade,
  seccion    text not null,  -- 'descripcion', 'perfil', 'formacion', 'oportunidades'
  contenido  text not null
);

-- 3. Índice para búsquedas por carrera
create index on public.secciones_carrera (carrera_id);

-- 4. Row Level Security: lectura pública
alter table public.carreras         enable row level security;
alter table public.secciones_carrera enable row level security;

create policy "Lectura pública de carreras"
  on public.carreras for select to anon, authenticated using (true);

create policy "Lectura pública de secciones"
  on public.secciones_carrera for select to anon, authenticated using (true);
