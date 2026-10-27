#!/usr/bin/env python3
"""Genera los templates FP1.docx, FP2.docx y CARTA_TUTOR.docx para CESA-WEB.
Basados en los formatos oficiales UNISON de /Documents/UNISON (FP1, FP2, Carta Tutor).
Tokens en formato {{campo}} para sustitución por backend/api/documentos.php."""
import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

OUT = os.path.dirname(os.path.abspath(__file__))

def base_doc():
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = 'Times New Roman'
    style.font.size = Pt(11)
    return doc

def label_line(doc, label, value, bold_label=True):
    """Párrafo: LABEL: {{token}}"""
    p = doc.add_paragraph()
    r1 = p.add_run(label)
    r1.bold = bold_label
    p.add_run(value)
    return p

def bullet(doc, text):
    doc.add_paragraph(text, style='List Bullet')

# ==============================================================
# FP1 - SOLICITUD DE ESTUDIANTES DE LA UNIDAD RECEPTORA
# ==============================================================
doc = base_doc()
h = doc.add_paragraph()
r = h.add_run('DEPARTAMENTO: {{departamento}}')
r.bold = True
h2 = doc.add_paragraph()
r = h2.add_run('DIRECCIÓN ADMINISTRATIVA DEL CAMPUS HERMOSILLO')
r.bold = True

p = doc.add_paragraph()
p.add_run('A {{dia}} de {{mes}} de {{anio}}.')

t = doc.add_paragraph()
t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('SOLICITUD DE ESTUDIANTES DE LA UNIDAD RECEPTORA\nPARA PRÁCTICAS PROFESIONALES')
r.bold = True

sec = doc.add_paragraph()
r = sec.add_run('\u2022 UNIDAD RECEPTORA:')
r.bold = True
label_line(doc, 'Nombre: ', '{{razon_social}}')
label_line(doc, 'R.F.C.: ', '{{rfc}}')

sec = doc.add_paragraph()
r = sec.add_run('\u2022 DATOS DEL PROGRAMA/PROYECTO:')
r.bold = True
label_line(doc, 'Nombre del programa/Proyecto: ', '{{nombre_programa}}')
label_line(doc, 'Área o Departamento donde se requieren practicantes: ', '{{areas_departamento}}')

sec = doc.add_paragraph()
r = sec.add_run('\u2022 CARACTERÍSTICAS DEL PRACTICANTE(S):')
r.bold = True
label_line(doc, 'Licenciatura: ', '{{licenciatura_target}}')
label_line(doc, 'Perfil deseado: ', '')
doc.add_paragraph('{{perfil_deseado_multiline}}')
label_line(doc, 'Número de practicantes solicitados: ', '{{num_practicantes}}')

sec = doc.add_paragraph()
r = sec.add_run('\u2022 JUSTIFICACIÓN DEL PROGRAMA/PROYECTO:')
r.bold = True
doc.add_paragraph('{{justificacion}}')

sec = doc.add_paragraph()
r = sec.add_run('\u2022 OBJETIVO DEL PROGRAMA/PROYECTO:')
r.bold = True
doc.add_paragraph('{{objetivo}}')

sec = doc.add_paragraph()
r = sec.add_run('\u2022 PLAN DE TRABAJO:')
r.bold = True
doc.add_paragraph('{{plan_trabajo_multiline}}')

sec = doc.add_paragraph()
r = sec.add_run('\u2022 APOYOS:')
r.bold = True
p = doc.add_paragraph()
p.add_run('Beca: {{apoyo_beca}}   Comida: {{apoyo_comida}}   Transporte: {{apoyo_transporte}}   Equipo de seguridad: {{apoyo_equipo}}')
p = doc.add_paragraph()
p.add_run('Otro: {{apoyo_otro}}   Ninguno: {{apoyo_ninguno}}')

doc.add_paragraph()
p = doc.add_paragraph()
r = p.add_run('_______________________________')
p.alignment = WD_ALIGN_PARAGRAPH.LEFT
p = doc.add_paragraph('{{responsable_nombre}}')
p = doc.add_paragraph('{{responsable_puesto}}')
p = doc.add_paragraph('{{razon_social}}')
p = doc.add_paragraph('{{responsable_email}}')
p = doc.add_paragraph('{{telefono}}')

