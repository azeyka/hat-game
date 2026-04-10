import React, { useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import type { RoomState } from "../../store/gameSlice";
import type { WsClient } from "../../ws/wsClient";
import "./styles.css";

export function RoundLive({
  room,
  wsClient
}: {
  room: RoomState;
  wsClient: WsClient;
}) {
  const round = room.round!;
  const word = round.words[round.currentWordIndex];

  const explainerName = useMemo(
    () => room.players.find((p) => p.id === round.pair.explainerId)?.name,
    [room.players, round.pair.explainerId]
  );

  const guesserName = useMemo(
    () => room.players.find((p) => p.id === round.pair.guesserId)?.name,
    [room.players, round.pair.guesserId]
  );

  const guessed = () =>
    wsClient.send({
      type: "WORD_GUESSED",
      payload: { roomId: room.roomId, wordId: word.id }
    });

  const skipped = () =>
    wsClient.send({
      type: "WORD_SKIPPED",
      payload: { roomId: room.roomId, wordId: word.id }
    });

  const confirm = () =>
    wsClient.send({
      type: "CONFIRM_ROUND_RESULTS",
      payload: { roomId: room.roomId }
    });

  const handlers = useSwipeable({
    onSwipedUp: guessed,
    onSwipedDown: skipped,
    trackMouse: true
  });

  return (
    <div className="round" {...handlers}>
      <div className="card">
  {/* Таймер показываем только во время раунда */}
  {room.status === "ROUND_ACTIVE" && !room.emptyHat && (
    <div className="timer">{round.timeLeft}s</div>
  )}

  {/* Если шляпа пуста — уведомление */}
  {room.status === "ROUND_RESULTS" && room.emptyHat && (
    <div className="empty-hat">Упс, шляпа пуста 🪄</div>
  )}

  {/* Контент раунда */}
  {room.status === "ROUND_ACTIVE" ? (
    <>
      <div className="word">{word?.text ?? "—"}</div>

      <div className="pair">
        <div>
          <div className="label">Explainer</div>
          <div className="value">{explainerName ?? "—"}</div>
        </div>
        <div>
          <div className="label">Guesser</div>
          <div className="value">{guesserName ?? "—"}</div>
        </div>
      </div>

      <div className="hint">Swipe ↑ guessed, Swipe ↓ skip</div>
    </>
  ) : (
    <>
      {/* ✅ РЕЗЮМЕ вместо слова */}
      <div className="round-summary">
        <div className="summary-row">
          <span>Отгадано</span>
          <b>{round.words.filter((w) => w.guessed).length}</b>
        </div>
        <div className="summary-row">
          <span>Пропущено</span>
          <b>{round.words.filter((w) => w.skipped).length}</b>
        </div>
        <div className="summary-row">
          <span>Осталось</span>
          <b>
            {round.words.filter((w) => !w.guessed && !w.skipped).length}
          </b>
        </div>
      </div>

      <button className="btn primary" onClick={confirm} type="button">
        Confirm round
      </button>
    </>
  )}
        </div>

    </div>
  );
}
