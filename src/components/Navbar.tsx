import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, auth } from '../lib/firebase';
import { Shield, LayoutDashboard, Settings, LogOut, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  setView: (view: 'landing' | 'user' | 'admin') => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ setView, currentView }) => {
  const { user, profile, isAdmin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setView('user')}
            className="flex items-center gap-2 text-blue-900 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <Shield className="w-6 h-6" fill="currentColor" />
            <span>SHARDS<span className="text-gray-400 font-light ml-1">CONNECT</span></span>
          </button>

          {user && (
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => setView('user')}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${currentView === 'user' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Dashboard
              </button>
              {isAdmin && (
                <button 
                  onClick={() => setView('admin')}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${currentView === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Admin Portal
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="bg-blue-900 text-white px-5 py-2 rounded shadow-sm hover:bg-blue-800 transition-all text-sm font-medium flex items-center gap-2"
            >
              Sign In with Google
            </button>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-8 h-8 rounded-full shadow-sm" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="hidden sm:block text-left mr-1">
                  <p className="text-xs font-semibold leading-none">{profile?.displayName?.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{profile?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden py-1 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{profile?.displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                    </div>
                    <button 
                      onClick={() => { setView('user'); setIsDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      My Tickets
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => { setView('admin'); setIsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Admin Settings
                      </button>
                    )}
                    <button 
                      onClick={() => auth.signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
