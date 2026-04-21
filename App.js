import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from './utils/supabase';

import LoginScreen    from './components/login';
import MainMenu       from './components/main';
import CameraScreen   from './components/camera';
import SearchScreen   from './components/buscar';
import HistoryScreen  from './components/historial';
import InfoScreen     from './components/info';

export default function App() {
  const [currentScreen, setCurrentScreen]           = useState('login');
  const [scannedStudentData, setScannedStudentData] = useState(null);
  const [studentSchedule, setStudentSchedule]       = useState([]);
  const [accreditedSubjects, setAccreditedSubjects] = useState([]);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [user, setUser]                             = useState(null);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setCurrentScreen('menu');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setCurrentScreen('menu');
      } else {
        setUser(null);
        setCurrentScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setScannedStudentData(null);
      setStudentSchedule([]);
      setAccreditedSubjects([]);
      setConsultationHistory([]);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleLoginSuccess = () => {
    setCurrentScreen('menu');
  };

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  const updateStudentData = (studentData, schedule, accredited) => {
    setScannedStudentData(studentData);
    if (schedule)   setStudentSchedule(schedule);
    if (accredited) setAccreditedSubjects(accredited);
  };

  const updateConsultationHistory = (history) => {
    setConsultationHistory(history);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B2453" />
      </View>
    );
  }

  switch (currentScreen) {
    case 'login':
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;

    case 'camera':
      return (
        <CameraScreen
          onClose={() => navigateTo('menu')}
          onStudentScanned={(studentData, schedule, accredited) => {
            updateStudentData(studentData, schedule, accredited);
            navigateTo('menu');
          }}
        />
      );

    case 'search':
      return (
        <SearchScreen
          onBack={() => navigateTo('menu')}
          onStudentSelect={(studentData, schedule, accredited) => {
            updateStudentData(studentData, schedule, accredited);
            navigateTo('menu');
          }}
        />
      );

    case 'history':
      return (
        <HistoryScreen
          onBack={() => navigateTo('menu')}
          studentData={scannedStudentData}
          consultationHistory={consultationHistory}
          onHistoryLoaded={updateConsultationHistory}
        />
      );

    case 'info':
      return (
        <InfoScreen
          onBack={() => navigateTo('menu')}
          studentData={scannedStudentData}
          studentSchedule={studentSchedule}
          accreditedSubjects={accreditedSubjects}
        />
      );

    case 'menu':
    default:
      return (
        <MainMenu
          studentData={scannedStudentData}
          onOpenCamera={() => navigateTo('camera')}
          onOpenSearch={() => navigateTo('search')}
          onOpenInfo={() => navigateTo('info')}
          onOpenHistory={() => navigateTo('history')}
          onLogout={handleLogout}
        />
      );
  }
}