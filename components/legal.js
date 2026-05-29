// components/legal.js
// Pantalla de información legal — Aviso de Privacidad, T&C, protección de menores.
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SECCIONES = [
  {
    id: 'privacidad',
    icon: 'shield-checkmark-outline',
    titulo: 'Aviso de Privacidad',
    contenido: [
      {
        subtitulo: 'Responsable del tratamiento',
        texto: 'Wolf-Ware, actuando bajo encargo del CECyT 9 "Juan de Dios Bátiz" del Instituto Politécnico Nacional (IPN). Domicilio: Mar Mediterráneo 227, Col. Popotla, Alcaldía Miguel Hidalgo, C.P. 11400, CDMX.\n\nContacto: mjimenezv2302@alumno.ipn.mx',
      },
      {
        subtitulo: 'Datos personales recabados',
        texto: '• Alumnos: nombre, boleta, fotografía*, grupo, estado académico, historial de accesos e incidencias.\n• Personal del sistema: nombre, usuario, contraseña cifrada (bcrypt), correo electrónico, rol.\n\n* La fotografía del alumno es un dato sensible conforme al Art. 3 fracc. VI LFPDPPP.',
      },
      {
        subtitulo: 'Finalidades del tratamiento',
        texto: 'PRIMARIAS: control de acceso al plantel, registro de asistencia, gestión de incidencias (retardos, faltas, olvidos de credencial), cumplimiento del Reglamento IPN Arts. 107–108, protocolos de Protección Civil.\n\nSECUNDARIAS: análisis estadístico de asistencia, mejora del sistema. Puede oponerse escribiendo al correo de contacto.',
      },
      {
        subtitulo: 'Transferencias internacionales',
        texto: 'Sus datos son procesados por:\n• Supabase, Inc. (EUA) — base de datos\n• Cloudinary Ltd. (EUA) — fotografías\n• Render Services (EUA) — hosting web\n\nBajo cláusulas contractuales y conforme a los Arts. 36–37 LFPDPPP.',
      },
      {
        subtitulo: 'Seguridad',
        texto: 'Contraseñas cifradas con bcrypt · Comunicaciones con HTTPS/TLS · Control de acceso por roles (RBAC) · Bitácora de auditoría completa · Tokens de sesión con expiración automática.',
      },
    ],
  },
  {
    id: 'menores',
    icon: 'people-outline',
    titulo: 'Protección de Datos de Menores',
    contenido: [
      {
        subtitulo: 'Marco legal aplicable',
        texto: 'La mayoría de alumnos del CECyT 9 son menores de 18 años. El sistema cumple con:\n\n• Ley General de los Derechos de Niñas, Niños y Adolescentes (LGDNNA), Arts. 76–78: derecho a la intimidad y privacidad.\n• Ley Federal de Protección de Datos Personales (LFPDPPP), Art. 9: consentimiento para datos sensibles.',
      },
      {
        subtitulo: 'Medidas especiales',
        texto: '1. El consentimiento para tratar datos de menores se obtiene durante el proceso de inscripción al CECyT 9, donde los padres/tutores firman el formato de reconocimiento de obligaciones del plantel.\n\n2. Los datos de menores NO son visibles al público; requieren autenticación institucional.\n\n3. Las fotografías de menores se almacenan con cifrado en tránsito (HTTPS) y en reposo.\n\n4. Ningún dato de menores se comparte con terceros no autorizados, medios de comunicación ni redes sociales.\n\n5. Los datos de menores se conservan durante el período activo de inscripción más 5 años.',
      },
      {
        subtitulo: 'Derechos de los menores',
        texto: 'Los alumnos menores pueden ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) a través de sus padres, madres o tutores legales, enviando solicitud a:\n\nmjimenezv2302@alumno.ipn.mx\nAsunto: "Derechos ARCO Menor — QR-Pass"\n\nTiempo de respuesta: 10 días hábiles.',
      },
    ],
  },
  {
    id: 'terminos',
    icon: 'document-text-outline',
    titulo: 'Términos y Condiciones',
    contenido: [
      {
        subtitulo: 'Usuarios autorizados',
        texto: 'El sistema QR-Pass es de uso institucional exclusivo para personal del CECyT 9 con rol asignado (Administrador, Vigilante, Prefecto, Soporte). Las credenciales son personales e intransferibles. Compartirlas viola el Art. 108 fracc. XII del Reglamento IPN (suplantación).',
      },
      {
        subtitulo: 'Marco legal',
        texto: '• LFPDPPP — protección de datos personales\n• LGDNNA Arts. 76–78 — datos de menores\n• Reglamento IPN Arts. 107–111 — obligaciones y sanciones\n• LFTAIP — transparencia (IPN es institución pública)\n• Protocolo de Seguridad EDOMEX (2023) — control de acceso con bitácora\n• Código Civil Federal — responsabilidad civil',
      },
      {
        subtitulo: 'Usos prohibidos',
        texto: '• Acceder sin autorización institucional\n• Suplantar identidad de otro usuario o alumno\n• Falsificar o alterar registros de asistencia\n• Divulgar datos de alumnos a terceros no autorizados\n• Intentar vulnerar los mecanismos de seguridad\n• Cualquier uso contrario al Art. 108 del Reglamento IPN',
      },
      {
        subtitulo: 'Ley aplicable',
        texto: 'Estos términos se rigen por las leyes vigentes en los Estados Unidos Mexicanos. Para controversias, las partes se someten a los Tribunales de la Ciudad de México.',
      },
    ],
  },
  {
    id: 'arco',
    icon: 'finger-print-outline',
    titulo: 'Derechos ARCO',
    contenido: [
      {
        subtitulo: 'Sus derechos',
        texto: 'Conforme a los Arts. 22–25 de la LFPDPPP, usted tiene derecho a:\n\n• ACCESO: conocer qué datos tiene el sistema sobre usted.\n• RECTIFICACIÓN: corregir datos inexactos o incompletos.\n• CANCELACIÓN: solicitar la eliminación de sus datos.\n• OPOSICIÓN: oponerse al uso de sus datos para finalidades secundarias.',
      },
      {
        subtitulo: 'Cómo ejercerlos',
        texto: 'Envíe un correo a:\nmjimenezv2302@alumno.ipn.mx\nAsunto: "Ejercicio de Derechos ARCO — QR-Pass"\n\nIncluya: nombre completo, boleta o usuario, y el derecho que desea ejercer.\n\nPara menores: el padre/madre/tutor debe acreditar su relación con el titular.\n\nTiempo de respuesta: máximo 10 días hábiles para confirmación.',
      },
      {
        subtitulo: 'Autoridad competente',
        texto: 'Si no obtiene respuesta satisfactoria, puede presentar queja ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI):\n\nwww.inai.org.mx\nTeléfono: 55 5004-2400',
      },
    ],
  },
];

