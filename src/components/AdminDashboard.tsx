import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Ticket, AuditLog, Department } from '../types';
import ChatWindow from './ChatWindow';
import DeptManager from './DeptManager';
import { BarChart3, Users, ClipboardCheck, History, Filter, ArrowUpRight, MessageSquare, Shield, Lock, Fingerprint, Briefcase, Heart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const { profile, isSuperAdmin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'tickets' | 'admin-settings' | 'audit-logs'>('tickets');

  const departments: Department[] = [
    'Shards Connect', 'Shards Shields', 'Shards Security', 'Suraksha Sankalp - Shards Connect', 'Cif Shards Connect'
  ];

  useEffect(() => {
    if (!profile) return;

    // Filter tickets by allowed departments if not admin
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    
    // In code we also filter for extra safety although rules handle it
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];

      // Filter by assigned departments if not super admin or full admin
      if (profile.role === 'staff' && profile.assignedDepartments) {
        ticketsData = ticketsData.filter(t => profile.assignedDepartments?.includes(t.department));
      }

      setTickets(ticketsData);
    });

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AuditLog[];
      setAuditLogs(logs);
    });
    return () => unsubscribe();
  }, [isSuperAdmin]);

  const filteredTickets = selectedDept === 'All' 
    ? tickets 
    : tickets.filter(t => t.department === selectedDept);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    closed: tickets.filter(t => t.status === 'closed').length,
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
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Admin Intelligence Portal</h1>
          <p className="text-gray-500 text-sm">Monitor departmental performance and manage security escalations.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'tickets' ? 'bg-blue-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <MessageSquare className="w-4 h-4" /> Operations
          </button>
          {isSuperAdmin && (
            <button 
              onClick={() => setActiveTab('admin-settings')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'admin-settings' ? 'bg-blue-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Users className="w-4 h-4" /> Identity Control
            </button>
          )}
          {isSuperAdmin && (
            <button 
              onClick={() => setActiveTab('audit-logs')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'audit-logs' ? 'bg-blue-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <History className="w-4 h-4" /> Audit
            </button>
          )}
        </div>
      </header>

      {activeTab === 'tickets' && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Volume', value: stats.total, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Unresolved', value: stats.open, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'In Progress', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Resolution Rate', value: stats.total ? `${Math.round((stats.closed / stats.total) * 100)}%` : '0%', icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg">Departmental Queue</h3>
                    <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Live Feed</div>
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all appearance-none"
                    >
                      <option value="All">All Departments</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="flex-grow overflow-y-auto divide-y divide-gray-100">
                  {filteredTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-6 transition-all hover:bg-gray-50 flex flex-col gap-3 group ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-white border border-gray-100 text-blue-900`}>
                             {React.createElement(getDeptIcon(ticket.department), { className: 'w-4 h-4' })}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-tight text-gray-400">{ticket.department}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ticket.status === 'open' ? 'bg-red-50 text-red-600' : ticket.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900 leading-tight group-hover:text-blue-900 transition-colors">{ticket.subject}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{ticket.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[10px] text-gray-400 font-mono italic truncate max-w-[150px]">{ticket.userEmail}</p>
                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                  {filteredTickets.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic text-sm">No tickets active in this queue.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedTicket ? (
                  <motion.div
                    key={selectedTicket.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="h-full"
                  >
                    <ChatWindow ticket={selectedTicket} isAdmin onBack={() => setSelectedTicket(null)} />
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-3xl border border-dashed border-gray-200 h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center border-2 border-gray-100">
                      <BarChart3 className="w-12 h-12 text-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight">Queue Management System</h3>
                      <p className="text-gray-500 max-w-sm text-sm">Select a technical request from the departmental queue to initiate resolution procedures.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin-settings' && isSuperAdmin && <DeptManager />}

      {activeTab === 'audit-logs' && isSuperAdmin && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-blue-900 tracking-tight">System Audit Log</h3>
              <p className="text-xs text-gray-500">Immutable record of all administrative identity and permission changes.</p>
            </div>
            <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Compliance Ready</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4">Admin Email</th>
                  <th className="px-8 py-4">Action Taken</th>
                  <th className="px-8 py-4">Target Details</th>
                  <th className="px-8 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 text-sm font-semibold text-gray-900">{log.adminEmail}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${log.action.includes('ROLE') ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500">{log.details || log.targetId}</td>
                    <td className="px-8 py-5 text-sm font-mono text-gray-400">
                      {log.timestamp?.toDate() ? new Date(log.timestamp.toDate()).toLocaleString() : 'Processing...'}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">No audit records identified in current session.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Dummy icons for missing ones
const AlertCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default AdminDashboard;
