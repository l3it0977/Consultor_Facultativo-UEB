-- =============================================================================
-- SEMBRADO DE CARRERAS — Facultad de Ingeniería (UEB)
-- Sin vectores. Solo INSERT normales.
-- Pega este script en el SQL Editor de Supabase DESPUÉS de ejecutar setup.sql
-- =============================================================================

-- Limpiar datos anteriores (el cascade borra también las secciones)
truncate public.carreras restart identity cascade;

-- ─────────────────────────────────────────────
-- INGENIERÍA EN SISTEMAS
-- ─────────────────────────────────────────────
insert into public.carreras (nombre, duracion) values
  ('Ingeniería en Sistemas', '4 años y medio');

insert into public.secciones_carrera (carrera_id, seccion, contenido) values
  (1, 'descripcion',
   'Ingeniería en Sistemas - Construyendo soluciones tecnológicas para un mundo conectado. '
   'Áreas de Desempeño Profesional: '
   'Desarrollo de Software: creación de aplicaciones personalizadas para empresas y usuarios finales. '
   'Administración de Sistemas y Redes: configuración y mantenimiento de infraestructuras TI. '
   'Big Data y Análisis de Datos: interpretación y gestión de grandes volúmenes de información para la toma de decisiones estratégicas. '
   'Ciberseguridad: implementación de políticas y sistemas de protección contra ciberataques. '
   'Emprendimiento Tecnológico: creación de startups en tecnología, desarrollo de software y soluciones innovadoras. '
   'Consultoría Tecnológica: asesoría en diseño, optimización y automatización de procesos empresariales.'),

  (1, 'perfil',
   'La Ingeniería en Sistemas prepara a profesionales capaces de diseñar, desarrollar e implementar soluciones tecnológicas '
   'innovadoras combinando fundamentos de programación, inteligencia artificial, redes, seguridad informática y gestión de proyectos. '
   'Un ingeniero en sistemas es competente para: '
   'Desarrollar software de alta calidad para aplicaciones móviles, web y empresariales. '
   'Diseñar y gestionar bases de datos avanzadas, garantizando la seguridad y el análisis de datos. '
   'Implementar y administrar redes de comunicación seguras y escalables. '
   'Aplicar inteligencia artificial y aprendizaje automático en soluciones prácticas. '
   'Diseñar sistemas de ciberseguridad para proteger infraestructuras digitales. '
   'Liderar proyectos tecnológicos adaptados a las necesidades del mercado global.'),

  (1, 'formacion',
   'Áreas de Formación de Ingeniería en Sistemas: '
   'Desarrollo de Software: programación avanzada, diseño de interfaces y desarrollo de aplicaciones móviles, web y empresariales. '
   'Inteligencia Artificial y Big Data: aplicación de algoritmos inteligentes y análisis de datos masivos para resolver problemas complejos. '
   'Redes y Telecomunicaciones: diseño, configuración y mantenimiento de redes seguras y de alto rendimiento. '
   'Ciberseguridad: implementación de estrategias para proteger sistemas y datos ante amenazas informáticas. '
   'Gestión de Proyectos Tecnológicos: liderazgo, planificación y ejecución de proyectos TI con metodologías ágiles y estándares internacionales. '
   'Sistemas Embebidos e Internet de las Cosas (IoT): diseño de dispositivos conectados y su integración en soluciones tecnológicas.');

-- ─────────────────────────────────────────────
-- INGENIERÍA ELECTRÓNICA
-- ─────────────────────────────────────────────
insert into public.carreras (nombre, duracion) values
  ('Ingeniería Electrónica', '4 años');

