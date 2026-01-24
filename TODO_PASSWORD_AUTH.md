# Password Authentication Implementation

## Backend Changes
- [x] Modify `auth.js` register function to accept `password` from request body
- [x] Modify `auth.js` login function to accept either `password` or `seedPhrase` (OR logic)

## Frontend Changes
- [x] Add password field to `Register.jsx`
- [x] Add password field to `Login.jsx` (both optional, at least one required)
- [x] Update `auth.jsx` service login to send password

## Testing
- [x] Test registration with password
- [x] Test login with password only
- [x] Test login with seedPhrase only
- [x] Test login with both password and seedPhrase
- [x] Test login with seedPhrase for existing users
