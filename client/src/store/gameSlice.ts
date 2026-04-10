import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RoomStatus = "LOBBY" | "ROUND_ACTIVE" | "ROUND_RESULTS" | "PODIUM";

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

export interface WordPack {
    id: string;
    name: string;
    difficulty: number;
    wordsCount: number;
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
  

interface GameSliceState {
  room?: RoomState;
  packs: WordPack[];
}

const initialState: GameSliceState = { packs: [] };

const slice = createSlice({
  name: "game",
  initialState,
  reducers: {
    roomStateReceived(state, action: PayloadAction<RoomState>) {
      state.room = action.payload;
    },
    leaveRoom(state) {
        state.room = undefined;
    },
    packsReceived(state, action: PayloadAction<WordPack[]>) {
        state.packs = action.payload;
    },
  }
});

export const { roomStateReceived, leaveRoom, packsReceived } = slice.actions;
export const gameReducer = slice.reducer;
