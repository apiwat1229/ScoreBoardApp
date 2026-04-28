import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminPanel from './components/AdminPanel'
import PodiumPage from './components/PodiumPage'
import Scoreboard from './components/Scoreboard'
import {
  IconArrowLeft,
  IconFullscreenEnter,
  IconFullscreenLeave,
  IconPodium,
  IconSliders,
} from './components/ToolbarIcons'
import {
  fetchScores,
  loadScoresLocalBackup,
  persistScoresRemote,
  saveLocalMirror,
} from './api/scoresStorage'
import { DEFAULT_SCORES, TEAMS } from './data/mockData'
import { useFullscreen } from './hooks/useFullscreen'
import { useScoresSocket } from './hooks/useScoresSocket'
import { useCountUp } from './hooks/useCountUp'

function getTotal(scores, teamId) {
  return Object.values(scores[teamId] || {}).reduce((a, b) => a + Number(b), 0)
}

function TeamCard({ team, score, rank }) {
  const animScore = useCountUp(score)
  const medals = ['🥇', '🥈', '🥉', '']
  const isFirst = rank === 1

  return (
    <div
      className={`topbar-team ${isFirst ? 'topbar-team-leader' : ''}`}
      style={{ '--tc': team.color }}
    >
      <span className="topbar-medal">{medals[rank - 1]}</span>
      <div className="topbar-team-info">
        <span className="topbar-name">{team.label}</span>
        <span className="topbar-score" style={{ color: team.color }}>{animScore}</span>
      </div>
    </div>
  )
}

function Background() {
  return (
    <div className="bg-orbs" aria-hidden>
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="bg-vignette" />
      <div className="bg-scan" />
    </div>
  )
}

function HomePage({ scores }) {
  const { isFullscreen, toggle } = useFullscreen()
  const totals = TEAMS.map((t) => ({ ...t, total: getTotal(scores, t.id) })).sort(
    (a, b) => b.total - a.total,
  )

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-wrap">
            <span className="logo-icon">🏆</span>
            <div className="logo-text">
              <span className="logo">Sports Day</span>
              <span className="subtitle">Live Scoreboard</span>
            </div>
          </div>
        </div>

        <div className="topbar-totals">
          {totals.map((t, i) => (
            <TeamCard key={t.id} team={t} score={t.total} rank={i + 1} />
          ))}
        </div>

        <div className="topbar-nav">
          <button
            type="button"
            className="fullscreen-btn"
            onClick={toggle}
            aria-pressed={isFullscreen}
            title={
              isFullscreen
                ? 'Exit full screen (or press Esc)'
                : 'Enter full screen'
            }
          >
            {isFullscreen ? (
              <IconFullscreenLeave className="toolbar-btn-icon" />
            ) : (
              <IconFullscreenEnter className="toolbar-btn-icon" />
            )}
            <span className="toolbar-btn-text">
              {isFullscreen ? 'Exit full screen' : 'Full screen'}
            </span>
          </button>
          <Link to="/podium" className="podium-link-btn">
            <IconPodium className="toolbar-btn-icon" />
            <span className="toolbar-btn-text">Podium</span>
          </Link>
          <Link to="/admin" className="admin-link-btn">
            <IconSliders className="toolbar-btn-icon" />
            <span className="toolbar-btn-text">Edit scores</span>
          </Link>
        </div>
      </header>

      <main className="main-content">
        <Scoreboard scores={scores} />
      </main>
    </>
  )
}

function AdminPage({ scores, onScoreChange, onReset, onSave }) {
  return (
    <>
      <header className="topbar topbar-admin">
        <Link to="/" className="admin-back-link">
          <IconArrowLeft className="toolbar-btn-icon" />
          <span>Back to scoreboard</span>
        </Link>
        <h1 className="admin-topbar-title">Edit scores</h1>
        <span className="admin-topbar-spacer" aria-hidden="true" />
      </header>

      <main className="main-content main-content--admin">
        <AdminPanel
          scores={scores}
          onScoreChange={onScoreChange}
          onReset={onReset}
          onSave={onSave}
        />
      </main>
    </>
  )
}

function App() {
  const [scores, setScores] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  useScoresSocket(setScores)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchScores()
        if (!cancelled) setScores(data)
      } catch {
        if (!cancelled) setScores(loadScoresLocalBackup(DEFAULT_SCORES))
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (scores == null) return
    saveLocalMirror(scores)
  }, [scores])

  const handleScoreChange = (teamId, subId, value) => {
    setScores((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || {}), [subId]: value },
    }))
  }

  const handleSave = async () => {
    if (scores == null) return
    await persistScoresRemote(scores)
  }

  const handleReset = () => {
    const next = structuredClone(DEFAULT_SCORES)
    setScores(next)
    persistScoresRemote(next).catch(() => {})
  }

  if (!hydrated || scores == null) {
    return (
      <div className="app app-loading">
        <Background />
        <div className="app-loading-inner">Loading scores…</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Background />
      <div className="app-body">
        <Routes>
          <Route path="/" element={<HomePage scores={scores} />} />
          <Route path="/podium" element={<PodiumPage scores={scores} />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                scores={scores}
                onScoreChange={handleScoreChange}
                onReset={handleReset}
                onSave={handleSave}
              />
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
