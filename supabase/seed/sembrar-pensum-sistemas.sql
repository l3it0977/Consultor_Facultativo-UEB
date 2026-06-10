-- =============================================================================
-- SEMBRADO: PLAN DE ESTUDIOS (PENSUM) — INGENIERÍA EN SISTEMAS + CONTACTO
-- Fuente: documento "Pensul de materias SISTEMAS".
-- Requiere haber ejecutado antes: sql/02-ampliar-esquema.sql
-- Es seguro re-ejecutarlo (borra y vuelve a cargar las materias de Sistemas).
--
-- NOTA: Algunas siglas del documento venían con errores de digitalización
-- (RS0->RSO, IE1/1E1->IEI, G10232->GIO232). Aquí quedan normalizadas para que
-- los requisitos sean coherentes entre sí.
-- =============================================================================

-- ── MATERIAS ─────────────────────────────────────────────────────────────────
delete from public.materias
where carrera_id = (select id from public.carreras where nombre = 'Ingeniería en Sistemas');

insert into public.materias (carrera_id, semestre, sigla, nombre, creditos, prerequisitos, es_electiva)
select c.id, v.semestre, v.sigla, v.nombre, v.creditos, v.prerequisitos, v.es_electiva
from public.carreras c
cross join (values
  -- Primer semestre (28 CR)
  (1, 'ELT111', 'Medidas Eléctricas y Electrónicas', 5, null, false),
  (1, 'ELT112', 'Análisis de Circuitos I',           5, null, false),
  (1, 'GHE111', 'Estrategias de Aprendizaje y Redacción', 5, null, false),
  (1, 'GOC111', 'El Origen de la Vida',              3, null, false),
  (1, 'INF111', 'Programación I',                    5, null, false),
  (1, 'MAT111', 'Álgebra I',                         5, null, false),

  -- Segundo semestre (34 CR)
  (2, 'FIS111', 'Física I',                          5, null, false),
  (2, 'GLC112', 'Proyecto de Vida',                  4, null, false),
  (2, 'IEI111', 'Taller Eléctrico SIPES I',          5, null, false),
  (2, 'INF112', 'Programación II',                   5, 'INF111', false),
  (2, 'INF113', 'Estructura de Datos I',             5, 'INF111', false),
  (2, 'MAT112', 'Cálculo I',                         5, null, false),
  (2, 'MAT113', 'Álgebra II',                        5, 'MAT111', false),

  -- Tercer semestre (32 CR)
  (3, 'ELT224', 'Electrónica Analógica I',           5, 'ELT112', false),
  (3, 'FIS222', 'Física II',                         5, 'FIS111', false),
  (3, 'GIE221', 'Inglés I',                          4, null, false),
  (3, 'GLC221', 'Relaciones Humanas',                3, null, false),
  (3, 'IEI222', 'Taller Electrónico SIPES II',       5, 'IEI111', false),
  (3, 'INF224', 'Estructuras de Datos II',           5, 'INF113', false),
  (3, 'MAT224', 'Cálculo II',                        5, 'MAT112', false),

  -- Cuarto semestre (35 CR)
  (4, 'FIS223', 'Física III',                        5, 'FIS222', false),
  (4, 'GIE222', 'Inglés II',                         5, 'GIE221', false),
  (4, 'GIO232', 'Idioma Nativo',                     5, null, false),
  (4, 'IEI223', 'Taller de Programación Avanzada SIPES III', 5, 'IEI222', false),
  (4, 'MAT226', 'Ecuaciones Diferenciales',          5, 'MAT224', false),
  (4, 'RSO221', 'Redes I',                           5, 'INF112', false),
  (4, 'SIS221', 'Bases de Datos I',                  5, 'INF224', false),

  -- Quinto semestre (33 CR)
  (5, 'EMP321', 'Contabilidad I',                    5, null, false),
  (5, 'EMP322', 'Administración I',                  5, null, false),
  (5, 'GFE322', 'Ciencia y Fe',                      3, null, false),
  (5, 'MAT325', 'Probabilidades y Estadística',      5, null, false),
  (5, 'RSO322', 'Redes II',                          5, null, false),
  (5, 'SIS322', 'Bases de Datos II',                 5, null, false),
  (5, 'SIS323', 'Sistemas de Información I',         5, null, false),

  -- Sexto semestre (34 CR ; incluye 1 materia electiva a elección)
  (6, 'GEC333', 'Ética Cristiana y Misión Integral', 4, null, false),
  (6, 'IEI334', 'Taller de Desarrollo de Sistemas SIPES IV', 5, null, false),
  (6, 'MAT337', 'Investigación de Operaciones I',    5, null, false),
  (6, 'RSO333', 'Redes III',                         5, null, false),
  (6, 'RSO334', 'Sistemas Operativos I',             5, null, false),
  (6, 'SIS334', 'Sistemas de Información II',        5, null, false),

  -- Séptimo semestre (34 CR ; incluye 1 materia electiva a elección)
  (7, 'GIE431', 'Métodos de Investigación',          5, 'GHE111, IEI334', false),
  (7, 'IEI435', 'Taller de Redes SIPES V',           5, 'IEI334', false),
  (7, 'RSO435', 'Sistemas Operativos II',            5, 'RSO334', false),
  (7, 'RSO436', 'Redes IV',                          5, 'RSO333', false),
  (7, 'TIN431', 'Ingeniería de Software',            5, 'SIS334', false),
  (7, 'TIN432', 'Tecnología Web I',                  4, 'SIS334', false),

  -- Octavo semestre (39 CR)
  (8, 'GIE442', 'Seminario de Grado',                20, 'GIE431', false),
  (8, 'IEI446', 'Taller de Desarrollo de Sistemas Web SIPES VI', 5, 'IEI435', false),
  (8, 'RSO447', 'Seguridad Informática',             5, 'RSO436', false),
  (8, 'TIN443', 'Gestión de Calidad del Software',   5, 'TIN431', false),
  (8, 'TIN444', 'Tecnología Web II',                 4, 'TIN432', false),

  -- Materias electivas (sin semestre fijo)
  (null, 'EMP333', 'Mercadotecnia',                  5, 'EMP322', true),
  (null, 'EMP434', 'Costos I',                       5, 'EMP321', true),
  (null, 'MAT438', 'Investigación de Operaciones II', 5, 'MAT337', true),
  (null, 'OMC111', 'Química General',                5, null, true),
  (null, 'RSO437', 'Auditoría Informática',          5, 'RSO333', true),
  (null, 'RSO448', 'Seguridad en Redes',            5, 'RSO333', true),
  (null, 'TCM434', 'Telecomunicaciones III',         5, 'FIS223', true),
  (null, 'TCM436', 'Telefonía II',                   5, 'MAT325', true)
) as v(semestre, sigla, nombre, creditos, prerequisitos, es_electiva)
where c.nombre = 'Ingeniería en Sistemas';

-- ── CONTACTO (general de la facultad) ────────────────────────────────────────
delete from public.contacto where carrera_id is null;

insert into public.contacto (carrera_id, tipo, detalle) values
  (null, 'Campus UEB',
   'Av. Moscú entre 5to. y 6to Anillo. Tel. 3560990 - 3561197. Fax 3560992. Casilla 4027. Correo: uebmail@ueb.edu.bo'),
  (null, 'Unidad en el Centro',
   'Ingavi esquina Cordillera. Tel. 3396784. Correo: uebcentro@ueb.edu.bo');

-- ── Verificación ─────────────────────────────────────────────────────────────
select
  coalesce(semestre::text, 'Electiva') as semestre,
  sigla, nombre, creditos, prerequisitos
from public.materias
where carrera_id = (select id from public.carreras where nombre = 'Ingeniería en Sistemas')
order by es_electiva, semestre, sigla;
