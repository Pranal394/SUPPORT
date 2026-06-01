import { Timestamp } from 'firebase/firestore';

export type Role = 'admin' | 'staff' | 'user';

export type Department = 
  | 'Shards Connect'
  | 'Shards Shields'
  | 'Shards Security'
  | 'Suraksha Sankalp - Shards Connect'
  | 'Cif Shards Connect';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  assignedDepartments?: Department[];
  createdAt: Date;
}

export type TicketStatus = 'open' | 'pending' | 'closed';

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  description: string;
  department: Department;
  status: TicketStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderEmail: string;
  senderRole: Role;
  text: string;
  timestamp: Timestamp;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details?: string;
  department?: Department;
  timestamp: Timestamp;
}
