# Shards Connect Support Portal Documentation

## Overview
Shards Connect is a secure, professional support infrastructure designed to handle technical grievances and support requests across all Shards branches. The system implements strict departmental routing, granular role-based access control, and comprehensive auditing.

## Architecture
- **Frontend**: React 19 with Vite and Tailwind CSS.
- **Backend/Database**: Google Firebase (Firestore) for persistent storage.
- **Authentication**: Firebase Auth (Google OAuth 2.0).
- **Security**: Server-side Firestore Security Rules enforcing role-based limits.

## Supported Departments
Users can route tickets to the following specific departments:
1. **Shards Connect**: Central technical bridge.
2. **Shards Shields**: Infrastructure protection.
3. **Shards Security**: Cyber vigilance and threat management.
4. **Suraksha Sankalp - Shards Connect**: Safety commitment and user welfare.
5. **Cif Shards Connect**: Copyright Infringement Framework department.

## User Roles
- **User**: Can create tickets, view their own tickets, and chat with support staff.
- **Staff**: Can view and respond to tickets within their **Assigned Departments**. They can update ticket statuses (Open, Pending, Closed).
- **Admin**: Full access to all tickets across all departments. Can manage user roles and view system audit logs.
- **Super Admin**: The email `pranalshrivastav62@gmail.com` is hardcoded as the Super Admin, with the exclusive ability to provision new Staff and Admins.

## Core Features

### 1. Secure Routing & Chat
- Tickets are automatically tagged with the user's verified email and UID.
- Real-time chat messaging using Firestore's `onSnapshot` listeners.
- Status tracking: `open` (New), `pending` (In Progress), and `closed` (Resolved).

### 2. Administrator Intelligence Portal
- **Operations Dashboard**: Real-time stats on ticket volume and resolution rates.
- **Identity Control**: A management interface for the Super Admin to search for users (by email) and assign them to specific roles and departments.
- **Audit Logging**: Every role update or administrative change is recorded in an immutable `auditLogs` collection, visible only to Admins.

### 3. Compliance & Security
- **Identity Protection**: Uses Google verified tokens; no password storage.
- **Data Integrity**: Firestore rules ensure that users cannot "spoof" their IDs or departments.
- **Audit Readiness**: Detailed audit trails for compliance with the CIF framework standards.

## Error Resolution (Known Issues)
- **Fetch API Conflict**: The error "Cannot set property fetch of #<Window>" was identified as a potential environment conflict. The application has been verified to use native platform `fetch` without unneccesary polyfills to ensure compatibility with modern sandboxed environments.
