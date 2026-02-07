"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseVisibilityOptions {
  onHidden?: () => void;
  onVisible?: () => void;
  enabled?: boolean;
}

export function useVisibility(options: UseVisibilityOptions = {}) {
  const { onHidden, onVisible, enabled = true } = options;
  const isHiddenRef = useRef(false);

  const handleVisibilityChange = useCallback(() => {
    if (!enabled || typeof document === "undefined") return;

    if (document.visibilityState === "hidden") {
      isHiddenRef.current = true;
      onHidden?.();
    } else if (document.visibilityState === "visible") {
      if (isHiddenRef.current) {
        onVisible?.();
      }
      isHiddenRef.current = false;
    }
  }, [enabled, onHidden, onVisible]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined" || typeof window === "undefined") return;

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 블러 이벤트도 감지 (창 포커스 잃음)
    const handleBlur = () => {
      if (enabled) {
        isHiddenRef.current = true;
        onHidden?.();
      }
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, handleVisibilityChange, onHidden]);

  return {
    isHidden: isHiddenRef.current,
  };
}
