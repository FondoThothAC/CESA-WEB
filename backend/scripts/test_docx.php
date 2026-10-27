<?php
// Test standalone de DocxGenerator - genera los 3 documentos con datos de muestra
require_once __DIR__ . '/../lib/DocxGenerator.php';

$fecha = ['dia' => '31', 'mes' => 'agosto', 'anio' => '2026'];

// FP1
$fp1 = DocxGenerator::build('FP1.docx', [
    'departamento' => 'Economía',
    'dia' => $fecha['dia'], 'mes' => $fecha['mes'], 'anio' => $fecha['anio'],
    'razon_social' => 'Instituto Sonorense de Cultura (ISC)',
    'rfc' => 'ISC881226FM5',
    'nombre_programa' => 'Apoyo a la Gestión, Vinculación y Promoción de Programas y Eventos Culturales',
    'areas_departamento' => 'Departamento de Información y Difusión Cultural',
    'licenciatura_target' => 'Negocios y Comercio Internacional',
    'perfil_deseado_multiline' => "Capacidad de análisis y organización\nManejo de herramientas informáticas\nTrabajo en equipo",
    'num_practicantes' => '5',
    'justificacion' => 'El ISC desarrolla programas y festivales que requieren apoyo en planeación y logística.',
    'objetivo' => 'Aplicar conocimientos mediante participación en actividades de planeación y promoción.',
    'plan_trabajo_multiline' => "Apoyo en la organización y logística de eventos culturales\nElaboración de bases de datos\nReportes ejecutivos e indicadores",
    'apoyo_beca' => '________', 'apoyo_comida' => '________', 'apoyo_transporte' => '________',
    'apoyo_equipo' => '________', 'apoyo_otro' => '____________', 'apoyo_ninguno' => 'X',
    'responsable_nombre' => 'Juan Alberto Pérez Durazo',
    'responsable_puesto' => 'Jefe del Departamento de Información y Difusión Cultural',
    'responsable_email' => 'jperez@isc.gob.mx', 'telefono' => '6621910154',
], ['perfil_deseado_multiline', 'plan_trabajo_multiline']);
file_put_contents('/tmp/test_FP1.docx', $fp1);

// FP2
$fp2 = DocxGenerator::build('FP2.docx', [
    'departamento' => 'Economía',
    'dia' => $fecha['dia'], 'mes' => $fecha['mes'], 'anio' => $fecha['anio'],
    'alumno_nombre' => 'Roberto Eduardo Celis Robles',
    'alumno_programa' => 'Licenciatura en Negocios y Comercio Internacionales',
    'alumno_expediente' => '213203453', 'alumno_telefono' => '6621703600',
    'alumno_email' => 'a213203453@unison.mx', 'alumno_creditos' => '255',
    'check_imss' => 'X', 'check_isste' => '', 'check_issteson' => '', 'seguro_otro' => '',
    'seguro_num' => '10169424073', 'opcion_elegida' => 'BANCO DE PROYECTOS',
    'disponibilidad_horario' => '9 AM a 12 PM',
    'razon_social' => 'Instituto Sonorense de Cultura', 'giro_sector' => 'Organismo Público Descentralizado',
    'domicilio' => 'Blvd. Agustín de Vildósola s/n, col. Villa de Seris', 'ciudad' => 'Hermosillo',
    'cp' => '83000', 'telefono' => '(662) 135-1127',
    'responsable_nombre' => 'Carolina Ferrá Peralta', 'responsable_puesto' => 'Coordinadora de Casas de la Cultura',
    'responsable_email' => 'difusion@isc.gob.mx',
    'nombre_programa' => 'Apoyo a la Gestión, Vinculación y Promoción de Programas Culturales',
    'objetivo' => 'Participar en actividades de planeación, organización y evaluación de programas culturales.',
    'horario_acordado' => 'De 9:00 am a 12:00 pm, lunes a viernes',
    'tutor_no_empleado' => '34737', 'tutor_nombre' => 'Marisol Arvizu Armenta', 'tutor_fecha' => '31/08/2026',
]);
file_put_contents('/tmp/test_FP2.docx', $fp2);

