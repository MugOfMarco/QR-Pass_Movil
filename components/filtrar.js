// components/filtrar.js
// Módulo "Filtrar Alumnos" para el prefecto.
// Equivalente al FiltrarAlumnos.html del panel web.
// Permite filtrar por grupo, estado académico y puertas abiertas,
// ver el listado resultante y bloquear/desbloquear alumnos.

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { studentService } from '../utils/studentService';

const PUERTAS_OPTS = [
  { label: 'Todas', value: null },
  { label: 'Con puerta', value: true },
  { label: 'Sin puerta', value: false },
];

const FiltrarScreen = ({ onBack, onStudentSelect }) => {
  const [grupos,    setGrupos]    = useState([]);
  const [estados,   setEstados]   = useState([]);
  const [alumnos,   setAlumnos]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [catLoading,setCatLoading]= useState(true);

  // Filtros activos
  const [idGrupo,  setIdGrupo]  = useState(null);
  const [idEstado, setIdEstado] = useState(null);
  const [puertas,  setPuertas]  = useState(null);  // null | true | false
  const [q,        setQ]        = useState('');

  // Paneles de filtro expandibles
  const [showGrupos,  setShowGrupos]  = useState(false);
  const [showEstados, setShowEstados] = useState(false);
  const [showPuertas, setShowPuertas] = useState(false);

  // Cargar catálogos una sola vez
  useEffect(() => {
    (async () => {
      try {
        const [g, e] = await Promise.all([
          studentService.getGrupos(),
          studentService.getEstados(),
        ]);
        setGrupos(g);
        setEstados(e);
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar los filtros.');
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  const buscar = useCallback(async () => {
    setLoading(true);
    try {
      const results = await studentService.getFilteredStudents({
        idGrupo, idEstado, puertas, q,
      });
      setAlumnos(results);
    } catch (err) {
      Alert.alert('Error', err.message || 'Error al buscar alumnos.');
    } finally {
      setLoading(false);
    }
  }, [idGrupo, idEstado, puertas, q]);

  const limpiar = () => {
    setIdGrupo(null);
    setIdEstado(null);
    setPuertas(null);
    setQ('');
    setAlumnos([]);
  };

  const toggleBloqueo = async (alumno) => {
    const accion = alumno.blockedManual ? 'desbloquear' : 'bloquear';
    Alert.alert(
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} alumno?`,
      `${alumno.name}\nBoleta: ${alumno.boleta}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: accion.charAt(0).toUpperCase() + accion.slice(1),
          style: accion === 'bloquear' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await studentService.setBlockStudent(alumno.boleta, !alumno.blockedManual);
              // Refrescar lista
              await buscar();
            } catch (err) {
              Alert.alert('Error', err.message || 'No se pudo actualizar.');
            }
          },
        },
      ]
    );
  };

  const verDetalle = async (alumno) => {
    try {
      const full = await studentService.getStudentByBoleta(alumno.boleta);
      if (full) onStudentSelect(full);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el alumno.');
    }
  };

  // ── Label del grupo seleccionado
  const grupoLabel  = idGrupo  ? grupos.find(g => g.id  === idGrupo)?.label  : 'Todos';
  const estadoLabel = idEstado ? estados.find(e => e.id === idEstado)?.label : 'Todos';
  const puertasLabel= PUERTAS_OPTS.find(o => o.value === puertas)?.label ?? 'Todas';

  const hayFiltros = idGrupo || idEstado || puertas !== null || q.trim().length >= 2;

  if (catLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B2453" />
        <Text style={styles.loadingText}>Cargando filtros…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtrar Alumnos</Text>
        <TouchableOpacity onPress={limpiar} style={styles.clearBtn}>
          <Ionicons name="refresh" size={20} color="#8B2453" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

        {/* Buscador libre */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre…"
            placeholderTextColor="#999"
            value={q}
            onChangeText={setQ}
            autoCapitalize="words"
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro: Grupo */}
        <TouchableOpacity style={styles.filterRow} onPress={() => setShowGrupos(v => !v)}>
          <Text style={styles.filterLabel}>Grupo</Text>
          <Text style={[styles.filterValue, idGrupo && styles.filterActive]}>{grupoLabel}</Text>
          <Ionicons name={showGrupos ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
        </TouchableOpacity>
        {showGrupos && (
          <View style={styles.filterOpts}>
            <TouchableOpacity
              style={[styles.filterOpt, !idGrupo && styles.filterOptSelected]}
              onPress={() => { setIdGrupo(null); setShowGrupos(false); }}
            >
              <Text style={!idGrupo ? styles.filterOptTextSel : styles.filterOptText}>Todos</Text>
            </TouchableOpacity>
            {grupos.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[styles.filterOpt, idGrupo === g.id && styles.filterOptSelected]}
                onPress={() => { setIdGrupo(g.id); setShowGrupos(false); }}
              >
                <Text style={idGrupo === g.id ? styles.filterOptTextSel : styles.filterOptText}>
                  {g.label}
                  {g.turno ? `  ·  ${g.turno}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Filtro: Estado académico */}
        <TouchableOpacity style={styles.filterRow} onPress={() => setShowEstados(v => !v)}>
          <Text style={styles.filterLabel}>Estado académico</Text>
          <Text style={[styles.filterValue, idEstado && styles.filterActive]}>{estadoLabel}</Text>
          <Ionicons name={showEstados ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
        </TouchableOpacity>
        {showEstados && (
          <View style={styles.filterOpts}>
            <TouchableOpacity
              style={[styles.filterOpt, !idEstado && styles.filterOptSelected]}
              onPress={() => { setIdEstado(null); setShowEstados(false); }}
            >
              <Text style={!idEstado ? styles.filterOptTextSel : styles.filterOptText}>Todos</Text>
            </TouchableOpacity>
            {estados.map(e => (
              <TouchableOpacity
                key={e.id}
                style={[styles.filterOpt, idEstado === e.id && styles.filterOptSelected]}
                onPress={() => { setIdEstado(e.id); setShowEstados(false); }}
              >
                <Text style={idEstado === e.id ? styles.filterOptTextSel : styles.filterOptText}>
                  {e.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Filtro: Puertas abiertas */}
        <TouchableOpacity style={styles.filterRow} onPress={() => setShowPuertas(v => !v)}>
          <Text style={styles.filterLabel}>Puertas abiertas</Text>
          <Text style={[styles.filterValue, puertas !== null && styles.filterActive]}>{puertasLabel}</Text>
          <Ionicons name={showPuertas ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
        </TouchableOpacity>
        {showPuertas && (
          <View style={styles.filterOpts}>
            {PUERTAS_OPTS.map(o => (
              <TouchableOpacity
                key={String(o.value)}
                style={[styles.filterOpt, puertas === o.value && styles.filterOptSelected]}
                onPress={() => { setPuertas(o.value); setShowPuertas(false); }}
              >
                <Text style={puertas === o.value ? styles.filterOptTextSel : styles.filterOptText}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Botón buscar */}
        <TouchableOpacity
          style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
          onPress={buscar}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="white" size="small" />
            : <Text style={styles.searchBtnText}>Buscar alumnos</Text>
          }
        </TouchableOpacity>

        {/* Contador de resultados */}
        {alumnos.length > 0 && (
          <Text style={styles.resultCount}>{alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''} encontrado{alumnos.length !== 1 ? 's' : ''}</Text>
        )}

        {/* Lista de resultados */}
        {alumnos.map(alumno => (
          <View key={alumno.id} style={[styles.card, alumno.blocked && styles.cardBlocked]}>
            {/* Info principal */}
            <TouchableOpacity onPress={() => verDetalle(alumno)} style={styles.cardBody}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardName}>{alumno.name}</Text>
                <Text style={styles.cardSub}>Boleta: {alumno.boleta}</Text>
                <Text style={styles.cardSub}>Grupo: {alumno.groupName}</Text>
                <View style={styles.badges}>
                  <View style={[styles.badge,
                    alumno.blocked ? styles.badgeBlocked :
                    alumno.academicStatus === 'Regular' ? styles.badgeOk : styles.badgeWarn
                  ]}>
                    <Text style={styles.badgeText}>
                      {alumno.blocked ? 'BLOQUEADO' : alumno.academicStatus}
                    </Text>
                  </View>
                  {alumno.openDoor && (
                    <View style={styles.badgeDoor}>
                      <Text style={styles.badgeText}>🚪 PUERTA</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>

            {/* Acción bloquear/desbloquear */}
            <TouchableOpacity
              style={[styles.blockBtn, alumno.blockedManual ? styles.unblockBtn : styles.blockBtnRed]}
              onPress={() => toggleBloqueo(alumno)}
            >
              <Ionicons
                name={alumno.blockedManual ? 'lock-open-outline' : 'lock-closed-outline'}
                size={14}
                color="white"
              />
              <Text style={styles.blockBtnText}>
                {alumno.blockedManual ? ' Desbloquear' : ' Bloquear'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Sin resultados */}
        {!loading && alumnos.length === 0 && hayFiltros && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={44} color="#DDD" />
            <Text style={styles.noResultsText}>Sin resultados</Text>
            <Text style={styles.noResultsSub}>Ajusta los filtros e intenta de nuevo</Text>
          </View>
        )}

        {/* Estado inicial */}
        {!loading && alumnos.length === 0 && !hayFiltros && (
          <View style={styles.noResults}>
            <Ionicons name="filter-outline" size={44} color="#DDD" />
            <Text style={styles.noResultsText}>Aplica filtros y presiona "Buscar"</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const GUARD = '#8B2453';

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#fff' },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:{ marginTop: 12, color: GUARD, fontSize: 15 },

  header: {
    paddingTop: 58, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
    backgroundColor: '#fff',
  },
  backBtn:     { padding: 6 },
  clearBtn:    { padding: 6 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 19, fontWeight: 'bold', color: '#111' },

  body: { flex: 1, padding: 16 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    borderWidth: 1, borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },

  filterRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  filterLabel:  { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  filterValue:  { fontSize: 13, color: '#888', marginRight: 8 },
  filterActive: { color: GUARD, fontWeight: '600' },

  filterOpts: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
  },
  filterOpt: {
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  filterOptSelected: { backgroundColor: '#8B245315' },
  filterOptText:    { fontSize: 14, color: '#333' },
  filterOptTextSel: { fontSize: 14, color: GUARD, fontWeight: '700' },

  searchBtn: {
    backgroundColor: GUARD, borderRadius: 30,
    paddingVertical: 14, alignItems: 'center',
    marginTop: 18, marginBottom: 10,
  },
  searchBtnDisabled: { opacity: 0.65 },
  searchBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  resultCount: {
    fontSize: 12, color: '#888', textAlign: 'right',
    marginBottom: 10, fontStyle: 'italic',
  },

  card: {
    backgroundColor: '#F8F8F8', borderRadius: 12,
    marginBottom: 10, overflow: 'hidden',
    borderLeftWidth: 4, borderLeftColor: GUARD,
  },
  cardBlocked: { borderLeftColor: '#e74c3c' },
  cardBody: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14,
  },
  cardLeft:  { flex: 1 },
  cardName:  { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  cardSub:   { fontSize: 12, color: '#666', marginBottom: 2 },

  badges:      { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 5 },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeOk:     { backgroundColor: '#27ae6020' },
  badgeWarn:   { backgroundColor: '#f39c1220' },
  badgeBlocked:{ backgroundColor: '#e74c3c20' },
  badgeDoor:   { backgroundColor: '#3498db20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:   { fontSize: 10, fontWeight: '700', color: '#333' },

  blockBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, marginHorizontal: 14, marginBottom: 12,
    borderRadius: 20,
  },
  blockBtnRed: { backgroundColor: '#e74c3c' },
  unblockBtn:  { backgroundColor: '#27ae60' },
  blockBtnText:{ color: 'white', fontSize: 12, fontWeight: 'bold' },

  noResults: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 50,
  },
  noResultsText: { fontSize: 16, color: '#888', marginTop: 16, fontWeight: '500' },
  noResultsSub:  { fontSize: 13, color: '#BBB', marginTop: 6, textAlign: 'center' },
});

export default FiltrarScreen;
