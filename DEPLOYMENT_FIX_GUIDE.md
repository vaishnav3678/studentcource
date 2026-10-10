# Pathfinder LMS deployment fix (Vercel frontend + Render API)

The current production login error happens because Vercel deployed the Vite frontend but the Express `server.ts` API is not running on that Vercel static deployment. The frontend was calling `/api/...` on Vercel, receiving an HTML page, and trying to parse it as JSON.

## 1. Deploy the API on Render
1. Push this project to a GitHub repository.
2. In Render, choose **New > Blueprint** and select the repository containing `render.yaml`.
3. Create the `pathfinder-lms-api` service. The blueprint uses a persistent disk mounted at `/var/data`; a paid Render plan is required for persistent disks.
4. Once deployed, copy the API base URL, e.g. `https://pathfinder-lms-api.onrender.com`.
5. In Render service Environment, set `FRONTEND_ORIGIN` to `https://pathfinderstudent.vercel.app` (add comma-separated origins only if you use more than one trusted frontend domain), then redeploy.

## 2. Point the Vercel frontend at the API
1. Vercel > `pathfinderstudent` > Settings > Environment Variables.
2. Add `VITE_API_BASE_URL` = your Render API URL, with no trailing slash.
3. Ensure Install Command is `npm install --legacy-peer-deps` if needed.
4. Redeploy with `vercel --prod` after pulling the updated source.

## 3. Important production checks
- Test `https://YOUR-RENDER-URL/api/courses` and confirm it returns JSON.
- Test the Vercel login, Admin updates, then open the student dashboard in another browser/session.
- Persistent disk protects the JSON database and uploaded files across restarts/deploys, but it is not a robust multi-instance database. For long-term production with concurrent users, migrate user/course/enrollment data to Supabase/Postgres and files to Supabase Storage.
- Before public launch, replace demo/default credentials, enforce server-side authorization on admin-only endpoints, and review the API's existing authentication/security implementation. Do not store real student data until that review is completed.
