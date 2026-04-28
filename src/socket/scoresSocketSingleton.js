import { io } from 'socket.io-client'

/**
 * Single Socket.IO connection per tab — avoids tearing down WS on React Strict Mode
 * remounts (disconnect-before-handshake warnings).
 */
function getSocketUrl() {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_ORIGIN || 'http://localhost:8787'
  }
  return undefined
}

let socket = null

function getSharedSocket() {
  if (!socket) {
    socket = io(getSocketUrl(), {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    })
  }
  return socket
}

/** Attach listener; return unsubscribe only (never disconnect socket). */
export function subscribeScoresUpdate(listener) {
  const s = getSharedSocket()
  s.on('scores:update', listener)
  return () => {
    s.off('scores:update', listener)
  }
}
