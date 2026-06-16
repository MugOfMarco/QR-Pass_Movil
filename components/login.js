// components/login.js
// Login con usuario/contraseña contra la tabla usuarios_sistema (bcrypt).
// NO usa Supabase Auth — el sistema web tiene su propio auth.

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Alert, TextInput, ActivityIndicator, Image,
} from 'react-native';

const LOGO = require('../assets/logo_sinborde.png');
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../utils/authService';

const LoginScreen = ({ onLoginSuccess }) => {
  const [usuario,      setUsuario]      = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!usuario.trim() || !password) {
      Alert.alert('Campos requeridos', 'Ingresa usuario y contraseña.');
      return;
    }
    try {
      setLoading(true);
      const user = await authService.login(usuario.trim(), password);
      onLoginSuccess(user);
    } catch (err) {
      Alert.alert('Error', err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo / encabezado */}
        <View style={styles.logoWrap}>
          <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.appTitle}>QR Pass</Text>
          <Text style={styles.appSub}>CECyT 9 — Prefectura</Text>
        </View>

        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu usuario del sistema"
          placeholderTextColor="#999"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputFlex}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(v => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnText}>Ingresar</Text>
          }
        </TouchableOpacity>

        <Text style={styles.hint}>
          Usa el mismo usuario y contraseña del sistema web QR-Pass.{'\n'}
          Solo pueden ingresar usuarios con rol Prefecto o Administrador.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7c1f1f',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoImg: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
  },
  appSub: {
    fontSize: 13,
    color: '#8B2453',
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
  },
  inputFlex: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#111',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  btn: {
    backgroundColor: '#8B2453',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 26,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  hint: {
    color: '#999',
    fontSize: 11,
    marginTop: 18,
    textAlign: 'center',
    lineHeight: 17,
  },
});

export default LoginScreen;
