-- =============================================================================
-- SEMBRADO: INFORMACIÓN DE CARRERAS (objetivo, perfil profesional, modelo)
-- Fuente: documento "Informacion Carreras".
-- Añade NUEVAS secciones a la tabla secciones_carrera (no toca las existentes).
-- Ejecutar DESPUÉS de sembrar-carreras.sql. Es seguro re-ejecutarlo.
-- =============================================================================

-- Borra solo las secciones que crea este script (para poder re-ejecutar sin duplicar).
delete from public.secciones_carrera
where seccion in ('modelo_educativo', 'objetivo', 'perfil_profesional');

-- ─────────────────────────────────────────────
-- INGENIERÍA EN SISTEMAS
-- ─────────────────────────────────────────────
insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'modelo_educativo',
  'La carrera de Ingeniería de Sistemas cuenta con un plan de estudio de 4 años y un renovado modelo '
  'educativo enfocado en tres aspectos principales: lo profesional, lo personal y lo productivo '
  '(Sistema de formación "Triple P"). Este enfoque permite al estudiante estar capacitado para '
  'enfrentarse al mundo laboral.'
from public.carreras where nombre = 'Ingeniería en Sistemas';

insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'objetivo',
  'Objetivo de la carrera de Ingeniería de Sistemas: preparar al estudiante en el campo de la '
  'informática, tanto en software como en hardware, proporcionándole conocimientos teóricos y '
  'prácticos en sus diferentes ramas, como proyectos de sistemas computacionales, circuitos '
  'analógicos y digitales, sistemas con microprocesadores y computadores digitales, y el diseño e '
  'implementación de redes y microelectrónica.'
from public.carreras where nombre = 'Ingeniería en Sistemas';

insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'perfil_profesional',
  'Perfil profesional de Ingeniería de Sistemas: formar ingenieros de sistemas capaces de diseñar, '
  'implementar y administrar aplicaciones y productos en el área de la Tecnología de la Información y '
  'las Comunicaciones, aplicando métodos y técnicas propias de la ingeniería de un modo integral y justo.'
from public.carreras where nombre = 'Ingeniería en Sistemas';

-- ─────────────────────────────────────────────
-- INGENIERÍA ELECTRÓNICA
-- ─────────────────────────────────────────────
insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'modelo_educativo',
  'La carrera de Ingeniería Electrónica cuenta con un plan de estudio de 4 años y un renovado modelo '
  'educativo enfocado en tres aspectos principales: lo profesional, lo personal y lo productivo '
  '(Sistema de formación "Triple P"). Este enfoque permite al estudiante estar capacitado para '
  'enfrentarse al mundo laboral.'
from public.carreras where nombre = 'Ingeniería Electrónica';

insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'objetivo',
  'Objetivo de la carrera de Ingeniería Electrónica: preparar al estudiante en el campo de la '
  'electrónica, proporcionándole conocimientos teóricos y prácticos en áreas como electrónica '
  '(analógica, digital, microprocesada, microcontrolada), redes, automatización y telecomunicaciones, '
  'para desarrollar sistemas de ingeniería y aplicar la tecnología existente, comprometido con el '
  'medio, con capacidad de investigación e innovación al servicio de un conocimiento productivo que '
  'genere empleos y posibilite el desarrollo social del país.'
from public.carreras where nombre = 'Ingeniería Electrónica';

insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'perfil_profesional',
  'Perfil profesional de Ingeniería Electrónica: el ingeniero electrónico de la UEB es un profesional '
  'líder y competitivo, habilitado científica y tecnológicamente para diseñar, innovar, desarrollar, '
  'proyectar y aplicar sistemas y circuitos electrónicos diversos en redes, telecomunicaciones, '
  'automatización y control, manteniendo siempre altos niveles de calidad para elevar la '
  'productividad y competitividad de las empresas y el bienestar de la sociedad, consciente de '
  'principios y valores bíblicamente fundamentados y comprometido con el desarrollo de su país y región.'
from public.carreras where nombre = 'Ingeniería Electrónica';

-- ─────────────────────────────────────────────
-- INGENIERÍA ELECTROMECÁNICA
-- ─────────────────────────────────────────────
insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'modelo_educativo',
  'La carrera de Ingeniería Electromecánica cuenta con un plan de estudio de 4 años y un renovado '
  'modelo educativo enfocado en tres aspectos principales: lo profesional, lo personal y lo '
  'productivo (Sistema de formación "Triple P"). Este enfoque permite al estudiante estar capacitado '
  'para enfrentarse al mundo laboral.'
from public.carreras where nombre = 'Ingeniería Electromecánica';

insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'objetivo',
  'Objetivo de la carrera de Ingeniería Electromecánica: formar ingenieros electromecánicos con '
  'principios, valores y sólidos conocimientos en el diseño, desarrollo, implementación y '
  'mantenimiento de sistemas y dispositivos electromecánicos, comprometidos con la investigación, '
  'el desarrollo y la innovación tecnológica de la comunidad y el país.'
from public.carreras where nombre = 'Ingeniería Electromecánica';

insert into public.secciones_carrera (carrera_id, seccion, contenido)
select id, 'perfil_profesional',
  'Perfil profesional de Ingeniería Electromecánica: ingenieros capaces de diseñar, desarrollar, '
  'implementar y mantener sistemas y dispositivos mecánicos controlados o accionados por corrientes '
  'eléctricas, aplicando métodos y técnicas propias de la ingeniería de un modo integral y justo.'
from public.carreras where nombre = 'Ingeniería Electromecánica';

-- Verificación
select c.nombre as carrera, s.seccion, left(s.contenido, 70) as preview
from public.secciones_carrera s
join public.carreras c on c.id = s.carrera_id
where s.seccion in ('modelo_educativo', 'objetivo', 'perfil_profesional')
order by c.id, s.seccion;
