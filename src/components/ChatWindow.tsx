import React, { useState, useEffect, useRef } from 'react';
import { useAuth, handleFirestoreError, OperationType } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, FirestoreError } from 'firebase/firestore';
import { Ticket, Message, TicketStatus } from '../types';
import { Send, ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatWindowProps {
  ticket: Ticket;
  onBack?: () => void;
  isAdmin?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ ticket, onBack, isAdmin: isAdminView }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, `tickets/${ticket.id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error: FirestoreError) => {
      console.error("Chat messages snapshot error:", error);
      handleFirestoreError(error, OperationType.GET, `tickets/${ticket.id}/messages`);
    });

    return () => unsubscribe();
  }, [ticket.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || isSending) return;

    setIsSending(true);
    const messagesPath = `tickets/${ticket.id}/messages`;
    try {
      await addDoc(collection(db, messagesPath), {
        ticketId: ticket.id,
        senderId: user.uid,
        senderEmail: user.email,
        senderRole: profile?.role || 'user',
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setIsSending(false);
      handleFirestoreError(err as FirestoreError, OperationType.WRITE, messagesPath);
      return;
    }

    try {
      await updateDoc(doc(db, 'tickets', ticket.id), {
        updatedAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error updating ticket timestamp:", err);
      handleFirestoreError(err as FirestoreError, OperationType.UPDATE, `tickets/${ticket.id}`);
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (newStatus: TicketStatus) => {
    try {
      await updateDoc(doc(db, 'tickets', ticket.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating status:", err);
      handleFirestoreError(err as FirestoreError, OperationType.UPDATE, `tickets/${ticket.id}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl flex flex-col h-full min-h-[600px] overflow-hidden">
      <header className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors lg:hidden text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-blue-500' : ticket.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
              <h3 className="font-bold text-gray-900 tracking-tight">{ticket.subject}</h3>
            </div>
            <p className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
              <span>{ticket.department}</span>
              <span>•</span>
              <span>TICKET: {ticket.id}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminView && (
            <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg">
              <button 
                onClick={() => updateStatus('open')}
                className={`p-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all ${ticket.status === 'open' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
              >
                OPEN
              </button>
              <button 
                onClick={() => updateStatus('pending')}
                className={`p-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all ${ticket.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'text-gray-400 hover:text-amber-600'}`}
              >
                PENDING
              </button>
              <button 
                onClick={() => updateStatus('closed')}
                className={`p-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all ${ticket.status === 'closed' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
              >
                CLOSE
              </button>
            </div>
          )}
          <button className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/30" ref={scrollRef}>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-900 text-white p-3 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-900">Initial Issue Report</p>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-2 border-t border-gray-50">
                <span>By: {ticket.userEmail}</span>
                <span>•</span>
                <span>Role: User</span>
              </div>
            </div>
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          const isStaff = msg.senderRole === 'admin' || msg.senderRole === 'staff';
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                <div 
                  className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-blue-900 text-white rounded-tr-none' 
                      : isStaff 
                        ? 'bg-amber-50 text-gray-900 border border-amber-100 rounded-tl-none'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {isMe ? 'You' : isStaff ? 'SHARDS SUPPORT TEAM' : msg.senderEmail.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-gray-300">
                    {msg.timestamp?.toDate() ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <footer className="p-6 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-end gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-900 transition-all">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type your message to support staff..."
            rows={1}
            className="flex-grow p-3 bg-transparent text-sm outline-none resize-none min-h-[44px] max-h-32"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-900 disabled:opacity-50 text-white p-3 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all flex-shrink-0"
          >
            {isSending ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-3 text-center italic">Professional resolution monitored for quality assurance and compliance.</p>
      </footer>
    </div>
  );
};

export default ChatWindow;
