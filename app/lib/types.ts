export type PlayerColor = "red" | "blue" | "green" | "yellow";

export type TokenState = "home" | "path" | "homeStretch" | "finished";

export interface Position {
  row: number;
  col: number;
}

export interface Token {
  id: number;
  color: PlayerColor;
  state: TokenState;
  /** Position on the main path (0-51) when state is "path",
   *  or position in the home stretch (0-5) when state is "homeStretch" */
  pathPos: number;
}

export interface Player {
  color: PlayerColor;
  name: string;
  tokens: Token[];
  isHuman: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  diceRolled: boolean;
  canRollDice: boolean;
  winner: PlayerColor | null;
  consecutiveSixes: number;
  message: string;
  turnPhase: "roll" | "select" | "animate";
  selectedToken: number | null;
}

export interface BoardCell {
  type: "empty" | "path" | "homeBase" | "homeStretch" | "center" | "safeZone";
  color?: PlayerColor;
  pathIndex?: number;
  position: Position;
}

export const PLAYER_COLORS: PlayerColor[] = ["red", "blue", "green", "yellow"];

export const COLOR_VALUES: Record<PlayerColor, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
};

export const COLOR_LIGHT: Record<PlayerColor, string> = {
  red: "#FEE2E2",
  blue: "#DBEAFE",
  green: "#DCFCE7",
  yellow: "#FEF9C3",
};

export const COLOR_DARK: Record<PlayerColor, string> = {
  red: "#B91C1C",
  blue: "#1D4ED8",
  green: "#15803D",
  yellow: "#A16207",
};
