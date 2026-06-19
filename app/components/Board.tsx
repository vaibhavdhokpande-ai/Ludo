"use client";

import { useMemo } from "react";
import { GameState, PlayerColor, Token } from "@/lib/types";
import {
  BOARD_SIZE,
  MAIN_PATH,
  SAFE_ZONE_INDICES,
  PLAYER_START_POSITION,
  PLAYER_HOME_COLUMN,
  PLAYER_HOME_BASE,
  TURN_ORDER,
} from "@/lib/constants";
import { getMainPathIndex } from "@/lib/gameLogic";

interface BoardProps {
  gameState: GameState;
  onTokenClick: (tokenId: number) => void;
  selectableTokens: number[];
}

const TOKEN_GRADIENT: Record<PlayerColor, string> = {
  red: "radial-gradient(circle at 32% 28%, #ff8a8a, #E5383B 55%, #A4161A 100%)",
  blue: "radial-gradient(circle at 32% 28%, #6fb1ff, #1B6FD6 55%, #0B3D91 100%)",
  green: "radial-gradient(circle at 32% 28%, #79e09a, #2DA84F 55%, #157535 100%)",
  yellow: "radial-gradient(circle at 32% 28%, #ffe082, #F5B400 55%, #B8860B 100%)",
};

const CORNER_GRADIENT: Record<PlayerColor, string> = {
  red: "linear-gradient(135deg, #ff5a5a 0%, #c41e1e 100%)",
  blue: "linear-gradient(135deg, #4f9bff 0%, #0d4fb0 100%)",
  green: "linear-gradient(135deg, #4fd47b 0%, #15823f 100%)",
  yellow: "linear-gradient(135deg, #ffd54f 0%, #d99b00 100%)",
};

const PATH_TINT: Record<PlayerColor, string> = {
  red: "#FBD2D2",
  blue: "#C9DEFB",
  green: "#CFEED8",
  yellow: "#FCE9B8",
};

function getTokensAtCell(
  gameState: GameState,
  row: number,
  col: number
): { token: Token; color: PlayerColor }[] {
  const result: { token: Token; color: PlayerColor }[] = [];
  for (const player of gameState.players) {
    for (const token of player.tokens) {
      if (token.state === "home") {
        const homePos = PLAYER_HOME_BASE[player.color][token.id];
        if (homePos.row === row && homePos.col === col) {
          result.push({ token, color: player.color });
        }
      } else if (token.state === "path") {
        const mainIndex = getMainPathIndex(player.color, token.pathPos);
        const pos = MAIN_PATH[mainIndex];
        if (pos.row === row && pos.col === col) {
          result.push({ token, color: player.color });
        }
      } else if (token.state === "homeStretch") {
        const pos = PLAYER_HOME_COLUMN[player.color][token.pathPos];
        if (pos.row === row && pos.col === col) {
          result.push({ token, color: player.color });
        }
      }
    }
  }
  return result;
}

function TokenPiece({
  color,
  isSelectable,
  onClick,
  small,
}: {
  color: PlayerColor;
  isSelectable: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`${color} token`}
      className={`token-pop relative rounded-full border-2 border-white/90 ${
        small ? "h-[60%] w-[60%]" : "h-[72%] w-[72%]"
      } ${isSelectable ? "cursor-pointer pulse-ring" : "cursor-default"}`}
      style={{
        background: TOKEN_GRADIENT[color],
        boxShadow:
          "0 2px 0 rgba(0,0,0,0.4), 0 3px 5px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.6)",
      }}
    >
      <span
        className="absolute left-1/2 top-[22%] h-[28%] w-[28%] -translate-x-1/2 rounded-full"
        style={{ background: "rgba(255,255,255,0.55)" }}
      />
    </button>
  );
}

