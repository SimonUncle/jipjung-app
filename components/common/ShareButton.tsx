"use client";

import { Share2, Check, Copy } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  onShare: () => Promise<boolean>;
  label?: string;
  className?: string;
}

export function ShareButton({ onShare, label = "공유하기", className = "" }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleClick = async () => {
    const success = await onShare();
    setStatus(success ? "success" : "error");

    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={status !== "idle"}
      className={`
        flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
        font-medium text-sm transition-all
        ${
          status === "success"
            ? "bg-green-500/20 text-green-400 border border-green-400/30"
            : status === "error"
            ? "bg-red-500/20 text-red-400 border border-red-400/30"
            : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20"
        }
        ${className}
      `}
    >
      {status === "success" ? (
        <>
          <Check className="w-4 h-4" />
          복사됨!
        </>
      ) : status === "error" ? (
        <>
          <Copy className="w-4 h-4" />
          실패
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
}
