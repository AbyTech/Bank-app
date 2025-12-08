# Netlify Build Fix

## Changes Made
- Updated `netlify.toml` NODE_VERSION from "18" to "20" to match .nvmrc and .node-version
- Changed build command from `npx vite build` to `npm run build` to avoid permission issues

## Next Steps
- Commit and push these changes to trigger a new Netlify build
- Monitor the build logs to ensure it completes successfully
- If issues persist, consider clearing Netlify's build cache