doc.add_paragraph()
p = doc.add_paragraph()
r = p.add_run('Original: Coordinación/responsable de Prácticas Profesionales del programa educativo.\nCopia: Unidad Receptora')
r.font.size = Pt(9)

doc.save(os.path.join(OUT, 'FP1.docx'))

# ==============================================================
# FP2 - SOLICITUD DE INSCRIPCIÓN
# ==============================================================
doc = base_doc()
h = doc.add_paragraph()
r = h.add_run('DEPARTAMENTO: {{departamento}}')
r.bold = True
h2 = doc.add_paragraph()
r = h2.add_run('DIRECCIÓN ADMINISTRATIVA DEL CAMPUS HERMOSILLO')
r.bold = True

p = doc.add_paragraph('A {{dia}} de {{mes}} de {{anio}}.')

t = doc.add_paragraph()
t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('SOLICITUD DE INSCRIPCIÓN A PRÁCTICAS PROFESIONALES')
r.bold = True

label_line(doc, 'NOMBRE DEL ALUMNO: ', '{{alumno_nombre}}')
label_line(doc, 'PROGRAMA ACADÉMICO: ', '{{alumno_programa}}')
label_line(doc, 'EXPEDIENTE: ', '{{alumno_expediente}}')
p = doc.add_paragraph()
r = p.add_run(' TELÉFONO: ')
r.bold = True
p.add_run('{{alumno_telefono}}')
label_line(doc, 'EMAIL: ', '{{alumno_email}}')
p = doc.add_paragraph()
r = p.add_run(' CREDITOS CURSADOS: ')
r.bold = True
p.add_run('{{alumno_creditos}}')
label_line(doc, 'SEGURIDAD SOCIAL: ', 'IMSS {{check_imss}}     ISSSTE {{check_isste}}     ISSSTESON {{check_issteson}}     OTRO: {{seguro_otro}}')
label_line(doc, 'No. Afiliación: ', '{{seguro_num}}')
label_line(doc, 'OPCIÓN ELEGIDA: ', '{{opcion_elegida}}')
label_line(doc, 'DISPONIBILIDAD DE HORARIO: ', '{{disponibilidad_horario}}')
label_line(doc, 'NOMBRE DE LA UNIDAD RECEPTORA (RAZON SOCIAL): ', '{{razon_social}}')
label_line(doc, 'GIRO O SECTOR: ', '{{giro_sector}}')
label_line(doc, 'DOMICILIO: ', '{{domicilio}}')
p = doc.add_paragraph()
r = p.add_run('CIUDAD: ')
r.bold = True
p.add_run('{{ciudad}}')
p2 = doc.add_paragraph()
r2 = p2.add_run(' C.P. ')
r2.bold = True
p2.add_run('{{cp}}')
p3 = doc.add_paragraph()
r3 = p3.add_run(' TELÉFONO: ')
r3.bold = True
p3.add_run('{{telefono}}')
label_line(doc, 'RESPONSABLE POR LA UNIDAD RECEPTORA: ', '{{responsable_nombre}}')
label_line(doc, 'PUESTO: ', '{{responsable_puesto}}')
p = doc.add_paragraph()
r = p.add_run(' EMAIL: ')
r.bold = True
p.add_run('{{responsable_email}}')
label_line(doc, 'NOMBRE DEL PROYECTO/PROGRAMA: ', '{{nombre_programa}}')
label_line(doc, 'OBJETIVO GENERAL: ', '{{objetivo}}')
label_line(doc, 'HORARIO: ', '{{horario_acordado}}')

doc.add_paragraph()
p = doc.add_paragraph()
p.add_run('Nombre y firma del alumno          Sello de la unidad receptora          Nombre y firma del responsable de la unidad receptora')

doc.add_paragraph()
label_line(doc, 'TUTOR PROFESIONAL: No. Empleado ', '{{tutor_no_empleado}}')
p = doc.add_paragraph()
r = p.add_run(' Nombre: ')
r.bold = True
p.add_run('{{tutor_nombre}}')
p = doc.add_paragraph()
r = p.add_run(' Fecha de asignación: ')
r.bold = True
p.add_run('{{tutor_fecha}}')

