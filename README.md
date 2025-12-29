
# Velocity Speed Test Deployment Guide

## Frontend (Vercel)
1. Push this repository to GitHub.
2. Connect your GitHub account to [Vercel](https://vercel.com).
3. Import this project.
4. Set the `Build Command` to `npm run build` (or your preferred bundler).
5. Ensure `Output Directory` is set to `dist` or `build`.
6. Click **Deploy**.

## Backend (Railway / Cloud Run)
The `server.js` file is a standalone Express server.
1. **Railway**: New Project -> Deploy from GitHub -> Select Repository.
   - It will automatically detect the `package.json` and `server.js`.
   - Set the `PORT` environment variable if needed.
2. **Configuration**: Once your backend is live, update `services/SpeedTestEngine.ts` to point `TEST_URL` to your new backend URL.

## Technical Notes
- **Accuracy**: For 1Gbps+ accuracy, ensure your backend is hosted on a provider with high-bandwidth peering (like Google Cloud or AWS).
- **CORS**: The backend includes wild-card CORS headers; restrict these to your production domain for better security.
- **Client Side**: The frontend uses `fetch` and `XHR` for maximum browser compatibility and precise timing.
