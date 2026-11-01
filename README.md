# Client Hub — Web Application

A shared workspace for clients and software freelancers to organize projects, discuss work, track tasks, and manage invoices.

Built with **Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query, and Zod**. It connects to the [Spring Boot backend](https://github.com/Triet1705/client-hub-backend), with optional wallet flows backed by the [contracts repository](https://github.com/Triet1705/client-hub-contracts).

## Product workflows

| Workspace | What users can do |
| --- | --- |
| **Client** | Create projects, add freelancers, organize tasks, manage invoices, and follow project activity |
| **Freelancer** | Access member projects and scoped tasks, update work, participate in discussions, and inspect relevant invoice records |
| **Admin** | Inspect users, projects, invoices, operational health, and audit records through a dedicated admin workspace |

Projects bring together **Overview, Tasks, Messages, Files, Invoices, and Activity**. The task workspace supports board/list views, URL-based filters, assignment, and a detail panel with contextual discussion. Files are aggregated discussion attachments, not a separate full file manager.

Optional workflows include:

- **Smart Upload:** turn a PDF into AI-generated task drafts, review/edit them, and explicitly approve task creation.
- **Escrow:** connect a wallet, explicitly bind it to a profile, approve the configured token, and interact with whole-invoice escrow.
- **Audit evidence:** inspect scoped integrity evidence for project or invoice activity when backend anchoring is enabled.

## Source layout

```text
src/
  app/          App Router pages and role-specific layouts
  features/     Domain features, API calls, hooks, and UI
  components/   Shared UI primitives and layout components
  lib/          API clients, formatting, configuration, and utilities
  providers/    Application providers
scripts/        Build and repository checks
```

The backend enforces permissions. Hiding a control in the UI does not grant or revoke access. Money-like API values are preserved as strings and formatted at the presentation boundary.

## Run locally

Use **Node.js 22** (the package requires `>=22 <23`), npm, and a running Client Hub backend. Run the following from this repository:

```powershell
npm ci --legacy-peer-deps
```

Create or update `.env.local` without overwriting unrelated existing settings:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_BLOCKCHAIN_ENABLED=false
```

The API URL includes `/api`. Configure the backend to allow the frontend origin, normally `http://localhost:3000`, and keep the browser's host choice consistent during local cookie-based sessions.

```powershell
npm run dev
```

Open `http://localhost:3000`. Login and registration require the intended workspace tenant. Start with the conventional Web2 workflow before enabling optional services.

### Useful routes

| Route | Purpose |
| --- | --- |
| `/login`, `/register` | Tenant-aware authentication |
| `/dashboard` | Role-aware overview |
| `/projects`, `/projects/[id]` | Project list and tabbed workspace |
| `/tasks` | Task board/list and filters |
| `/invoices`, `/invoices/[id]` | Invoice list, details, discussion, and optional escrow/proofs |
| `/communication` | Contextual discussion hub |
| `/profile`, `/settings` | Profile, preferences, and wallet settings |
| `/admin` | Dedicated administration workspace |

## Checks and builds

```powershell
npm run lint
npm run type-check
npm run check:theme
npm run build
npm start
```

`npm start` serves the production build. These checks establish lint/type/build properties; they do not replace browser acceptance tests.

For the hosted Web2 build, set a reachable HTTPS backend URL and keep Web3 disabled:

```dotenv
NEXT_PUBLIC_API_URL=https://your-backend.example/api
NEXT_PUBLIC_BLOCKCHAIN_ENABLED=false
```

Then run `npm run build:hosted`. Its wrapper rejects a missing, non-HTTPS, or loopback API URL and requires the Web2 feature flag. Replace the example hostname with your own backend.

`NEXT_PUBLIC_*` values are included in browser code and are read at build time. They must never contain private keys, database credentials, or server secrets. Rebuild after changing hosted public configuration. Cross-site refresh cookies also require matching backend CORS and cookie settings.

## Optional wallet setup

Follow the [local contracts workflow](https://github.com/Triet1705/client-hub-contracts#local-web3-workflow). The bootstrap manifest supplies the escrow/token addresses and token decimals; do not reuse addresses from an earlier local chain.

Relevant variables include `NEXT_PUBLIC_BLOCKCHAIN_ENABLED`, `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS`, `NEXT_PUBLIC_ESCROW_TOKEN_ADDRESS`, `NEXT_PUBLIC_ESCROW_TOKEN_DECIMALS`, and `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`. Backend `/api/system/config` also controls capability availability. Restart the dev server or rebuild after configuration changes.

Connecting a wallet does not bind it to a user. Bind the intended address explicitly in profile/settings; the transaction signer must match the invoice client's bound wallet.

## Status and limitations

- This repository contains a substantial implemented application, but no claim is made that every route or environment has passed end-to-end acceptance.
- The evaluated hosted release covered the Web2 path; optional AI and blockchain were disabled there.
- Historical hosted evaluation recorded disconnected STOMP, stale automatic invoice updates, and recovery requiring manual reload. Later local fixes need a fresh hosted acceptance run before those limitations can be considered closed.
- FIAT invoice status is bookkeeping, not bank-payment verification.
- Certificate read UI exists, while backend on-chain certificate minting remains a prototype.
- Build success does not establish accessibility compliance, load capacity, or real-participant usability results.

See [backend scope and configuration](https://github.com/Triet1705/client-hub-backend) for the authoritative API and runtime responsibilities.
