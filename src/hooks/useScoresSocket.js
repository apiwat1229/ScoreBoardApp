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
        setScores((prev) => {
          // Prevent infinite loop: only update if data is actually different
          if (JSON.stringify(prev) === JSON.stringify(payload)) {
            return prev
          }
          return payload
        })
      }
    }
    return subscribeScoresUpdate(handler)
  }, [setScores])
}
