/**
 * API + SQLite + Socket.IO (realtime scores) + optional static SPA.
 */
import cors from 'cors'
import express from 'express'
import Database from 'better-sqlite3'
import fs from 'fs'
import { createServer } from 'http'
import path from 'path'
import { Server as SocketIOServer } from 'socket.io'
import { fileURLToPath } from 'url'
import { DEFAULT_SCORES } from '../src/data/mockData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dataDir = path.join(root, 'data')
const dbPath = path.join(dataDir, 'scores.sqlite')

fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`)

const selectScores = db.prepare('SELECT value FROM kv WHERE key = ?')
const upsertScores = db.prepare(
  'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
)

function readScoresFromDb() {
  const row = selectScores.get('scores')
  if (!row) return null
  try {
    return JSON.parse(row.value)
  } catch {
    return null
  }
}

function writeScoresToDb(obj) {
  upsertScores.run('scores', JSON.stringify(obj))
}

if (!readScoresFromDb()) {
  writeScoresToDb(structuredClone(DEFAULT_SCORES))
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '512kb' }))

const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: { origin: true, methods: ['GET', 'POST', 'PUT'] },
})

io.on('connection', (socket) => {
  socket.emit('scores:update', readScoresFromDb())
})

app.get('/api/scores', (_req, res) => {
  const data = readScoresFromDb()
  if (!data) {
    writeScoresToDb(structuredClone(DEFAULT_SCORES))
    res.json(readScoresFromDb())
    return
  }
  res.json(data)
})

app.put('/api/scores', (req, res) => {
  const body = req.body
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Invalid body' })
    return
  }
  const teams = ['pink', 'yellow', 'blue', 'green']
  if (!teams.every((id) => body[id] && typeof body[id] === 'object')) {
    res.status(400).json({ error: 'Missing team scores' })
    return
  }
  writeScoresToDb(body)
  const next = readScoresFromDb()
  io.emit('scores:update', next)
  res.json(next)
})

const dist = path.join(root, 'dist')
const isProd = process.env.NODE_ENV === 'production'

if (isProd && fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      next()
      return
    }
    if (req.path.startsWith('/api')) {
      next()
      return
    }
    res.sendFile(path.join(dist, 'index.html'))
  })
} else if (!isProd) {
  /**
   * Dev: HTML must be loaded from Vite (:5173), not this API.
   * Redirect any browser GET that isn’t API/socket so /@vite/client & HMR work.
   */
  const viteDev = `http://localhost:${process.env.VITE_DEV_PORT ?? 5173}`
  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      next()
      return
    }
    if (req.path.startsWith('/api')) {
      next()
      return
    }
    if (req.path.startsWith('/socket.io')) {
      next()
      return
    }
    const target = `${viteDev}${req.originalUrl}`
    res.redirect(302, target)
  })
}

const PORT = Number(process.env.PORT) || 8787
httpServer.listen(PORT, () => {
  console.log(`SQLite DB: ${dbPath}`)
  console.log(`Realtime: Socket.IO on same port`)
  if (isProd) {
    console.log(`Open http://localhost:${PORT} (static + api)`)
  } else {
    console.log(`API: http://localhost:${PORT}`)
    console.log(`Open the app in Vite → http://localhost:${process.env.VITE_DEV_PORT ?? 5173} (not ${PORT})`)
  }
})
