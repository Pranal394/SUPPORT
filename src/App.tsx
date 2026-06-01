import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
