import { useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowLeft,
  IconFullscreenEnter,
  IconFullscreenLeave,
} from './ToolbarIcons'
import { EVENTS, TEAMS } from '../data/mockData'
import { useFullscreen } from '../hooks/useFullscreen'

function getTotal(scores, teamId) {
  return Object.values(scores[teamId] || {}).reduce((a, b) => a + Number(b), 0)
}

const RANK_META = {
  1: { crown: '👑', label: '1st', suffix: 'CHAMPION' },
  2: { crown: '🥈', label: '2nd', suffix: '2nd Place' },
  3: { crown: '🥉', label: '3rd', suffix: '3rd Place' },
  4: { crown: '🏅', label: '4th', suffix: '4th Place' },
}

/* ── Confetti canvas ─────────────────────────────────────── */
function ConfettiCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = ['#FFD700', '#FF2D78', '#00AAFF', '#00CC44', '#FF6B35', '#B44FFF', '#fff']
    const SHAPES = ['rect', 'circle', 'tri']
    const TOTAL = 120
    const particles = Array.from({ length: TOTAL }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 1.8,
      vy: Math.random() * 2.2 + 0.8,
      size: Math.random() * 7 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.5 + 0.5,
      delay: i * 0.5,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016
      particles.forEach(p => {
        if (t < p.delay / 60) return
        p.x += p.vx
        p.y += p.vy
        p.rot += p.rotV
        p.vy += 0.015
        if (p.y > canvas.height + 20) {
          p.y = -16; p.x = Math.random() * canvas.width
          p.vy = Math.random() * 2 + 0.8; p.alpha = Math.random() * 0.5 + 0.5
        }
        ctx.save()
        ctx.globalAlpha = p.alpha * 0.72
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else if (p.shape === 'circle') {
          ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(0, -p.size / 2)
          ctx.lineTo(p.size / 2, p.size / 2)
          ctx.lineTo(-p.size / 2, p.size / 2)
          ctx.closePath(); ctx.fill()
        }
        ctx.restore()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="podium2-confetti" aria-hidden />
}

/* ── Spotlight beams ─────────────────────────────────────── */
function SpotlightBeams() {
  return (
    <div className="podium2-spotlights" aria-hidden>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className={`podium2-beam podium2-beam--${i}`} />
      ))}
    </div>
  )
}

