import React from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { Shield, Lock, Fingerprint, Briefcase, Heart, CheckCircle2, ChevronRight, MessageSquare, ClipboardCheck, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 shadow-sm p-8 md:p-16 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest"
          >
            <Shield className="w-4 h-4" /> Official Support Portal
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-blue-900 tracking-tight"
          >
            Secure Technical <br />
            <span className="text-gray-400">Support Infrastructure</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl"
          >
            Unified ticketing and live chat system for all Shards branches. Register your technical grievances with the official Copyright Infringement Framework (CIF) and Security departments.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <button 
              onClick={signInWithGoogle}
              className="w-full sm:w-auto bg-blue-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center justify-center gap-2 group"
            >
              Sign In to Submit Ticket
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Verified Access</span>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex-1 relative">
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4 }}
             className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Shield, label: 'Shards Connect', color: 'bg-blue-500' },
              { icon: Lock, label: 'Shards Shields', color: 'bg-indigo-500' },
              { icon: Fingerprint, label: 'Shards Security', color: 'bg-emerald-500' },
              { icon: Briefcase, label: 'CIF Framework', color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-white hover:shadow-md transition-all">
                <item.icon className="w-8 h-8 text-blue-900" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Badges / Branches */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { name: 'Shards Connect', icon: Shield, desc: 'Central technical bridge' },
          { name: 'Shards Shields', icon: Lock, desc: 'Infrastructure protection' },
          { name: 'Shards Security', icon: Fingerprint, desc: 'Cyber vigilance' },
          { name: 'Suraksha Sankalp', icon: Heart, desc: 'Safety commitment' },
          { name: 'CIF Shards', icon: Briefcase, desc: 'Copyright enforcement' },
        ].map((branch, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors group">
            <branch.icon className="w-6 h-6 text-blue-900 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-sm mb-1">{branch.name}</h3>
            <p className="text-xs text-gray-500">{branch.desc}</p>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-blue-900">Advanced Support Protocols</h2>
          <p className="text-gray-500 max-w-xl mx-auto italic">Adhering to strict data protection and departmental routing standards.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Live Resolution', 
              desc: 'Direct encrypted channel between users and departmental staff for real-time problem solving.',
              icon: MessageSquare 
            },
            { 
              title: 'Granular Auditing', 
              desc: 'Full transparency with comprehensive audit logs for every administrative action within the system.',
              icon: ClipboardCheck 
            },
            { 
              title: 'Performance Dashboards', 
              desc: 'Analytics-driven insights into departmental resolution times and support efficiency.',
              icon: BarChart3 
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
