import { useEffect } from 'react'
import { subscribeScoresUpdate } from '../socket/scoresSocketSingleton'

/**
 * Keeps scores in sync when server broadcasts (after PUT or on connect).
 * Uses one shared Socket.IO client so React Strict Mode remounts don’t disconnect mid-handshake.
 */
export function useScoresSocket(setScores) {
  useEffect(() => {
    const handler = (payload) => {
      if (payload && typeof payload === 'object') {
        setScores(payload)
      }
    }
    return subscribeScoresUpdate(handler)
  }, [setScores])
}
