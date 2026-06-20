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
  playerNames?: Partial<Record<PlayerColor, string>>;
}

const TOKEN_GRADIENT: Record<PlayerColor, string> = {
  red: "radial-gradient(circle at 35% 25%, #ffb3b3 0%, #f15c5c 30%, #D8262A 65%, #8C1014 100%)",
  blue: "radial-gradient(circle at 35% 25%, #aed4ff 0%, #4f9bff 30%, #1457B8 65%, #06286B 100%)",
  green: "radial-gradient(circle at 35% 25%, #a8eebd 0%, #4fcc7a 30%, #1F9248 65%, #0E5C28 100%)",
  yellow: "radial-gradient(circle at 35% 25%, #ffefb0 0%, #ffd24d 30%, #E0A100 65%, #8C6300 100%)",
};

const TOKEN_RING: Record<PlayerColor, string> = {
  red: "#8C1014",
  blue: "#06286B",
  green: "#0E5C28",
  yellow: "#8C6300",
};

const CORNER_GRADIENT: Record<PlayerColor, string> = {
  red: "linear-gradient(135deg, #ff6b6b 0%, #C41E1E 55%, #8C1014 100%)",
  blue: "linear-gradient(135deg, #5fa8ff 0%, #0D4FB0 55%, #06286B 100%)",
  green: "linear-gradient(135deg, #5fdb8a 0%, #15823F 55%, #0E5C28 100%)",
  yellow: "linear-gradient(135deg, #ffdb6b 0%, #D99B00 55%, #8C6300 100%)",
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
      className={`token-pop relative rounded-full ${
        small ? "h-[58%] w-[58%]" : "h-[74%] w-[74%]"
      } ${isSelectable ? "cursor-pointer pulse-ring" : "cursor-default"}`}
      style={{
        background: TOKEN_GRADIENT[color],
        border: `2px solid ${TOKEN_RING[color]}`,
        boxShadow:
          "0 2px 0 rgba(0,0,0,0.45), 0 3px 6px rgba(0,0,0,0.5), inset 0 -3px 4px rgba(0,0,0,0.25), inset 0 2px 3px rgba(255,255,255,0.7)",
      }}
    >
      <span
        className="absolute left-1/2 top-[18%] h-[26%] w-[26%] -translate-x-1/2 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 100%)",
        }}
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
    const isCenter = row === 7 && col === 7;
    return (
      <div
        key={`${row}-${col}`}
        className={cellBase}
        style={{
          background: CORNER_GRADIENT[triColor],
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
        }}
      >
        {isCenter && (
          <i
            className="ti ti-star-filled text-[16px] text-white drop-shadow"
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  if (homeStretchColor) {
    const colIdx = PLAYER_HOME_COLUMN[homeStretchColor].findIndex(
      (p) => p.row === row && p.col === col
    );
    return (
      <div
        key={`${row}-${col}`}
        className={`${cellBase} border-[0.5px] border-black/10`}
        style={{
          background: PATH_TINT[homeStretchColor],
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
        }}
      >
        {tokens.length === 0 && (
          <span
            className="text-[9px] font-bold opacity-25"
            style={{ color: "#000" }}
          >
            {colIdx + 1}
          </span>
        )}
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
        style={{
          background: bgColor,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
        }}
      >
        {isSafe && (
          <i
            className="ti ti-shield-star-filled absolute text-[13px] opacity-35"
            style={{ color: startColor ? "#5A1A1A" : "#8C6300" }}
            aria-hidden="true"
          />
        )}
        {tokens.length > 0 && (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 place-items-center p-[3%]">
            {tokens.slice(0, 4).map((t) => (
              <TokenPiece
                key={`${t.color}-${t.token.id}`}
                color={t.color}
                isSelectable={selectableTokens.includes(t.token.id)}
                onClick={() => onTokenClick(t.token.id)}
                small={tokens.length > 1}
              />
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
          className="grid h-[84%] w-[84%] grid-cols-2 grid-rows-2 place-items-center gap-[6%] rounded-2xl p-[8%]"
          style={{
            background: "rgba(255,255,255,0.55)",
            boxShadow:
              "inset 0 3px 8px rgba(0,0,0,0.22), inset 0 -1px 0 rgba(255,255,255,0.5)",
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

const QUADRANT_LABEL_POS: Record<PlayerColor, { top: string; left: string }> = {
  red: { top: "31.5%", left: "16%" },
  blue: { top: "31.5%", left: "84%" },
  green: { top: "68.5%", left: "84%" },
  yellow: { top: "68.5%", left: "16%" },
};

export default function Board({
  gameState,
  onTokenClick,
  selectableTokens,
  playerNames,
}: BoardProps) {
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
      className="relative mx-auto h-full max-h-full w-full max-w-full overflow-hidden rounded-2xl"
      style={{
        border: "4px solid #D99B00",
        boxShadow:
          "0 16px 34px rgba(0,0,0,0.5), 0 4px 0 rgba(0,0,0,0.25), inset 0 0 0 2px rgba(255,255,255,0.55), inset 0 0 0 6px rgba(217,155,0,0.25)",
        aspectRatio: "1",
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          width: "100%",
          height: "100%",
          background: "#FFFDF6",
        }}
      >
        {cells}
      </div>

      {playerNames &&
        TURN_ORDER.map((color) => {
          const label = playerNames[color];
          if (!label) return null;
          const pos = QUADRANT_LABEL_POS[color];
          return (
            <span
              key={color}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-[6%] py-[1.5%] font-display text-[clamp(8px,2.4vw,15px)] font-extrabold uppercase tracking-wide text-white"
              style={{
                top: pos.top,
                left: pos.left,
                background: "rgba(0,0,0,0.28)",
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              {label}
            </span>
          );
        })}
    </div>
  );
}
