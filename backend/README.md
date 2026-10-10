
# ZUNO AI Partner Growth Backend

The backend foundation for ZUNO AI's central platform and individual partner assistants.

## Requirements

- Node.js 20 or newer
- A Supabase project
- A secure backend hosting provider

## Install

Run `npm install` in this folder.

## Environment setup

Create a private `.env` file based on `.env.example`.

Configure these server-side values:

- `PORT`
- `FRONTEND_ORIGIN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never commit `.env` or real credentials to GitHub. Never expose the service-role key in browser code.

## Database setup

Review `schema.sql` before running it in the Supabase SQL Editor. Test database permissions before using real customer data.

## Start the server

Run `npm start` after configuring the environment.

The health endpoint is `/health`.

## Current limitations

- Email sending is disabled.
- The frontend is not connected to this API yet.
- Production security testing is required.
- Do not use real customer data until access controls are verified.

## Approval policy

All outreach starts as a draft. An authorized owner or admin must approve it. Approval and sending are separate actions. No email may be sent until a secure delivery system is configured and tested.
