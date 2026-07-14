import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Department, Role } from '../types';
import { UserPlus, Shield, Check, X, Search, Briefcase, Lock, Fingerprint, Heart } from 'lucide-react';

const DeptManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [selectedDepts, setSelectedDepts] = useState<Department[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const departments: Department[] = [
    'Shards Connect', 'Shards Shields', 'Shards Security', 'Suraksha Sankalp - Shards Connect', 'Cif Shards Connect'
  ];

  const toggleDept = (dept: Department) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSearching) return;

    setIsSearching(true);
    setMessage(null);

    try {
      const q = query(collection(db, 'users'), where('email', '==', email.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage({ type: 'error', text: 'User not found. They must sign in to the portal at least once.' });
      } else {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          role,
          assignedDepartments: selectedDepts,
        });

        // Log action
        await addDoc(collection(db, 'auditLogs'), {
          adminId: currentUser?.uid,
          adminEmail: currentUser?.email,
          action: `UPDATE_USER_ROLE_${role.toUpperCase()}`,
          targetId: userDoc.id,
          details: `Granted ${role} access to ${email} for departments: ${selectedDepts.join(', ')}`,
          timestamp: serverTimestamp(),
        });

        setMessage({ type: 'success', text: `Access granted successfully to ${email}.` });
        setEmail('');
        setSelectedDepts([]);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setMessage({ type: 'error', text: 'Administrative failure. Operation aborted.' });
    } finally {
      setIsSearching(false);
    }
  };

  const getDeptIcon = (dept: string) => {
    switch (dept) {
      case 'Shards Shields': return Lock;
      case 'Shards Security': return Fingerprint;
      case 'Suraksha Sankalp - Shards Connect': return Heart;
      case 'Cif Shards Connect': return Briefcase;
      default: return Shield;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xl font-bold text-blue-900 tracking-tight">Identity & Role Management</h3>
        <p className="text-xs text-gray-500">Provision departmental staff and configure granular access controls.</p>
      </div>

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleGrantAccess} className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Personnel Email</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter verified user email..."
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all outline-none"
              />
            </div>
            <p className="text-[10px] text-gray-400 italic pl-1">Note: The user must have logged into the Shards Citadel portal at least once to be identified.</p>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Target Authority Level</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'staff', label: 'Department Staff', desc: 'Can manage tickets in assigned sectors.' },
                { id: 'admin', label: 'Full Admin', desc: 'Unrestricted access to all support sectors.' },
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as Role)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all relative ${role === r.id ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  {role === r.id && <div className="absolute top-4 right-4 bg-blue-600 text-white p-0.5 rounded-full"><Check className="w-3 h-3" /></div>}
                  <p className={`font-bold text-sm ${role === r.id ? 'text-blue-900' : 'text-gray-900'}`}>{r.label}</p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {role === 'staff' && (
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Departmental Allotments</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDept(dept)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedDepts.includes(dept) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white'}`}
                  >
                    <div className={`p-2 rounded-lg ${selectedDepts.includes(dept) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                       {React.createElement(getDeptIcon(dept), { className: 'w-4 h-4' })}
                    </div>
                    <span className={`text-xs font-bold ${selectedDepts.includes(dept) ? 'text-blue-900' : 'text-gray-600'}`}>{dept}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSearching || !email || (role === 'staff' && selectedDepts.length === 0)}
            className="w-full bg-blue-900 disabled:opacity-50 text-white px-8 py-5 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center justify-center gap-3"
          >
            {isSearching ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <UserPlus className="w-5 h-5" />}
            Provision Departmental Access
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeptManager;
