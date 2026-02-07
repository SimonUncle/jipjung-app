// Web Notifications API 래퍼

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function sendNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== "granted") return null;

  try {
    return new Notification(title, {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      ...options,
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
}

// 항해 완료 알림
export function notifyVoyageComplete(portName: string): Notification | null {
  return sendNotification("항해 완료!", {
    body: `${portName}에 도착했습니다! 🚢`,
    tag: "voyage-complete",
  });
}

// 업적 달성 알림
export function notifyAchievement(
  achievementName: string,
  icon: string
): Notification | null {
  return sendNotification("업적 달성!", {
    body: `${icon} ${achievementName}`,
    tag: "achievement",
  });
}

// 항구 해금 알림
export function notifyPortUnlock(portName: string): Notification | null {
  return sendNotification("새 항구 해금!", {
    body: `${portName}으로 항해할 수 있습니다! 🔓`,
    tag: "port-unlock",
  });
}