function renderCell(
  row: number,
  col: number,
  gameState: GameState,
  selectableTokens: number[],
  onTokenClick: (tokenId: number) => void
) {
  const pathIndex = MAIN_PATH.findIndex((p) => p.row === row && p.col === col);
  const isPath = pathIndex !== -1;
  const isSafe = isPath && SAFE_ZONE_INDICES.includes(pathIndex);

  let homeStretchColor: PlayerColor | null = null;
  for (const color of TURN_ORDER) {
    const colIdx = PLAYER_HOME_COLUMN[color].findIndex(
      (p) => p.row === row && p.col === col
    );
    if (colIdx !== -1) {
      homeStretchColor = color;
      break;
    }
  }

  let homeBaseColor: PlayerColor | null = null;
  for (const color of TURN_ORDER) {
    const match = PLAYER_HOME_BASE[color].some(
      (p) => p.row === row && p.col === col
    );
    if (match) {
      homeBaseColor = color;
      break;
    }
  }

  const tokens = getTokensAtCell(gameState, row, col);

  let startColor: PlayerColor | null = null;
  for (const color of TURN_ORDER) {
    if (PLAYER_START_POSITION[color] === pathIndex) {
      startColor = color;
      break;
    }
  }

  const cellBase = "relative flex h-full w-full items-center justify-center";

  const isMidRow = row >= 6 && row <= 8;
  const isMidCol = col >= 6 && col <= 8;
  if (isMidRow && isMidCol) {
    let triColor: PlayerColor = "red";
    if (row === 6 && col === 7) triColor = "blue";
    else if (row === 7 && col === 8) triColor = "green";
    else if (row === 8 && col === 7) triColor = "yellow";
    else if (row === 7 && col === 6) triColor = "red";
    return (
      <div
        key={`${row}-${col}`}
        className={cellBase}
        style={{ background: CORNER_GRADIENT[triColor] }}
      />
    );
  }

  if (homeStretchColor) {
    return (
      <div
        key={`${row}-${col}`}
        className={`${cellBase} border-[0.5px] border-black/10`}
        style={{ background: PATH_TINT[homeStretchColor] }}
      >
        {tokens.map((t, i) => (
          <div
            key={`${t.color}-${t.token.id}`}
            className="absolute flex h-full w-full items-center justify-center"
            style={{ zIndex: i }}
          >
            <TokenPiece
              color={t.color}
              isSelectable={selectableTokens.includes(t.token.id)}
              onClick={() => onTokenClick(t.token.id)}
              small
            />
          </div>
        ))}
      </div>
    );
  }

  if (isPath) {
    const bgColor = startColor ? PATH_TINT[startColor] : "#FFFDF6";
    return (
      <div
        key={`${row}-${col}`}
        className={`${cellBase} border-[0.5px] border-black/10`}
        style={{ background: bgColor }}
      >
        {isSafe && (
          <i
            className="ti ti-shield-star absolute text-[12px] opacity-40"
            style={{ color: startColor ? "#000" : "#B8860B" }}
            aria-hidden="true"
          />
        )}
        {tokens.length > 0 && (
          <div className="flex h-full w-full flex-wrap items-center justify-center">
            {tokens.slice(0, 4).map((t) => (
              <div key={`${t.color}-${t.token.id}`} className="h-1/2 w-1/2 p-[6%]">
                <TokenPiece
                  color={t.color}
                  isSelectable={selectableTokens.includes(t.token.id)}
                  onClick={() => onTokenClick(t.token.id)}
                  small={tokens.length > 1}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (homeBaseColor) {
    return (
      <div
        key={`${row}-${col}`}
        className={cellBase}
        style={{ background: PATH_TINT[homeBaseColor] }}
      >
        <div
          className="flex h-[82%] w-[82%] items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.6)",
            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {tokens.map((t) => (
            <TokenPiece
              key={`${t.color}-${t.token.id}`}
              color={t.color}
              isSelectable={selectableTokens.includes(t.token.id)}
              onClick={() => onTokenClick(t.token.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  const isTopLeft = row < 6 && col < 6;
  const isTopRight = row < 6 && col >= 9;
  const isBottomLeft = row >= 9 && col < 6;
  const isBottomRight = row >= 9 && col >= 9;

  let quadColor: PlayerColor | null = null;
  if (isTopLeft) quadColor = "red";
  else if (isTopRight) quadColor = "blue";
  else if (isBottomRight) quadColor = "green";
  else if (isBottomLeft) quadColor = "yellow";

  return (
    <div
      key={`${row}-${col}`}
      className={cellBase}
      style={{
        background: quadColor ? CORNER_GRADIENT[quadColor] : "#FFFDF6",
      }}
    />
  );
}

export default function Board({ gameState, onTokenClick, selectableTokens }: BoardProps) {
  const cells = useMemo(() => {
    const result: React.ReactNode[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        result.push(renderCell(r, c, gameState, selectableTokens, onTokenClick));
      }
    }
    return result;
  }, [gameState, selectableTokens, onTokenClick]);

  return (
    <div
      className="overflow-hidden rounded-2xl border-[3px] border-amber-200"
      style={{
        boxShadow:
          "0 14px 30px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.5)",
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          width: "100%",
          aspectRatio: "1",
          background: "#FFFDF6",
        }}
      >
        {cells}
      </div>
    </div>
  );
}
