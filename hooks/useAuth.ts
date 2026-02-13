"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { fullSync } from "@/lib/supabaseSync";
import { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean; // Supabase 설정 여부
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isConfigured: isSupabaseConfigured,
  });

  // 세션 체크
  useEffect(() => {
    // Supabase가 설정되지 않은 경우
    if (!isSupabaseConfigured) {
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        isConfigured: false,
      });
      return;
    }

    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
        isConfigured: true,
      });
    });

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
        isConfigured: true,
      });

      // 로그인 시 localStorage 데이터를 Supabase에 동기화
      if (_event === "SIGNED_IN" && session?.user?.id) {
        try {
          const raw = localStorage.getItem("climb-focus-data");
          if (raw) {
            const data = JSON.parse(raw);
            fullSync(session.user.id, data).catch(() => {});
          }
        } catch {}
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 이메일/비밀번호 회원가입
  const signUp = useCallback(async (email: string, password: string, nickname?: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase가 설정되지 않았습니다.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
        },
      },
    });

    if (error) throw error;
    return data;
  }, []);

  // 이메일/비밀번호 로그인
  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase가 설정되지 않았습니다.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }, []);

  // Google 로그인
  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase가 설정되지 않았습니다.");
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  }, []);

  // Kakao 로그인
  const signInWithKakao = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase가 설정되지 않았습니다.");
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  }, []);

  // 로그아웃
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase가 설정되지 않았습니다.");
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  // 비밀번호 재설정 이메일
  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase가 설정되지 않았습니다.");
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return data;
  }, []);

  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    resetPassword,
  };
}
