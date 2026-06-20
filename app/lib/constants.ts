import { Position, PlayerColor } from "@/lib/types";

/** Board is 15x15 grid */
export const BOARD_SIZE = 15;

/** The 52 positions on the main path, in order (clockwise) */
export const MAIN_PATH: Position[] = [
  // Starting from Red's start, going clockwise
  { row: 6, col: 1 },  // 0 - Red start
  { row: 6, col: 2 },  // 1
  { row: 6, col: 3 },  // 2
  { row: 6, col: 4 },  // 3
  { row: 6, col: 5 },  // 4
  { row: 5, col: 6 },  // 5
  { row: 4, col: 6 },  // 6
  { row: 3, col: 6 },  // 7
  { row: 2, col: 6 },  // 8
  { row: 1, col: 6 },  // 9
  { row: 0, col: 6 },  // 10
  { row: 0, col: 7 },  // 11 - safe zone
  { row: 0, col: 8 },  // 12
  { row: 1, col: 8 },  // 13 - Blue start
  { row: 2, col: 8 },  // 14
  { row: 3, col: 8 },  // 15
  { row: 4, col: 8 },  // 16
  { row: 5, col: 8 },  // 17
  { row: 6, col: 9 },  // 18
  { row: 6, col: 10 }, // 19
  { row: 6, col: 11 }, // 20
  { row: 6, col: 12 }, // 21
  { row: 6, col: 13 }, // 22
  { row: 6, col: 14 }, // 23
  { row: 7, col: 14 }, // 24 - safe zone
  { row: 8, col: 14 }, // 25
  { row: 8, col: 13 }, // 26 - Green start
  { row: 8, col: 12 }, // 27
  { row: 8, col: 11 }, // 28
  { row: 8, col: 10 }, // 29
  { row: 8, col: 9 },  // 30
  { row: 9, col: 8 },  // 31
  { row: 10, col: 8 }, // 32
  { row: 11, col: 8 }, // 33
  { row: 12, col: 8 }, // 34
  { row: 13, col: 8 }, // 35
  { row: 14, col: 8 }, // 36
  { row: 14, col: 7 }, // 37 - safe zone
  { row: 14, col: 6 }, // 38
  { row: 13, col: 6 }, // 39 - Yellow start
  { row: 12, col: 6 }, // 40
  { row: 11, col: 6 }, // 41
  { row: 10, col: 6 }, // 42
  { row: 9, col: 6 },  // 43
  { row: 8, col: 5 },  // 44
  { row: 8, col: 4 },  // 45
  { row: 8, col: 3 },  // 46
  { row: 8, col: 2 },  // 47
  { row: 8, col: 1 },  // 48
  { row: 8, col: 0 },  // 49
  { row: 7, col: 0 },  // 50 - safe zone
  { row: 6, col: 0 },  // 51
];

/** Safe zone positions (star positions on the board) */
export const SAFE_ZONE_INDICES = [11, 24, 37, 50];

/** Each player's start position on the main path */
export const PLAYER_START_POSITION: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  blue: 26,
  yellow: 39,
};

/** The main path position where each player enters their home column */
export const PLAYER_HOME_ENTRY: Record<PlayerColor, number> = {
  red: 51,
  green: 12,
  blue: 25,
  yellow: 38,
};

/** Each player's home column (6 squares leading to the center) */
export const PLAYER_HOME_COLUMN: Record<PlayerColor, Position[]> = {
  red: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7, col: 6 },
  ],
  green: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
    { row: 6, col: 7 },
  ],
  blue: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
    { row: 7, col: 8 },
  ],
  yellow: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
    { row: 8, col: 7 },
  ],
};

/** Each player's home base (4 token starting positions) */
export const PLAYER_HOME_BASE: Record<PlayerColor, Position[]> = {
  red: [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 4, col: 1 },
    { row: 4, col: 4 },
  ],
  green: [
    { row: 1, col: 10 },
    { row: 1, col: 13 },
    { row: 4, col: 10 },
    { row: 4, col: 13 },
  ],
  blue: [
    { row: 10, col: 10 },
    { row: 10, col: 13 },
    { row: 13, col: 10 },
    { row: 13, col: 13 },
  ],
  yellow: [
    { row: 10, col: 1 },
    { row: 10, col: 4 },
    { row: 13, col: 1 },
    { row: 13, col: 4 },
  ],
};

/** Turn order for players */
export const TURN_ORDER: PlayerColor[] = ["red", "green", "blue", "yellow"];

/** Number of tokens per player */
export const TOKENS_PER_PLAYER = 4;

/** Number of steps in the home column */
export const HOME_COLUMN_LENGTH = 6;

/** Total steps from start to finish */
export const TOTAL_STEPS = 52 + HOME_COLUMN_LENGTH; // 58
