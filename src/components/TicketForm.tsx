import React, { useState } from 'react';
import { useAuth, handleFirestoreError, OperationType } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, FirestoreError } from 'firebase/firestore';
import { Department, TicketStatus } from '../types';
import { LucideProps, X, Send, Shield, Lock, Fingerprint, Heart, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

interface TicketFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [department, setDepartment] = useState<Department | ''>('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departments: { name: Department; icon: React.ComponentType<LucideProps>; color: string }[] = [
    { name: 'Shards Connect', icon: Shield, color: 'text-blue-600' },
    { name: 'Shards Shields', icon: Lock, color: 'text-indigo-600' },
    { name: 'Shards Security', icon: Fingerprint, color: 'text-emerald-600' },
    { name: 'Suraksha Sankalp - Shards Connect', icon: Heart, color: 'text-red-600' },
    { name: 'Cif Shards Connect', icon: Briefcase, color: 'text-amber-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !department || !subject || !description) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'tickets'), {
        userId: user.uid,
        userEmail: user.email,
        subject,
        description,
        department,
        status: 'open' as TicketStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onSuccess();
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError("Failed to submit ticket. Please ensure all fields are valid.");
      handleFirestoreError(err as FirestoreError, OperationType.CREATE, 'tickets');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
      >
        <div className="bg-blue-900 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">New Support Request</h2>
              <p className="text-xs text-blue-200">Submit a formal technical grievance to Shards Branches</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
              <X className="w-5 h-5" /> {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Target Department</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {departments.map((dept) => (
                <button
                  key={dept.name}
                  type="button"
                  onClick={() => setDepartment(dept.name)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 group ${department === dept.name ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-100 bg-white'}`}
                >
                  <dept.icon className={`w-6 h-6 ${department === dept.name ? 'text-blue-600' : 'text-gray-400'} transition-transform group-hover:scale-110`} />
                  <span className={`text-xs font-bold leading-tight ${department === dept.name ? 'text-blue-900' : 'text-gray-600'}`}>{dept.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Subject</label>
              <input
                id="subject"
                type="text"
                required
                minLength={5}
                maxLength={200}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Detailed Description</label>
              <textarea
                id="description"
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your technical issue or grievance in detail..."
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !department}
              className="flex-grow bg-blue-900 disabled:opacity-50 text-white px-8 py-5 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Official Support Request
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TicketForm;
