"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUAD_COLORS = [
  { bg: "#E5383B", token: "radial-gradient(circle at 35% 25%, #ffb3b3 0%, #f15c5c 30%, #D8262A 65%, #8C1014 100%)" },
  { bg: "#1B6FD6", token: "radial-gradient(circle at 35% 25%, #aed4ff 0%, #4f9bff 30%, #1457B8 65%, #06286B 100%)" },
  { bg: "#2DA84F", token: "radial-gradient(circle at 35% 25%, #a8eebd 0%, #4fcc7a 30%, #1F9248 65%, #0E5C28 100%)" },
  { bg: "#F5B400", token: "radial-gradient(circle at 35% 25%, #ffefb0 0%, #ffd24d 30%, #E0A100 65%, #8C6300 100%)" },
];

function MiniTokenIcon({ gradient, ring }: { gradient: string; ring: string }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full"
      style={{
        background: gradient,
        border: `1.5px solid ${ring}`,
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6)",
      }}
    />
  );
}

export default function HomePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [name, setName] = useState("");
  const coinBalance = 2500;

  const handlePlay = () => {
    router.push("/play");
  };

  const handleSocialLogin = (_provider: "google" | "facebook") => {
    // UI-only stub — wire up real OAuth later
    router.push("/play");
  };

  const handleGuestPlay = () => {
    router.push("/play");
  };

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden p-4 xs:p-6"
      style={{
        background:
          "radial-gradient(circle at 50% -10%, #1d5a8c 0%, #0a1f33 55%, #050f1a 100%)",
      }}
    >
      {/* decorative floating tokens in background */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        {QUAD_COLORS.map((c, i) => (
          <div
            key={i}
            className="absolute h-10 w-10 rounded-full xs:h-14 xs:w-14"
            style={{
              background: c.token,
              top: `${15 + i * 20}%`,
              left: i % 2 === 0 ? "8%" : "82%",
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      {/* top bar: coin balance */}
      <div className="z-10 flex w-full max-w-md items-center justify-end">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 xs:px-4 xs:py-2"
          style={{
            background: "linear-gradient(180deg, #F5B400 0%, #C98A00 100%)",
            boxShadow: "0 3px 0 #8a5e00, 0 4px 10px rgba(0,0,0,0.35)",
          }}
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-amber-900 xs:h-6 xs:w-6 xs:text-xs"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #fff6d6 0%, #ffd24d 50%, #C98A00 100%)",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
            }}
          >
            $
          </span>
          <span className="text-sm font-extrabold text-white xs:text-base">
            {coinBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* center: logo + tagline */}
      <div className="z-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          {QUAD_COLORS.map((c, i) => (
            <MiniTokenIcon key={i} gradient={c.token} ring={c.bg} />
          ))}
        </div>
        <h1 className="text-stroke font-display text-5xl font-extrabold text-white xs:text-6xl sm:text-7xl">
          Ludo
        </h1>
        <p className="text-sm font-semibold text-amber-200/80 xs:text-base">
          Roll. Race. Win.
        </p>
      </div>

      {/* bottom: play button + auth */}
      <div className="z-10 flex w-full max-w-sm flex-col items-center gap-3 xs:gap-4">
        <button
          onClick={handlePlay}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-lg font-extrabold text-white transition-transform active:scale-95 xs:py-4 xs:text-xl"
          style={{
            background: "linear-gradient(180deg, #34C75C 0%, #1F9248 100%)",
            boxShadow: "0 5px 0 #0E5C28, 0 8px 18px rgba(0,0,0,0.4)",
          }}
        >
          <i className="ti ti-player-play-filled text-[20px]" aria-hidden="true" />
          Play Now
        </button>

        {!showLogin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="text-sm font-bold text-amber-200/90 underline-offset-4 hover:underline xs:text-base"
          >
            Sign in to save progress
          </button>
        ) : (
          <div
            className="flex w-full flex-col gap-2.5 rounded-2xl p-4 xs:gap-3"
            style={{
              background: "linear-gradient(180deg, #123a5e 0%, #0c2945 100%)",
              boxShadow:
                "0 4px 0 #051320, 0 6px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <button
              onClick={() => handleSocialLogin("google")}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-white py-2.5 text-sm font-bold text-gray-700 transition-transform active:scale-95 xs:text-base"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
                />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialLogin("facebook")}
              className="flex items-center justify-center gap-2.5 rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-95 xs:text-base"
              style={{ background: "#1877F2" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z" />
              </svg>
              Continue with Facebook
            </button>

            <div className="flex items-center gap-2 py-1">
              <div className="h-px flex-1 bg-white/15" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40 xs:text-xs">
                or
              </span>
              <div className="h-px flex-1 bg-white/15" />
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border-2 border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-white placeholder-white/40 outline-none focus:border-amber-300/60 xs:text-base"
            />
            <button
              onClick={handleGuestPlay}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-amber-900 transition-transform active:scale-95 xs:text-base"
              style={{
                background: "linear-gradient(180deg, #F5B400 0%, #C98A00 100%)",
              }}
            >
              Play as Guest
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
