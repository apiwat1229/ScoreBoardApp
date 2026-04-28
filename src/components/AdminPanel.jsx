import { useState } from 'react'
import { EVENTS, TEAMS } from '../data/mockData'

export default function AdminPanel({ scores, onScoreChange, onReset, onSave }) {
  const [activeTeam, setActiveTeam] = useState(TEAMS[0].id)
  const [saveStatus, setSaveStatus] = useState('')

  const team = TEAMS.find((t) => t.id === activeTeam)

  const handleSaveClick = async () => {
    setSaveStatus('Saving…')
    try {
      await onSave()
      setSaveStatus('Saved')
      setTimeout(() => setSaveStatus(''), 2500)
    } catch {
      setSaveStatus('Save failed — check API')
      setTimeout(() => setSaveStatus(''), 4000)
    }
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Admin — Update Scores</h2>

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
                  value={scores[activeTeam]?.[sub.id] ?? 0}
                  onChange={(e) =>
                    onScoreChange(activeTeam, sub.id, Number(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="admin-save-row">
        <button type="button" className="admin-save-btn" onClick={handleSaveClick}>
          Save to server
        </button>
        {saveStatus ? (
          <span className="admin-save-status" aria-live="polite">
            {saveStatus}
          </span>
        ) : null}
      </div>

    </div>
  )
}
