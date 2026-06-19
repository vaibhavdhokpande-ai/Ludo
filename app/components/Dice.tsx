"use client";

import { useEffect, useState, useRef } from "react";

interface DiceProps {
  value: number | null;
  rolling: boolean;
  disabled: boolean;
  onRoll: () => void;
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [25, 25],
    [75, 75],
  ],
  3: [
    [25, 25],
    [50, 50],
    [75, 75],
  ],
  4: [
    [25, 25],
    [25, 75],
    [75, 25],
    [75, 75],
  ],
  5: [
    [25, 25],
    [25, 75],
    [50, 50],
    [75, 25],
    [75, 75],
  ],
  6: [
    [25, 25],
    [25, 75],
    [50, 25],
    [50, 75],
    [75, 25],
    [75, 75],
  ],
};

const VALUE_TO_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  2: { x: 0, y: -90 },
  5: { x: 0, y: 90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
};

function DiceFace({
  value,
  rotation,
  depth,
}: {
  value: number;
  rotation: string;
  depth: number;
}) {
  const dots = DOT_POSITIONS[value];
  return (
    <div
      style={{
        transform: `${rotation} translateZ(${depth}px)`,
        pointerEvents: "none",
        background: "linear-gradient(165deg, #ffffff 0%, #f3ebd9 100%)",
        boxShadow:
          "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 5px rgba(0,0,0,0.08)",
      }}
      className="absolute flex h-full w-full items-center justify-center rounded-xl border-[3px] border-amber-100"
    >
      <div className="relative h-full w-full p-[12%]">
        {dots.map((pos, i) => (
          <div
            key={i}
            className="absolute h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${pos[0]}%`,
              top: `${pos[1]}%`,
              background:
                "radial-gradient(circle at 35% 30%, #1d3a52 0%, #0a1f33 70%)",
              boxShadow: "0 1px 1px rgba(0,0,0,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Dice({ value, rolling, disabled, onRoll }: DiceProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayTransform, setDisplayTransform] = useState(
    "rotateX(18deg) rotateY(-22deg)"
  );
  const [depth, setDepth] = useState(24);
  const rafRef = useRef(0);
  const rotXRef = useRef(18);
  const rotYRef = useRef(-22);

  useEffect(() => {
    const updateDepth = () => {
      const w = window.innerWidth;
      if (w >= 640) setDepth(40);
      else if (w >= 400) setDepth(32);
      else setDepth(24);
    };
    updateDepth();
    window.addEventListener("resize", updateDepth);
    return () => window.removeEventListener("resize", updateDepth);
  }, []);

  useEffect(() => {
    if (rolling && !isAnimating) {
      setIsAnimating(true);
      const speedX = 14 + Math.random() * 22;
      const speedY = 18 + Math.random() * 26;
      const startTime = Date.now();
      const duration = 700;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          setIsAnimating(false);
          rotXRef.current %= 360;
          rotYRef.current %= 360;
          return;
        }
        const t = elapsed / duration;
        const eased = 1 - Math.pow(1 - t, 3);
        rotXRef.current += speedX * (1 - eased) * 0.4;
        rotYRef.current += speedY * (1 - eased) * 0.4;
        setDisplayTransform(
          `rotateX(${rotXRef.current}deg) rotateY(${rotYRef.current}deg)`
        );
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [rolling, isAnimating]);

  useEffect(() => {
    if (!isAnimating && value !== null) {
      const rot = VALUE_TO_ROTATION[value];
      if (!rot) return;
      const extraSpinsX = (2 + Math.floor(Math.random() * 3)) * 360;
      const extraSpinsY = (2 + Math.floor(Math.random() * 3)) * 360;
      const dirX = Math.random() > 0.5 ? 1 : -1;
      const dirY = Math.random() > 0.5 ? 1 : -1;
      const targetX = rot.x + dirX * extraSpinsX;
      const targetY = rot.y + dirY * extraSpinsY;
      setTimeout(() => {
        rotXRef.current = targetX;
        rotYRef.current = targetY;
        setDisplayTransform(`rotateX(${targetX}deg) rotateY(${targetY}deg)`);
      }, 50);
    }
  }, [isAnimating, value]);

  const showRoll = !rolling && value === null && !disabled;
  const hasSettled = !isAnimating && value !== null;

  return (
    <div className="flex flex-col items-center gap-1 xs:gap-2">
      <button
        type="button"
        onClick={onRoll}
        disabled={disabled || rolling}
        aria-label="Roll dice"
        className={`relative flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 xs:h-20 xs:w-20 sm:h-24 sm:w-24 ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        } ${showRoll ? "hover:scale-105" : ""}`}
        style={{
          background: "linear-gradient(180deg, #1a4a73 0%, #0c2945 100%)",
          boxShadow:
            "inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.35), 0 3px 0 #051320",
        }}
      >
        <div
          className="pointer-events-none relative h-12 w-12 xs:h-16 xs:w-16 sm:h-20 sm:w-20"
          style={{
            perspective: "600px",
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transformStyle: "preserve-3d",
              transform: displayTransform,
              transition: hasSettled
                ? "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
            }}
          >
            <DiceFace value={1} rotation="" depth={depth} />
            <DiceFace value={6} rotation="rotateY(180deg)" depth={depth} />
            <DiceFace value={2} rotation="rotateY(90deg)" depth={depth} />
            <DiceFace value={5} rotation="rotateY(-90deg)" depth={depth} />
            <DiceFace value={3} rotation="rotateX(90deg)" depth={depth} />
            <DiceFace value={4} rotation="rotateX(-90deg)" depth={depth} />
          </div>
          <div
            className={`pointer-events-none absolute -bottom-1 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-black/40 blur-sm transition-all duration-700 ${
              isAnimating ? "scale-75 opacity-50" : "scale-100 opacity-90"
            }`}
          />
        </div>
      </button>
      {showRoll && (
        <span className="text-xs font-bold text-amber-300 drop-shadow">
          Tap to roll
        </span>
      )}
    </div>
  );
}
