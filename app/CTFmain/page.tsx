"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAudio } from "../components/AudioProvider";
import { motion } from "framer-motion";
import KOTHShell from "../components/KOTHShell";

/* =====================================================
   MOCK DATA – BACKEND WILL REPLACE
===================================================== */
interface ChallengeDomain {
  domain: string;
  desc: string;
  isKOTH?: boolean;
  challenges: any;
}

const mockChallenges: ChallengeDomain[] = [
  {
    domain: "Forensics",
    desc: "Digital investigation & evidence analysis",
    challenges: {
      Easy: [{ id: 1, title: "Hidden File", description: "Find hidden data inside files." }],
      Medium: [{ id: 2, title: "PCAP Analysis", description: "Analyze captured network traffic." }],
      Hard: [{ id: 3, title: "Memory Dump", description: "Extract secrets from memory." }],
    },
  },
  {
    domain: "Web Exploit",
    desc: "Break vulnerable web applications",
    challenges: {
      Easy: [{ id: 4, title: "Basic XSS", description: "Exploit reflected XSS." }],
      Medium: [{ id: 5, title: "SQL Injection", description: "Dump database content." }],
      Hard: [{ id: 6, title: "Auth Bypass", description: "Break flawed authentication." }],
    },
  },

  {
    domain: "Binary",
    desc: "Low-level exploitation challenges",
    challenges: {
      Easy: [{ id: 7, title: "BOF 1", description: "Stack overflow basics." }],
      Medium: [{ id: 8, title: "ret2libc", description: "Redirect execution flow." }],
      Hard: [{ id: 9, title: "Heap Abuse", description: "Advanced heap exploitation." }],
    },
  },
  {
    domain: "Cyber Security",
    desc: "Defense, analysis & response",
    challenges: {
      Easy: [{ id: 10, title: "Recon", description: "Open-source intelligence gathering." }],
      Medium: [{ id: 11, title: "Threat Analysis", description: "Analyze attacker behavior." }],
      Hard: [{ id: 12, title: "Incident Response", description: "Handle breach scenarios." }],
    },
  },
  {
    domain: "Reverse Engineering",
    desc: "Understand compiled programs",
    challenges: {
      Easy: [{ id: 13, title: "Strings", description: "Extract readable strings." }],
      Medium: [{ id: 14, title: "Crackme", description: "Reverse simple protections." }],
      Hard: [{ id: 15, title: "Obfuscated Logic", description: "Defeat obfuscation." }],
    },
  },
];

