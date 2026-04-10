export type RoomStatus =
  | "LOBBY"
  | "ROUND_ACTIVE"
  | "ROUND_RESULTS"
  | "PODIUM";

export interface Player {
    id: string;
    name: string;
    score: number;

    guessedCount: number;
    explainedCount: number;
    skippedCount: number;

    isHost: boolean;
    disconnected: boolean;
}

export interface RoundWord {
  id: string;
  text: string;
  guessed: boolean;
  skipped: boolean;
}

export interface Pair {
  explainerId: string;
  guesserId: string;
}

export interface RoundState {
  pair: Pair;
  currentWordIndex: number;
  words: RoundWord[];
  timeLeft: number;
}

export interface RoomState {
    roomId: string;
    status: RoomStatus;
    players: Player[];
    round?: RoundState;
    podium?: Player[];
    emptyHat?: boolean;
  
    selectedPackIds: string[];
  
    settings: {
      timeSeconds: number;
      wordsPerRound: number;
      deductOnSkip: boolean;
    };
  }
  
