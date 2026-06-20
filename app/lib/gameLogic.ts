import {
  GameState,
  PlayerColor,
  Token,
  Player,
  TokenState,
} from "@/lib/types";
import {
  MAIN_PATH,
  SAFE_ZONE_INDICES,
  PLAYER_START_POSITION,
  PLAYER_HOME_COLUMN,
  TURN_ORDER,
  TOKENS_PER_PLAYER,
  HOME_COLUMN_LENGTH,
} from "@/lib/constants";

/** Create initial tokens for a player */
export function createTokens(color: PlayerColor): Token[] {
  return Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
    id: i,
    color,
    state: "home" as TokenState,
    pathPos: 0,
  }));
}

/** Create initial game state */
export function createInitialGameState(): GameState {
  const NAMES: Record<PlayerColor, string> = {
    red: "Computer 2",
    green: "Computer 3",
    blue: "You",
    yellow: "Computer 4",
  };
  const players: Player[] = TURN_ORDER.map((color) => ({
    color,
    name: NAMES[color],
    tokens: createTokens(color),
    isHuman: color === "blue",
  }));

  return {
    players,
    currentPlayerIndex: TURN_ORDER.indexOf("blue"),
    diceValue: null,
    diceRolled: false,
    canRollDice: true,
    winner: null,
    consecutiveSixes: 0,
    message: "Your turn. Roll the dice!",
    turnPhase: "roll",
    selectedToken: null,
  };
}

/** Get the current player */
export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

/** Build a grammatically correct turn phrase, e.g. "Your turn" or "Computer 2's turn" */
function turnPhrase(name: string): string {
  return name === "You" ? "Your turn" : `${name}'s turn`;
}

/** Roll the dice (returns 1-6) */
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/** Check if a path position is a safe zone (uses main path index) */
export function isSafeZone(pathIndex: number): boolean {
  return SAFE_ZONE_INDICES.includes(pathIndex);
}

/**
 * Convert a player's personal path position to the main path index.
 * playerPathPos: 0 = start position, 51 = last position before home column
 */
export function getMainPathIndex(color: PlayerColor, playerPathPos: number): number {
  const startPos = PLAYER_START_POSITION[color];
  return (startPos + playerPathPos) % 52;
}

/** Get board grid position for a token */
export function getBoardPosition(
  color: PlayerColor,
  playerPathPos: number,
  state: TokenState,
  tokenId: number
): { row: number; col: number } {
  if (state === "home") {
    const bases: Record<PlayerColor, { row: number; col: number }[]> = {
      red: [{ row: 1, col: 1 }, { row: 1, col: 4 }, { row: 4, col: 1 }, { row: 4, col: 4 }],
      green: [{ row: 1, col: 10 }, { row: 1, col: 13 }, { row: 4, col: 10 }, { row: 4, col: 13 }],
      blue: [{ row: 10, col: 10 }, { row: 10, col: 13 }, { row: 13, col: 10 }, { row: 13, col: 13 }],
      yellow: [{ row: 10, col: 1 }, { row: 10, col: 4 }, { row: 13, col: 1 }, { row: 13, col: 4 }],
    };
    return bases[color][tokenId];
  }

  if (state === "path") {
    return MAIN_PATH[getMainPathIndex(color, playerPathPos)];
  }

  if (state === "homeStretch") {
    return PLAYER_HOME_COLUMN[color][playerPathPos];
  }

  // finished - return center
  const centerPositions: Record<PlayerColor, { row: number; col: number }> = {
    red: { row: 7, col: 6 },
    green: { row: 6, col: 7 },
    blue: { row: 7, col: 8 },
    yellow: { row: 8, col: 7 },
  };
  return centerPositions[color];
}

/**
 * Calculate steps needed for a token on the main path to enter the home column.
 * Player path positions are 0 (start) through 51 (last before home column).
 * From any position p, the steps to reach AND enter the home column = 52 - p.
 * Example: at p=0, need 52 steps; at p=51, need 1 step.
 */
