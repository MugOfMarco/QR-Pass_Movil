// utils/authService.js
// Autenticación personalizada contra la tabla usuarios_sistema.
// El sistema web NO usa Supabase Auth — usa bcrypt + sessions propio.
// Aquí verificamos la contraseña con bcryptjs y validamos el rol.

import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

export const authService = {

  async login(usuario, password) {
    if (!usuario?.trim() || !password) {
      throw new Error('Ingresa usuario y contraseña.');
    }

    // 1. Buscar usuario en la tabla usuarios_sistema
    const { data, error } = await supabase
      .from('usuarios_sistema')
      .select(`
        id_usuario,
        usuario,
        nombre_completo,
        email,
        password_hash,
        roles ( nombre_rol )
      `)
      .eq('usuario', usuario.trim())
      .maybeSingle();

    if (error) throw new Error('Error de conexión con la base de datos.');
    if (!data)  throw new Error('Usuario o contraseña incorrectos.');

    // 2. Verificar contraseña con bcrypt
    const passwordOk = await bcrypt.compare(password, data.password_hash);
    if (!passwordOk) throw new Error('Usuario o contraseña incorrectos.');

    // 3. Verificar que el rol tenga acceso a esta app
    const rol = data.roles?.nombre_rol;
    if (!['Prefecto', 'Administrador'].includes(rol)) {
      throw new Error('Tu rol no tiene acceso a esta aplicación.');
    }

    return {
      id:      data.id_usuario,
      usuario: data.usuario,
      nombre:  data.nombre_completo,
      email:   data.email,
      rol,
    };
  },
};
