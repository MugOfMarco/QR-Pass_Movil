import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../utils/supabase';

const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      onLoginSuccess();
    } catch (error) {
      console.error('Error de autenticación:', error);

      let errorMessage = 'Error al iniciar sesión';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Confirma tu email antes de iniciar sesión';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContent}>
        <Text style={styles.loginTitle}>QR PASS APP</Text>
        <Text style={styles.loginSubtitle}>Iniciar Sesión</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.loginHint}>
          Usa el email y contraseña registrados en Supabase Auth
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loginContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    color: '#000000',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loginSubtitle: {
    color: '#8B2453',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#8B2453',
    borderWidth: 2,
    borderColor: '#591634',
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    alignItems: 'center',
    minWidth: 200,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default LoginScreen;