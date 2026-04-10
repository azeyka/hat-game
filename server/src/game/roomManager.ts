import type { RoomState, Player, Pair, RoundWord } from "./types.js";

export type RoomRuntime = {
  clients: Set<WebSocket>;
  timer?: NodeJS.Timeout;
};

export type Room = {
  state: RoomState;
  rt: RoomRuntime;
};

export function createRoom(roomId: string): Room {
  return {
    state: {
      roomId,
      status: "LOBBY",
      players: [],
      selectedPackIds: [],
      settings: {
        timeSeconds: 5,
        wordsPerRound: 10,
        deductOnSkip: true
      }
    },
    rt: {
      clients: new Set<WebSocket>()
    }
  };
}

export function upsertPlayer(room: Room, playerId: string, name: string): Player {
  const p = room.state.players.find((x) => x.id === playerId);
  if (p) {
    p.name = name || p.name;
    p.disconnected = false;
    return p;
  }

  const isHost = room.state.players.length === 0;
  const player: Player = {
    id: playerId,
    name,
    score: 0,
  
    guessedCount: 0,
    explainedCount: 0,
    skippedCount: 0,
  
    isHost,
    disconnected: false
  };
  

  room.state.players.push(player);
  return player;
}

export function removePlayer(room: Room, playerId: string) {
    room.state.players = room.state.players.filter((p) => p.id !== playerId);
}

export function ensureHost(room: Room) {
    const host = room.state.players.find((p) => p.isHost);
    if (host) return;
  
    const newHost = room.state.players.find((p) => !p.disconnected);
    if (newHost) newHost.isHost = true;
}
  

export function markDisconnected(room: Room, playerId: string) {
  const p = room.state.players.find((x) => x.id === playerId);
  if (p) p.disconnected = true;
}

export function pickPair(room: Room): Pair {
  const active = room.state.players.filter((p) => !p.disconnected);
  if (active.length < 2) {
    throw new Error("Need at least 2 active players");
  }

  const shuffled = [...active].sort(() => Math.random() - 0.5);
  return {
    explainerId: shuffled[0].id,
    guesserId: shuffled[1].id
  };
}

export function startRound(room: Room, words: RoundWord[]) {
    room.state.emptyHat = false;
    room.state.round = {
      pair: pickPair(room),
      currentWordIndex: 0,
      words,
      timeLeft: room.state.settings.timeSeconds
    };
    room.state.status = "ROUND_ACTIVE";
  }
  

export function finishRound(room: Room) {
  room.state.status = "ROUND_RESULTS";
}

export function computePodium(room: Room) {
  room.state.podium = [...room.state.players].sort((a, b) => b.score - a.score);
  room.state.status = "PODIUM";
}

export function clearTimer(room: Room) {
  if (room.rt.timer) {
    clearInterval(room.rt.timer);
    room.rt.timer = undefined;
  }
}

export function startTimer(room: Room, onTick: () => void) {
  clearTimer(room);
  room.rt.timer = setInterval(() => {
    const r = room.state.round;
    if (!r) return;
    if (room.state.status !== "ROUND_ACTIVE") return;

    r.timeLeft = Math.max(0, r.timeLeft - 1);

    if (r.timeLeft === 0) {
        room.state.emptyHat = false;    
        finishRound(room);
        clearTimer(room);
    }

    onTick();
  }, 1000);
}

export function currentWord(room: Room) {
  const r = room.state.round;
  if (!r) return null;
  return r.words[r.currentWordIndex] ?? null;
}

export function advanceWord(room: Room) {
  const r = room.state.round;
  if (!r) return;

  // найти следующий индекс после текущего
  let idx = r.currentWordIndex + 1;

  // пропускаем уже отмеченные слова
  while (idx < r.words.length && (r.words[idx].guessed || r.words[idx].skipped)) {
    idx++;
  }

  // если дошли до конца, оставляем как есть
  if (idx >= r.words.length) return;

  r.currentWordIndex = idx;
}
