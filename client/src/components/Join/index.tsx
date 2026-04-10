import React, { useState } from "react";
import type { WsClient } from "../../ws/wsClient";
import "./styles.css";

export function Join({ wsClient }: { wsClient: WsClient }) {
  const [name, setName] = useState(localStorage.getItem("hat_name") || "");
  const [roomId, setRoomId] = useState(
    localStorage.getItem("hat_room") || "demo-room"
  );

  const playerId = (() => {
    const existing = localStorage.getItem("hat_player_id");
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem("hat_player_id", id);
    return id;
  })();

  const join = () => {
    localStorage.setItem("hat_name", name);
    localStorage.setItem("hat_room", roomId);
    wsClient.send({
      type: "CONNECT",
      payload: { roomId, playerId, name: name || "Player" }
    });
  };

  return (
    <div className="join">
      <h1>Шляпа</h1>

      <label>
        Имя
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="например, Аня"
        />
      </label>

      <label>
        Room ID
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="например, demo-room"
        />
      </label>

      <button onClick={join}>Join</button>

      <p className="hint">Первый вошедший станет хостом.</p>
    </div>
  );
}
