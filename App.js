// App.js — Punto de entrada de la app móvil QR-Pass Prefecto.
// Auth personalizado contra usuarios_sistema (NO usa Supabase Auth).

import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen   from './components/login';
import MainMenu      from './components/main';
import CameraScreen  from './components/camera';
import SearchScreen  from './components/buscar';
import HistoryScreen from './components/historial';
import InfoScreen    from './components/info';
import FiltrarScreen from './components/filtrar';
import SoporteScreen from './components/soporte';
import LegalScreen   from './components/legal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user,          setUser]          = useState(null);       // { id, usuario, nombre, rol }
  const [studentData,   setStudentData]   = useState(null);       // alumno actualmente seleccionado
  const [studentSchedule, setStudentSchedule] = useState([]);

  const navigateTo = (screen) => setCurrentScreen(screen);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigateTo('menu');
  };

  const handleLogout = () => {
    setUser(null);
    setStudentData(null);
    setStudentSchedule([]);
    navigateTo('login');
  };

  const handleStudentScanned = (data, schedule = []) => {
    setStudentData(data);
    setStudentSchedule(schedule);
    navigateTo('menu');
  };

  const handleStudentSelected = (data, schedule = []) => {
    setStudentData(data);
    setStudentSchedule(schedule);
    navigateTo('menu');
  };

  // Desde FiltrarScreen → ver info del alumno seleccionado
  const handleFiltrarSelect = (data) => {
    setStudentData(data);
    setStudentSchedule([]);  // se carga lazy en InfoScreen
    navigateTo('info');
  };

  switch (currentScreen) {

    case 'login':
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;

    case 'camera':
      return (
        <CameraScreen
          onClose={() => navigateTo('menu')}
          onStudentScanned={handleStudentScanned}
        />
      );

    case 'search':
      return (
        <SearchScreen
          onBack={() => navigateTo('menu')}
          onStudentSelect={handleStudentSelected}
        />
      );

    case 'history':
      return (
        <HistoryScreen
          onBack={() => navigateTo('menu')}
          studentData={studentData}
        />
      );

    case 'info':
      return (
        <InfoScreen
          onBack={() => navigateTo('menu')}
          studentData={studentData}
          studentSchedule={studentSchedule}
        />
      );

    case 'filtrar':
      return (
        <FiltrarScreen
          onBack={() => navigateTo('menu')}
          onStudentSelect={handleFiltrarSelect}
        />
      );

    case 'soporte':
      return (
        <SoporteScreen
          onBack={() => navigateTo('menu')}
          user={user}
        />
      );

    case 'legal':
      return (
        <LegalScreen
          onBack={() => navigateTo('menu')}
        />
      );

    case 'menu':
    default:
      return (
        <MainMenu
          user={user}
          studentData={studentData}
          onOpenCamera={()    => navigateTo('camera')}
          onOpenSearch={()    => navigateTo('search')}
          onOpenFiltrar={()   => navigateTo('filtrar')}
          onOpenInfo={()      => navigateTo('info')}
          onOpenHistory={()   => navigateTo('history')}
          onOpenSoporte={()   => navigateTo('soporte')}
          onOpenLegal={()     => navigateTo('legal')}
          onLogout={handleLogout}
        />
      );
  }
}
