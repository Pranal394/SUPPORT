import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Ticket } from '../types';
import TicketForm from './TicketForm';
import ChatWindow from './ChatWindow';
import { Plus, MessageCircle, Clock, CheckCircle2, AlertCircle, ChevronRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
      setTickets(ticketsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'closed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Support Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage your technical support requests and communicate with staff.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-800 transition-all text-sm"
        >
          <Plus className="w-5 h-5" />
          Create New Ticket
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> My Tickets ({tickets.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm italic">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm italic">No tickets found. Create your first support request.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-5 transition-all hover:bg-gray-50 flex items-start justify-between group ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-xs font-bold uppercase tracking-tight text-gray-400">{ticket.department}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{ticket.subject}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {ticket.id.slice(0, 8)}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform text-gray-300 group-hover:translate-x-1 ${selectedTicket?.id === ticket.id ? 'text-blue-500 translate-x-1' : ''}`} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <ChatWindow ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-gray-200 h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10 text-blue-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Select a Ticket</h3>
                  <p className="text-gray-500 max-w-xs text-sm">Pick a ticket from the sidebar to view details and start a conversation with our support team.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showCreateForm && (
        <TicketForm 
          onClose={() => setShowCreateForm(false)} 
          onSuccess={() => setShowCreateForm(false)} 
        />
      )}
    </div>
  );
};

export default UserDashboard;
