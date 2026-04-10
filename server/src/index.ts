import "reflect-metadata";
import WebSocket, { WebSocketServer } from "ws";
import { WS_PORT } from "./env.js";
import { AppDataSource } from "./db/data-source.js";
import { getRandomWords } from "./db/wordsRepo.js";
import { listPacks, createPackWithWords, getRandomWordsFromPacks } from "./db/packsRepo.js";

import type { RoomState } from "./game/types.js";
import {
  createRoom,
  upsertPlayer,
  markDisconnected,
  removePlayer,
  ensureHost,
  startRound,
  finishRound,
  computePodium,
  advanceWord,
  clearTimer,
  startTimer,
  type Room
} from "./game/roomManager.js";

type Incoming =
    | { type: "CONNECT"; payload: { roomId: string; playerId: string; name: string } }
    | { type: "SETTINGS_UPDATE"; payload: { roomId: string; settings: Partial<RoomState["settings"]> } }
    | { type: "START_GAME"; payload: { roomId: string } }
    | { type: "WORD_GUESSED"; payload: { roomId: string; wordId: string } }
    | { type: "WORD_SKIPPED"; payload: { roomId: string; wordId: string } }
    | { type: "RESET_GAME"; payload: { roomId: string } }
    | { type: "LEAVE_ROOM"; payload: { roomId: string } }
    | { type: "CONFIRM_ROUND_RESULTS"; payload: { roomId: string } }
    | { type: "PACKS_LIST_REQUEST" }
    | { type: "ROOM_PACKS_UPDATE"; payload: { roomId: string; packIds: string[] } }
    | { type: "CREATE_PACK"; payload: { roomId: string; name: string; difficulty: number; words: string[] } }


const rooms = new Map<string, Room>();

function safeSend(ws: WebSocket, msg: any) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function maskRoomStateForPlayer(room: Room, forPlayerId: string | null): RoomState {
    const state = room.state;
  
    if (!state.round) return state;
  
    const { pair, currentWordIndex, words } = state.round;
    const isExplainer = !!forPlayerId && pair.explainerId === forPlayerId;
  
    // Только объясняющий видит текущий word.text
    if (!isExplainer) {
      const maskedWords = words.map((w, idx) => {
        if (idx !== currentWordIndex) return { ...w, text: "" }; // вообще не светим
        return { ...w, text: "••••••" };
      });
  
      return {
        ...state,
        round: { ...state.round, words: maskedWords }
      };
    }
  
    return state;
  }
  
function hasPlayableWords(room: Room): boolean {
    const r = room.state.round;
    if (!r) return false;
    return r.words.some((w) => !w.guessed && !w.skipped);
}
  
function requireHost(room: Room, playerId: string | null, ws: WebSocket) {
    const host = room.state.players.find((p) => p.isHost);
    if (!host) {
      safeSend(ws, { type: "ERROR", payload: { message: "Host not found" } });
      return null;
    }
    if (!playerId || playerId !== host.id) {
      safeSend(ws, { type: "ERROR", payload: { message: "Only host can do this" } });
      return null;
    }
    return host;
  }

function broadcast(room: Room) {
    for (const ws of room.rt.clients) {
        const pid = (ws as any).__playerId as string | undefined; // мы запишем ниже
        const payload = maskRoomStateForPlayer(room, pid ?? null);
        safeSend(ws, { type: "ROOM_STATE", payload });
    }
}

function requireRoom(roomId: string): Room {
  const existing = rooms.get(roomId);
  if (existing) return existing;
  const r = createRoom(roomId);
  rooms.set(roomId, r);
  return r;
}

function maybeDeleteRoom(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;
  
    const hasPlayers = room.state.players.length > 0;
    if (hasPlayers) return;
  
    // стоп таймера
    clearTimer(room);
  
    // закрываем и чистим клиентов (на всякий)
    for (const ws of room.rt.clients) {
      try {
        ws.close();
      } catch {}
    }
    room.rt.clients.clear();
  
    rooms.delete(roomId);
    console.log(`[server] Room deleted: ${roomId}`);
  }
  