function stepsToHomeEntry(playerPathPos: number): number {
  return 52 - playerPathPos;
}

/**
 * Move a token forward by `steps` steps along the player's personal path.
 * Returns the new state and position.
 */
export function moveToken(
  token: Token,
  _color: PlayerColor,
  steps: number
): { state: TokenState; pathPos: number } {
  if (token.state === "path") {
    const entrySteps = stepsToHomeEntry(token.pathPos);

    if (steps < entrySteps) {
      // Stays on the main path
      const newPos = (token.pathPos + steps) % 52;
      return { state: "path" as TokenState, pathPos: newPos };
    } else {
      // Enters the home column
      const homeStretchPos = steps - entrySteps;
      if (homeStretchPos < HOME_COLUMN_LENGTH) {
        return { state: "homeStretch" as TokenState, pathPos: homeStretchPos };
      } else if (homeStretchPos === HOME_COLUMN_LENGTH) {
        return { state: "finished" as TokenState, pathPos: HOME_COLUMN_LENGTH };
      } else {
        // Overshoots - can't move, return original
        return { state: "path" as TokenState, pathPos: token.pathPos };
      }
    }
  }

  if (token.state === "homeStretch") {
    const newPos = token.pathPos + steps;
    if (newPos < HOME_COLUMN_LENGTH) {
      return { state: "homeStretch" as TokenState, pathPos: newPos };
    } else if (newPos === HOME_COLUMN_LENGTH) {
      return { state: "finished" as TokenState, pathPos: HOME_COLUMN_LENGTH };
    } else {
      // Overshoots
      return { state: "homeStretch" as TokenState, pathPos: token.pathPos };
    }
  }

  return { state: token.state, pathPos: token.pathPos };
}

/** Check for capturing: when a token lands on an opponent on the main path */
export function checkCapture(
  state: GameState,
  color: PlayerColor,
  mainPathIndex: number
): Token | null {
  if (isSafeZone(mainPathIndex)) return null;

  for (const player of state.players) {
    if (player.color === color) continue;
    for (const token of player.tokens) {
      if (token.state === "path") {
        const tokenMainIndex = getMainPathIndex(player.color, token.pathPos);
        if (tokenMainIndex === mainPathIndex) {
          return token;
        }
      }
    }
  }
  return null;
}

/** Check if a player has any movable tokens for a given dice value */
export function hasMovableToken(
  state: GameState,
  color: PlayerColor,
  diceValue: number
): boolean {
  const player = state.players.find((p) => p.color === color)!;
  for (const token of player.tokens) {
    if (canTokenMove(token, color, diceValue)) {
      return true;
    }
  }
  return false;
}

/** Check if a specific token can move with the given dice value */
export function canTokenMove(
  token: Token,
  _color: PlayerColor,
  diceValue: number
): boolean {
  if (token.state === "finished") return false;

  if (token.state === "home") {
    return diceValue === 6;
  }

  if (token.state === "path") {
    const entrySteps = stepsToHomeEntry(token.pathPos);
    if (diceValue < entrySteps) {
      return true; // Stays on path
    }
    // Enters home column
    const homeStretchPos = diceValue - entrySteps;
    return homeStretchPos <= HOME_COLUMN_LENGTH;
  }

  if (token.state === "homeStretch") {
    const newPos = token.pathPos + diceValue;
    return newPos <= HOME_COLUMN_LENGTH;
  }

  return false;
}

/** Get all movable token IDs for the current player */
export function getMovableTokenIds(state: GameState): number[] {
  const player = getCurrentPlayer(state);
  if (state.diceValue === null) return [];

  const movable: number[] = [];
  for (const token of player.tokens) {
    if (canTokenMove(token, player.color, state.diceValue)) {
      movable.push(token.id);
    }
  }
  return movable;
}

/** Check if the game has a winner */
export function checkWinner(state: GameState): PlayerColor | null {
  for (const player of state.players) {
    if (player.tokens.every((t) => t.state === "finished")) {
      return player.color;
    }
  }
  return null;
}

