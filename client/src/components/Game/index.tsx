import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { WsClient } from "../../ws/wsClient";
import { Lobby } from "../Lobby";
import { RoundLive } from "../RoundLive";
import { Podium } from "../Podium";
import "./styles.css";

export function Game({ wsClient }: { wsClient: WsClient }) {
  const room = useSelector((s: RootState) => s.game.room)!;
  const playerId = localStorage.getItem("hat_player_id");

  return (
    <div className="shell">
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