doc.add_paragraph()
p = doc.add_paragraph()
r = p.add_run('Original: Coordinación o Responsable de Prácticas Profesionales de la carrera.\nCopias o PDF: 1) Tutor académico,  2) Asesor de la empresa,  3) Alumno')
r.font.size = Pt(9)

doc.save(os.path.join(OUT, 'FP2.docx'))

# ==============================================================
# CARTA DE ASIGNACIÓN DE TUTOR PROFESIONAL
# ==============================================================
doc = base_doc()
p = doc.add_paragraph()
r = p.add_run('PAPEL MEMBRETADO DEL DEPARTAMENTO')
r.bold = True

doc.add_paragraph('{{ciudad_departamento}}, Sonora a {{dia_carta}} de {{mes_carta}} de {{anio_carta}}.')

p = doc.add_paragraph()
r = p.add_run('{{responsable_nombre}}')
r.bold = True
p = doc.add_paragraph()
r = p.add_run('CARGO O PUESTO: ')
r.bold = True
p.add_run('{{responsable_puesto}}')
p = doc.add_paragraph()
r = p.add_run('NOMBRE DE LA UNIDAD RECEPTORA: ')
r.bold = True
p.add_run('{{razon_social}}')
doc.add_paragraph('P R E S E N T E.-')

cuerpo = (
    'Por este medio, y de acuerdo a su solicitud de practicantes, hago constar que {{alumno_nombre}}, '
    'con número de expediente {{alumno_expediente}} afiliado(a) al {{seguro_tipo}} según constancia número {{seguro_num}}, '
    'actualmente está inscrito(a) en la materia acreditable "{{tipo_programa_texto}}" del plan de estudios de la '
    '{{alumno_programa}} y ha sido asignado(a) a {{razon_social}} para que realice {{nombre_programa}}, '
    'ejecutando labores propias de un auxiliar de {{labores_auxiliar}}.'
)
doc.add_paragraph(cuerpo).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

cuerpo2 = (
    'Asimismo, se comunica que se ha nombrado como Tutor Profesional a (la) {{tutor_titulo}} {{tutor_nombre}}, '
    'a quien se puede localizar en el teléfono {{tutor_telefono}} o bien en el correo electrónico {{tutor_email}}, '
    'para cualquier comentario o aclaración.'
)
doc.add_paragraph(cuerpo2).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

doc.add_paragraph(
    'Aprovecho la oportunidad para agradecer encarecidamente el apoyo que se nos brinda para fortalecer el '
    'desarrollo profesional de nuestros educandos y nos suscribimos a sus apreciables órdenes para cualquier '
    'información adicional que se requiera.'
).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

p = doc.add_paragraph()
r = p.add_run('A T E N T A M E N T E\n"EL SABER DE MIS HIJOS HARA MI GRANDEZA"')
r.bold = True

doc.add_paragraph()
doc.add_paragraph('{{jefe_departamento}}')
doc.add_paragraph('JEFE DEL DEPARTAMENTO')
doc.add_paragraph('Vo. Bo: CD de PP')
doc.add_paragraph('_____________________________')
p = doc.add_paragraph()
r = p.add_run('c.c.p. Maestro Tutor Profesional.\nc.c.p. Archivo.')
r.font.size = Pt(9)

doc.save(os.path.join(OUT, 'CARTA_TUTOR.docx'))

print("Templates generados en", OUT)

# ==============================================================
# FPP-3 - REPORTE PARCIAL (Informe parcial / cambio de UR)
# ==============================================================
doc = base_doc()
h = doc.add_paragraph()
r = h.add_run('DEPARTAMENTO: {{departamento}}')
r.bold = True
h2 = doc.add_paragraph()
r = h2.add_run('DIRECCIÓN ADMINISTRATIVA DEL CAMPUS HERMOSILLO')
r.bold = True

t = doc.add_paragraph()
t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('REPORTE PARCIAL DE ACTIVIDADES\nPRÁCTICAS PROFESIONALES')
r.bold = True

p = doc.add_paragraph()
r = p.add_run('Periodo:   Del ')
r.bold = True
p.add_run('{{periodo_del_dia}} / {{periodo_del_mes}} / 20{{periodo_del_anio}}')
p2 = doc.add_paragraph()
r2 = p2.add_run(' al ')
r2.bold = True
p2.add_run('{{periodo_al_dia}} / {{periodo_al_mes}} / 20{{periodo_al_anio}}')

