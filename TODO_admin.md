# Admin Login and User Management TODO

## Tasks
- [x] Add role field to User model (default 'user', allow 'admin')
- [x] Update auth controller to include role in login response
- [x] Update useAuth hook to store and provide user role
- [x] Protect /admin route to only allow users with 'admin' role
- [x] Update AdminDashboard to fetch and display list of all users
- [x] Create admin user with special email (e.g., admin@primewave.com)

## Files to Edit
- banking_system/backend/models/User.js
- banking_system/backend/controllers/auth.js
- banking_system/frontend/src/hooks/useAuth.jsx
- banking_system/frontend/src/App.jsx
- banking_system/frontend/src/pages/Admin/AdminDashboard.jsx
- banking_system/backend/controllers/users.js (new)
- banking_system/backend/routes/users.js (new)
