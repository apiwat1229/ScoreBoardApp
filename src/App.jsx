import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminPanel from './components/AdminPanel'
import Scoreboard from './components/Scoreboard'
import {
  IconArrowLeft,
  IconFullscreenEnter,
  IconFullscreenLeave,
  IconSliders,
} from './components/ToolbarIcons'
import { DEFAULT_SCORES, TEAMS } from './data/mockData'
import { useFullscreen } from './hooks/useFullscreen'
import { useCountUp } from './hooks/useCountUp'

const STORAGE_KEY = 'sportsdayScores'

function loadScores() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_SCORES
  } catch {
    return DEFAULT_SCORES
  }
}

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
          <Link to="/admin" className="admin-link-btn">
            <IconSliders className="toolbar-btn-icon" />
            <span className="toolbar-btn-text">Edit scores</span>
          </Link>
          <div className="nav-pill">
            <span className="nav-dot" />
            <span className="nav-pill-text">Auto · Slide</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Scoreboard scores={scores} />
      </main>
    </>
  )
}

function AdminPage({ scores, onScoreChange, onReset }) {
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
        <AdminPanel scores={scores} onScoreChange={onScoreChange} onReset={onReset} />
      </main>
    </>
  )
}

function App() {
  const [scores, setScores] = useState(loadScores)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  }, [scores])

  const handleScoreChange = (teamId, subId, value) => {
    setScores((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || {}), [subId]: value },
    }))
  }

  const handleReset = () => {
    setScores({ ...DEFAULT_SCORES })
  }

  return (
    <div className="app">
      <Background />
      <Routes>
        <Route path="/" element={<HomePage scores={scores} />} />
        <Route
          path="/admin"
          element={
            <AdminPage
              scores={scores}
              onScoreChange={handleScoreChange}
              onReset={handleReset}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App