// CARTA_TUTOR
$carta = DocxGenerator::build('CARTA_TUTOR.docx', [
    'ciudad_departamento' => 'Hermosillo',
    'dia_carta' => '1', 'mes_carta' => 'septiembre', 'anio_carta' => '2026',
    'responsable_nombre' => 'Carolina Ferrá Peralta', 'responsable_puesto' => 'Coordinadora de Casas de la Cultura',
    'razon_social' => 'Instituto Sonorense de Cultura',
    'alumno_nombre' => 'Roberto Eduardo Celis Robles', 'alumno_expediente' => '213203453',
    'seguro_tipo' => 'IMSS', 'seguro_num' => '10169424073',
    'tipo_programa_texto' => 'Prácticas Profesionales',
    'alumno_programa' => 'Licenciatura en Negocios y Comercio Internacionales',
    'nombre_programa' => 'Apoyo a la Gestión, Vinculación y Promoción de Programas Culturales del ISC',
    'labores_auxiliar' => 'gestión y promoción cultural',
    'tutor_titulo' => 'Dra.', 'tutor_nombre' => 'Marisol Arvizu Armenta',
    'tutor_telefono' => '259-22-13', 'tutor_email' => 'marisol.armenta@unison.mx',
    'jefe_departamento' => 'Dra. Lizbeth Salgado Beltrán',
]);
file_put_contents('/tmp/test_CARTA_TUTOR.docx', $carta);

echo "Generados: " . strlen($fp1) . ", " . strlen($fp2) . ", " . strlen($carta) . " bytes\n";

// FPP3
$fpp3 = DocxGenerator::build('FPP3.docx', [
    'departamento' => 'Economía',
    'periodo_del_dia' => '01', 'periodo_del_mes' => 'septiembre', 'periodo_del_anio' => '26',
    'periodo_al_dia' => '31', 'periodo_al_mes' => 'octubre', 'periodo_al_anio' => '26',
    'horas_realizadas' => '240', 'horas_total' => '480', 'avance_pct' => '50',
    'alumno_nombre' => 'Roberto Eduardo Celis Robles', 'alumno_expediente' => '213203453',
    'alumno_programa' => 'Licenciatura en Negocios y Comercio Internacionales',
    'nombre_programa' => 'Apoyo a la Gestión Cultural del ISC', 'razon_social' => 'Instituto Sonorense de Cultura',
    'responsable_datos' => 'Carolina Ferrá Peralta / Coordinadora de Casas de la Cultura',
    'telefono' => '(662) 135-1127', 'telefono_ext' => '101', 'celular' => '6621703600',
    'descripcion_actividades_multiline' => "Organización de eventos culturales\nGestión de bases de datos de artistas\nApoyo en difusión del FAOT",
    'observaciones' => '',
], ['descripcion_actividades_multiline']);
file_put_contents('/tmp/test_FPP3.docx', $fpp3);

// FPP4
$fpp4 = DocxGenerator::build('FPP4.docx', [
    'departamento' => 'Economía',
    'periodo_del_dia' => '01', 'periodo_del_mes' => 'septiembre', 'periodo_del_anio' => '26',
    'periodo_al_dia' => '28', 'periodo_al_mes' => 'febrero', 'periodo_al_anio' => '27',
    'horas_realizadas' => '480', 'horas_total' => '480', 'avance_pct' => '100',
    'alumno_nombre' => 'Roberto Eduardo Celis Robles', 'alumno_expediente' => '213203453',
    'alumno_programa' => 'Licenciatura en Negocios y Comercio Internacionales',
    'nombre_programa' => 'Apoyo a la Gestión Cultural del ISC', 'razon_social' => 'Instituto Sonorense de Cultura',
    'responsable_datos' => 'Carolina Ferrá Peralta / Coordinadora', 'telefono' => '(662) 135-1127',
    'telefono_ext' => '101', 'celular' => '6621703600',
    'descripcion_actividades_multiline' => '', 'retroalimentacion_tutor' => '', 'observaciones' => '',
], []);
file_put_contents('/tmp/test_FPP4.docx', $fpp4);

// FPP5
$fpp5 = DocxGenerator::build('FPP5.docx', [
    'departamento' => 'Economía', 'dia_baja' => '4', 'mes_baja' => 'septiembre', 'anio_baja' => '26',
    'alumno_programa' => 'Negocios y Comercio Internacionales',
    'alumno_nombre' => 'Roberto Eduardo Celis Robles', 'alumno_expediente' => '213203453',
    'marca_temporal' => 'X', 'marca_definitiva' => '  ',
    'nombre_programa' => 'Apoyo a la Gestión Cultural del ISC', 'razon_social' => 'Instituto Sonorense de Cultura',
    'motivos_baja_multiline' => "Cambio de residencia\nCarga académica",
], ['motivos_baja_multiline']);
file_put_contents('/tmp/test_FPP5.docx', $fpp5);

echo " + FPP3/4/5: " . strlen($fpp3) . ", " . strlen($fpp4) . ", " . strlen($fpp5) . " bytes\n";