export default function CTFMainPage() {
  const [mounted, setMounted] = useState(false);
  const [activeDomain, setActiveDomain] = useState<any | null>(null);
  const [activeProblem, setActiveProblem] = useState<any | null>(null);
  const [closing, setClosing] = useState(false);
  const [showKOTHShell, setShowKOTHShell] = useState(false);
  const { isPlaying, toggleAudio } = useAudio();

  // Generate team ID (in real implementation, this would come from authentication)
  const [teamId] = useState(() => `Team_${Math.random().toString(36).substr(2, 9)}`);
  const [instanceId] = useState(() => `koth_${Math.random().toString(36).substr(2, 9)}`);

  // Debug log
  useEffect(() => {
    console.log('showKOTHShell state:', showKOTHShell);
  }, [showKOTHShell]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow =
      activeDomain || activeProblem ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeDomain, activeProblem]);

  const closeDomain = () => {
    setClosing(true);
    setTimeout(() => {
      setActiveDomain(null);
      setClosing(false);
    }, 260);
  };

  const closeProblem = () => {
    setClosing(true);
    setTimeout(() => {
      setActiveProblem(null);
      setClosing(false);
    }, 220);
  };

  return (
    <main className="relative min-h-screen text-zinc-100 overflow-hidden">
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

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/20 bg-white/3 backdrop-blur-none shadow-lg shadow-black/20">
        <span className="tracking-[0.4em] font-extrabold text-sm">IEEE RAS</span>
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
            href="/" 
            className="px-4 py-2 text-sm rounded-xl border border-white/30 bg-white/5 backdrop-blur-none hover:bg-white/10 hover:border-white/40 transition-all shadow-lg shadow-black/20 text-zinc-300 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className="px-4 py-2 text-sm rounded-xl border border-white/30 bg-white/5 backdrop-blur-none hover:bg-white/10 hover:border-white/40 transition-all shadow-lg shadow-black/20 text-zinc-300 hover:text-white"
          >
            Leaderboard
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        className={`relative z-10 text-center py-16 px-6 transition-all duration-700
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <h1 
          className="text-4xl md:text-6xl font-black tracking-widest text-green-400"
          style={{
            textShadow: '3px 3px 0px #fbbf24, 6px 6px 0px #f59e0b, 9px 9px 0px #d97706, 12px 12px 15px rgba(0,0,0,0.3)'
          }}
        >
          WELCOME TO THE CAPTURE THE FLAG
        </h1>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto text-sm md:text-base">
          Choose a domain. Solve challenges. Prove your dominance.
        </p>
      </section>

      {/* ================= PYRAMID DOMAIN GRID ================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        {/* DESKTOP PYRAMID */}
        <div className="hidden md:grid grid-cols-6 gap-6">
          {/* TOP ROW */}
          {mockChallenges.slice(0, 2).map((d, i) => (
            <button
              key={d.domain}
              onClick={() => {
                if (d.isKOTH) {
                  setShowKOTHShell(true);
                } else {
                  setActiveDomain(d);
                }
              }}
              style={{ animationDelay: `${i * 120}ms` }}
              className={`domain-card col-span-3 ${d.isKOTH ? 'koth-card' : ''}`}
            >
              <h3 className="text-xl font-bold">{d.domain} {d.isKOTH ? '🏰' : ''}</h3>
              <p className="text-xs text-zinc-400 mt-2">{d.desc}</p>
              {!d.isKOTH && (
                <div className="mt-4 flex gap-2 text-[10px] text-zinc-500">
                  <span>Easy</span>
                  <span>Medium</span>
                  <span>Hard</span>
                </div>
              )}
              {d.isKOTH && (
                <div className="mt-4 text-[10px] text-yellow-400 font-semibold">
                  🔥 LIVE COMPETITION 🔥
                </div>
              )}
            </button>
          ))}

          {/* MIDDLE ROW - KOTH takes center position */}
          {mockChallenges.slice(2, 3).map((d, i) => (
            <button
              key={d.domain}
              onClick={() => {
                console.log('KOTH Middle Row clicked!', d.domain, d.isKOTH);
                if (d.isKOTH) {
                  setShowKOTHShell(true);
                } else {
                  setActiveDomain(d);
                }
              }}
              style={{ animationDelay: `${(i + 2) * 120}ms` }}
              className={`domain-card col-span-6 ${d.isKOTH ? 'koth-card' : ''}`}
            >
              <h3 className="text-2xl font-bold">{d.domain} {d.isKOTH ? '🏰' : ''}</h3>
              <p className="text-sm text-zinc-400 mt-2">{d.desc}</p>
              {!d.isKOTH && (
                <div className="mt-4 flex gap-2 text-[10px] text-zinc-500">
                  <span>Easy</span>
                  <span>Medium</span>
                  <span>Hard</span>
                </div>
              )}
              {d.isKOTH && (
                <div className="mt-4 text-sm text-yellow-400 font-bold animate-pulse">
                  🔥 CLICK TO ENTER THE ARENA 🔥
                </div>
              )}
            </button>
          ))}

          {/* BOTTOM ROW */}
          {mockChallenges.slice(3).map((d, i) => (
            <button
              key={d.domain}
              onClick={() => {
                if (d.isKOTH) {
                  setShowKOTHShell(true);
                } else {
                  setActiveDomain(d);
                }
              }}
              style={{ animationDelay: `${(i + 3) * 120}ms` }}
              className={`domain-card col-span-3 ${d.isKOTH ? 'koth-card' : ''}`}
            >
              <h3 className="text-xl font-bold">{d.domain} {d.isKOTH ? '🏰' : ''}</h3>
              <p className="text-xs text-zinc-400 mt-2">{d.desc}</p>
              {!d.isKOTH && (
                <div className="mt-4 flex gap-2 text-[10px] text-zinc-500">
                  <span>Easy</span>
                  <span>Medium</span>
                  <span>Hard</span>
                </div>
              )}
              {d.isKOTH && (
                <div className="mt-4 text-[10px] text-yellow-400 font-semibold">
                  🔥 LIVE COMPETITION 🔥
                </div>
              )}
            </button>
          ))}
        </div>

        {/* MOBILE FALLBACK */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mockChallenges.map((d, i) => (
            <button
              key={d.domain}
              onClick={() => {
                console.log('Mobile KOTH clicked!', d.domain, d.isKOTH);
                if (d.isKOTH) {
                  setShowKOTHShell(true);
                } else {
                  setActiveDomain(d);
                }
              }}
              style={{ animationDelay: `${i * 80}ms` }}
              className={`domain-card ${d.isKOTH ? 'koth-card' : ''}`}
            >
              <h3 className="text-xl font-bold">{d.domain} {d.isKOTH ? '🏰' : ''}</h3>
              <p className="text-xs text-zinc-400 mt-2">{d.desc}</p>
              {d.isKOTH && (
                <div className="mt-4 text-[10px] text-yellow-400 font-semibold">
                  🔥 TAP TO ENTER 🔥
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* DOMAIN MODAL */}
      {activeDomain && !activeDomain.isKOTH && (
        <div className="fixed inset-0 z-30 bg-black/90 flex items-center justify-center px-4">
          <div className={`modal-lamp w-full max-w-4xl p-6 ${closing ? "lamp-close" : ""}`}>
            <h2 className="text-2xl font-bold mb-1">{activeDomain.domain}</h2>
            <p className="text-sm text-zinc-400 mb-6">{activeDomain.desc}</p>

            <div className="grid md:grid-cols-3 gap-4">
              {(["Easy", "Medium", "Hard"] as const).map((lvl, i) => (
                <div
                  key={lvl}
                  style={{ animationDelay: `${i * 140}ms` }}
                  className="fade-up bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-4 shadow-lg shadow-black/20"
                >
                  <h4 className="font-semibold mb-3">{lvl}</h4>
                  {activeDomain.challenges[lvl].map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveProblem(p)}
                      className="w-full text-left p-3 mb-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-xl hover:bg-white/20 hover:border-white/30 transition-all shadow-md"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <button className="mt-6 text-red-400 hover:underline" onClick={closeDomain}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* PROBLEM MODAL */}
      {activeProblem && (
        <div className="fixed inset-0 z-40 bg-black/95 flex items-center justify-center px-4">
          <div className={`problem-lamp w-full max-w-3xl p-6 ${closing ? "lamp-close-fast" : ""}`}>
            <h2 className="text-2xl font-bold">{activeProblem.title}</h2>
            <p className="fade-up mt-4 text-zinc-300 whitespace-pre-wrap">
              {activeProblem.description}
            </p>

            <div className="mt-6 border-t border-white/10 pt-4 text-sm text-zinc-400">
              Hints, attachments and flag submission will appear here.
            </div>

            <button className="mt-6 text-red-400 hover:underline" onClick={closeProblem}>
              Close Problem
            </button>
          </div>
        </div>
      )}

      {/* KOTH SHELL */}
      {showKOTHShell && (
        <KOTHShell
          onClose={() => setShowKOTHShell(false)}
          teamId={teamId}
          instanceId={instanceId}
        />
      )}

      {/* GLOBAL ANIMATIONS */}
      <style jsx global>{`
        .domain-card {
          opacity: 0;
          animation: fadeUp 0.6s ease-out forwards;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .koth-card {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.05));
          border-color: rgba(255, 215, 0, 0.6);
          box-shadow: 0 8px 32px rgba(255, 140, 0, 0.3), inset 0 1px 0 rgba(255, 215, 0, 0.2);
          cursor: pointer;
          pointer-events: auto;
        }

        .koth-card:hover {
          transform: translateY(-12px);
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.1));
          border-color: rgba(255, 215, 0, 0.8);
          box-shadow: 0 20px 50px rgba(255, 140, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 215, 0, 0.3);
        }

        .domain-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
          border-radius: 1rem;
          pointer-events: none;
        }

        .domain-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.6s ease;
        }

        .domain-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 15px 40px rgba(34, 211, 238, 0.2), 0 0 0 1px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .domain-card:hover::after {
          left: 100%;
        }

        .fade-up {
          opacity: 0;
          animation: fadeUp 0.6s ease-out forwards;
        }

        .modal-lamp,
        .problem-lamp {
          border-radius: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: none;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: lampOpen 0.6s ease-out forwards;
          overflow: hidden;
          position: relative;
        }

        .modal-lamp::before,
        .problem-lamp::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          border-radius: 1.25rem;
          pointer-events: none;
        }

        .lamp-close {
          animation: lampClose 0.25s ease-in forwards;
        }

        .lamp-close-fast {
          animation: lampClose 0.22s ease-in forwards;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lampOpen {
          from {
            opacity: 0;
            transform: scale(0.9);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes lampClose {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(10px);
          }
        }
      `}</style>
    </main>
  );
}
