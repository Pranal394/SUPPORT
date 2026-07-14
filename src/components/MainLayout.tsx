import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import LandingPage from './LandingPage';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import { Shield, Lock, Briefcase, Heart, Fingerprint } from 'lucide-react';

type View = 'landing' | 'user' | 'admin';

const MainLayout: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<View>('landing');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  const renderView = () => {
    if (!user) return <LandingPage />;
    
    switch (currentView) {
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <UserDashboard />;
      case 'user':
        return <UserDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      <Navbar setView={setCurrentView} currentView={currentView} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {renderView()}
      </main>

      <footer className="bg-blue-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Shards Citadel
              </h3>
              <p className="text-blue-100 text-sm">
                Official support portal for all Shards branches. Secure, reliable, and professional technical assistance. Formerly Shards Connect.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Our Branches</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2"><Lock className="w-4 h-4" /> Shards Shields</li>
                <li className="flex items-center gap-2"><Fingerprint className="w-4 h-4" /> Shards Security</li>
                <li className="flex items-center gap-2"><Heart className="w-4 h-4" /> Suraksha Sankalp</li>
                <li className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> CIF Shards Citadel</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>Help Center</li>
                <li>API Documentation</li>
                <li>Audit Logs</li>
                <li>Data Protection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Copyright</li>
                <li>Security Standards</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-12 pt-8 text-center text-sm text-blue-200">
            &copy; {new Date().getFullYear()} Shards Citadel (Formerly Shards Connect). All rights reserved. Professional Support Infrastructure.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
