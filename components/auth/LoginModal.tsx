"use client";

import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { SubmarineIcon } from "@/components/submarine/SubmarineIcon";
import { useAuthContext } from "./AuthProvider";
import { Modal, Button, Input } from "@/components/ui";
import { SocialButtons } from "./SocialButtons";
import { AuthModeSwitcher } from "./AuthModeSwitcher";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "signup" | "forgot";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn, signUp, signInWithGoogle, signInWithKakao, resetPassword } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
        onClose();
      } else if (mode === "signup") {
        await signUp(email, password, nickname);
        setSuccess("확인 이메일을 보냈습니다. 이메일을 확인해주세요!");
      } else if (mode === "forgot") {
        await resetPassword(email);
        setSuccess("비밀번호 재설정 이메일을 보냈습니다!");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google 로그인 중 오류가 발생했습니다.");
    }
  };

  const handleKakaoLogin = async () => {
    setError(null);
    try {
      await signInWithKakao();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "카카오 로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* 헤더 */}
      <div className="pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SubmarineIcon className="w-8 h-8 text-cyan-400" size={32} />
          <h2 className="text-2xl font-bold text-white">
            {mode === "login" && "로그인"}
            {mode === "signup" && "회원가입"}
            {mode === "forgot" && "비밀번호 찾기"}
          </h2>
        </div>
        <p className="text-sm text-blue-300/60">
          {mode === "login" && "계정에 로그인하세요"}
          {mode === "signup" && "새로운 잠항을 시작하세요"}
          {mode === "forgot" && "이메일을 입력하세요"}
        </p>
      </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* 에러/성공 메시지 */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
              {success}
            </div>
          )}

          {/* 닉네임 (회원가입만) */}
          {mode === "signup" && (
            <Input
              type="text"
              label="닉네임"
              icon={<User className="w-4 h-4" />}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="잠항사 닉네임"
            />
          )}

          {/* 이메일 */}
          <Input
            type="email"
            label="이메일"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />

          {/* 비밀번호 (로그인/회원가입) */}
          {mode !== "forgot" && (
            <Input
              type="password"
              label="비밀번호"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          )}

          {/* 제출 버튼 */}
          <Button type="submit" isLoading={isLoading} fullWidth size="lg">
            {mode === "login" && "로그인"}
            {mode === "signup" && "가입하기"}
            {mode === "forgot" && "이메일 보내기"}
          </Button>

          {/* 소셜 로그인 */}
          {mode !== "forgot" && (
            <SocialButtons
              onGoogleLogin={handleGoogleLogin}
              onKakaoLogin={handleKakaoLogin}
            />
          )}

          {/* 모드 전환 링크 */}
          <AuthModeSwitcher
            mode={mode}
            onModeChange={(newMode) => {
              setMode(newMode);
              setError(null);
              setSuccess(null);
            }}
          />
        </form>
      </Modal>
  );
}