// ── Sección expandible ────────────────────────────────────────
const SeccionLegal = ({ seccion }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.seccionCard}>
      <TouchableOpacity style={styles.seccionHeader} onPress={() => setOpen(v => !v)} activeOpacity={0.8}>
        <View style={styles.seccionIconWrap}>
          <Ionicons name={seccion.icon} size={20} color="#8B2453" />
        </View>
        <Text style={styles.seccionTitulo}>{seccion.titulo}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
      </TouchableOpacity>

      {open && (
        <View style={styles.seccionBody}>
          {seccion.contenido.map((bloque, i) => (
            <View key={i} style={styles.bloqueTexto}>
              <Text style={styles.bloqueSubtitulo}>{bloque.subtitulo}</Text>
              <Text style={styles.bloqueContenido}>{bloque.texto}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const LegalScreen = ({ onBack }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Aviso Legal y Privacidad</Text>
      <View style={{ width: 36 }} />
    </View>

    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.bannerMenores}>
        <Ionicons name="alert-circle-outline" size={18} color="#7c1f1f" />
        <Text style={styles.bannerText}>
          La mayoría de los alumnos del CECyT 9 son menores de 18 años. Sus datos están protegidos
          bajo la LGDNNA y la LFPDPPP.
        </Text>
      </View>

      <Text style={styles.metaInfo}>
        CECyT 9 "Juan de Dios Bátiz" — IPN · Wolf-Ware{'\n'}
        Versión 2.0 · Actualizado: 27 de mayo de 2026
      </Text>

      {SECCIONES.map(s => <SeccionLegal key={s.id} seccion={s} />)}

      <View style={styles.contactBox}>
        <Ionicons name="mail-outline" size={18} color="#8B2453" />
        <Text style={styles.contactText}>
          Contacto de privacidad:{'\n'}
          mjimenezv2302@alumno.ipn.mx{'\n'}
          Asunto: "Privacidad — QR-Pass"
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingTop: 58, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: '#fff',
  },
  backBtn:     { padding: 6 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111' },

  body: { flex: 1, paddingHorizontal: 16 },

  bannerMenores: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFF3E0', borderRadius: 10,
    borderLeftWidth: 4, borderLeftColor: '#e67e22',
    padding: 12, marginTop: 16, marginBottom: 4,
  },
  bannerText: { flex: 1, fontSize: 12.5, color: '#5d3a00', lineHeight: 19 },

  metaInfo: {
    fontSize: 11, color: '#aaa', textAlign: 'center',
    marginVertical: 12, lineHeight: 17,
  },

  seccionCard: {
    borderWidth: 1, borderColor: '#EEE', borderRadius: 12,
    marginBottom: 10, overflow: 'hidden',
  },
  seccionHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: '#FAFAFA', gap: 10,
  },
  seccionIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#8B245315', justifyContent: 'center', alignItems: 'center',
  },
  seccionTitulo: { flex: 1, fontSize: 14, fontWeight: '700', color: '#222' },

  seccionBody: { padding: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  bloqueTexto:     { marginBottom: 14 },
  bloqueSubtitulo: { fontSize: 12.5, fontWeight: '700', color: '#8B2453', marginBottom: 5 },
  bloqueContenido: { fontSize: 12.5, color: '#444', lineHeight: 19 },

  contactBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginTop: 6,
  },
  contactText: { flex: 1, fontSize: 12.5, color: '#444', lineHeight: 19 },
});

export default LegalScreen;
