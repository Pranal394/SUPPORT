# Security Specification - Shards Connect Support

## Data Invariants
1. A user can only see their own tickets unless they are an admin or staff member assigned to that department.
2. Only admins can see audit logs.
3. Only the super admin (pranalshrivastav62@gmail.com) can assign roles to other users.
4. Messages must belong to a valid ticket.
5. Ticket departments must be from the predefined list.
6. Admin actions must be logged.

## The Dirty Dozen Payloads (Rejection Tests)

1. **Identity Spoofing (Ticket)**: Create a ticket with `userId` of another user.
2. **Privilege Escalation (User)**: A regular user trying to update their own `role` to 'admin'.
3. **Invalid Department**: Submitting a ticket for "Shadow Department" which is not in the list.
4. **Unauthorized Read (Ticket)**: Regular user A trying to `get` a ticket owned by user B.
5. **Unauthorized Read (Audit)**: Regular user trying to `list` the `auditLogs` collection.
6. **Ghost Message**: Adding a message to a ticket the user does not have access to.
7. **Bypassing Terminal State**: User trying to reopen a ticket marked as 'closed' that was closed by an admin (or just generally updating a terminal state field if enforced).
8. **Shadow Field Injection**: Creating a ticket with an extra field `isPriority: true` not in the schema.
9. **Invalid Document ID**: Using a document ID with special characters like `/` or extremely long strings.
10. **Admin Bypass (Staff)**: A staff member restricted to "Shards Security" trying to view tickets in "Cif Shards Connect".
11. **Timestamp Manipulation**: Submitting a ticket with a `createdAt` in the future or a hardcoded string instead of server timestamp.
12. **Null Body Write**: Attempting to write a document with an empty map.

## Security Rules Plan
- `isValidUser`: Checks email format, role enum, and ensures `createdAt` is server timestamp.
- `isValidTicket`: Checks department enum, status enum, and ensures `userId` matches auth.
- `isValidMessage`: Checks text size and timestamp.
- `isAdmin`: Checks if `exists(/databases/$(database)/documents/users/$(request.auth.uid))` and `get(...).data.role == 'admin'`.
- `isSuperAdmin`: Checks if `request.auth.token.email == 'pranalshrivastav62@gmail.com'`.
- `isStaffForDept`: Checks if user is 'staff' or 'admin' and has the ticket's department in their `assignedDepartments`.