/** Get the next player index */
export function getNextPlayerIndex(currentIndex: number): number {
  return (currentIndex + 1) % 4;
}

/** Create a fresh copy of the game state for mutation */
function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      tokens: p.tokens.map((t) => ({ ...t })),
    })),
  };
}

/** Process a dice roll */
export function processDiceRoll(state: GameState): GameState {
  const diceValue = rollDice();
  const newState = cloneState(state);
  newState.diceValue = diceValue;
  newState.diceRolled = true;
  newState.canRollDice = false;

  let consecutiveSixes = state.consecutiveSixes;
  if (diceValue === 6) {
    consecutiveSixes++;
  } else {
    consecutiveSixes = 0;
  }
  newState.consecutiveSixes = consecutiveSixes;

  // Three 6s in a row = lose turn
  if (consecutiveSixes >= 3) {
    const nextIndex = getNextPlayerIndex(state.currentPlayerIndex);
    const nextPlayerName = state.players[nextIndex].name;
    newState.consecutiveSixes = 0;
    newState.message = `${getCurrentPlayer(state).name} rolled three 6s! Turn lost. ${turnPhrase(nextPlayerName)}.`;
    newState.currentPlayerIndex = nextIndex;
    newState.canRollDice = true;
    newState.diceRolled = false;
    newState.diceValue = null;
    newState.turnPhase = "roll";
    return newState;
  }

  // Check if any token can move
  const player = getCurrentPlayer(state);
  const hasMove = hasMovableToken(newState, player.color, diceValue);

  if (!hasMove) {
    if (diceValue === 6) {
      newState.message = `${player.name} rolled ${diceValue} but no tokens can move. Roll again!`;
      newState.canRollDice = true;
      newState.diceRolled = false;
      newState.diceValue = null;
      newState.turnPhase = "roll";
      newState.consecutiveSixes = 0;
      return newState;
    }
    const nextIndex = getNextPlayerIndex(state.currentPlayerIndex);
    const nextPlayerName = state.players[nextIndex].name;
    newState.message = `${player.name} rolled ${diceValue} but no tokens can move. ${turnPhrase(nextPlayerName)}.`;
    newState.currentPlayerIndex = nextIndex;
    newState.canRollDice = true;
    newState.diceRolled = false;
    newState.diceValue = null;
    newState.turnPhase = "roll";
    newState.consecutiveSixes = 0;
    return newState;
  }

  // Has moves - let player select
  newState.turnPhase = "select";
  if (diceValue === 6) {
    newState.message = `${player.name} rolled a 6! Select a token to move. (Bonus turn!)`;
  } else {
    newState.message = `${player.name} rolled ${diceValue}. Select a token to move.`;
  }
  return newState;
}

