// utils/authService.js
// Autenticación via Supabase RPC (función mobile_login).
// La verificación de bcrypt ocurre en PostgreSQL — no se expone password_hash.
// No depende de Render, solo de Supabase (siempre activo).

import { supabase } from './supabase';

export const authService = {

  async login(usuario, password) {
    if (!usuario?.trim() || !password) {
      throw new Error('Ingresa usuario y contraseña.');
    }

    const { data, error } = await supabase.rpc('mobile_login', {
      p_usuario:  usuario.trim(),
      p_password: password,
    });

    if (error) throw new Error(`Error: ${error.message}`);

    if (!data.success) throw new Error(data.message);

    return data.user;
  },
};
