// components/soporte.js
// Módulo de Soporte para Prefectos — tickets + preguntas frecuentes.
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

// ── FAQ estática para prefectos ────────────────────────────────
const FAQ_PREFECTO = [
  {
    id: 1,
    pregunta: '¿Qué puede hacer el prefecto en la app móvil?',
    respuesta: 'El prefecto puede escanear el código QR de la credencial de un alumno para consultar su información, buscar alumnos por nombre o boleta, filtrar el padrón por grupo o estado académico, ver el historial de accesos de cada alumno, y bloquear/desbloquear credenciales. El prefecto no registra entradas ni salidas; eso es función del vigilante en la plataforma web.',
  },
  {
    id: 2,
    pregunta: '¿Cómo escaneo el QR de un alumno?',
    respuesta: 'Desde el menú principal toca "Escanear QR". Apunta la cámara al código QR de la credencial escolar del alumno. El sistema lo identificará automáticamente y mostrará su información. Si el QR no es reconocido, prueba con mejor iluminación o usa la opción "Buscar alumno" para ingresarlo manualmente.',
  },
  {
    id: 3,
    pregunta: '¿Cómo busco a un alumno si no tengo su credencial?',
    respuesta: 'Desde el menú principal toca "Buscar alumno". Escribe al menos 2 caracteres del nombre o el número de boleta completo. El sistema buscará en tiempo real contra la base de datos del CECyT 9.',
  },
  {
    id: 4,
    pregunta: '¿Qué significa que un alumno aparece como "Bloqueado"?',
    respuesta: 'Un alumno bloqueado no puede registrar entrada al plantel con su credencial QR. El bloqueo puede ser:\n\n• Bloqueo de sistema: ocurrió automáticamente porque el alumno superó el límite de olvidos de credencial (por defecto 3 veces).\n• Bloqueo manual: fue aplicado por un administrador o vigilante.\n\nEn ambos casos el alumno debe pasar a la dirección o prefectura para gestionar el desbloqueo.',
  },
  {
    id: 5,
    pregunta: '¿Puedo bloquear o desbloquear un alumno desde la app?',
    respuesta: 'Sí. Desde la pantalla "Filtrar alumnos", busca al alumno y toca el botón "Bloquear" o "Desbloquear" según corresponda. Solo puedes hacer bloqueo/desbloqueo manual; el bloqueo por sistema (olvidos de credencial) se desactiva automáticamente al presionar "Desbloquear" y también reinicia el contador de olvidos.',
  },
  {
    id: 6,
    pregunta: '¿Qué es "Puertas Abiertas"?',
    respuesta: '"Puertas Abiertas" es un permiso especial asignado por el administrador que permite a un alumno entrar al plantel sin necesidad de escanear su credencial QR. Puede verse como un indicador azul "PUERTA" en la tarjeta del alumno. Este permiso lo gestiona únicamente el administrador desde la plataforma web.',
  },
  {
    id: 7,
    pregunta: '¿Cómo filtro alumnos por grupo o estado académico?',
    respuesta: 'Toca "Filtrar alumnos" en el menú. Verás opciones para filtrar por:\n• Grupo (ej. 6IV7)\n• Estado académico (Activo, Baja Temporal, Egresado, Baja Definitiva)\n• Puertas abiertas\n• Nombre (búsqueda libre)\n\nSelecciona los filtros que necesitas y toca "Buscar alumnos".',
  },
  {
    id: 8,
    pregunta: '¿Qué hago si un alumno no aparece en el sistema?',
    respuesta: 'Si el alumno no aparece al buscar su nombre o boleta, puede deberse a que:\n\n1. El alumno no ha sido dado de alta en el sistema. El administrador debe registrarlo desde la plataforma web.\n2. La boleta ingresada tiene un error de captura.\n3. El alumno está registrado con un nombre diferente al que buscas.\n\nEn este caso, contacta al administrador del sistema o envía un ticket de soporte desde esta misma sección.',
  },
  {
    id: 9,
    pregunta: '¿Cómo veo el historial de accesos de un alumno?',
    respuesta: 'Primero selecciona al alumno (escaneando su QR o buscándolo). Luego, en el menú principal aparecerá la sección "Alumno seleccionado". Toca "Historial de acceso" para ver los últimos 30 registros de entradas, salidas y retardos con fecha, hora y punto de acceso.',
  },
  {
    id: 10,
    pregunta: '¿Cuál es la diferencia entre un retardo y una falta?',
    respuesta: '• Retardo: el alumno llegó tarde. Se registra automáticamente cuando el alumno escanea su QR después del tiempo de tolerancia establecido (20 minutos por defecto). Suma al contador de retardos.\n\n• Falta: el alumno no asistió al plantel ese día. La falta es registrada por el administrador o automáticamente por el sistema según las reglas de negocio. Suma al contador de faltas.\n\nAmbos contadores son visibles en el expediente del alumno.',
  },
  {
    id: 11,
    pregunta: '¿Qué es "Sin Credencial" y cuándo se registra?',
    respuesta: '"Sin Credencial" (tipo 4) se registra cuando el vigilante da acceso manual a un alumno que olvidó o perdió su credencial QR. El sistema lleva un contador de estos eventos. Si el alumno supera el límite configurado (por defecto 3 veces), su credencial se bloquea automáticamente.',
  },
  {
    id: 12,
    pregunta: '¿La app funciona sin conexión a internet?',
    respuesta: 'No. La app requiere conexión a internet activa para consultar la base de datos del CECyT 9 en la nube. Si no hay conexión, las búsquedas y el escaneo QR no funcionarán. Asegúrate de tener datos móviles o WiFi disponibles.',
  },
  {
    id: 13,
    pregunta: '¿Cómo cierro sesión?',
    respuesta: 'Toca el ícono de salida (flecha hacia afuera) en la esquina superior derecha del menú principal. Se cerrará tu sesión y regresarás a la pantalla de inicio de sesión.',
  },
  {
    id: 14,
    pregunta: '¿Qué hago si el código QR no se escanea?',
    respuesta: 'Prueba lo siguiente:\n1. Asegúrate de tener suficiente iluminación.\n2. Mantén el código QR estable y a 15–25 cm de la cámara.\n3. Limpia la lente de la cámara del dispositivo.\n4. Si la credencial está dañada o el QR no es legible, usa la opción "Buscar alumno" para buscarlo por nombre o boleta.\n5. Si el problema persiste, envía un ticket de soporte.',
  },
  {
    id: 15,
    pregunta: '¿Con qué usuario y contraseña entro a la app?',
    respuesta: 'Usa el mismo usuario y contraseña que utilizas para acceder al sistema web QR-Pass (plataforma de prefectura). Solo pueden ingresar cuentas con rol Prefecto o Administrador. Si olvidaste tu contraseña, restablécela desde la plataforma web en "¿Olvidaste tu contraseña?".',
  },
  {
    id: 16,
    pregunta: '¿Cómo envío un reporte o ticket de soporte?',
    respuesta: 'En esta misma pantalla de Soporte, toca la pestaña "Nuevo Ticket". Llena el formulario con el asunto, descripción del problema, módulo afectado y prioridad. El equipo de soporte recibirá tu reporte y lo atenderá. Puedes indicar si es urgente si el problema impide la operación del plantel.',
  },
  {
    id: 17,
    pregunta: '¿Por qué no aparecen alumnos nuevos en el sistema?',
    respuesta: 'El sistema actualiza datos en tiempo real desde la base de datos central. Si un alumno fue agregado recientemente, debería aparecer al buscar. Si no aparece, puede ser porque:\n1. El administrador aún no lo ha dado de alta.\n2. La carga masiva desde Excel aún no se ha procesado.\n\nContacta al administrador del sistema.',
  },
  {
    id: 18,
    pregunta: '¿Mis datos como usuario del sistema están protegidos?',
    respuesta: 'Sí. El sistema cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Tu contraseña nunca se almacena en texto claro (usa cifrado bcrypt). Las comunicaciones van cifradas (HTTPS/TLS). Todas las acciones quedan registradas en una bitácora de auditoría para trazabilidad institucional.',
  },
];

