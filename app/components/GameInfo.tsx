"use client";

import { GameState, PlayerColor } from "@/lib/types";

interface GameInfoProps {
  gameState: GameState;
  finishedCounts: Record<PlayerColor, number>;
  onReset: () => void;
}

const PANEL_BG: Record<PlayerColor, string> = {
  red: "bg-ludo-red",
  blue: "bg-ludo-blue",
  green: "bg-ludo-green",
  yellow: "bg-ludo-yellow",
};

const PANEL_TEXT: Record<PlayerColor, string> = {
  red: "text-white",
  blue: "text-white",
  green: "text-white",
  yellow: "text-amber-950",
};

export default function GameInfo({ gameState, finishedCounts, onReset }: GameInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {gameState.players.map((player, idx) => {
        const isActive = idx === gameState.currentPlayerIndex && !gameState.winner;
        return (
          <div
            key={player.color}
            className={`relative flex items-center justify-between rounded-xl px-3 py-2 ${PANEL_BG[player.color]} ${PANEL_TEXT[player.color]} ${
              isActive ? "ring-2 ring-white pulse-ring" : "opacity-80"
            }`}
            style={{ boxShadow: "0 3px 0 rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.3)" }}
          >
            <span className="text-sm font-bold">{player.name}</span>
            <span className="flex items-center gap-1 text-sm font-bold">
              <i className="ti ti-flag-filled text-[14px]" aria-hidden="true" />
              {finishedCounts[player.color]}/4
            </span>
          </div>
        );
      })}
    </div>
  );
}