async function main() {
  await AppDataSource.initialize();
  console.log("✅ DB connected");

  const wss = new WebSocketServer({ port: WS_PORT, host: "0.0.0.0" });
  console.log(`✅ WS listening: ws://localhost:${WS_PORT}`);

  wss.on("connection", (ws, req) => {
    let roomId: string | null = null;
    let playerId: string | null = null;

    console.log("WS connection from", req.socket.remoteAddress);

    ws.on("message", async (buf) => {
      let msg: Incoming;
      try {
        msg = JSON.parse(buf.toString());
      } catch {
        return safeSend(ws, { type: "ERROR", payload: { message: "Invalid JSON" } });
      }

      try {
        if (msg.type === "CONNECT") {
            roomId = msg.payload.roomId;
            playerId = msg.payload.playerId;
          
            const room = requireRoom(roomId);
            room.rt.clients.add(ws);
          
            upsertPlayer(room, playerId, msg.payload.name);
          
            (ws as any).__playerId = playerId; // ✅ важно
          
            broadcast(room);
            return;
        }
          

        // дальнейшие действия требуют подключения к комнате
        if (!roomId) return;

        const room = requireRoom(roomId);

        if (msg.type === "SETTINGS_UPDATE") {
            const room = requireRoom(msg.payload.roomId);
          
            // кто сейчас хост
            const host = room.state.players.find((p) => p.isHost);
            if (!host) {
              return safeSend(ws, { type: "ERROR", payload: { message: "Host not found" } });
            }
          
            // кто отправил сообщение
            if (!playerId) {
              return safeSend(ws, { type: "ERROR", payload: { message: "Not connected" } });
            }
          
            // проверка прав
            if (playerId !== host.id) {
              return safeSend(ws, { type: "ERROR", payload: { message: "Only host can change settings" } });
            }
          
            // применяем
            room.state.settings = { ...room.state.settings, ...msg.payload.settings };
            broadcast(room);
            return;
        }

        if (msg.type === "START_GAME") {
            const rawWords = await getRandomWordsFromPacks({
                packIds: room.state.selectedPackIds,
                limit: room.state.settings.wordsPerRound
              });

          startRound(
            room,
            rawWords.map((w) => ({ ...w, guessed: false, skipped: false }))
          );

          startTimer(room, () => broadcast(room));
          broadcast(room);
          return;
        }

        if (msg.type === "WORD_GUESSED") {
          const r = room.state.round;
          if (!r) return;

          const w = r.words.find((x) => x.id === msg.payload.wordId);
          if (w && !w.guessed) {
            w.guessed = true;

            const explainer = room.state.players.find((p) => p.id === r.pair.explainerId);
            const guesser = room.state.players.find((p) => p.id === r.pair.guesserId);

            if (explainer) {
                explainer.score += 1;
                explainer.explainedCount += 1;
            }
              
            if (guesser) {
                guesser.score += 1;
                guesser.guessedCount += 1;
            }
              
          }

          advanceWord(room);

          if (!hasPlayableWords(room)) {
            room.state.emptyHat = true;
            finishRound(room);
            clearTimer(room);
          }

          broadcast(room);
          return;
        }

        if (msg.type === "WORD_SKIPPED") {
          const r = room.state.round;
          if (!r) return;

          const w = r.words.find((x) => x.id === msg.payload.wordId);
          if (w && !w.skipped) {
            w.skipped = true;

            if (room.state.settings.deductOnSkip) {
              const explainer = room.state.players.find((p) => p.id === r.pair.explainerId);
              if (explainer) explainer.score -= 1;
            }

            const explainer = room.state.players.find(
                (p) => p.id === r.pair.explainerId
              );
            
              if (explainer) {
                explainer.skippedCount += 1;
              }
          }

          advanceWord(room);

          if (!hasPlayableWords(room)) {
            room.state.emptyHat = true;
            finishRound(room);
            clearTimer(room);
          }
    
          broadcast(room);
          return;
        }

        if (msg.type === "RESET_GAME") {
            const room = requireRoom(msg.payload.roomId);
          
            // только хост может сбрасывать
            const host = room.state.players.find((p) => p.isHost);
            if (!host) {
              return safeSend(ws, { type: "ERROR", payload: { message: "Host not found" } });
            }
            if (!playerId) {
              return safeSend(ws, { type: "ERROR", payload: { message: "Not connected" } });
            }
            if (playerId !== host.id) {
              return safeSend(ws, { type: "ERROR", payload: { message: "Only host can reset the game" } });
            }
          
            // стоп таймера, очистка раунда, сброс очков
            clearTimer(room);
          
            for (const p of room.state.players) {
                p.score = 0;
                p.guessedCount = 0;
                p.explainedCount = 0;
                p.skippedCount = 0;
              // p.disconnected не трогаем
            }
          
            room.state.round = undefined;
            room.state.podium = undefined;
            room.state.emptyHat = false;
            room.state.status = "LOBBY";
          
            broadcast(room);
            return;
          }
          
          if (msg.type === "LEAVE_ROOM") {
            const room = requireRoom(msg.payload.roomId);
          
            if (!playerId) {
              return safeSend(ws, { type: "ERROR", payload: { message: "Not connected" } });
            }
          
            // удалить игрока
            removePlayer(room, playerId);
          
            // убрать сокет из клиентов комнаты
            room.rt.clients.delete(ws);
          
            // если игрок был хостом — переназначить
            for (const p of room.state.players) {
              // на всякий случай, если у кого-то остался флаг
              if (p.isHost && p.id === playerId) p.isHost = false;
            }
            // нормализуем хоста (если нет — назначим первого активного)
            ensureHost(room);
          
            broadcast(room);
            maybeDeleteRoom(room.state.roomId);
            return;
          }
          

        if (msg.type === "CONFIRM_ROUND_RESULTS") {
          const r = room.state.round;
          if (!r) return;

          // оставляем только НЕугаданные (включая пропуски — они снова сыграют)
          const remaining = r.words.filter((x) => !x.guessed);

          if (remaining.length === 0) {
            clearTimer(room);
            computePodium(room);
            broadcast(room);
            return;
          }

          // новый раунд с оставшимися словами (сбрасываем skipped)
          startRound(
            room,
            remaining.map((x) => ({ ...x, skipped: false }))
          );

          startTimer(room, () => broadcast(room));
          broadcast(room);
          return;
        }

        if (msg.type === "PACKS_LIST_REQUEST") {
            const packs = await listPacks();
            return safeSend(ws, { type: "PACKS_LIST", payload: { packs } });
          }
          
          if (msg.type === "ROOM_PACKS_UPDATE") {
            const room = requireRoom(msg.payload.roomId);
            if (!requireHost(room, playerId, ws)) return;
          
            room.state.selectedPackIds = msg.payload.packIds;
            broadcast(room);
            return;
          }
          if (msg.type === "CREATE_PACK") {
            const room = requireRoom(msg.payload.roomId);
            if (!requireHost(room, playerId, ws)) return;
          
            const name = msg.payload.name.trim();
            if (!name) {
              return safeSend(ws, { type: "ERROR", payload: { message: "Pack name is required" } });
            }
          
            const pack = await createPackWithWords({
              name,
              difficulty: Math.max(1, Math.min(5, Number(msg.payload.difficulty || 1))),
              words: msg.payload.words || []
            });
          
            // авто-добавим созданный пак в выбранные
            room.state.selectedPackIds = Array.from(new Set([...room.state.selectedPackIds, pack.id]));
            broadcast(room);
          
            // вернём список паков всем (можно только ws, но удобнее всем)
            const packs = await listPacks();
            for (const c of room.rt.clients) {
              safeSend(c, { type: "PACKS_LIST", payload: { packs } });
            }
            return;
          }
          
      } catch (e: any) {
        return safeSend(ws, { type: "ERROR", payload: { message: e?.message || "Server error" } });
      }
    });

    ws.on("close", () => {
        if (!roomId || !playerId) return;
        const room = rooms.get(roomId);
        if (!room) return;
      
        room.rt.clients.delete(ws);
        markDisconnected(room, playerId);
      
        // ✅ если отвалился хост — переназначаем
        const host = room.state.players.find((p) => p.isHost);
        const hostDisconnected = host?.disconnected;
      
        if (host && hostDisconnected) {
          // снимаем флаг хоста со всех (на всякий)
          for (const p of room.state.players) p.isHost = false;
      
          // выбираем нового: первый активный
          const newHost = room.state.players.find((p) => !p.disconnected);
          if (newHost) newHost.isHost = true;
        }
      
        broadcast(room);
        maybeDeleteRoom(room.state.roomId);
    });
      
      
  });
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
