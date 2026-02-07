"use client";

type AuthMode = "login" | "signup" | "forgot";

interface AuthModeSwitcherProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthModeSwitcher({ mode, onModeChange }: AuthModeSwitcherProps) {
  const handleModeChange = (newMode: AuthMode) => {
    onModeChange(newMode);
  };

  return (
    <div className="text-center text-sm space-y-2">
      {mode === "login" && (
        <>
          <button
            type="button"
            onClick={() => handleModeChange("forgot")}
            className="text-blue-300/60 hover:text-blue-300"
          >
            비밀번호를 잊으셨나요?
          </button>
          <p className="text-white/40">
            계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={() => handleModeChange("signup")}
              className="text-cyan-400 hover:underline"
            >
              회원가입
            </button>
          </p>
        </>
      )}
      {mode === "signup" && (
        <p className="text-white/40">
          이미 계정이 있으신가요?{" "}
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className="text-cyan-400 hover:underline"
          >
            로그인
          </button>
        </p>
      )}
      {mode === "forgot" && (
        <button
          type="button"
          onClick={() => handleModeChange("login")}
          className="text-cyan-400 hover:underline"
        >
          로그인으로 돌아가기
        </button>
      )}
    </div>
  );
}
