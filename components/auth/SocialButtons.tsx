"use client";

import { useMemo } from "react";

interface SocialButtonsProps {
  onGoogleLogin: () => void;
  onKakaoLogin: () => void;
}

function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /KAKAOTALK|Instagram|FBAN|FBAV|LINE|NAVER|Daum|Snapchat/i.test(ua);
}

export function SocialButtons({ onGoogleLogin, onKakaoLogin }: SocialButtonsProps) {
  const inApp = useMemo(() => isInAppBrowser(), []);

  return (
    <>
      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-900 text-white/40">또는</span>
        </div>
      </div>

      {/* 카카오 로그인 */}
      <button
        type="button"
        onClick={onKakaoLogin}
        className="w-full py-3 rounded-xl font-medium bg-[#FEE500] text-[#000000D9] hover:bg-[#FDD835] transition-all flex items-center justify-center gap-2"
      >
        <KakaoIcon className="w-5 h-5" />
        카카오로 계속하기
      </button>

      {/* Google 로그인 */}
      <button
        type="button"
        onClick={onGoogleLogin}
        className={`w-full py-3 rounded-xl font-medium bg-white text-gray-800 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 ${
          inApp ? "opacity-50" : ""
        }`}
      >
        <GoogleIcon className="w-5 h-5" />
        Google로 계속하기
      </button>

      {/* 인앱 브라우저 안내 */}
      {inApp && (
        <p className="text-xs text-amber-400/80 text-center">
          인앱 브라우저에서는 Google 로그인이 제한됩니다. 카카오 로그인을 이용해주세요.
        </p>
      )}
    </>
  );
}

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 3C6.477 3 2 6.463 2 10.691c0 2.687 1.78 5.052 4.469 6.393-.197.732-.715 2.652-.82 3.064-.13.513.188.506.396.368.163-.109 2.597-1.766 3.653-2.485.747.104 1.518.159 2.302.159 5.523 0 10-3.463 10-7.499S17.523 3 12 3z"
      />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
