/**
 * API + JSON File Storage + Socket.IO (realtime scores) + optional static SPA.
 * Switched from SQLite to JSON to avoid binary compatibility issues during deployment.
 */
import cors from 'cors'
import express from 'express'
import fs from 'fs'
import { createServer } from 'http'
import path from 'path'
import { Server as SocketIOServer } from 'socket.io'
import { fileURLToPath } from 'url'
import { DEFAULT_SCORES } from '../src/data/mockData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dataDir = path.join(root, 'data')
const jsonPath = path.join(dataDir, 'scores.json')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

/** Helper to read scores from JSON file */
function readScoresFromDb() {
  if (!fs.existsSync(jsonPath)) return null
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading JSON DB:', err)
    return null
  }
}

/** Helper to write scores to JSON file */
function writeScoresToDb(obj) {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2), 'utf8')
  } catch (err) {
    console.error('Error writing JSON DB:', err)
  }
}

// Initialize if empty
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
  
  // Basic validation of team keys
  const teams = ['pink', 'yellow', 'blue', 'green']
  if (!teams.every((id) => body[id] && typeof body[id] === 'object')) {
    res.status(400).json({ error: 'Missing team scores' })
    return
  }

  writeScoresToDb(body)
  const next = readScoresFromDb()
  
  // Broadcast to ALL connected clients
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
  console.log(`JSON DB: ${jsonPath}`)
  console.log(`Realtime: Socket.IO on same port`)
  if (isProd) {
    console.log(`Open http://localhost:${PORT} (static + api)`)
  } else {
    console.log(`API: http://localhost:${PORT}`)
    console.log(`Open the app in Vite → http://localhost:${process.env.VITE_DEV_PORT ?? 5173} (not ${PORT})`)
  }
})