/* ── Single podium column ────────────────────────────────── */
function PodiumSlot({ team, rank, step, maxScore }) {
  const meta = RANK_META[rank]
  const isFirst = rank === 1
  
  // Dynamic height calculation: scale height between 80px and 260px
  const minH = 80
  const maxH = 260
  const dynamicH = maxScore > 0 ? (team.total / maxScore) * maxH : minH
  const finalH = Math.max(minH, dynamicH)

  return (
    <div
      className={`podium2-slot podium2-slot--rank${rank}`}
      style={{ '--step': step, '--tc': team.color }}
      role="listitem"
    >
      {/* floating card */}
      <div className={`podium2-card ${isFirst ? 'podium2-card--champion' : ''}`} style={{ borderColor: `${team.color}44` }}>
        {isFirst && <div className="podium2-border-beam" aria-hidden />}
        <div className="podium2-card-glow" aria-hidden />

        <span className="podium2-crown">{meta.crown}</span>

        <div className="podium2-team-name">{team.label}</div>

        <div className="podium2-score">
          <span className="podium2-score-num">{team.total}</span>
          <span className="podium2-score-pts">pts</span>
        </div>

        <div className="podium2-badge">{meta.suffix}</div>
      </div>

      {/* dynamic podium pedestal */}
      <div 
        className="podium2-pedestal" 
        style={{ 
          height: `${finalH}px`,
          transition: 'height 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          borderColor: `${team.color}33`
        }}
      >
        <div className="podium2-pedestal-face">
          <span className="podium2-pedestal-rank" style={{ color: team.color }}>{meta.label}</span>
        </div>
        <div className="podium2-pedestal-shine" aria-hidden />
        <div className="podium2-pedestal-bottom" aria-hidden />
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────── */
export default function PodiumPage({ scores }) {
  const { isFullscreen, toggle } = useFullscreen()
  const ranked = useMemo(() => {
    return TEAMS.map((t) => ({ ...t, total: getTotal(scores, t.id) }))
      .sort((a, b) => b.total - a.total)
  }, [scores])

  const maxScore = ranked[0]?.total || 0
  const top4 = ranked.slice(0, 4)

  // Layout order: [2nd, 1st, 3rd, 4th]
  const displayOrder = [
    { team: top4[1], rank: 2, step: 1 },
    { team: top4[0], rank: 1, step: 0 },
    { team: top4[2], rank: 3, step: 2 },
    { team: top4[3], rank: 4, step: 3 },
  ].filter((item) => !!item.team)

  // Ticker content: Summary of scores per category
  const sportSummaries = useMemo(() => {
    return EVENTS.map(event => {
      const teamBreakdown = TEAMS.map(team => {
        const teamScores = scores[team.id] || {}
        const sportTotal = event.subEvents.reduce((sum, sub) => sum + Number(teamScores[sub.id] || 0), 0)
        return { label: team.label, color: team.color, score: sportTotal }
      })
      return { label: event.label, breakdown: teamBreakdown }
    })
  }, [scores])

  return (
    <div className="podium2-page">
      {/* background layers */}
      <div className="podium2-bg" aria-hidden>
        <div className="podium2-bg-grad" />
        <div className="podium2-bg-grid" />
        <div className="podium2-bg-vignette" />
      </div>

      <ConfettiCanvas />
      <SpotlightBeams />

      {/* floating nav */}
      <nav className="podium2-nav" aria-label="Page controls">
        <Link
          to="/"
          className="podium2-fab"
          aria-label="Back to scoreboard"
          title="Back to scoreboard"
        >
          <IconArrowLeft className="podium2-fab-icon" />
        </Link>
        <button
          type="button"
          className="podium2-fab"
          onClick={toggle}
          aria-pressed={isFullscreen}
          title={isFullscreen ? 'Exit full screen' : 'Full screen presentation'}
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
        >
          {isFullscreen
            ? <IconFullscreenLeave className="podium2-fab-icon" />
            : <IconFullscreenEnter className="podium2-fab-icon" />}
        </button>
      </nav>

      <main className="podium2-main">
        {/* heading */}
        <header className="podium2-heading" aria-labelledby="podium2-title">
          <div className="podium2-trophy-large" aria-hidden>🏆</div>
          <p className="podium2-heading-kicker">Y.T. Rubber Sports Day 2026 Summary</p>
          <h1 id="podium2-title" className="podium2-heading-title">Live Scoreboard</h1>
        </header>

        {/* podium stage */}
        <div className="podium2-stage" role="list" aria-label="Podium rankings">
          {displayOrder.map((item, i) => (
            <PodiumSlot
              key={item.team.id}
              team={item.team}
              rank={item.rank}
              step={item.step}
              maxScore={maxScore}
            />
          ))}
        </div>

        {/* floor line */}
        <div className="podium2-floor" />
      </main>

      {/* Real-time Ticker */}
      <footer className="podium2-ticker-wrap">
        <div className="podium2-ticker">
          <div className="podium2-ticker-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="podium2-ticker-content" aria-hidden={i > 0}>
                {sportSummaries.map((sport, idx) => (
                  <div key={idx} className="podium2-ticker-item">
                    <span className="p2-ticker-sport">{sport.label}</span>
                    {sport.breakdown.map((t, tidx) => (
                      <span key={tidx} className="p2-ticker-team" style={{ color: t.color }}>
                        {t.label} <strong>{t.score}</strong>
                      </span>
                    ))}
                    <span className="p2-ticker-sep">•</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
