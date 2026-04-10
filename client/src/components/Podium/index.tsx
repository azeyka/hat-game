import React, { useMemo } from "react";
import type { RoomState } from "../../store/gameSlice";
import type { WsClient } from "../../ws/wsClient";
import "./styles.css";

export function Podium({
  room,
  wsClient,
  playerId
}: {
  room: RoomState;
  wsClient: WsClient;
  playerId: string | null;
}) {
  const me = useMemo(
    () => room.players.find((p) => p.id === playerId),
    [room.players, playerId]
  );

  const reset = () => {
    wsClient.send({ type: "RESET_GAME", payload: { roomId: room.roomId } });
  };

  return (
    <div className="podium">
      <div className="card">
        <h2>Results</h2>

        <table className="results-table">
        <thead>
            <tr>
            <th>Игрок</th>
            <th>Очки</th>
            <th>Отгадано</th>
            <th>Загадано</th>
            <th>Пропущено</th>
            </tr>
        </thead>

        <tbody>
            {room.podium?.map((p) => (
            <tr key={p.id}>
                <td>{p.name}</td>
                <td><b>{p.score}</b></td>
                <td>{p.guessedCount}</td>
                <td>{p.explainedCount}</td>
                <td>{p.skippedCount}</td>
            </tr>
            ))}
        </tbody>
        </table>

        {me?.isHost ? (
          <button className="btn primary" onClick={reset} type="button">
            Начать новую игру
          </button>
        ) : (
          <div className="hint">Ждём, пока хост начнёт новую игру…</div>
        )}
      </div>
    </div>
  );
}
