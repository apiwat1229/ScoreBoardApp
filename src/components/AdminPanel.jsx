import { useState } from 'react'
import { EVENTS, TEAMS } from '../data/mockData'

export default function AdminPanel({ scores, onScoreChange, onReset, onSave }) {
  const [activeTeam, setActiveTeam] = useState(TEAMS[0].id)
  const [saveStatus, setSaveStatus] = useState('')
  const [showModal, setShowModal] = useState(false)

  const team = TEAMS.find((t) => t.id === activeTeam)

  const handleSaveClick = async () => {
    setSaveStatus('Saving…')
    try {
      await onSave()
      setSaveStatus('')
      setShowModal(true)
      setTimeout(() => setShowModal(false), 2000)
    } catch {
      setSaveStatus('Save failed — check API')
      setTimeout(() => setSaveStatus(''), 4000)
    }
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Admin — Update Scores</h2>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-icon">🏆</div>
            <h3>Saved Successfully!</h3>
            <p>Scores are now live on the scoreboard.</p>
          </div>
        </div>
      )}

      <div className="team-tabs">
        {TEAMS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`team-tab ${activeTeam === t.id ? 'active' : ''}`}
            style={
              activeTeam === t.id
                ? { background: t.color, color: '#000' }
                : { borderColor: t.color, color: t.color }
            }
            onClick={() => setActiveTeam(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-form">
        {EVENTS.map((event) => (
          <div key={event.id} className="admin-event-group">
            <div className="admin-event-title" style={{ color: team.color }}>
              {event.label}
            </div>
            {event.subEvents.map((sub) => (
              <div key={sub.id} className="admin-field-row">
                <label>
                  {sub.ageGroup || sub.gender ? (
                    <>
                      {sub.ageGroup && <span>{sub.ageGroup} </span>}
                      {sub.gender && <span>{sub.gender}</span>}
                    </>
                  ) : (
                    <span>Result</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={scores[activeTeam]?.[sub.id] || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value)
                    onScoreChange(activeTeam, sub.id, val)
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="admin-save-row">
        <button type="button" className="admin-save-btn" onClick={handleSaveClick} disabled={saveStatus === 'Saving…'}>
          {saveStatus === 'Saving…' ? 'Saving…' : 'Save to server'}
        </button>
        {saveStatus && saveStatus !== 'Saving…' ? (
          <span className="admin-save-status" aria-live="polite">
            {saveStatus}
          </span>
        ) : null}
      </div>
    </div>
  )
}
