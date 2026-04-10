import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { leaveRoom } from "../../store/gameSlice";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { WsClient } from "../../ws/wsClient";
import "./styles.css";

export function Header({ wsClient }: { wsClient: WsClient }) {
  const room = useSelector((s: RootState) => s.game.room)!;
  const dispatch = useDispatch();
  const { refreshTheme } = useAppTheme();
  const myName = localStorage.getItem("hat_name") || null;
  const playerId = localStorage.getItem("hat_player_id");

  const [accent, setAccent] = useState(
    localStorage.getItem("hat_accent") || "#2f7cff"
  );

  const exitRoom = () => {
    if (room?.roomId) {
        wsClient.send({ type: "LEAVE_ROOM", payload: { roomId: room.roomId } });
        dispatch(leaveRoom());
    }
    localStorage.setItem("hat_player_id", '');
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("hat_accent", accent);
    refreshTheme();
  }, [accent]);

  return (
    <header className="topbar">
        <div className="title">Шляпа</div>

        <div className="top-actions">
            {playerId && myName && (<div className="me">
                <div className="me-name">{myName}</div>
                <button className="exit-btn" onClick={exitRoom} type="button">
                    Выйти
                </button>
            </div>)}

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
  );
}
