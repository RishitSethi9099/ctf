"use client";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface AudioContextType {
  isPlaying: boolean;
  toggleAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Auto-play intro tune when website loads
    const playIntro = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.3; // Set volume to 30%
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.log("Autoplay prevented by browser");
          setIsPlaying(false);
        }
      }
    };
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(playIntro, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleAudio = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Audio play failed");
      }
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio }}>
      {children}
      
      {/* Global Audio Element - persists across all pages */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        autoPlay
        muted={false}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      >
        <source src="/intro.mp3" type="audio/mpeg" />
        <source src="/intro.ogg" type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}