p = doc.add_paragraph()
r = p.add_run('Cantidad de ')
r.bold = True
p.add_run('{{horas_realizadas}}')
r2 = p.add_run(' horas realizadas de un total de ')
r2.bold = True
p.add_run('{{horas_total}}')
p3 = doc.add_paragraph()
r3 = p3.add_run(' horas.                  Avance: ')
r3.bold = True
p3.add_run('{{avance_pct}}')

label_line(doc, 'Nombre del practicante: ', '{{alumno_nombre}}')
label_line(doc, 'Expediente: ', '{{alumno_expediente}}')
p = doc.add_paragraph()
r = p.add_run(' Programa Educativo (Licenciatura): ')
r.bold = True
p.add_run('{{alumno_programa}}')
label_line(doc, 'Nombre del Proyecto: ', '{{nombre_programa}}')
label_line(doc, 'Datos de la Unidad Receptora (Razón Social): ', '{{razon_social}}')
label_line(doc, 'Responsable de la Unidad Receptora (Nombre/Puesto): ', '{{responsable_datos}}')
label_line(doc, 'Contacto: Teléfono/Empresa: ', '{{telefono}}')
p = doc.add_paragraph()
r = p.add_run('  Ext.: ')
r.bold = True
p.add_run('{{telefono_ext}}')
p2 = doc.add_paragraph()
r2 = p2.add_run('  Celular: ')
r2.bold = True
p2.add_run('{{celular}}')

sec = doc.add_paragraph()
r = sec.add_run('DESCRIPCIÓN GENERAL DE ACTIVIDADES')
r.bold = True
doc.add_paragraph('{{descripcion_actividades_multiline}}')
doc.add_paragraph('En caso de requerirse, anexar reportes, formatos, diagramas que apoyen las actividades realizadas.')
label_line(doc, 'Observaciones Generales: ', '{{observaciones}}')

doc.add_paragraph()
p = doc.add_paragraph()
p.add_run('Nombre y firma del alumno          Nombre y firma del tutor de prácticas UNISON          Nombre y firma del Responsable de la UR          Sello de la UR')

doc.save(os.path.join(OUT, 'FPP3.docx'))

# ==============================================================
# FPP-4 - REPORTE FINAL
# ==============================================================
doc = base_doc()
h = doc.add_paragraph()
r = h.add_run('DEPARTAMENTO: {{departamento}}')
r.bold = True
h2 = doc.add_paragraph()
r = h2.add_run('DIRECCIÓN ADMINISTRATIVA DEL CAMPUS HERMOSILLO')
r.bold = True

t = doc.add_paragraph()
t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('REPORTE FINAL DE ACTIVIDADES\nPRÁCTICAS PROFESIONALES')
r.bold = True

p = doc.add_paragraph()
r = p.add_run('Periodo:   Del ')
r.bold = True
p.add_run('{{periodo_del_dia}} / {{periodo_del_mes}} / 20{{periodo_del_anio}}')
p2 = doc.add_paragraph()
r2 = p2.add_run(' al ')
r2.bold = True
p2.add_run('{{periodo_al_dia}} / {{periodo_al_mes}} / 20{{periodo_al_anio}}')

p = doc.add_paragraph()
r = p.add_run('Cantidad de ')
r.bold = True
p.add_run('{{horas_realizadas}}')
r2 = p.add_run(' horas de un total de ')
r2.bold = True
p.add_run('{{horas_total}}')
p3 = doc.add_paragraph()
r3 = p3.add_run('          Avance: ')
r3.bold = True
p3.add_run('{{avance_pct}}')

