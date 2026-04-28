// Sports Day Scoreboard - 4 Teams

export const TEAMS = [
    { id: "pink", label: "PINK", color: "#FF2D78", bg: "#3a0020" },
    { id: "yellow", label: "YELLOW", color: "#FFD600", bg: "#2a2200" },
    { id: "blue", label: "BLUE", color: "#00AAFF", bg: "#002233" },
    { id: "green", label: "GREEN", color: "#00CC44", bg: "#002211" },
];

export const EVENTS = [
    {
        id: "running",
        label: "Running",
        type: "sub",
        subEvents: [
            { id: "run_18_29_m", ageGroup: "18-29", gender: "Male (M)" },
            { id: "run_18_29_w", ageGroup: "18-29", gender: "Female (W)" },
            { id: "run_30_39_m", ageGroup: "30-39", gender: "Male (M)" },
            { id: "run_30_39_w", ageGroup: "30-39", gender: "Female (W)" },
            { id: "run_40_49_m", ageGroup: "40-49", gender: "Male (M)" },
            { id: "run_40_49_w", ageGroup: "40-49", gender: "Female (W)" },
            { id: "run_50p_m", ageGroup: "50+", gender: "Male (M)" },
            { id: "run_50p_w", ageGroup: "50+", gender: "Female (W)" },
        ],
    },
    {
        id: "football",
        label: "Football",
        type: "single",
        subEvents: [
            { id: "football_total", ageGroup: "", gender: "" },
        ],
    },
    {
        id: "takrow",
        label: "Takraw",
        type: "single",
        subEvents: [
            { id: "takrow_total", ageGroup: "", gender: "" },
        ],
    },
    {
        id: "table_tennis",
        label: "Table Tennis",
        type: "sub",
        subEvents: [
            { id: "tt_m", ageGroup: "", gender: "Male (M)" },
            { id: "tt_w", ageGroup: "", gender: "Female (W)" },
        ],
    },
    {
        id: "badminton",
        label: "Badminton",
        type: "sub",
        subEvents: [
            { id: "bad_m", ageGroup: "", gender: "Male (M)" },
            { id: "bad_w", ageGroup: "", gender: "Female (W)" },
            { id: "bad_mw", ageGroup: "", gender: "Mixed (M+W)" },
        ],
    },
    {
        id: "funny",
        label: "Funny Games",
        type: "sub",
        subEvents: [
            { id: "sack", ageGroup: "Sack Race", gender: "M+W" },
            { id: "paper", ageGroup: "Paper Holding Race", gender: "M+W" },
            { id: "wvball", ageGroup: "Water Volleyball", gender: "M+W" },
        ],
    },
];

export const DEFAULT_SCORES = {
    pink: {
        run_18_29_m: 0, run_18_29_w: 0,
        run_30_39_m: 0, run_30_39_w: 0,
        run_40_49_m: 0, run_40_49_w: 0,
        run_50p_m: 0, run_50p_w: 0,
        football_total: 0,
        takrow_total: 0,
        tt_m: 11, tt_w: 1,
        bad_m: 0, bad_w: 10, bad_mw: 5,
        sack: 0, paper: 0, wvball: 0,
    },
    yellow: {
        run_18_29_m: 0, run_18_29_w: 0,
        run_30_39_m: 0, run_30_39_w: 0,
        run_40_49_m: 0, run_40_49_w: 0,
        run_50p_m: 0, run_50p_w: 0,
        football_total: 0,
        takrow_total: 0,
        tt_m: 6, tt_w: 1,
        bad_m: 0, bad_w: 0, bad_mw: 0,
        sack: 0, paper: 0, wvball: 0,
    },
    blue: {
        run_18_29_m: 0, run_18_29_w: 0,
        run_30_39_m: 0, run_30_39_w: 0,
        run_40_49_m: 0, run_40_49_w: 0,
        run_50p_m: 0, run_50p_w: 0,
        football_total: 0,
        takrow_total: 0,
        tt_m: 2, tt_w: 2,
        bad_m: 10, bad_w: 0, bad_mw: 10,
        sack: 0, paper: 0, wvball: 0,
    },
    green: {
        run_18_29_m: 0, run_18_29_w: 0,
        run_30_39_m: 0, run_30_39_w: 0,
        run_40_49_m: 0, run_40_49_w: 0,
        run_50p_m: 0, run_50p_w: 0,
        football_total: 0,
        takrow_total: 0,
        tt_m: 0, tt_w: 15,
        bad_m: 5, bad_w: 5, bad_mw: 0,
        sack: 0, paper: 0, wvball: 0,
    },
};
