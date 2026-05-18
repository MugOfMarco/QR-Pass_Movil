import { supabase } from './supabase';

export const studentService = {

  async getStudentByBoleta(boleta) {
    try {
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
          estado_academico (estado),
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
      if (!data) return null;
RS
      return {
        boleta:          data.boleta,
        name:            data.nombre_completo,
        groupId:         data.id_grupo_base,
        groupName:       data.grupos?.nombre_grupo,
        career:          data.grupos?.carreras?.nombre_carrera,
        academicStatus:  data.estado_academico?.estado,
        blocked:         data.info_alumno?.bloqueado_manual || data.info_alumno?.bloqueado_sistema,
        openDoor:        data.puertas_abiertas,
        photoUrl:        data.info_alumno?.url_foto,
        retardos:        data.info_alumno?.contador_retardos,
        sinCredencial:   data.info_alumno?.contador_sin_credencial,
      };
    } catch (error) {
      console.error('Error obteniendo estudiante:', error);
      throw error;
    }
  },

  async getStudentSchedule(groupId) {
    try {
      const { data, error } = await supabase
        .from('horario_grupo')
        .select(`
          dia,
          hora_inicio,
          hora_fin,
          materias ( nombre_materia )
        `)
        .eq('id_grupo', groupId);

      if (error) throw error;

      return this.organizeScheduleByTime(data || []);
    } catch (error) {
      console.error('Error obteniendo horario:', error);
      return [];
    }
  },

  async getAccreditedSubjects(boleta) {
    try {
      const { data, error } = await supabase
        .from('materias_acreditadas')
        .select(`
          fecha_acreditacion,
          materias ( nombre_materia )
        `)
        .eq('boleta', parseInt(boleta));

      if (error) throw error;

      return (data || []).map(item => ({
        subjectName:       item.materias?.nombre_materia,
        accreditationDate: item.fecha_acreditacion,
      }));
    } catch (error) {
      console.error('Error obteniendo materias acreditadas:', error);
      return [];
    }
  },

  organizeScheduleByTime(scheduleData) {
    const timeSlots = {};

    scheduleData.forEach(classItem => {
      const startTime = classItem.hora_inicio?.slice(0, 5);
      const endTime   = classItem.hora_fin?.slice(0, 5);
      const timeKey   = `${startTime}-${endTime}`;

      if (!timeSlots[timeKey]) {
        timeSlots[timeKey] = {
          time: `${startTime}-${endTime}`,
          lun: '-', mar: '-', mie: '-', jue: '-', vie: '-',
        };
      }

      const dayMap = {
        'lunes':      'lun',
        'martes':     'mar',
        'miércoles':  'mie',
        'jueves':     'jue',
        'viernes':    'vie',
      };

      const dayKey = dayMap[classItem.dia];
      if (dayKey) {
        // Shorten materia name for display (e.g. "P601 – Probabilidad..." → "P601")
        const fullName = classItem.materias?.nombre_materia || '-';
        const shortName = fullName.split('–')[0].trim();
        timeSlots[timeKey][dayKey] = shortName;
      }
    });

    return Object.values(timeSlots).sort((a, b) => a.time.localeCompare(b.time));
  },

  async searchStudents(searchTerm) {
    try {
      // Search by name
      const { data: byName, error: nameError } = await supabase
        .from('alumnos')
        .select(`
          boleta,
          nombre_completo,
          id_grupo_base,
          grupos ( nombre_grupo, carreras ( nombre_carrera ) )
        `)
        .ilike('nombre_completo', `%${searchTerm}%`)
        .limit(20);

      if (nameError) throw nameError;

      let results = byName || [];

      // If term looks numeric, also search by boleta
      if (/^\d+$/.test(searchTerm)) {
        const { data: byBoleta } = await supabase
          .from('alumnos')
          .select(`
            boleta,
            nombre_completo,
            id_grupo_base,
            grupos ( nombre_grupo, carreras ( nombre_carrera ) )
          `)
          .eq('boleta', parseInt(searchTerm))
          .limit(5);

        if (byBoleta) {
          const existingBoletas = new Set(results.map(r => r.boleta));
          byBoleta.forEach(r => {
            if (!existingBoletas.has(r.boleta)) results.push(r);
          });
        }
      }

      return results.map(item => ({
        id:       String(item.boleta),
        boleta:   String(item.boleta),
        name:     item.nombre_completo,
        groupId:  item.id_grupo_base,
        career:   item.grupos?.carreras?.nombre_carrera,
      }));
    } catch (error) {
      console.error('Error buscando alumnos:', error);
      throw error;
    }
  },

  async getConsultationHistory(boleta) {
    try {
      const { data, error } = await supabase
        .from('registros_acceso')
        .select(`
          id_registro,
          fecha_hora,
          id_tipo_registro,
          tipos_registro ( descripcion ),
          usuarios_sistema ( email, nombre_completo )
        `)
        .eq('boleta', parseInt(boleta))
        .order('fecha_hora', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(item => ({
        id:               String(item.id_registro),
        date:             new Date(item.fecha_hora),
        consultationType: item.id_tipo_registro === 4 ? 'sin_credencial' : 'qr_scan',
        details:          item.tipos_registro?.descripcion || 'Registro de acceso',
        prefectEmail:     item.usuarios_sistema?.email,
        prefectName:      item.usuarios_sistema?.nombre_completo,
      }));
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  },

  async registerConsultation(boleta, studentName, consultationType) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get id_usuario from usuarios_sistema by email
      let vigilanteId = null;
      const { data: userRow } = await supabase
        .from('usuarios_sistema')
        .select('id_usuario')
        .eq('email', user.email)
        .single();

      if (userRow) vigilanteId = userRow.id_usuario;

      // id_tipo_registro: 1 = Entrada Normal (used for consultations)
      await supabase.from('registros_acceso').insert({
        boleta:               parseInt(boleta),
        id_punto_acceso:      1,
        id_tipo_registro:     1,
        id_usuario_vigilante: vigilanteId,
        fecha_hora:           new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error registrando consulta:', error);
      throw error;
    }
  },

  extractBoletaFromQR(data) {
    try {
      const url = new URL(data);
      const boletaParam = url.searchParams.get('boleta');
      if (boletaParam) return boletaParam;
      throw new Error('No tiene parámetro boleta');
    } catch {
      const match = data.match(/\d{10}/);
      if (match) return match[0];
      throw new Error('QR Inválido: No contiene una boleta válida');
    }
  },
};