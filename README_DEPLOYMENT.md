# Banking System Deployment Guide

This guide will help you deploy the banking system backend on Render and frontend on Netlify.

## Prerequisites

1. **GitHub Account**: Create a repository for your project
2. **Render Account**: Sign up at https://render.com
3. **Netlify Account**: Sign up at https://netlify.com
4. **MongoDB Atlas Account**: For production database (optional, Render provides managed MongoDB)

## Step 1: Prepare Your Code

### 1.1 Environment Variables

Copy the example environment files and fill in your values:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 1.2 Update Environment Variables

**Backend (.env):**
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `JWT_REFRESH_SECRET`: Another secure random string for refresh tokens
- `CORS_ORIGIN`: Will be updated after Netlify deployment

**Frontend (.env):**
- `VITE_API_BASE_URL`: Will be updated after Render deployment

## Step 2: Deploy Backend on Render

### 2.1 Connect GitHub Repository

1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect your GitHub account and select the banking-system repository
4. Render will automatically detect the `render.yaml` file

### 2.2 Configure Deployment

The `render.yaml` file is already configured for:
- Node.js runtime
- MongoDB database
- Environment variables
- Build and start commands

### 2.3 Deploy

1. Click "Create Blueprint"
2. Wait for the build to complete
3. Note the backend URL (e.g., `https://your-app.onrender.com`)

## Step 3: Deploy Frontend on Netlify

### 3.1 Connect Repository

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account and select the repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 3.2 Environment Variables

In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add: `VITE_API_BASE_URL` = `https://your-render-backend-url.onrender.com/api`

### 3.3 Deploy

1. Click "Deploy site"
2. Wait for deployment to complete
3. Note the frontend URL (e.g., `https://amazing-site.netlify.app`)

## Step 4: Update CORS Configuration

### 4.1 Update Backend CORS

In Render dashboard:
1. Go to your backend service
2. Environment → Add environment variable:
   - Key: `CORS_ORIGIN`
   - Value: `https://your-netlify-site.netlify.app`

### 4.2 Redeploy Backend

Trigger a new deployment in Render to apply CORS changes.

## Step 5: Test the Application

1. Visit your Netlify frontend URL
2. Try registering a new user
3. Test login functionality
4. Verify API calls are working

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure CORS_ORIGIN in backend matches your Netlify URL exactly
2. **API Connection**: Check VITE_API_BASE_URL in frontend environment variables
3. **Database Connection**: Verify MONGO_URI is correct and accessible
4. **Build Failures**: Check build logs in Render/Netlify dashboards

### Useful Commands:

```bash
# Test backend locally
cd backend
npm install
npm start

# Test frontend locally
cd frontend
npm install
npm run dev
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT tokens
- Regularly rotate API keys and database credentials
- Enable HTTPS (automatically handled by Render/Netlify)

## Support

If you encounter issues:
1. Check deployment logs in Render/Netlify dashboards
2. Verify environment variables are set correctly
3. Test API endpoints directly using tools like Postman
4. Ensure MongoDB connection string allows external connections
