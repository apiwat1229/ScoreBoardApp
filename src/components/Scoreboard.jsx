import { useEffect, useMemo, useState } from "react";
import { EVENTS, TEAMS } from "../data/mockData";
import { useCountUp } from "../hooks/useCountUp";

const ROWS_PER_PAGE = 6;
const SLIDE_MS = 4500;

function getTotal(scores, teamId) {
    return Object.values(scores[teamId] || {}).reduce((a, b) => a + Number(b), 0);
}

/** Sum scores for one sport/category (all its sub-events). */
function getEventTotal(scores, teamId, event) {
    if (!event?.subEvents?.length) return 0;
    return event.subEvents.reduce((sum, sub) => {
        return sum + Number(scores[teamId]?.[sub.id] ?? 0);
    }, 0);
}

function getRank(scores) {
    const totals = TEAMS.map((t) => ({ id: t.id, total: getTotal(scores, t.id) }));
    totals.sort((a, b) => b.total - a.total);
    const rankMap = {};
    totals.forEach((item, idx) => (rankMap[item.id] = idx + 1));
    return rankMap;
}

/** Teams left→right: highest total first (matches top bar order). */
function getTeamsOrderedByScore(scores) {
    return [...TEAMS].sort(
        (a, b) => getTotal(scores, b.id) - getTotal(scores, a.id),
    );
}

const RANK_LABELS = ["1st", "2nd", "3rd", "4th"];

/** Flatten events into (event, page) slides so long categories fit one screen without scroll. */
function buildSlides() {
    const slides = [];
    for (const event of EVENTS) {
        const n = event.subEvents.length;
        const pages = Math.max(1, Math.ceil(n / ROWS_PER_PAGE));
        for (let p = 0; p < pages; p++) {
            slides.push({ event, page: p, pageCount: pages });
        }
    }
    return slides;
}

const SLIDES = buildSlides();

function AnimatedScore({ value, color, large, teamId }) {
    const display = useCountUp(value);
    return (
        <div
            className={`sb-score-cell ${value > 0 ? "has-score" : ""} ${large ? "total-score" : ""}`}
            style={value > 0 ? { color } : {}}
        >
            <span className="sb-score-inner" data-team={teamId}>
                {display}
            </span>
        </div>
    );
}

export default function Scoreboard({ scores }) {
    const [slideIndex, setSlideIndex] = useState(0);
    const [direction, setDirection] = useState("to-left");
    const rankMap = getRank(scores);
    const orderedTeams = useMemo(() => getTeamsOrderedByScore(scores), [scores]);

    const { currentEvent, subSlice, pageLabel, globalIndex, totalSlides } = useMemo(() => {
        const slide = SLIDES[slideIndex];
        const start = slide.page * ROWS_PER_PAGE;
        const subSlice = slide.event.subEvents.slice(start, start + ROWS_PER_PAGE);
        const pageLabel =
            slide.pageCount > 1 ? `${slide.page + 1} / ${slide.pageCount}` : null;
        return {
            currentEvent: slide.event,
            subSlice,
            pageLabel,
            globalIndex: slideIndex + 1,
            totalSlides: SLIDES.length,
        };
    }, [slideIndex]);

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection((prev) => (prev === "to-left" ? "to-right" : "to-left"));
            setSlideIndex((prev) => (prev + 1) % SLIDES.length);
        }, SLIDE_MS);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="scoreboard-wrap">
            <div className="scoreboard">
                <div className="sb-header">
                    <div className="sb-event-col">Sport / Category</div>
                    {orderedTeams.map((team) => (
                        <div
                            key={team.id}
                            className={`sb-team-col rank-${rankMap[team.id]}`}
                            style={{ "--team-color": team.color }}
                        >
                            <span className="team-label">{team.label}</span>
                            <span
                                className="team-rank-badge"
                                style={{
                                    background: `${team.color}22`,
                                    color: team.color,
                                    border: `1px solid ${team.color}55`,
                                }}
                            >
                                {RANK_LABELS[rankMap[team.id] - 1]}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="sb-slide-stage">
                    <div
                        key={`${currentEvent.id}-${slideIndex}-${direction}`}
                        className={`sb-slide ${direction}`}
                    >
                        <div className="sb-event-group">
                            <div className="sb-event-title-row">
                                <div className="sb-event-title-wrap">
                                    <span className="sb-event-title">{currentEvent.label}</span>
                                    {pageLabel && (
                                        <span className="sb-event-part" aria-live="polite">
                                            Part {pageLabel}
                                        </span>
                                    )}
                                </div>
                                <div className="sb-event-count">
                                    {globalIndex} / {totalSlides}
                                </div>
                            </div>

                            <div className="sb-rows-flex">
                                {subSlice.map((sub, idx) => (
                                    <div
                                        key={sub.id}
                                        className="sb-row"
                                        style={{ "--row-i": idx }}
                                    >
                                        <div className="sb-sub-label">
                                            {sub.ageGroup && (
                                                <span className="age-group">{sub.ageGroup}</span>
                                            )}
                                            {sub.gender && <span className="gender">{sub.gender}</span>}
                                            {!sub.ageGroup && !sub.gender && (
                                                <span className="age-group">Result</span>
                                            )}
                                        </div>
                                        {orderedTeams.map((team) => {
                                            const val = scores[team.id]?.[sub.id] ?? 0;
                                            return (
                                                <AnimatedScore
                                                    key={team.id}
                                                    teamId={team.id}
                                                    value={val}
                                                    color={team.color}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="slide-dots" aria-hidden>
                        {SLIDES.map((_, idx) => (
                            <span
                                key={idx}
                                className={`slide-dot ${idx === slideIndex ? "active" : ""}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="sb-total-row">
                    <div className="sb-sub-label total-label">
                        <span className="total-label-line">Total</span>
                        <span className="total-label-event">{currentEvent.label}</span>
                    </div>
                    {orderedTeams.map((team) => (
                        <AnimatedScore
                            key={`${team.id}-${currentEvent.id}`}
                            teamId={team.id}
                            value={getEventTotal(scores, team.id, currentEvent)}
                            color={team.color}
                            large
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
