# About
Freaked out that we have a meeting on Tues so pushed up what I'd played around with (there's nothing in our jira about this 😭), this is just throwing everything at the wall (add more if you can) and we can refine it down and tidy up in meetings I guess 🤷‍♂️ probably get it more inline with web apps branding too (and to the new one)

Not sure what apis are available I guess that's in someone elses ball park

Break, play around, remove things, add things. If you push to this repo it should build on the link in the sidebar.

Mix of coding and vibing, this is useful to get syntax highlighting on the templates [https://ejs.co](https://marketplace.visualstudio.com/items?itemName=DigitalBrainstem.javascript-ejs-support)

# CLICK on the dropdown in the bottom corner to simulate what the portal might look like for different student states. Maybe we could pull in more of the EAP stuff into the first state.

# Recommended install
- Install NVM with homebrew https://formulae.brew.sh/formula/nvm
- Once installed open new terminal
- Go to folder in terminal
- run `nvm install 24`
- run `nvm use 24`
- check ur using node 24 `node -v`
- run `cp .env.example .env`
- run `npm install`
- run `npm dev`

# Express Boilerplate

A modern Node.js web application boilerplate using Express 5, Eta templates, and pino logging. Structured for clean extension with pluggable auth and TypeScript-readiness.

## Stack

| Concern | Package |
|---|---|
| Framework | Express 5 |
| Templates | Eta (SSR) |
| Sessions | express-session (MemoryStore — swap in production) |
| CSRF | csrf-csrf |
| Logging | pino + pino-http |
| Auth | Pluggable — `none` by default, `cas` available |
| Config | dotenv |

## Getting started

```bash
# Requires Node >= 20
nvm install 24 && nvm use 24

git clone <repo>
cd <repo>
npm install

cp .env.example .env
# Edit .env — at minimum set SESSION_SECRET and CSRF_SECRET

npm run dev
```

Open http://localhost:3000

`node --watch` is used in development — file changes restart the server automatically.

## Environment variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `PORT` | Port to listen on (default: 3000) |
| `SESSION_SECRET` | Long random string for signing sessions |
| `CSRF_SECRET` | Long random string for CSRF tokens |
| `AUTH_PROVIDER` | `none` (default) or `cas` |
| `BASE_URL` | Full app URL — required for CAS, optional otherwise |

## Auth

Auth is pluggable via `middleware/auth/`. Set `AUTH_PROVIDER` in `.env`:

- **`none`** (default) — all routes are public
- **`cas`** — CAS SSO. Requires `npm install connect-cas` and `CAS_HOST` in `.env`

To add a new provider, create `middleware/auth/myprovider.js` exporting `{ requireAuth, getUser, router }` and register it in `middleware/auth/index.js`.

## Scripts

```bash
npm run dev       # Development with file watching
npm start         # Production start
npm test          # Run tests (Node built-in test runner)
npm run lint      # ESLint
npm run format    # Prettier
```

## Logging

pino writes structured JSON logs to stdout. In development, pino-pretty formats them for readability.

Log levels are controlled via `LOG_LEVEL` in `.env` (default: `debug` in dev, `info` in production).

## Session store

The default MemoryStore is not suitable for production (it leaks memory and doesn't survive restarts). Replace it in `app.js` with a persistent store:

- **Redis** — `connect-redis`
- **SQLite** — `better-sqlite3-session-store`
- **PostgreSQL** — `connect-pg-simple`

## Production checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `SESSION_SECRET` and `CSRF_SECRET`
- [ ] Replace MemoryStore with a persistent session store
- [ ] Set `cookie.secure: true` (already done when `NODE_ENV=production`)
- [ ] Run behind a reverse proxy (nginx/caddy) with HTTPS
