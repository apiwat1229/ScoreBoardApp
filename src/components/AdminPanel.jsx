import { useState } from "react";
import { EVENTS, TEAMS } from "../data/mockData";

export default function AdminPanel({ scores, onScoreChange, onReset }) {
    const [activeTeam, setActiveTeam] = useState(TEAMS[0].id);

    const team = TEAMS.find((t) => t.id === activeTeam);

    return (
        <div className="admin-panel">
            <h2 className="admin-title">Admin - Update Scores</h2>

            {/* Team selector */}
            <div className="team-tabs">
                {TEAMS.map((t) => (
                    <button
                        key={t.id}
                        className={`team-tab ${activeTeam === t.id ? "active" : ""}`}
                        style={activeTeam === t.id ? { background: t.color, color: "#000" } : { borderColor: t.color, color: t.color }}
                        onClick={() => setActiveTeam(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Score fields */}
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

            <button className="reset-btn" onClick={onReset}>
                Reset All Scores
            </button>
        </div>
    );
}
