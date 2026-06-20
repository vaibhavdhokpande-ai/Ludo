"use client";

import { PlayerColor } from "@/lib/types";

interface PlayerCardProps {
  color: PlayerColor;
  isActive: boolean;
  isHuman: boolean;
  finished: number;
  align: "left" | "right";
}

const RING_COLOR: Record<PlayerColor, string> = {
  red: "#E5383B",
  blue: "#1B6FD6",
  green: "#2DA84F",
  yellow: "#F5B400",
};

const RING_DARK: Record<PlayerColor, string> = {
  red: "#8C1014",
  blue: "#06286B",
  green: "#0E5C28",
  yellow: "#8C6300",
};

export default function PlayerCard({
  color,
  isActive,
  isHuman,
  finished,
  align,
}: PlayerCardProps) {
  const ring = RING_COLOR[color];
  const ringDark = RING_DARK[color];

  const avatar = (
    <div
      className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl xs:h-10 xs:w-10 sm:h-12 sm:w-12"
      style={{
        border: `2.5px solid ${ring}`,
        background: "linear-gradient(180deg, #f3a6a6 0%, #e88a8a 100%)",
        boxShadow: isActive
          ? `0 0 0 3px rgba(255,255,255,0.55), 0 3px 0 ${ringDark}, 0 5px 10px rgba(0,0,0,0.4)`
          : `0 3px 0 ${ringDark}, 0 5px 10px rgba(0,0,0,0.35)`,
      }}
    >
      <i
        className={`ti ${
          isHuman ? "ti-user-filled" : "ti-robot-face"
        } text-[16px] text-white/90 xs:text-[19px] sm:text-[22px]`}
        aria-hidden="true"
      />
      {isActive && (
        <span
          className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full xs:h-2.5 xs:w-2.5"
          style={{
            background: "#7CFC9A",
            boxShadow: "0 0 0 2px #0a1f33, 0 0 6px #7CFC9A",
          }}
        />
      )}
    </div>
  );

  const scoreBox = (
    <div
      className="flex h-9 min-w-9 flex-shrink-0 items-center justify-center gap-0.5 rounded-xl px-1.5 xs:h-10 xs:min-w-10 sm:h-12 sm:min-w-12"
      style={{
        border: `2.5px solid ${ring}`,
        background: "linear-gradient(180deg, #fff6da 0%, #f7e2a8 100%)",
        boxShadow: `0 3px 0 ${ringDark}, 0 5px 10px rgba(0,0,0,0.35)`,
      }}
    >
      <i
        className="ti ti-map-pin-filled text-[12px] xs:text-[13px] sm:text-[15px]"
        style={{ color: ring }}
        aria-hidden="true"
      />
      <span
        className="font-display text-[11px] font-extrabold xs:text-xs sm:text-sm"
        style={{ color: ringDark }}
      >
        {finished}/4
      </span>
    </div>
  );

  return (
    <div
      className={`flex items-center gap-1 xs:gap-1.5 ${
        align === "right" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {avatar}
      {scoreBox}
    </div>
  );
}
