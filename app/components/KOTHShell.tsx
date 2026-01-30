"use client";
import { useEffect, useRef, useState } from "react";

interface KOTHShellProps {
  onClose: () => void;
  teamId: string;
  instanceId: string;
}

export default function KOTHShell({ onClose, teamId, instanceId }: KOTHShellProps) {
  const [lines, setLines] = useState<string[]>([
    "NOTICE:",
    "This system is for authorized use only.",
    "All activity is monitored and logged.",
    "",
    "If you are not an authorized employee,",
    "disconnect immediately.",
    "",
    "--------------------------------------------------",
    "",
    "Type 'help' for available commands",
    ""
  ]);
  const [input, setInput] = useState("");
  const [interactiveMode, setInteractiveMode] = useState<{
    active: boolean;
    type: string;
    prompt: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Command history state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    
    // Fetch command history
    fetch(`/api/koth/history?teamId=${teamId}&instanceId=${instanceId}`)
        .then(res => res.json())
        .then(data => {
            if (data.ok && Array.isArray(data.history)) {
                
                // Restore visual lines
                const restoredLines = [
                    "NOTICE:",
                    "This system is for authorized use only.",
                    "All activity is monitored and logged.",
                    "",
                    "If you are not an authorized employee,",
                    "disconnect immediately.",
                    "",
                    "--------------------------------------------------",
                    "",
                    "Type 'help' for available commands",
                    ""
                ];

                const commandHistory: string[] = [];

                data.history.forEach((item: any) => {
                    const cmd = typeof item === 'string' ? item : item.command;
                    const out = typeof item === 'string' ? "" : item.output; // Legacy support
                    
                    if (cmd === "clear") {
                         restoredLines.splice(0, restoredLines.length); // Clear visual lines
                         restoredLines.push(
                            "NOTICE:",
                            "This system is for authorized use only.",
                            "All activity is monitored and logged.",
                            "",
                            "If you are not an authorized employee,",
                            "disconnect immediately.",
                            "",
                            "--------------------------------------------------",
                            "",
                            "Type 'help' for available commands",
                            ""
                         );
                         commandHistory.push(cmd);
                    } else {
                        if (cmd) {
                            restoredLines.push(`$ ${cmd}`);
                            commandHistory.push(cmd);
                        }
                        if (out) {
                            restoredLines.push(out);
                        }
                    }
                });

                setLines(restoredLines);
                setHistory(commandHistory);
            }
        })
        .catch(err => console.error("Failed to fetch history:", err));

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [teamId, instanceId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      // Small timeout to ensure DOM is ready after re-enabling
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isProcessing]);

  // Handle Ctrl+C to abort running command
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+C only when processing a command
      if (isProcessing && e.key.toLowerCase() === 'c' && e.ctrlKey) {
        // Don't prevent default if user is selecting text (browser handles copy)
        // usage: if nothing selected, interpret as break
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
            e.preventDefault();
            abortControllerRef.current?.abort();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isProcessing]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  async function executeCommand(cmd: string) {
    if (!cmd.trim()) return;

    setLines((prev) => [...prev, `$ ${cmd}`]);
    setIsProcessing(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/koth/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          command: cmd, 
          teamId, 
          instanceId 
        }),
        signal: controller.signal
      });

      const result = await response.json();

      if (result.interactive) {
        setInteractiveMode({
          active: true,
          type: result.type,
          prompt: result.prompt
        });
        setIsProcessing(false);
        abortControllerRef.current = null;
        return;
      }

      if (result.clear) {
        setLines([
          "NOTICE:",
          "This system is for authorized use only.",
          "All activity is monitored and logged.",
          "",
          "If you are not an authorized employee,",
          "disconnect immediately.",
          "",
          "--------------------------------------------------",
          "",
          "Type 'help' for available commands",
          ""
        ]);
      } else if (result.output) {
        setLines((prev) => [...prev, result.output]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setLines((prev) => [...prev, "^C"]);
      } else {
        setLines((prev) => [...prev, `Network error: ${error.message}`]);
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (isProcessing) return;
    
    // Interactive mode handling
    if (interactiveMode?.active) {
        const answer = input.trim();
        // Display the user's answer with the custom prompt
        setLines(prev => [...prev, `${interactiveMode.prompt}${answer}`]);
        setInput("");
        
        if (interactiveMode.type === "breaking_bad") {
            if (answer.toLowerCase() === "heisenberg") {
                 setLines(prev => [...prev, "YOUR GODDAMN RIGHT"]);
                 
                 setTimeout(() => {
                    setLines(prev => [...prev, "unfortunately you are on the wrong path", ""]);
                 }, 2000);
            } else {
                 setLines(prev => [...prev, "Who are you talking to right now? Who is it you think you see?", ""]);
            }
        }
        
        setInteractiveMode(null);
        return;
    }

    const cmd = input.trim();
    if (!cmd) return;

    // Add to history if unique or last command is different
    setHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === cmd) return prev;
      return [...prev, cmd];
    });
    setHistoryIndex(-1);
    setInput("");
    executeCommand(cmd);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      executeCommand("clear");
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;

      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;
      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    }
  }

  function handleContainerClick() {
    // Don't steal focus if user is selecting text
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      inputRef.current?.focus();
    }
  }

  // Server availability check
  const [serverError, setServerError] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if the droplet/ssh is reachable
    const checkConnection = async () => {
      try {
        const res = await fetch("/api/koth/exec", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: "whoami", teamId, instanceId, skipHistory: true })
        });
        const data = await res.json();
        // If we get an explicit shell error or connection fail message
        if (!data.ok && data.output && data.output.includes("Connection failed")) {
             setServerError(true);
        }
      } catch (e) {
         setServerError(true);
      } finally {
         setInitialized(true);
      }
    };

    checkConnection();
  }, [teamId, instanceId]);

  if (serverError) {
      return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="p-8 bg-stone-950/95 border border-amber-600/30 rounded-lg shadow-2xl text-center max-w-md">
                 <h2 className="text-2xl font-bold text-amber-500 mb-4">⚠️ SYSTEM OFFLINE</h2>
                 <p className="text-stone-300">The challenge will begin soon.</p>
                 <button onClick={onClose} className="mt-6 px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded text-stone-400">Close</button>
             </div>
        </div>
      );
  }
  
  // Don't render shell until we've checked connection to avoid flicker (optional, but cleaner)
  if (!initialized) return null; 

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div 
        onClick={handleContainerClick}
        className="w-full max-w-5xl h-[80vh] bg-stone-950/95 backdrop-blur-md border border-amber-600/30 rounded-lg shadow-2xl flex flex-col overflow-hidden ring-1 ring-amber-900/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-900/80 backdrop-blur-sm border-b border-amber-600/30">
          <div className="flex items-center gap-3">
            {/* Breaking Bad Style Logo Elements - Simplified to Mono-color */}
            <div className="flex items-baseline font-bold text-lg tracking-wide text-stone-300">
              <span>BLUME PORTAL</span>
            </div>
            <span className="text-amber-700/50 text-sm font-mono ml-2 hidden sm:inline">{teamId}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 rounded font-mono text-sm transition-all duration-200"
          >
            ✕ Close
          </button>
        </div>

        {/* Terminal Output */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm text-stone-300 bg-stone-950/50 selection:bg-amber-900/30 selection:text-amber-200"
          style={{ scrollbarColor: "#451a03 rgba(0,0,0,0.3)" }}
        >
          {lines.map((line, i) => (
            <pre key={i} className="whitespace-pre-wrap break-words mb-1 opacity-90">
              {line}
            </pre>
          ))}
          {isProcessing && (
            <div className="flex gap-1 mt-2 text-sky-500/70">
              <span className="animate-pulse">Cooking.</span>
              <span className="animate-pulse delay-100">.</span>
              <span className="animate-pulse delay-200">.</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 bg-stone-900/80 backdrop-blur-sm border-t border-amber-600/30"
        >
          <span className="text-emerald-600 font-mono font-bold">
            {interactiveMode?.active ? interactiveMode.prompt : "walter@lab:~$"}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="flex-1 bg-transparent outline-none text-sky-400 font-mono caret-amber-500 placeholder-stone-700"
            placeholder="Let's cook..."
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-1 bg-amber-700/20 hover:bg-amber-600/30 disabled:bg-stone-800 text-amber-500 hover:text-amber-400 border border-amber-700/50 rounded font-mono text-sm transition-all duration-200 uppercase tracking-wider"
          >
            Exec
          </button>
        </form>
      </div>

      <style jsx>{`
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
}
