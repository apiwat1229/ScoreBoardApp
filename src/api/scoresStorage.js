const STORAGE_KEY = 'sportsdayScores'

export async function fetchScores() {
  const r = await fetch('/api/scores')
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export function loadScoresLocalBackup(defaultScores) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : defaultScores
  } catch {
    return defaultScores
  }
}

export function saveLocalMirror(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch {
    /* ignore quota */
  }
}

export async function persistScoresRemote(scores) {
  const r = await fetch('/api/scores', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scores),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}
