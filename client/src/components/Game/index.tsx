import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { leaveRoom } from "../../store/gameSlice";
import type { WsClient } from "../../ws/wsClient";
import { Lobby } from "../Lobby";
import { RoundLive } from "../RoundLive";
import { Podium } from "../Podium";
import "./styles.css";

export function Game({ wsClient }: { wsClient: WsClient }) {
  const room = useSelector((s: RootState) => s.game.room)!;
  const dispatch = useDispatch();
    const myName = localStorage.getItem("hat_name") || "Player";
  const playerId = localStorage.getItem("hat_player_id");

  const [accent, setAccent] = useState(
    localStorage.getItem("hat_accent") || "#2f7cff"
  );

  const exitRoom = () => {
    wsClient.send({ type: "LEAVE_ROOM", payload: { roomId: room.roomId } });
  
    // сбросить room в Redux → вернёмся на Join
    dispatch(leaveRoom());
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("hat_accent", accent);
  }, [accent]);

  return (
    <div className="shell">
    <header className="topbar">
        <div className="title">Шляпа</div>

        <div className="top-actions">
            <div className="me">
            <div className="me-name">{myName}</div>
            <button className="exit-btn" onClick={exitRoom} type="button">
                Выйти
            </button>
            </div>

            <div className="accent">
            <input
                aria-label="Accent"
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
            />
            </div>
        </div>
    </header>


      {room.status === "LOBBY" && (
        <Lobby room={room} wsClient={wsClient} playerId={playerId} />
      )}

      {(room.status === "ROUND_ACTIVE" || room.status === "ROUND_RESULTS") && (
        <RoundLive room={room} wsClient={wsClient} />
      )}

        {room.status === "PODIUM" && (
            <Podium room={room} wsClient={wsClient} playerId={playerId} />
        )}
    </div>
  );
}