// ── Componente accordion para una pregunta ────────────────────
const FaqItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.faqCard, open && styles.faqCardOpen]}
      onPress={() => setOpen(v => !v)}
      activeOpacity={0.85}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQ, open && styles.faqQOpen]}>{item.pregunta}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={open ? '#8B2453' : '#999'}
          style={{ marginLeft: 8, flexShrink: 0 }}
        />
      </View>
      {open && <Text style={styles.faqA}>{item.respuesta}</Text>}
    </TouchableOpacity>
  );
};

// ── Pantalla principal ─────────────────────────────────────────
const SoporteScreen = ({ onBack, user }) => {
  const [tab, setTab] = useState('faq'); // 'faq' | 'ticket'

  // ── Estado del formulario de ticket ──────────────────────────
  const [asunto,      setAsunto]      = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modulo,      setModulo]      = useState('App Móvil');
  const [prioridad,   setPrioridad]   = useState('media');
  const [sending,     setSending]     = useState(false);

  const MODULOS    = ['App Móvil', 'Alumnos', 'Acceso / QR', 'Reportes', 'Usuarios', 'Otro'];
  const PRIORIDADES = [
    { value: 'baja',    label: 'Baja',    color: '#27ae60' },
    { value: 'media',   label: 'Media',   color: '#f39c12' },
    { value: 'alta',    label: 'Alta',    color: '#e67e22' },
    { value: 'urgente', label: 'Urgente', color: '#e74c3c' },
  ];

  const enviarTicket = async () => {
    if (!asunto.trim()) { Alert.alert('Campo requerido', 'Escribe un asunto para el ticket.'); return; }
    if (!descripcion.trim()) { Alert.alert('Campo requerido', 'Describe el problema o solicitud.'); return; }

    setSending(true);
    try {
      const { error } = await supabase
        .from('tickets_soporte')
        .insert({
          id_usuario:  user?.id,
          asunto:      asunto.trim().slice(0, 120),
          descripcion: descripcion.trim(),
          modulo,
          prioridad,
        });

      if (error) throw error;

      Alert.alert(
        'Ticket enviado',
        'Tu reporte fue recibido. El equipo de soporte lo atenderá pronto.',
        [{ text: 'Aceptar', onPress: () => { setAsunto(''); setDescripcion(''); setModulo('App Móvil'); setPrioridad('media'); } }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo enviar el ticket. Intenta más tarde.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soporte y Ayuda</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'faq' && styles.tabActive]}
          onPress={() => setTab('faq')}
        >
          <Ionicons name="help-circle-outline" size={16} color={tab === 'faq' ? '#8B2453' : '#888'} />
          <Text style={[styles.tabText, tab === 'faq' && styles.tabTextActive]}>Preguntas frecuentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'ticket' && styles.tabActive]}
          onPress={() => setTab('ticket')}
        >
          <Ionicons name="create-outline" size={16} color={tab === 'ticket' ? '#8B2453' : '#888'} />
          <Text style={[styles.tabText, tab === 'ticket' && styles.tabTextActive]}>Nuevo ticket</Text>
        </TouchableOpacity>
      </View>

      {/* ── TAB FAQ ──────────────────────────────────────────── */}
      {tab === 'faq' && (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionNote}>
            Preguntas frecuentes para el rol de Prefecto — {FAQ_PREFECTO.length} respuestas
          </Text>
          {FAQ_PREFECTO.map(item => (
            <FaqItem key={item.id} item={item} />
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── TAB TICKET ───────────────────────────────────────── */}
      {tab === 'ticket' && (
        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionNote}>
            Describe el problema o solicitud. El equipo de soporte lo atenderá.
          </Text>

          {/* Asunto */}
          <Text style={styles.fieldLabel}>Asunto *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: No puedo escanear el QR de un alumno"
            placeholderTextColor="#aaa"
            value={asunto}
            onChangeText={setAsunto}
            maxLength={120}
          />
          <Text style={styles.charCount}>{asunto.length}/120</Text>

          {/* Módulo */}
          <Text style={styles.fieldLabel}>Módulo afectado</Text>
          <View style={styles.chipRow}>
            {MODULOS.map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, modulo === m && styles.chipActive]}
                onPress={() => setModulo(m)}
              >
                <Text style={[styles.chipText, modulo === m && styles.chipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Prioridad */}
          <Text style={styles.fieldLabel}>Prioridad</Text>
          <View style={styles.chipRow}>
            {PRIORIDADES.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[styles.chip, prioridad === p.value && { backgroundColor: p.color + '22', borderColor: p.color }]}
                onPress={() => setPrioridad(p.value)}
              >
                <Text style={[styles.chipText, prioridad === p.value && { color: p.color, fontWeight: '700' }]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Descripción */}
          <Text style={styles.fieldLabel}>Descripción del problema *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe detalladamente qué ocurre, qué pasos realizaste y qué resultado esperabas…"
            placeholderTextColor="#aaa"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Botón enviar */}
          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={enviarTicket}
            disabled={sending}
          >
            {sending
              ? <ActivityIndicator color="white" />
              : <>
                  <Ionicons name="send-outline" size={18} color="white" />
                  <Text style={styles.sendBtnText}>Enviar ticket</Text>
                </>
            }
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const G = '#8B2453';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingTop: 58, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: '#fff',
  },
  backBtn:     { padding: 6 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 19, fontWeight: 'bold', color: '#111' },

  tabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: '#fff',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13,
  },
  tabActive:     { borderBottomWidth: 2.5, borderBottomColor: G },
  tabText:       { fontSize: 13, color: '#888', fontWeight: '500' },
  tabTextActive: { color: G, fontWeight: '700' },

  body: { flex: 1, paddingHorizontal: 16 },
  sectionNote: { fontSize: 12, color: '#999', marginTop: 14, marginBottom: 12, textAlign: 'center' },

  // FAQ
  faqCard: {
    borderWidth: 1, borderColor: '#EEE', borderRadius: 12,
    padding: 14, marginBottom: 8, backgroundColor: '#FAFAFA',
  },
  faqCardOpen: { borderColor: G + '60', backgroundColor: '#FFF5F8' },
  faqHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333', lineHeight: 20 },
  faqQOpen: { color: G },
  faqA: { fontSize: 13, color: '#555', lineHeight: 20, marginTop: 10 },

  // Ticket form
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F8F8F8',
  },
  textarea: { minHeight: 110, maxHeight: 200 },
  charCount: { fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 3 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    borderWidth: 1.5, borderColor: '#DDD', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#F8F8F8',
  },
  chipActive:     { borderColor: G, backgroundColor: G + '15' },
  chipText:       { fontSize: 12, color: '#555', fontWeight: '500' },
  chipTextActive: { color: G, fontWeight: '700' },

  sendBtn: {
    backgroundColor: G, borderRadius: 30, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 22,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default SoporteScreen;
