"use client";

import { useEffect, useState, useRef } from "react";
import { PixelEagle } from "./terrain/PixelObjects";

interface PixelEventsProps {
  progress: number;
  onEventStart?: (event: EventType) => void;
  onEventEnd?: (event: EventType) => void;
}

type EventType = "sandstorm" | "oasis" | "eagle" | "rockfall" | "snowstorm" | "basecamp" | "arrival";

interface EventConfig {
  type: EventType;
  trigger: number;
  duration: number;
  message: string;
}

const EVENTS: EventConfig[] = [
  { type: "sandstorm", trigger: 15, duration: 3000, message: "모래폭풍!" },
  { type: "oasis", trigger: 25, duration: 4000, message: "오아시스 발견!" },
  { type: "eagle", trigger: 35, duration: 3000, message: "" },
  { type: "rockfall", trigger: 50, duration: 3000, message: "낙석 주의!" },
  { type: "snowstorm", trigger: 70, duration: 4000, message: "눈보라!" },
  { type: "basecamp", trigger: 90, duration: 3000, message: "베이스캠프가 보인다!" },
  { type: "arrival", trigger: 100, duration: 5000, message: "도착!" },
];

export function PixelEvents({ progress, onEventStart, onEventEnd }: PixelEventsProps) {
  const [activeEvent, setActiveEvent] = useState<EventType | null>(null);
  const [eventMessage, setEventMessage] = useState<string>("");
  const triggeredEvents = useRef<Set<EventType>>(new Set());

  useEffect(() => {
    // Find event to trigger
    const eventToTrigger = EVENTS.find(
      (e) => progress >= e.trigger && progress < e.trigger + 3 && !triggeredEvents.current.has(e.type)
    );

    if (eventToTrigger) {
      triggeredEvents.current.add(eventToTrigger.type);
      setActiveEvent(eventToTrigger.type);
      setEventMessage(eventToTrigger.message);
      onEventStart?.(eventToTrigger.type);

      const timer = setTimeout(() => {
        setActiveEvent(null);
        setEventMessage("");
        onEventEnd?.(eventToTrigger.type);
      }, eventToTrigger.duration);

      return () => clearTimeout(timer);
    }
  }, [progress, onEventStart, onEventEnd]);

  return (
    <>
      {/* Event message overlay */}
      {eventMessage && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3">
            <span className="text-white text-lg font-bold pixel-text">{eventMessage}</span>
          </div>
        </div>
      )}

      {/* Sandstorm effect */}
      {activeEvent === "sandstorm" && <SandstormEffect />}

      {/* Oasis effect */}
      {activeEvent === "oasis" && <OasisEffect />}

      {/* Eagle effect */}
      {activeEvent === "eagle" && <EagleEffect />}

      {/* Rockfall effect */}
      {activeEvent === "rockfall" && <RockfallEffect />}

      {/* Snowstorm effect */}
      {activeEvent === "snowstorm" && <SnowstormEffect />}

      {/* Arrival celebration */}
      {activeEvent === "arrival" && <ArrivalEffect />}

      <style jsx global>{`
        .pixel-text {
          font-family: monospace;
          text-shadow: 2px 2px 0 #000;
        }
      `}</style>
    </>
  );
}

// Return the character state based on active event
export function getCharacterState(activeEvent: EventType | null): "normal" | "resting" | "struggling" {
  if (activeEvent === "oasis") return "resting";
  if (activeEvent === "snowstorm" || activeEvent === "sandstorm") return "struggling";
  return "normal";
}

// Sandstorm particles
function SandstormEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {/* Screen shake */}
      <div className="absolute inset-0 animate-shake" />

      {/* Sand particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: "#d4a76a",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `sandParticle ${0.5 + Math.random() * 0.5}s linear infinite`,
            animationDelay: `${Math.random() * 0.5}s`,
            opacity: 0.6,
          }}
        />
      ))}

      {/* Yellow overlay */}
      <div className="absolute inset-0 bg-yellow-600/20" />

      <style jsx>{`
        @keyframes sandParticle {
          0% { transform: translateX(100vw) translateY(-10px); }
          100% { transform: translateX(-100px) translateY(20px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.1s infinite;
        }
      `}</style>
    </div>
  );
}

// Oasis water effect
function OasisEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Cool blue tint */}
      <div className="absolute inset-0 bg-blue-400/10 animate-pulse" />

      {/* Water droplets */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${20 + i * 10}%`,
            top: `${40 + (i % 3) * 10}%`,
            animation: `droplet 1s ease-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        >
          💧
        </div>
      ))}

      <style jsx>{`
        @keyframes droplet {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(30px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Eagle flying across screen
function EagleEffect() {
  const [frame, setFrame] = useState(0);
  const [position, setPosition] = useState(100);

  useEffect(() => {
    // Wing flap animation
    const flapInterval = setInterval(() => {
      setFrame((f) => (f + 1) % 2);
    }, 200);

    // Movement animation
    const moveInterval = setInterval(() => {
      setPosition((p) => p - 2);
    }, 30);

    return () => {
      clearInterval(flapInterval);
      clearInterval(moveInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <div
        className="absolute"
        style={{
          left: `${position}%`,
          top: "15%",
          transition: "left 0.03s linear",
        }}
      >
        <PixelEagle frame={frame} />
      </div>
    </div>
  );
}

// Rockfall effect
function RockfallEffect() {
  const rocks = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: 20 + i * 15,
    delay: i * 0.3,
    size: i % 2 === 0 ? 20 : 16,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {rocks.map((rock) => (
        <div
          key={rock.id}
          className="absolute"
          style={{
            left: `${rock.x}%`,
            top: "-50px",
            animation: `rockfall 1.5s ease-in infinite`,
            animationDelay: `${rock.delay}s`,
          }}
        >
          <svg
            width={rock.size * 4}
            height={rock.size * 4}
            viewBox="0 0 20 20"
            style={{ imageRendering: "pixelated" }}
          >
            <rect x="4" y="0" width="12" height="4" fill="#6b7280" />
            <rect x="0" y="4" width="20" height="12" fill="#4b5563" />
            <rect x="4" y="16" width="12" height="4" fill="#374151" />
          </svg>
        </div>
      ))}

      {/* Warning overlay */}
      <div className="absolute inset-0 bg-red-500/10 animate-pulse" />

      <style jsx>{`
        @keyframes rockfall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Snowstorm effect
function SnowstormEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {/* White overlay */}
      <div className="absolute inset-0 bg-white/20" />

      {/* Snow particles */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            animation: `snowfall ${1 + Math.random()}s linear infinite`,
            animationDelay: `${Math.random()}s`,
            opacity: 0.8,
          }}
        />
      ))}

      {/* Wind lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`wind-${i}`}
          className="absolute h-px bg-white/30"
          style={{
            width: "30%",
            left: `${Math.random() * 100}%`,
            top: `${20 + i * 15}%`,
            animation: `windLine 0.5s linear infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes snowfall {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(100vh) translateX(-50px); }
        }
        @keyframes windLine {
          0% { transform: translateX(100vw); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(-100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Arrival celebration
function ArrivalEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Golden glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent animate-pulse" />

      {/* Confetti */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3"
          style={{
            backgroundColor: ["#f1c40f", "#e74c3c", "#3498db", "#2ecc71"][i % 4],
            left: `${Math.random() * 100}%`,
            top: "-20px",
            animation: `confetti ${2 + Math.random()}s ease-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Big celebration text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl animate-bounce">
          🎉🏕️🎉
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