/** Process a token selection */
export function processTokenSelect(state: GameState, tokenId: number): GameState {
  if (state.turnPhase !== "select") return state;

  const player = getCurrentPlayer(state);
  const token = player.tokens.find((t) => t.id === tokenId);
  if (!token || !canTokenMove(token, player.color, state.diceValue!)) return state;

  const newState = cloneState(state);
  const newPlayer = newState.players[newState.currentPlayerIndex];
  const newToken = newPlayer.tokens.find((t) => t.id === tokenId)!;

  if (newToken.state === "home") {
    // Move out of home: need a 6, place at start position (path pos 0)
    newToken.state = "path";
    newToken.pathPos = 0;
  } else {
    // Normal movement
    const result = moveToken(newToken, player.color, state.diceValue!);
    if (result.state === newToken.state && result.pathPos === newToken.pathPos) {
      // Cannot move (overshoot)
      return state;
    }

    newToken.state = result.state;
    newToken.pathPos = result.pathPos;

    // Check for capture after moving (only on main path)
    if (newToken.state === "path") {
      const newMainIndex = getMainPathIndex(player.color, newToken.pathPos);
      const captured = checkCapture(newState, player.color, newMainIndex);
      if (captured) {
        // Send captured token back home
        for (const p of newState.players) {
          if (p.color === captured.color) {
            const capToken = p.tokens.find((t) => t.id === captured.id)!;
            capToken.state = "home";
            capToken.pathPos = 0;
            break;
          }
        }
        const capturedPlayerName =
          newState.players.find((p) => p.color === captured.color)?.name ??
          captured.color;
        const verb = player.name === "You" ? "get" : "gets";
        newState.message = `${player.name} captured ${capturedPlayerName}'s token! ${player.name} ${verb} another turn!`;
        newState.diceRolled = false;
        newState.diceValue = null;
        newState.turnPhase = "roll";
        newState.canRollDice = true;

        const winner = checkWinner(newState);
        if (winner) {
          const winnerName =
            newState.players.find((p) => p.color === winner)?.name ?? winner;
          newState.winner = winner;
          newState.message = `${winnerName} wins the game! 🎉`;
          newState.turnPhase = "roll";
          newState.canRollDice = true;
        }
        return newState;
      }
    }
  }

  // Check winner
  const winner = checkWinner(newState);
  if (winner) {
    const winnerName =
      newState.players.find((p) => p.color === winner)?.name ?? winner;
    newState.winner = winner;
    newState.message = `${winnerName} wins the game! 🎉`;
    newState.turnPhase = "roll";
    newState.canRollDice = true;
    return newState;
  }

  // Handle turn transition
  if (state.diceValue === 6) {
    // Extra turn for rolling a 6
    newState.diceRolled = false;
    newState.diceValue = null;
    newState.turnPhase = "roll";
    newState.canRollDice = true;
    newState.message =
      player.name === "You"
        ? "You get another turn! Roll again."
        : `${player.name} gets another turn! Roll again.`;
  } else {
    // Next player's turn
    const nextIndex = getNextPlayerIndex(state.currentPlayerIndex);
    const nextPlayerName = state.players[nextIndex].name;
    newState.currentPlayerIndex = nextIndex;
    newState.diceRolled = false;
    newState.diceValue = null;
    newState.turnPhase = "roll";
    newState.canRollDice = true;
    newState.consecutiveSixes = 0;
    newState.message = `${turnPhrase(nextPlayerName)}. Roll the dice!`;
  }

  return newState;
}

/** Try to auto-select a token when only one can move */
export function tryAutoSelect(state: GameState): GameState | null {
  if (state.turnPhase !== "select") return null;
  const movable = getMovableTokenIds(state);
  if (movable.length === 1) {
    return processTokenSelect(state, movable[0]);
  }
  return null;
}

/**
 * Choose the best token for a bot (computer) player to move.
 * Priority: capture an opponent > finish a token > bring a token out of home > advance the furthest token.
 */
export function chooseBotTokenId(state: GameState): number | null {
  const player = getCurrentPlayer(state);
  const diceValue = state.diceValue;
  if (diceValue === null) return null;

  const movable = player.tokens.filter((t) =>
    canTokenMove(t, player.color, diceValue)
  );
  if (movable.length === 0) return null;
  if (movable.length === 1) return movable[0].id;

  // 1. Prefer a move that captures an opponent token
  for (const token of movable) {
    if (token.state === "path") {
      const result = moveToken(token, player.color, diceValue);
      if (result.state === "path") {
        const mainIndex = getMainPathIndex(player.color, result.pathPos);
        const captured = checkCapture(state, player.color, mainIndex);
        if (captured) return token.id;
      }
    }
  }

  // 2. Prefer a move that finishes a token
  for (const token of movable) {
    const result = moveToken(token, player.color, diceValue);
    if (result.state === "finished") return token.id;
  }

  // 3. Prefer bringing a new token out of home (on a 6)
  const fromHome = movable.find((t) => t.state === "home");
  if (fromHome) return fromHome.id;

  // 4. Otherwise advance the token that is furthest along
  let best = movable[0];
  let bestProgress = -1;
  for (const token of movable) {
    const progress =
      token.state === "homeStretch" ? 52 + token.pathPos : token.pathPos;
    if (progress > bestProgress) {
      bestProgress = progress;
      best = token;
    }
  }
  return best.id;
}
