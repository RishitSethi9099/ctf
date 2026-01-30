"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAudio } from "./components/AudioProvider";
import { useState } from "react";
import KOTHShell from "./components/KOTHShell";

export default function HomePage() {
  const { isPlaying, toggleAudio } = useAudio();
  const [showKOTHShell, setShowKOTHShell] = useState(false);
  
  // Generate team ID (in real implementation, this would come from authentication)
  const [teamId] = useState(() => `Team_${Math.random().toString(36).substr(2, 9)}`);
  const [instanceId] = useState(() => `koth_${Math.random().toString(36).substr(2, 9)}`);
  
  return (
    <main className="relative min-h-screen overflow-hidden text-zinc-100">
      {/* ================= RV BACKGROUND ================= */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/rv-background.jpg')"
        }}
      />
      
      {/* Light overlay for text readability only */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      
      {/* Subtle animated effects over the image */}
      <motion.div
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.15),transparent_50%)]"
      />
      <motion.div
        animate={{ 
          opacity: [0.1, 0.25, 0.1],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]"
      />

      {/* ================= NAVBAR ================= */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-between px-8 py-6 bg-white/3 backdrop-blur-none border-b border-white/30 shadow-lg shadow-black/20"
      >
        <h1 className="text-sm md:text-base font-extrabold tracking-[0.2em]">
          <b>IEEE RAS x RANDOMIZE</b>
        </h1>

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

          <Link href="/leaderboard">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 backdrop-blur-none px-4 py-2 text-sm font-semibold hover:border-white/40 hover:bg-white/10 transition-all shadow-lg shadow-black/20"
            >
              🚀 <span>Leaderboard</span>
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* ================= HERO ================= */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 py-36 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-6xl font-black tracking-widest text-green-400"
          style={{
            textShadow: '3px 3px 0px #fbbf24, 6px 6px 0px #f59e0b, 9px 9px 0px #d97706, 12px 12px 15px rgba(0,0,0,0.3)'
          }}
        >
          WELCOME TO THE ARENA
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 max-w-2xl text-zinc-400 text-sm md:text-base"
        >
          A competitive cyber battleground built for hackers, defenders, and strategists.
          Choose your mode and prove your dominance.
        </motion.p>

        {/* ================= GAME MODES ================= */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-14">
          {/* CTFD */}
          <motion.button
            onClick={() => window.location.href = "http://cookcrackcapture.in/login"}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            whileHover={{ 
              scale: 1.08, 
              borderColor: "rgba(34,211,238, 0.9)",
              backgroundColor: "rgba(255,255,255,0.15)"
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-80 h-44 rounded-3xl border-2 border-white/40 bg-white/5 backdrop-blur-none shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-500 overflow-hidden"
          >
              {/* Ultra crystal clear liquid glass layers */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/15 via-white/5 to-transparent opacity-70" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-cyan-400/8 via-transparent to-white/10" />
              <div className="absolute inset-0 rounded-3xl bg-cyan-400/3 group-hover:bg-cyan-400/8 transition-all duration-500" />
              
              {/* Subtle reflective surface */}
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/15 to-transparent opacity-60 rounded-t-3xl" />
              <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/8 via-transparent to-cyan-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: [-100, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-20 skew-x-12 opacity-0 group-hover:opacity-100"
              />
              
              <div className="relative flex flex-col items-center justify-center h-full z-10">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-3xl mb-4 filter drop-shadow-2xl"
                >
                  🛡️
                </motion.div>
                <span className="text-2xl font-extrabold tracking-[0.3em]">CTFD</span>
                <span className="mt-2 text-xs uppercase tracking-widest text-zinc-400">
                  Capture The Flag
                </span>
              </div>
            </motion.button>

          {/* KOTH */}
          <motion.button
            onClick={() => setShowKOTHShell(true)}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            whileHover={{ 
              scale: 1.08, 
              borderColor: "rgba(168,85,247, 0.9)",
              backgroundColor: "rgba(255,255,255,0.15)"
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-80 h-44 rounded-3xl border-2 border-white/40 bg-white/5 backdrop-blur-none shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-500 overflow-hidden"
          >
            {/* Ultra crystal clear liquid glass layers */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/15 via-white/5 to-transparent opacity-70" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-purple-400/8 via-transparent to-white/10" />
            <div className="absolute inset-0 rounded-3xl bg-purple-400/3 group-hover:bg-purple-400/8 transition-all duration-500" />
            
            {/* Subtle reflective surface */}
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/15 to-transparent opacity-60 rounded-t-3xl" />
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/8 via-transparent to-purple-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: [-100, 400] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-20 skew-x-12 opacity-0 group-hover:opacity-100"
            />
            
            <div className="relative flex flex-col items-center justify-center h-full z-10">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="text-3xl mb-4 filter drop-shadow-2xl"
              >
                👑
              </motion.div>
              <span className="text-2xl font-extrabold tracking-[0.3em]">KOTH</span>
              <span className="mt-2 text-xs uppercase tracking-widest text-zinc-400">
                King of the Hill
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="relative z-10 pb-10 text-center text-xs text-zinc-500"
      >
        © {new Date().getFullYear()} · All systems operational
      </motion.footer>
      
      {/* KOTH SHELL */}
      {showKOTHShell && (
        <KOTHShell
          onClose={() => setShowKOTHShell(false)}
          teamId={teamId}
          instanceId={instanceId}
        />
      )}
    </main>
  );
}
