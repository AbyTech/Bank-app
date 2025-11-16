# TODO: Fix CORS and Database Issues for Banking System

## Frontend Updates
- [x] Update hardcoded backend URL in App.jsx from https://primewave.onrender.com to https://banking-system-1-qeky.onrender.com
- [ ] Ensure VITE_API_URL environment variable is set to new backend URL in frontend deployment

## Backend Updates
- [x] Update settings.py DATABASES configuration to properly use DATABASE_URL from Render
- [ ] Verify render.yaml has correct ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS

## Verification
- [ ] Redeploy frontend and backend after changes
- [ ] Test registration and login functionality
