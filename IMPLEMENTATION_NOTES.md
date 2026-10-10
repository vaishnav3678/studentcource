# Pathfinder LMS update notes

## Changes made in this archive
- Added searchable video/lesson management across courses in Admin > Videos. Search matches course, module, lesson title, and current video source; lesson lists scroll independently and do not impose a fixed 100-item cap.
- Validated video URLs in the Admin UI and API; only valid HTTPS URLs are accepted.
- Improved course learning desktop syllabus width and desktop video viewport sizing while retaining the mobile stacked layout.
- Student lesson resources now show only published resources.
- Student course cards use dedicated Full Stack / Manual Testing thumbnails as fallbacks and lazy-load thumbnails.
- Added a deployment note explaining the current storage architecture and what is still needed for shared cloud persistence.

## Important remaining production work
This archive is not yet a fully production-secure, multi-device cloud LMS. The current Express API still stores its database in `data/pathfinder_db.json` and uploads in `data/uploads/`; API mutation routes are not protected by server-side session/role authorization. The Supabase helper/schema is present, but the current REST routes are not migrated to Supabase Postgres/Storage. Therefore, do not deploy this build with real student data on an ephemeral/serverless host until the shared database, private object storage, authentication/session authorization, and RLS are implemented and verified.

## Validation
A production build could not be run in this environment because `npm install` timed out before dependencies were installed. Please run `npm install` and `npm run build` locally after extracting this archive. Do not assume deployment readiness until build and authorization/storage tests pass.

## Student course hub update (2026-10-10)
- Replaced the student learning viewport with a full-width responsive Course Hub that shows only the published live meeting link and the optional WhatsApp group invite link.
- Removed student-facing lesson video player, syllabus/video sidebar, PDF/resource tab, and PDF preview/download controls from the course learning page and student dashboard.
- Added an Admin Meeting Links field for a WhatsApp group invite URL; it is saved together with the course meeting schedule and shown to enrolled students.
- Hid the dedicated Video Upload and PDF Notes navigation entries from the Admin sidebar. Existing backend/API data was left in place rather than deleting existing course data.
- Admin should enter a valid invite such as `https://chat.whatsapp.com/...`, publish the meeting card, and click Save Meeting & WhatsApp Links.
- Build was not verified in this environment because dependency installation timed out; run `npm install --legacy-peer-deps` then `npm run build` locally.
