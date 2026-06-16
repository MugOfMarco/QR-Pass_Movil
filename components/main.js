// components/main.js
// Menú principal del prefecto — acceso a los 4 módulos.

import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Image,
} from 'react-native';

const LOGO = require('../assets/logo_sinborde.png');
import { Ionicons } from '@expo/vector-icons';

const MainMenu = ({
  user,
  studentData,
  onOpenCamera,
  onOpenSearch,
  onOpenFiltrar,
  onOpenInfo,
  onOpenHistory,
  onOpenSoporte,
  onOpenLegal,
  onLogout,
}) => {
  const hasStudent = !!studentData;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.appTitle}>QR Pass</Text>
            <Text style={styles.appSub}>CECyT 9 — Prefectura</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutIcon}>
          <Ionicons name="log-out-outline" size={24} color="#8B2453" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Saludo */}
        {user && (
          <Text style={styles.greeting}>Hola, {user.nombre?.split(' ')[0] || user.usuario} 👋</Text>
        )}

        {/* Card alumno actual (si hay uno seleccionado) */}
        {hasStudent ? (
          <View style={[styles.studentCard, studentData.blocked && styles.studentCardBlocked]}>
            <View style={styles.studentCardTop}>
              <Ionicons name="person-circle-outline" size={36} color="#8B2453" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.studentName}>{studentData.name}</Text>
                <Text style={styles.studentSub}>Boleta: {studentData.boleta}</Text>
                <Text style={styles.studentSub}>Grupo: {studentData.groupName}</Text>
              </View>
              <View style={[styles.statusBadge, studentData.blocked && styles.statusBadgeBlocked]}>
                <Text style={[styles.statusText, studentData.blocked && styles.statusTextBlocked]}>
                  {studentData.blocked ? 'BLOQUEADO' : studentData.academicStatus || 'OK'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noStudentCard}>
            <Ionicons name="scan-outline" size={32} color="#CCC" />
            <Text style={styles.noStudentText}>Sin alumno seleccionado</Text>
            <Text style={styles.noStudentSub}>Escanea un QR o busca manualmente</Text>
          </View>
        )}

        {/* Sección: escaneo y búsqueda */}
        <Text style={styles.sectionTitle}>Consulta rápida</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={onOpenCamera}>
          <Ionicons name="qr-code-outline" size={22} color="white" />
          <Text style={styles.primaryBtnText}>
            {hasStudent ? 'Escanear otro QR' : 'Escanear QR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={onOpenSearch}>
          <Ionicons name="search-outline" size={20} color="#8B2453" />
          <Text style={styles.outlineBtnText}>Buscar alumno</Text>
        </TouchableOpacity>

        {/* Sección: detalle del alumno seleccionado */}
        {hasStudent && (
          <>
            <Text style={styles.sectionTitle}>Alumno seleccionado</Text>
            <TouchableOpacity style={styles.outlineBtn} onPress={onOpenInfo}>
              <Ionicons name="information-circle-outline" size={20} color="#8B2453" />
              <Text style={styles.outlineBtnText}>Ver información y horario</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={onOpenHistory}>
              <Ionicons name="time-outline" size={20} color="#8B2453" />
              <Text style={styles.outlineBtnText}>Historial de acceso</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Sección: gestión grupal */}
        <Text style={styles.sectionTitle}>Gestión</Text>

        <TouchableOpacity style={styles.outlineBtn} onPress={onOpenFiltrar}>
          <Ionicons name="filter-outline" size={20} color="#8B2453" />
          <Text style={styles.outlineBtnText}>Filtrar alumnos</Text>
        </TouchableOpacity>

        {/* Sección: soporte y legal */}
        <Text style={styles.sectionTitle}>Ayuda e información</Text>

        <TouchableOpacity style={styles.outlineBtn} onPress={onOpenSoporte}>
          <Ionicons name="help-circle-outline" size={20} color="#8B2453" />
          <Text style={styles.outlineBtnText}>Soporte y preguntas frecuentes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtnGray} onPress={onOpenLegal}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#888" />
          <Text style={styles.outlineBtnGrayText}>Aviso legal y privacidad</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#fff',
    paddingTop: 58, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  headerLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  headerLogo: {
    width: 36, height: 36,
  },
  appTitle: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  appSub:   { fontSize: 12, color: '#8B2453', marginTop: 2 },
  logoutIcon: { padding: 6 },

  body:     { flex: 1, paddingHorizontal: 20 },
  greeting: { fontSize: 16, color: '#555', marginTop: 20, marginBottom: 4 },

  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: '#999',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 22, marginBottom: 10,
  },

  // Card alumno seleccionado
  studentCard: {
    backgroundColor: '#FFF5F8', borderRadius: 14,
    padding: 14, marginTop: 14,
    borderLeftWidth: 4, borderLeftColor: '#8B2453',
  },
  studentCardBlocked: { borderLeftColor: '#e74c3c', backgroundColor: '#FFF5F5' },
  studentCardTop: { flexDirection: 'row', alignItems: 'center' },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  studentSub:  { fontSize: 12, color: '#666', marginTop: 1 },
  statusBadge: {
    backgroundColor: '#27ae6022', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start',
  },
  statusBadgeBlocked: { backgroundColor: '#e74c3c22' },
  statusText:        { fontSize: 10, fontWeight: '800', color: '#27ae60' },
  statusTextBlocked: { color: '#e74c3c' },

  noStudentCard: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#DDD',
    borderRadius: 14, padding: 20, marginTop: 14,
    alignItems: 'center',
  },
  noStudentText: { fontSize: 15, color: '#888', marginTop: 10 },
  noStudentSub:  { fontSize: 12, color: '#BBB', marginTop: 4, textAlign: 'center' },

  // Botones
  primaryBtn: {
    backgroundColor: '#8B2453',
    borderRadius: 14, paddingVertical: 15, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 10,
  },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },

  outlineBtn: {
    borderWidth: 1.5, borderColor: '#8B2453',
    borderRadius: 14, paddingVertical: 13, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 10, backgroundColor: '#fff',
  },
  outlineBtnText: { color: '#8B2453', fontSize: 15, fontWeight: '600', flex: 1 },

  outlineBtnGray: {
    borderWidth: 1.5, borderColor: '#CCC',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 10, backgroundColor: '#FAFAFA',
  },
  outlineBtnGrayText: { color: '#888', fontSize: 14, fontWeight: '500', flex: 1 },
});

export default MainMenu;
