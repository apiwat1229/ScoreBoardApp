# ScoreBoardApp

Sports Day **live scoreboard** built with React and Vite: team totals, per-sport slides, admin score entry, and fullscreen display.

## Quick start

Install **with devDependencies** (needed for Vite). If `vite` is missing, run `npm install` with `NODE_ENV=development`.

```bash
npm install
npm run dev
```

`npm run dev` starts **both** the SQLite API (`http://localhost:8787`) and Vite (`http://localhost:5173`).

**Always open the UI at `http://localhost:5173`** (Vite). If you open `:8787` by mistake, requests like `/@vite/client` return 404 until you use the Vite port; the API server redirects browsers to Vite in development.

Realtime **Socket.IO** connects to **`http://localhost:8787` in development** (bypassing Vite’s proxy so WebSockets work). Override with `VITE_API_ORIGIN` in `.env` if your API runs elsewhere.

## Data storage (SQLite in the project)

Scores are stored in **`data/scores.sqlite`** (created automatically next to the repo). The file is listed in `.gitignore` so it is not committed; the `data/` folder is kept with `data/.gitkeep`.

**Realtime:** with the API running, clients stay in sync via **Socket.IO** (`scores:update`) after each successful `PUT /api/scores`.

**Admin:** use **Save to server** to persist edits; the scoreboard and podium update for everyone without reloading.

If the API is unreachable (for example only Vite without `node server`), scores stay in **`localStorage`** for that browser only.

## Deploy (temporary / single Node process)

```bash
npm run build
npm start
```

Then open `http://localhost:8787` (or `PORT` if set). With `NODE_ENV=production`, the same server serves **`dist/`** as static files and handles **`/api/scores`**.

**Note:** Platforms that only host static files (GitHub Pages) cannot run SQLite; use a Node-capable host (VPS, Railway, Render, etc.) or deploy only the frontend and point API elsewhere.

## Scripts

| Command | Description |
| -------- | ------------- |
| `npm run dev` | API on :8787 + Vite dev server (proxied) |
| `npm run dev:api` | API only |
| `npm run dev:vite` | Vite only (no DB unless you run API separately) |
| `npm run build` | Production build to `dist/` |
| `npm start` | Production: serve `dist/` + API on `PORT` or 8787 |

## Tech

- React 19 · Vite 8 · react-router-dom · Express · better-sqlite3 · Socket.IO
