# PassOP Password Manager

PassOP is a full-stack password manager with per-user data isolation, JWT
authentication, AES-256-GCM encryption, secure password generation, strength
analysis, password reuse detection, a security dashboard, and persistent
light/dark themes.

## Architecture

- Frontend: React 19, React Router, Vite, React Toastify
- Backend: Node.js, Express 5, Mongoose
- Database: MongoDB
- Authentication: signed JWT in an HTTP-only, SameSite cookie
- Credential encryption: AES-256-GCM with a random IV and authentication tag
- Reuse detection: keyed HMAC-SHA256 fingerprint, never plaintext comparison

The API follows an MVC-style layout under `backend/src`:

```text
backend/src/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
```

## Local Setup

Requirements:

- Node.js 20 or newer
- MongoDB running locally or a MongoDB Atlas connection string

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Frontend, in a second terminal:

```bash
npm install
npm run dev
```

The Vite development server proxies `/api` to `http://localhost:3000`.

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection URI |
| `JWT_SECRET` | Yes | Random JWT signing secret, at least 32 characters |
| `ENCRYPTION_KEY` | Yes | Exactly 32 random bytes encoded as 64 hex characters or base64 |
| `PASSWORD_HASH_KEY` | Yes | Separate random HMAC secret, at least 32 characters |
| `CLIENT_ORIGIN` | Yes | Allowed frontend origin; comma-separate multiple origins |
| `PORT` | No | API port, defaults to `3000` |
| `JWT_EXPIRES_IN` | No | JWT lifetime, defaults to `7d` |
| `JWT_COOKIE_DAYS` | No | Cookie lifetime in days, defaults to `7` |
| `COOKIE_NAME` | No | Auth cookie name, defaults to `passop_token` |
| `NODE_ENV` | No | Set to `production` in production |
| `TRUST_PROXY` | No | Set to `true` behind one trusted reverse proxy |

Generate suitable secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run that command separately for `JWT_SECRET`, `ENCRYPTION_KEY`, and
`PASSWORD_HASH_KEY`. Never commit `.env`, and do not casually rotate
`ENCRYPTION_KEY`: existing credential ciphertext depends on it.

For a separately hosted API, create a frontend `.env`:

```text
VITE_API_URL=https://api.example.com/api
```

## Database Schema

### User

- `name`
- `email` (normalized and unique)
- `password` (bcrypt hash, never returned)
- timestamps

### PasswordEntry

- `owner` (required `User` reference)
- `site`
- `username`
- `passwordCiphertext`
- `passwordIv`
- `passwordAuthTag`
- `passwordFingerprint` (keyed HMAC for equality/reuse checks)
- `passwordLength`
- `strengthScore`
- `strengthLabel`
- optional `legacyId`
- timestamps

Indexes cover unique user emails, owner/date listing, and owner/fingerprint
reuse checks.

## API

All password and security routes require the JWT cookie. Bearer tokens are also
accepted by the middleware for API clients.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register and start a session |
| `POST` | `/api/auth/login` | Log in and start a session |
| `POST` | `/api/auth/logout` | Clear the session cookie |
| `GET` | `/api/auth/me` | Return the current user |
| `GET` | `/api/passwords` | List the current user's encrypted-entry metadata |
| `POST` | `/api/passwords` | Create and encrypt an entry |
| `PUT` | `/api/passwords/:id` | Update an owned entry |
| `DELETE` | `/api/passwords/:id` | Delete an owned entry |
| `POST` | `/api/passwords/:id/reveal` | Explicitly decrypt one owned password |
| `GET` | `/api/security/summary` | Return aggregate strength/reuse metrics |

List responses never contain ciphertext, encryption metadata, fingerprints, or
plaintext passwords. Reveal responses set `Cache-Control: no-store`, and the
frontend automatically hides revealed values after 20 seconds.

## Legacy Data Migration

The old application stored unowned plaintext documents in the `passwords`
collection. A user must be registered before those records can be assigned.

1. Back up the MongoDB database.
2. Start the new application and register the account that should own the old
   entries.
3. Inspect the migration:

```bash
cd backend
npm run migrate:legacy -- --email=user@example.com --dry-run
```

4. Run it:

```bash
npm run migrate:legacy -- --email=user@example.com
```

The migration only selects documents with no owner and a plaintext `password`
field. It encrypts each password, computes its strength/fingerprint metadata,
assigns the selected owner, and removes the plaintext field.

## Testing

Automated checks:

```bash
npm run lint
npm run build
cd backend
npm test
npm audit --omit=dev
```

Feature checklist:

- Register with valid and invalid names, emails, mismatched passwords, and weak
  account passwords.
- Confirm duplicate emails are rejected and login errors do not reveal which
  field was wrong.
- Confirm `/`, `/security`, and every credential API reject logged-out users.
- Create two users and verify neither can read, reveal, update, or delete the
  other's entries.
- Inspect MongoDB and verify credential plaintext is absent.
- Create, edit without changing the password, edit with a new password, reveal,
  copy, hide, and delete entries.
- Confirm reveal values disappear after 20 seconds and are not returned by list
  APIs.
- Generate passwords with every option combination and confirm at least one
  character from every selected group.
- Verify all four strength labels update while typing.
- Save the same password for multiple accounts and verify warning badges, reuse
  counts, and dashboard totals.
- Toggle light/dark mode, reload, and confirm the preference persists.
- Check keyboard focus, modal Escape handling, mobile layouts, loading states,
  and toast errors.

## Deployment

The included `render.yaml` deploys the React frontend and Express API as one
Render web service. Keeping both on the same origin preserves the intentionally
strict authentication cookie.

1. Create a MongoDB Atlas cluster and a database user with access only to the
   PassOP database.
2. Add an Atlas network access rule that permits the Render service to connect.
3. In Render, create a new Blueprint and select this GitHub repository.
4. Enter `MONGO_URI` when Render prompts for it.
5. Generate an encryption key locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Enter that value as `ENCRYPTION_KEY`. Store a backup in a password manager;
   losing or rotating it makes existing saved credentials unrecoverable.
7. Deploy and verify `/api/health`, registration, login, save, reveal, and
   logout on the assigned HTTPS URL.

Render generates `JWT_SECRET` and `PASSWORD_HASH_KEY` during Blueprint
creation. Do not commit production secrets or paste them into `render.yaml`.
`TRUST_PROXY=true` is set because Render terminates HTTPS in front of the Node
service.

For other hosting platforms, run this build command:

```bash
npm ci && npm run build && npm --prefix backend ci --omit=dev
```

Then start the service with `npm start`. Set `NODE_ENV=production`,
`MONGO_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, `PASSWORD_HASH_KEY`, and
`TRUST_PROXY=true` in the platform's secret manager.