label_line(doc, 'Nombre del practicante: ', '{{alumno_nombre}}')
label_line(doc, 'Expediente: ', '{{alumno_expediente}}')
p = doc.add_paragraph()
r = p.add_run(' Programa Educativo (Licenciatura): ')
r.bold = True
p.add_run('{{alumno_programa}}')
label_line(doc, 'Nombre del Proyecto: ', '{{nombre_programa}}')
label_line(doc, 'Datos de la Unidad Receptora (Razón Social): ', '{{razon_social}}')
label_line(doc, 'Responsable de la Unidad Receptora (Nombre/Puesto): ', '{{responsable_datos}}')
label_line(doc, 'Contacto: Teléfono/UR: ', '{{telefono}}')
p = doc.add_paragraph()
r = p.add_run('  Ext.: ')
r.bold = True
p.add_run('{{telefono_ext}}')
p2 = doc.add_paragraph()
r2 = p2.add_run('  Celular: ')
r2.bold = True
p2.add_run('{{celular}}')

sec = doc.add_paragraph()
r = sec.add_run('DESCRIPCIÓN GENERAL DE ACTIVIDADES')
r.bold = True
doc.add_paragraph('{{descripcion_actividades_multiline}}')

sec = doc.add_paragraph()
r = sec.add_run('RETROALIMENTACIÓN DEL TUTOR')
r.bold = True
doc.add_paragraph('{{retroalimentacion_tutor}}')
doc.add_paragraph('En caso de requerirse, anexar reportes, formatos, diagramas que apoyen las actividades realizadas.')
label_line(doc, 'Observaciones Generales: ', '{{observaciones}}')

doc.add_paragraph()
p = doc.add_paragraph()
p.add_run('Nombre y firma del alumno          Nombre y firma del tutor de Prácticas Profesionales UNISON          Nombre y firma del responsable de la UR          Sello de la UR')

doc.save(os.path.join(OUT, 'FPP4.docx'))

# ==============================================================
# FPP-5 - FORMATO DE BAJA
# ==============================================================
doc = base_doc()
h = doc.add_paragraph()
r = h.add_run('DEPARTAMENTO: {{departamento}}')
r.bold = True
h2 = doc.add_paragraph()
r = h2.add_run('UNIDAD REGIONAL CENTRO                                      CAMPUS HERMOSILLO')
r.bold = True

t = doc.add_paragraph()
t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('FORMATO DE BAJA DE PRÁCTICAS PROFESIONALES')
r.bold = True

doc.add_paragraph('Hermosillo, Sonora, a {{dia_baja}} de {{mes_baja}} de 20{{anio_baja}}.')

doc.add_paragraph('_________________________________________________')
p = doc.add_paragraph()
r = p.add_run('COORDINADOR/RESPONSABLE DE PRÁCTICAS PROFESIONALES\nde la LICENCIATURA EN {{alumno_programa}}\nP R E S E N T E.-')
r.bold = True

p = doc.add_paragraph()
r = p.add_run('Por medio de la presente ')
r.bold = True
p.add_run('{{alumno_nombre}}')
label_line(doc, 'Alumno(a) de la Licenciatura en ', '{{alumno_programa}}')
p = doc.add_paragraph()
r = p.add_run(' con número de expediente ')
r.bold = True
p.add_run('{{alumno_expediente}}')
p2 = doc.add_paragraph()
r2 = p2.add_run(', solicito mi baja temporal (')
r2.bold = True
p2.add_run('{{marca_temporal}}')
p3 = doc.add_paragraph()
r3 = p3.add_run(')   definitiva (')
r3.bold = True
p3.add_run('{{marca_definitiva}}')
p4 = doc.add_paragraph()
r4 = p4.add_run(') del programa/proyecto de Prácticas Profesionales denominado: ')
r4.bold = True
p4.add_run('{{nombre_programa}}')
label_line(doc, 'registrado en la unidad receptora ', '{{razon_social}}')
p = doc.add_paragraph()
r = p.add_run(' siendo los motivos de la baja los siguientes:')
r.bold = True

doc.add_paragraph('{{motivos_baja_multiline}}')
doc.add_paragraph('Se anexa el reporte de avance correspondiente.')
p = doc.add_paragraph()
r = p.add_run('A T E N T A M E N T E')
r.bold = True

doc.add_paragraph()
p = doc.add_paragraph()
p.add_run('Nombre y firma del alumno                              Nombre y firma del Responsable del Programa de la Unidad Receptora')
p = doc.add_paragraph()
p.add_run('Tutor de la Práctica Profesional')

doc.save(os.path.join(OUT, 'FPP5.docx'))

print("FPP3/4/5 agregados en", OUT)
