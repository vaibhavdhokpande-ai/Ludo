"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createInitialGameState,
  processDiceRoll,
  processTokenSelect,
  tryAutoSelect,
  getCurrentPlayer,
  getMovableTokenIds,
  chooseBotTokenId,
} from "@/lib/gameLogic";
import { PlayerColor } from "@/lib/types";
import Board from "@/components/Board";
import PlayerCard from "@/components/PlayerCard";
import BottomToolbar from "@/components/BottomToolbar";

export default function Home() {
  const router = useRouter();
  const [gameState, setGameState] = useState(createInitialGameState);
  const [isRolling, setIsRolling] = useState(false);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (!currentPlayer.isHuman) return;
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

  // Auto-select when only one token can legally move
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

  // Bot (computer) turn handling
  useEffect(() => {
    const currentPlayer = getCurrentPlayer(gameState);
    if (currentPlayer.isHuman || gameState.winner) return;

    if (botTimerRef.current) clearTimeout(botTimerRef.current);

    if (gameState.turnPhase === "roll" && gameState.canRollDice) {
      botTimerRef.current = setTimeout(() => {
        setIsRolling(true);
        setTimeout(() => {
          setGameState((prev) => processDiceRoll(prev));
          setIsRolling(false);
        }, 600);
      }, 700);
    } else if (gameState.turnPhase === "select") {
      const movable = getMovableTokenIds(gameState);
      if (movable.length > 1) {
        botTimerRef.current = setTimeout(() => {
          setGameState((prev) => {
            const tokenId = chooseBotTokenId(prev);
            if (tokenId === null) return prev;
            return processTokenSelect(prev, tokenId);
          });
        }, 600);
      }
    }

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [gameState]);

  const selectableTokens = getCurrentPlayer(gameState).isHuman
    ? getMovableTokenIds(gameState)
    : [];
  const currentPlayer = getCurrentPlayer(gameState);
  const finishedCounts = getFinishedCounts();

  const playerByColor = Object.fromEntries(
    gameState.players.map((p) => [p.color, p])
  ) as Record<PlayerColor, (typeof gameState.players)[number]>;

  return (
    <main
      className="relative flex h-[100dvh] w-screen flex-col items-center overflow-hidden p-2 xs:p-3"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #15436b 0%, #0a1f33 55%, #061320 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-conic-gradient(#ffffff 0deg 90deg, transparent 90deg 180deg)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative flex h-full w-full max-w-md flex-col items-center justify-between gap-1.5 xs:gap-2">
        {/* Top row: red (top-left) + green (top-right) player cards */}
        <div className="flex w-full flex-shrink-0 items-center justify-between">
          <PlayerCard
            color="red"
            isActive={currentPlayer.color === "red" && !gameState.winner}
            isHuman={playerByColor.red.isHuman}
            finished={finishedCounts.red}
            align="left"
          />
          <PlayerCard
            color="green"
            isActive={currentPlayer.color === "green" && !gameState.winner}
            isHuman={playerByColor.green.isHuman}
            finished={finishedCounts.green}
            align="right"
          />
        </div>

        {/* Board */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-center py-1">
          <div className="relative aspect-square h-full max-h-full w-full max-w-full">
            <Board
              gameState={gameState}
              onTokenClick={handleTokenClick}
              selectableTokens={selectableTokens}
              playerNames={Object.fromEntries(
                gameState.players.map((p) => [p.color, p.name])
              )}
            />
          </div>
        </div>

        {/* Bottom row: blue (bottom-left) + yellow (bottom-right) player cards */}
        <div className="flex w-full flex-shrink-0 items-center justify-between">
          <PlayerCard
            color="blue"
            isActive={currentPlayer.color === "blue" && !gameState.winner}
            isHuman={playerByColor.blue.isHuman}
            finished={finishedCounts.blue}
            align="left"
          />
          <PlayerCard
            color="yellow"
            isActive={currentPlayer.color === "yellow" && !gameState.winner}
            isHuman={playerByColor.yellow.isHuman}
            finished={finishedCounts.yellow}
            align="right"
          />
        </div>

        {/* Status message */}
        <div className="flex-shrink-0 px-2 text-center">
          <span className="text-[11px] font-semibold text-amber-100/90 xs:text-xs">
            {gameState.winner
              ? `${playerByColor[gameState.winner].name} wins! 🎉`
              : gameState.message}
          </span>
        </div>

        {/* Bottom toolbar */}
        <BottomToolbar
          onRoll={handleRoll}
          onHome={() => router.push("/")}
          canRoll={
            gameState.canRollDice && !gameState.winner && currentPlayer.isHuman
          }
          rolling={isRolling}
        />
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
            <p className="text-stroke font-display text-xl font-extrabold text-white xs:text-2xl">
              {playerByColor[gameState.winner].name} wins!
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
    </main>
  );
}

