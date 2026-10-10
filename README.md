# ZUNO AI Control Center — Prototype v1

A responsive web app/PWA starter for ZUNO AI. It can be used in a browser and, once hosted on HTTPS, added to an iPhone Home Screen.

## Current features
- Dashboard with prospects, active clients, MRR, goal progress, pending approvals.
- Add/search sales leads and change their status.
- Add client records and change client status.
- Draft outreach into an approval queue.
- Approval/rejection log; the prototype does **not** send external messages or spend money.
- Basic automation preference toggles; these are not background jobs yet.
- JSON backup export and lead CSV export.
- Local browser storage (`localStorage`).

## Important limitations
This is a front-end prototype, not a production multi-user SaaS. Data lives in the current browser/device and is not synchronized between devices. Do not use it for sensitive real customer data yet. Approval buttons only record a decision locally; they do not execute external actions. There is no authentication, cloud database, AI API connection, email/SMS integration, payment processor, scheduled worker, or server-side audit log.

## Run locally
Open `index.html` in a modern browser. Some PWA features require HTTPS or localhost.

## Publish free for testing
One simple option is GitHub Pages:
1. Create/sign in to a GitHub account.
2. Create a new public repository named `zuno-ai-control-center`.
3. Upload `index.html`, `manifest.webmanifest`, `icon.svg`, and `sw.js` to the repository root.
4. In repository Settings → Pages, choose deploy from the `main` branch and root folder.
5. Open the generated HTTPS URL.

Public repository means the source code is visible to everyone. The current prototype stores data in each user's browser, but do not put secrets or private customer data in the repo.

## Add to iPhone Home Screen
1. Open the published HTTPS URL in Safari.
2. Tap Share.
3. Choose Add to Home Screen.
4. Launch ZUNO AI from its new icon.

## Production architecture to build next
- Frontend: Next.js/React PWA (same UI across web and iPhone; native app wrapper later if needed).
- Auth: managed auth provider.
- Database: PostgreSQL with row-level access controls.
- AI: server-side model API; keys never in the browser.
- Jobs: durable queue/scheduler for reminders and reporting.
- Integrations: email/calendar/CRM/payment providers through least-privilege OAuth.
- Approval gates: pending action → owner review → server-side validation → execution → immutable audit log.
- Billing: subscription processor with webhook validation.
- Monitoring: errors, retries, rate limits, usage budgets, backups, and alerts.

## Security/approval requirements
Never let client-side JavaScript decide that an external action is authorized. The production backend must check identity, permissions, approval state, idempotency, provider scopes, and limits immediately before executing an action. Spending, external messages, and consequential changes must require owner approval.