insert into public.secciones_carrera (carrera_id, seccion, contenido) values
  (2, 'descripcion',
   'Ingeniería Electrónica - Innovación y compromiso que transforman el futuro tecnológico de nuestra región. '
   'Plan de Estudios Básico: Fundamentos de Electrónica, Sistemas de Telecomunicaciones, Automatización y Control, '
   'Microprocesadores y Microcontroladores, Instalaciones Eléctricas, Redes y Conectividad, Innovación y Proyectos Tecnológicos.'),

  (2, 'oportunidades',
   'Oportunidades Laborales de Ingeniería Electrónica: '
   'Industria Automotriz: automatización de procesos. '
   'Telecomunicaciones: redes móviles y fijas. '
   'Energía: instalaciones eléctricas industriales. '
   'Tecnología y Desarrollo: innovación y diseño de dispositivos. '
   'Consultoría Técnica: asesoría en sistemas electrónicos. '
   'Automatización Industrial: integración de sistemas PLC. '
   'Formamos profesionales capaces de liderar el desarrollo tecnológico en áreas como automatización, '
   'nanoelectrónica, telecomunicaciones, electromedicina y más.'),

  (2, 'formacion',
   'Áreas de Formación de Ingeniería Electrónica: '
   'Sistemas Electrónicos y Circuitos: diseño y construcción de circuitos analógicos y digitales, procesamiento de señales y lógica programable. '
   'Instalaciones Eléctricas: planificación y ejecución de instalaciones de baja tensión enfocadas en seguridad y eficiencia. '
   'Automatización y Control Industrial: creación y gestión de sistemas automatizados con tecnologías 4.0. '
   'Telecomunicaciones y Redes: diseño de redes de comunicación digital, fibra óptica y sistemas satelitales. '
   'Microprocesadores y Microcontroladores: programación y desarrollo de soluciones tecnológicas personalizadas. '
   'Redes Ópticas y Satelitales: implementación y gestión de redes avanzadas de comunicación. '
   'Innovación Tecnológica: desarrollo de soluciones sostenibles y adaptadas al mercado global.');

-- ─────────────────────────────────────────────
-- INGENIERÍA ELECTROMECÁNICA
-- ─────────────────────────────────────────────
insert into public.carreras (nombre, duracion) values
  ('Ingeniería Electromecánica', '4 años y medio');

insert into public.secciones_carrera (carrera_id, seccion, contenido) values
  (3, 'descripcion',
   'Ingeniería Electromecánica - La carrera combina ingeniería eléctrica, mecánica y automatización. '
   'Áreas de Desempeño Profesional: '
   'Industria Manufacturera: optimización de procesos y adopción de tecnologías como IoT y robótica industrial. '
   'Energía y Recursos Naturales: instalación y mantenimiento de sistemas renovables como solar y eólica. '
   'Automatización y Robótica Industrial: diseño y gestión de sistemas automatizados en minería, manufactura y alimentos. '
   'Construcción e Infraestructura: sistemas de climatización, electricidad y agua para grandes proyectos. '
   'Transporte y Logística: mantenimiento de vehículos eléctricos y optimización de sistemas logísticos automatizados. '
   'Emprendimiento: creación de empresas de diseño y mantenimiento de sistemas electromecánicos.'),

  (3, 'perfil',
   'El ingeniero electromecánico será capaz de: '
   'Diseñar maquinaria industrial integrando sistemas eléctricos, hidráulicos, electro-neumáticos y automatización. '
   'Implementar sistemas SCADA y soluciones de Industria 4.0. '
   'Diseñar y gestionar redes eléctricas en edificios e industrias. '
   'Desarrollar y mantener sistemas de refrigeración industrial y comercial. '
   'Construir y programar robots industriales. '
   'Optimizar procesos en mecánica automotriz y equipos pesados.'),

  (3, 'formacion',
   'Áreas de Formación de Ingeniería Electromecánica: '
   'Electrónica y Sistemas de Control: diseño y control de sistemas electromecánicos con énfasis en automatización industrial. '
   'Mecánica y Diseño Industrial: creación y mantenimiento de maquinaria y sistemas mecánicos mediante herramientas CAD y simulación. '
   'Automatización y Robótica: programación de controladores lógicos y diseño de robots para procesos industriales avanzados. '
   'Sistemas Eléctricos: diseño e implementación de redes eléctricas de media y alta tensión, cumpliendo normas internacionales. '
   'Gestión de Proyectos y Calidad: liderazgo, aseguramiento de calidad y gestión eficiente de proyectos multidisciplinarios.');

-- ─────────────────────────────────────────────
-- Verificación: muestra lo que se insertó
-- ─────────────────────────────────────────────
select
  c.nombre as carrera,
  c.duracion,
  s.seccion,
  left(s.contenido, 80) as preview
from public.secciones_carrera s
join public.carreras c on c.id = s.carrera_id
order by c.id, s.id;
