"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createInitialGameState,
  processDiceRoll,
  processTokenSelect,
  tryAutoSelect,
  getCurrentPlayer,
  getMovableTokenIds,
} from "@/lib/gameLogic";
import { PlayerColor } from "@/lib/types";
import Board from "@/components/Board";
import Dice from "@/components/Dice";
import GameInfo from "@/components/GameInfo";

const TURN_DOT: Record<PlayerColor, string> = {
  red: "#E5383B",
  blue: "#1B6FD6",
  green: "#2DA84F",
  yellow: "#F5B400",
};

export default function Home() {
  const router = useRouter();
  const [gameState, setGameState] = useState(createInitialGameState);
  const [isRolling, setIsRolling] = useState(false);

  const getFinishedCounts = useCallback(() => {
    const counts: Record<PlayerColor, number> = {
      red: 0,
      blue: 0,
      green: 0,
      yellow: 0,
    };
    for (const player of gameState.players) {
      counts[player.color] = player.tokens.filter((t) => t.state === "finished").length;
    }
    return counts;
  }, [gameState]);

  const handleRoll = useCallback(() => {
    if (!gameState.canRollDice || gameState.winner) return;
    setIsRolling(true);
    setTimeout(() => {
      const newState = processDiceRoll(gameState);
      setGameState(newState);
      setIsRolling(false);
    }, 600);
  }, [gameState]);

  const handleTokenClick = useCallback(
    (tokenId: number) => {
      if (gameState.turnPhase !== "select") return;
      const currentPlayer = getCurrentPlayer(gameState);
      const token = currentPlayer.tokens.find((t) => t.id === tokenId);
      if (!token) return;
      const newState = processTokenSelect(gameState, tokenId);
      setGameState(newState);
    },
    [gameState]
  );

  const handleReset = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  useEffect(() => {
    if (gameState.turnPhase === "select") {
      const autoState = tryAutoSelect(gameState);
      if (autoState) {
        const timer = setTimeout(() => {
          setGameState(autoState);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState]);

  const selectableTokens = getMovableTokenIds(gameState);
  const currentPlayer = getCurrentPlayer(gameState);

  return (
    <main
      className="relative flex min-h-screen items-start justify-center overflow-y-auto p-2 xs:p-3 sm:p-6 lg:items-center"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #15436b 0%, #0a1f33 55%, #061320 100%)",
      }}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-2 xs:gap-3 sm:max-w-lg lg:max-w-xl lg:flex-row lg:items-start lg:gap-6 lg:max-w-4xl">
        <div className="flex w-full flex-col items-center gap-2 xs:gap-3 lg:flex-1">
          <div
            className="flex w-full items-center justify-between rounded-2xl px-3 py-2 xs:px-4 xs:py-3"
            style={{
              background: "linear-gradient(180deg, #F5B400 0%, #C98A00 100%)",
              boxShadow: "0 4px 0 #8a5e00, 0 6px 14px rgba(0,0,0,0.4)",
            }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/")}
                aria-label="Back to home"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 transition-all hover:bg-white/35 active:scale-95 xs:h-8 xs:w-8"
              >
                <i className="ti ti-home text-[15px] text-white xs:text-[17px]" aria-hidden="true" />
              </button>
              <h1 className="text-stroke font-display text-lg font-extrabold text-white xs:text-xl sm:text-2xl">
                Ludo
              </h1>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/35 active:scale-95 xs:px-3 xs:text-sm"
            >
              <i className="ti ti-refresh text-[14px] xs:text-[16px]" aria-hidden="true" />
              <span className="hidden xs:inline">New game</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>

          <div className="w-full max-w-[min(92vw,75vh,520px)] sm:max-w-[min(80vw,75vh,520px)] lg:max-w-[min(45vw,80vh,560px)]">
            <Board
              gameState={gameState}
              onTokenClick={handleTokenClick}
              selectableTokens={selectableTokens}
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-2 xs:gap-3 lg:w-64 lg:flex-shrink-0">
          <div
            className="flex w-full items-center justify-between rounded-2xl px-3 py-2 xs:px-4 xs:py-3"
            style={{
              background: "linear-gradient(180deg, #123a5e 0%, #0c2945 100%)",
              boxShadow: "0 4px 0 #051320, 0 6px 14px rgba(0,0,0,0.4)",
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold capitalize text-amber-200/80 xs:text-xs">
                {currentPlayer.color}&apos;s turn
              </span>
              <div
                className="h-4 w-4 rounded-full border-2 border-white/60 xs:h-5 xs:w-5"
                style={{ backgroundColor: TURN_DOT[currentPlayer.color] }}
              />
            </div>

            <Dice
              value={gameState.diceValue}
              rolling={isRolling}
              disabled={!gameState.canRollDice || gameState.winner !== null || isRolling}
              onRoll={handleRoll}
            />

            <div className="w-14 text-center text-[10px] font-semibold text-amber-100 xs:w-20 xs:text-xs">
              {gameState.turnPhase === "select" && (
                <span className="inline-block animate-pulse text-amber-300">
                  Pick a token
                </span>
              )}
              {gameState.turnPhase === "roll" && !gameState.canRollDice && (
                <span className="text-amber-100/50">Waiting...</span>
              )}
            </div>
          </div>

          <div className="w-full">
            <GameInfo
              gameState={gameState}
              finishedCounts={getFinishedCounts()}
              onReset={handleReset}
            />
          </div>
        </div>

        {gameState.winner && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <div
              className="flex flex-col items-center gap-4 rounded-2xl px-6 py-5 xs:px-8 xs:py-6"
              style={{
                background: "linear-gradient(180deg, #F5B400 0%, #C98A00 100%)",
                boxShadow: "0 8px 0 #8a5e00, 0 12px 24px rgba(0,0,0,0.5)",
              }}
            >
              <i className="ti ti-trophy text-[40px] text-white xs:text-[48px]" aria-hidden="true" />
              <p className="text-stroke font-display text-xl font-extrabold capitalize text-white xs:text-2xl">
                {gameState.winner} wins!
              </p>
              <button
                onClick={handleReset}
                className="rounded-full bg-white px-6 py-2 text-sm font-bold text-amber-700 transition-all hover:scale-105 active:scale-95"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
