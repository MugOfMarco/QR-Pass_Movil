// utils/studentService.js
// Servicio de datos de alumnos — consulta Supabase directo con anon key.

import { supabase } from './supabase';

// Mapa de día numérico (1-7) a clave de columna para la tabla de horario
const DIA_MAP = { 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie', 6: 'sab' };

export const studentService = {

  // ── Obtener alumno completo por boleta ────────────────────────
  async getStudentByBoleta(boleta) {
    const { data, error } = await supabase
      .from('alumnos')
      .select(`
        boleta,
        nombre_completo,
        puertas_abiertas,
        id_grupo_base,
        grupos (
          id_grupo,
          nombre_grupo,
          carreras ( nombre_carrera )
        ),
        estado_academico ( estado ),
        info_alumno (
          bloqueado_manual,
          bloqueado_sistema,
          url_foto,
          contador_retardos,
          contador_sin_credencial
        )
      `)
      .eq('boleta', parseInt(boleta))
      .maybeSingle();

    if (error) throw error;
    if (!data)  return null;

    return {
      boleta:         data.boleta,
      name:           data.nombre_completo,
      groupId:        data.id_grupo_base,
      groupName:      data.grupos?.nombre_grupo    || '—',
      career:         data.grupos?.carreras?.nombre_carrera || '—',
      academicStatus: data.estado_academico?.estado || '—',
      blocked:        !!(data.info_alumno?.bloqueado_manual || data.info_alumno?.bloqueado_sistema),
      blockedManual:  !!data.info_alumno?.bloqueado_manual,
      blockedSistema: !!data.info_alumno?.bloqueado_sistema,
      openDoor:       data.puertas_abiertas,
      photoUrl:       data.info_alumno?.url_foto,
      retardos:       data.info_alumno?.contador_retardos       ?? 0,
      sinCredencial:  data.info_alumno?.contador_sin_credencial ?? 0,
    };
  },

  // ── Obtener horario del grupo por id_grupo ────────────────────
  // espaIds: Set<id_materia> — celdas de esas materias se marcan con _espa: true
  async getStudentSchedule(groupId, espaIds = new Set()) {
    if (!groupId) return [];
    try {
      const { data, error } = await supabase
        .from('horarios_grupo')
        .select(`
          id_materia,
          dia_semana,
          hora_inicio,
          hora_fin,
          materias ( nombre_materia )
        `)
        .eq('id_grupo', groupId)
        .order('hora_inicio');

      if (error) throw error;
      return this.organizeScheduleByDay(data || [], espaIds);
    } catch (err) {
      console.warn('Error obteniendo horario:', err.message);
      return [];
    }
  },

  // Organiza filas de horario en tabla por franjas horarias.
  // Las materias cuyo id_materia esté en espaIds se marcan con {dayKey}_espa: true.
  organizeScheduleByDay(scheduleData, espaIds = new Set()) {
    const timeSlots = {};

    scheduleData.forEach(item => {
      const start   = item.hora_inicio?.slice(0, 5) || '';
      const end     = item.hora_fin?.slice(0, 5)    || '';
      const timeKey = `${start}-${end}`;

      if (!timeSlots[timeKey]) {
        timeSlots[timeKey] = {
          time: timeKey,
          lun: '-', lun_espa: false,
          mar: '-', mar_espa: false,
          mie: '-', mie_espa: false,
          jue: '-', jue_espa: false,
          vie: '-', vie_espa: false,
          sab: '-', sab_espa: false,
        };
      }

      const dayKey = DIA_MAP[item.dia_semana];
      if (dayKey) {
        const full   = item.materias?.nombre_materia || '-';
        const short  = full.split('–')[0].trim();
        const isEspa = espaIds.has(item.id_materia);
        timeSlots[timeKey][dayKey]            = short;
        timeSlots[timeKey][dayKey + '_espa']  = isEspa;
      }
    });

    return Object.values(timeSlots).sort((a, b) => a.time.localeCompare(b.time));
  },

  // ── Obtener ESPAs acreditadas del alumno con detalle de horario ─
  // Devuelve { ids: Set<id_materia>, details: [{nombre, dias:[{dia,inicio,fin}]}] }
  async getStudentEspaWithSchedule(boleta, groupId) {
    const empty = { ids: new Set(), details: [] };
    try {
      // Semestre activo
      const { data: semData } = await supabase
        .from('semestres')
        .select('id_semestre')
        .eq('activo', true)
        .maybeSingle();

      // ESPAs del alumno
      const { data: acred, error } = await supabase
        .from('materias_acreditadas')
        .select('id_materia, materias ( nombre_materia )')
        .eq('boleta', parseInt(boleta));

      if (error || !acred?.length) return empty;

      const ids = new Set(acred.map(a => a.id_materia));

      if (!semData || !groupId) {
        const details = acred.map(a => ({
          nombre: a.materias?.nombre_materia || '—',
          dias:   [],
        }));
        return { ids, details };
      }

      // Horarios de las materias ESPA en el grupo del alumno
      const { data: horariosEspa } = await supabase
        .from('horarios_grupo')
        .select('id_materia, dia_semana, hora_inicio, hora_fin, materias ( nombre_materia )')
        .eq('id_grupo', groupId)
        .eq('id_semestre', semData.id_semestre)
        .in('id_materia', [...ids]);

      const DIA_NOMBRES = {
        1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
        4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
      };

      const byMateria = {};
      for (const h of (horariosEspa || [])) {
        if (!byMateria[h.id_materia]) {
          byMateria[h.id_materia] = {
            nombre: h.materias?.nombre_materia || '—',
            dias:   [],
          };
        }
        byMateria[h.id_materia].dias.push({
          dia:    DIA_NOMBRES[h.dia_semana] || String(h.dia_semana),
          inicio: h.hora_inicio?.slice(0, 5) || '',
          fin:    h.hora_fin?.slice(0, 5)    || '',
        });
      }

      // Materias ESPA sin horario registrado también aparecen
      for (const a of acred) {
        if (!byMateria[a.id_materia]) {
          byMateria[a.id_materia] = {
            nombre: a.materias?.nombre_materia || '—',
            dias:   [],
          };
        }
      }

      return { ids, details: Object.values(byMateria) };
    } catch (err) {
      console.warn('Error obteniendo ESPAs:', err.message);
      return empty;
    }
  },

  // ── Buscar alumnos (por nombre o boleta) ──────────────────────
  async searchStudents(searchTerm) {
    const term = searchTerm.trim();
    if (term.length < 2) return [];

    const baseSelect = `
      boleta,
      nombre_completo,
      puertas_abiertas,
      id_grupo_base,
      grupos ( nombre_grupo, carreras ( nombre_carrera ) ),
      estado_academico ( estado ),
      info_alumno ( bloqueado_manual, bloqueado_sistema )
    `;

    // Búsqueda por nombre
    const { data: byName, error: nameError } = await supabase
      .from('alumnos')
      .select(baseSelect)
      .ilike('nombre_completo', `%${term}%`)
      .limit(30);

    if (nameError) throw nameError;
    let results = byName || [];

    // Si parece número también busca por boleta
    if (/^\d+$/.test(term)) {
      const { data: byBoleta } = await supabase
        .from('alumnos')
        .select(baseSelect)
        .eq('boleta', parseInt(term))
        .limit(5);

      if (byBoleta) {
        const existing = new Set(results.map(r => r.boleta));
        byBoleta.forEach(r => { if (!existing.has(r.boleta)) results.push(r); });
      }
    }

    return results.map(this._mapAlumnoRow);
  },

  // ── Filtrar alumnos (equivalente a FiltrarAlumnos web) ────────
  async getFilteredStudents({ idGrupo, idEstado, puertas, q } = {}) {
    let query = supabase
      .from('alumnos')
      .select(`
        boleta,
        nombre_completo,
        puertas_abiertas,
        id_grupo_base,
        grupos ( nombre_grupo, id_turno, carreras ( nombre_carrera ) ),
        estado_academico ( id_estado, estado ),
        info_alumno ( bloqueado_manual, bloqueado_sistema, contador_retardos )
      `)
      .order('nombre_completo')
      .limit(200);

    if (idGrupo)  query = query.eq('id_grupo_base', idGrupo);
    if (idEstado) query = query.eq('id_estado_academico', idEstado);
    if (puertas !== null && puertas !== undefined)
                  query = query.eq('puertas_abiertas', puertas);
    if (q?.trim().length >= 2)
                  query = query.ilike('nombre_completo', `%${q.trim()}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this._mapAlumnoRow);
  },

  // Mapea una fila cruda de `alumnos` al formato interno
  _mapAlumnoRow(row) {
    return {
      id:             String(row.boleta),
      boleta:         String(row.boleta),
      name:           row.nombre_completo,
      groupId:        row.id_grupo_base,
      groupName:      row.grupos?.nombre_grupo    || '—',
      career:         row.grupos?.carreras?.nombre_carrera || '—',
      academicStatus: row.estado_academico?.estado || '—',
      idEstado:       row.estado_academico?.id_estado,
      openDoor:       row.puertas_abiertas,
      blocked:        !!(row.info_alumno?.bloqueado_manual || row.info_alumno?.bloqueado_sistema),
      blockedManual:  !!row.info_alumno?.bloqueado_manual,
      retardos:       row.info_alumno?.contador_retardos ?? 0,
    };
  },

  // ── Bloquear / desbloquear alumno ─────────────────────────────
  async setBlockStudent(boleta, bloquear) {
    const update = bloquear
      ? { bloqueado_manual: true }
      : { bloqueado_manual: false, bloqueado_sistema: false, contador_sin_credencial: 0 };

    const { error } = await supabase
      .from('info_alumno')
      .update(update)
      .eq('boleta', parseInt(boleta));

    if (error) throw error;
  },

  // ── Catálogos para filtros ────────────────────────────────────
  async getGrupos() {
    const { data, error } = await supabase
      .from('grupos')
      .select('id_grupo, nombre_grupo, turnos ( nombre_turno )')
      .order('nombre_grupo');
    if (error) throw error;
    return (data || []).map(g => ({
      id:    g.id_grupo,
      label: g.nombre_grupo,
      turno: g.turnos?.nombre_turno || '',
    }));
  },

  async getEstados() {
    const { data, error } = await supabase
      .from('estado_academico')
      .select('id_estado, estado')
      .order('estado');
    if (error) throw error;
    return (data || []).map(e => ({ id: e.id_estado, label: e.estado }));
  },

  // ── Historial de acceso del alumno ────────────────────────────
  async getConsultationHistory(boleta) {
    const { data, error } = await supabase
      .from('registros_acceso')
      .select(`
        id_registro,
        fecha_hora,
        tipos_registro ( descripcion ),
        puntos_acceso ( nombre_punto ),
        v_usuarios_nombre ( nombre_completo )
      `)
      .eq('boleta', parseInt(boleta))
      .order('fecha_hora', { ascending: false })
      .limit(30);

    if (error) throw error;

    return (data || []).map(item => ({
      id:       String(item.id_registro),
      date:     new Date(item.fecha_hora),
      tipo:     item.tipos_registro?.descripcion || 'Registro',
      punto:    item.puntos_acceso?.nombre_punto || '—',
      prefecto: item.v_usuarios_nombre?.nombre_completo || '—',
    }));
  },

  // ── Extraer boleta de un QR ───────────────────────────────────
  extractBoletaFromQR(data) {
    try {
      const url         = new URL(data);
      const boletaParam = url.searchParams.get('boleta');
      if (boletaParam) return boletaParam;
    } catch {}
    // Intento directo: 10 dígitos consecutivos
    const match = data.match(/\d{7,10}/);
    if (match) return match[0];
    throw new Error('QR inválido: no contiene una boleta reconocible.');
  },
};
