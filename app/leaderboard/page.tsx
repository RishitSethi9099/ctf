"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAudio } from "../components/AudioProvider";

/* =====================================================
   MOCK DATA & TYPES
===================================================== */
type Team = {
    id: string;
    name: string;
    color: string;
    history: number[]; // Accumulated scores over time
};

const MOCK_TEAMS: Team[] = [
    {
        id: "t1",
        name: "CyberSentinels",
        color: "#22d3ee", // Cyan
        history: [0, 150, 300, 450, 450, 600, 850, 900],
    },
    {
        id: "t2",
        name: "Shadow Brokers",
        color: "#a855f7", // Purple
        history: [0, 100, 200, 350, 500, 700, 750, 800],
    },
    {
        id: "t3",
        name: "Null Pointers",
        color: "#f472b6", // Pink
        history: [0, 50, 150, 200, 400, 450, 600, 700],
    },
    {
        id: "t4",
        name: "Root Kitters",
        color: "#34d399", // Emerald
        history: [0, 100, 100, 250, 300, 500, 650, 650],
    },
];

// Graph constants
const POINTS_COUNT = 8; // Number of time points (must match history length)
const MAX_SCORE = 1000;
const GRAPH_HEIGHT = 400;
const GRAPH_WIDTH = 800;

export default function LeaderboardPage() {
    const [hoveredTeam, setHoveredTeam] = useState<Team | null>(null);
    const { isPlaying, toggleAudio } = useAudio();

    // Helper to convert data point to SVG coordinates
    const getCoordinates = (index: number, score: number) => {
        const x = (index / (POINTS_COUNT - 1)) * GRAPH_WIDTH;
        const y = GRAPH_HEIGHT - (score / MAX_SCORE) * GRAPH_HEIGHT;
        return `${x},${y}`;
    };

    // Generate path 'd' attribute for a team
    const generatePath = (history: number[]) => {
        return history.map((score, i) => {
            const coords = getCoordinates(i, score);
            return `${i === 0 ? "M" : "L"} ${coords}`;
        }).join(" ");
    };

    return (
        <main className="relative min-h-screen text-zinc-100 overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* ================= RV BACKGROUND (Same as homepage) ================= */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/rv-background.jpg')"
                }}
            />
            
            {/* Light overlay for text readability only */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

            {/* ================= NAVBAR ================= */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/20 bg-white/3 backdrop-blur-none shadow-lg shadow-black/20">
                <Link href="/" className="group">
                    <span className="tracking-[0.4em] font-extrabold text-sm md:text-base text-zinc-300 group-hover:text-white transition">
                        IEEE RAS
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    {/* Audio Toggle Button */}
                    <motion.button
                        onClick={toggleAudio}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 backdrop-blur-none px-3 py-2 text-sm font-semibold hover:border-white/40 hover:bg-white/10 transition-all shadow-lg shadow-black/20"
                    >
                        {isPlaying ? "🔊" : "🔇"} 
                        <span className="hidden md:inline">{isPlaying ? "Stop" : "Play"}</span>
                    </motion.button>

                    <Link
                        href="/CTFmain"
                        className="px-4 py-2 text-xs md:text-sm rounded-lg border border-white/30 bg-white/5 backdrop-blur-none hover:bg-white/10 hover:border-white/40 transition-all shadow-lg shadow-black/20 text-zinc-300 hover:text-white"
                    >
                        🛡️ CTF Arena
                    </Link>
                </div>
            </nav>

            {/* ================= CONTENT ================= */}
            <section className="relative z-10 flex flex-col items-center justify-center pt-12 pb-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-black tracking-widest bg-gradient-to-br from-white via-zinc-400 to-zinc-700 bg-clip-text text-transparent uppercase">
                        Leaderboard
                    </h1>
                    <p className="mt-3 text-zinc-500 text-sm tracking-widest uppercase">
                        Top Teams Live Performance
                    </p>
                </motion.div>

                {/* GRAPH CONTAINER */}
                <div className="relative w-full max-w-5xl aspect-[16/9] md:aspect-[21/9] bg-white/5 rounded-2xl border border-white/10 p-6 md:p-12 shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm overflow-hidden">

                    {/* Grid Lines */}
                    <div className="absolute inset-x-12 inset-y-12 border-l border-b border-white/10 pointer-events-none">
                        {[0.25, 0.5, 0.75, 1].map((tick) => (
                            <div key={tick} className="absolute w-full border-t border-dashed border-white/5" style={{ bottom: `${tick * 100}%` }} />
                        ))}
                    </div>

                    {/* SVG GRAPH */}
                    <div className="relative w-full h-full">
                        <svg
                            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
                            className="w-full h-full overflow-visible"
                            preserveAspectRatio="none"
                        >
                            {MOCK_TEAMS.map((team, idx) => {
                                const isHovered = hoveredTeam?.id === team.id;
                                const isDimmed = hoveredTeam && !isHovered;

                                return (
                                    <g key={team.id}>
                                        {/* The Line */}
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{
                                                pathLength: 1,
                                                opacity: isDimmed ? 0.1 : 1,
                                                strokeWidth: isHovered ? 6 : 3
                                            }}
                                            transition={{ duration: 2, ease: "easeInOut", delay: idx * 0.2 }}
                                            d={generatePath(team.history)}
                                            fill="none"
                                            stroke={team.color}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="transition-all duration-300"
                                            style={{ filter: isHovered ? `drop-shadow(0 0 10px ${team.color})` : "none" }}
                                        />

                                        {/* Points on the line */}
                                        {team.history.map((score, i) => {
                                            const [cx, cy] = getCoordinates(i, score).split(',');
                                            return (
                                                <motion.circle
                                                    key={i}
                                                    cx={cx}
                                                    cy={cy}
                                                    r={isHovered ? 6 : 0} // Only show dots on hover
                                                    fill="#000"
                                                    stroke={team.color}
                                                    strokeWidth={2}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: isHovered ? 1 : 0 }}
                                                    className="pointer-events-none"
                                                />
                                            );
                                        })}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Interactive Areas (Overlay) */}
                        {/* We overlay transparent columns per team or trigger generic hover areas. 
                For simplicity in this mock, we use a simple legend hover. */}
                    </div>
                </div>

                {/* TEAM LEGEND / RANKING */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
                    {MOCK_TEAMS.sort((a, b) => b.history[b.history.length - 1] - a.history[a.history.length - 1]).map((team, index) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            onMouseEnter={() => setHoveredTeam(team)}
                            onMouseLeave={() => setHoveredTeam(null)}
                            className={`
                group relative p-4 rounded-xl border border-white/5 bg-white/5 
                hover:bg-white/10 transition-all cursor-pointer overflow-hidden
                ${hoveredTeam?.id === team.id ? 'ring-1 ring-white/50' : ''}
              `}
                        >
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition duration-500"
                                style={{ backgroundColor: team.color }}
                            />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-xs text-zinc-500 font-mono mb-1">RANK {index + 1}</span>
                                    <span className="font-bold text-sm md:text-base truncate" style={{ color: team.color }}>
                                        {team.name}
                                    </span>
                                </div>
                                <div className="text-xl font-black text-white">
                                    {team.history[team.history.length - 1]}
                                    <span className="text-[10px] text-zinc-600 ml-1 font-normal">PTS</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </section>
        </main>
    );
}
