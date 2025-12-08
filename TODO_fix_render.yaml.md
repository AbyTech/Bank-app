# TODO: Fix render.yaml for MongoDB Deployment Issue

## Summary
Fixed the "unknown type 'mongodb'" error in render.yaml by removing the unsupported mongodb service type and updating the configuration to use MongoDB Atlas instead. Updated deployment instructions to use Render Web Service instead of Blueprint.

## Changes Made
- [x] Removed the `type: mongodb` service from render.yaml
- [x] Changed MONGO_URI env var from `fromService` to `value: $MONGO_URI`
- [x] Updated README_DEPLOYMENT.md to use Web Service deployment instead of Blueprint
- [x] Added detailed environment variable setup instructions in README
- [x] Removed render.yaml file since Blueprint deployment is not used
- [x] Updated build command instructions to leave empty for Node.js backend

## Next Steps
- Create a new Web Service in Render (not Blueprint)
- Set all required environment variables in Render dashboard, including MONGO_URI with MongoDB Atlas connection string
- Ensure build command is left empty (no npm run build)
- Deploy and test the backend
- Proceed with Netlify frontend deployment
