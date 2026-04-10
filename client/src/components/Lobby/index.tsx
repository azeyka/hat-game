import { useMemo, useState, useEffect } from "react";
import type { RoomState } from "../../store/gameSlice";
import type { WsClient } from "../../ws/wsClient";
import { PacksSelector } from "./PacksSelector";
import "./styles.css";

export function Lobby({
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

  const [timeSeconds, setTimeSeconds] = useState(room.settings.timeSeconds);
  const [wordsPerRound, setWordsPerRound] = useState(room.settings.wordsPerRound);
  const [deductOnSkip, setDeductOnSkip] = useState(room.settings.deductOnSkip);
  const [settingsErrors, setSettingsErrors] = useState({
    timeSeconds: "",
    wordsPerRound: "",
    packSelected: ""
  });
  const [errorsVisible, setErrorsVisible] = useState(false)

  // если настройки прилетели с сервера — синхронизируем локальные поля
  useEffect(() => {
    setTimeSeconds(room.settings.timeSeconds);
    setWordsPerRound(room.settings.wordsPerRound);
    setDeductOnSkip(room.settings.deductOnSkip);
  }, [room.settings.timeSeconds, room.settings.wordsPerRound, room.settings.deductOnSkip]);

  const start = () =>
    wsClient.send({ type: "START_GAME", payload: { roomId: room.roomId } });

  const applySettings = () => {
    wsClient.send({
      type: "SETTINGS_UPDATE",
      payload: {
        roomId: room.roomId,
        settings: {
          timeSeconds,
          wordsPerRound,
          deductOnSkip
        }
      }
    });
  };

  useEffect(() => {
    setSettingsErrors((prev) => ({
      ...prev,
      packSelected: !room.selectedPackIds || room.selectedPackIds.length === 0 ? "Выберите хотя бы один пакет слов" : ""
    }));
  }, [room.selectedPackIds])
  

  return (
    <div className="lobby">
      <div className="card">
        <div className="row">
          <div>
            <div className="label">Room</div>
            <div className="value">{room.roomId}</div>
          </div>
          <button
            className="btn"
            onClick={() => navigator.clipboard.writeText(room.roomId)}
            type="button"
          >
            Copy
          </button>
        </div>

        <div className="label">Участники</div>
        <div className="players">
          {room.players.map((p) => (
            <p key={p.id}>
              <span className="meta">
                {p.disconnected ? "offline" : ""} {p.isHost ? "👑 " : ""}
              </span>
              <span>{p.name}</span>
            </p>
          ))}
        </div>

        {me?.isHost ? (
          <>
            <div className="settings">
              <div className="label">Settings</div>

              <div className="settings-grid">
                <label className="field">
                  <span>Time (sec)</span>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={timeSeconds}
                    disabled={!me?.isHost}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setTimeSeconds(value)
                      setSettingsErrors((prev) => ({
                        ...prev,
                        timeSeconds: !value || value < 3 || value > 100 ? "Установите длительность раунда" : ""
                      }));
                    }}
                  />
                </label>

                <label className="field">
                  <span>Words / round</span>
                  <input
                    type="number"
                    min={3}
                    max={100}
                    value={wordsPerRound}
                    disabled={!me?.isHost}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setWordsPerRound(value);
                      setSettingsErrors((prev) => ({
                        ...prev,
                        wordsPerRound: !value || value < 3 || value > 100 ? "Установите максимальное количество слов за раунд" : ""
                      }));
                    }}
                  />
                </label>

                <label className="field checkbox">
                  <span>Deduct on skip</span>
                  <input
                    type="checkbox"
                    checked={deductOnSkip}
                    disabled={!me?.isHost}
                    onChange={(e) => setDeductOnSkip(e.target.checked)}
                  />
                </label>
              </div>
            </div>

            <PacksSelector room={room} wsClient={wsClient} isHost={me?.isHost ?? false} />

            {errorsVisible && (settingsErrors.timeSeconds || settingsErrors.wordsPerRound || settingsErrors.packSelected) && (
              <div className="error-block">
                {Object.values(settingsErrors).map(
                  (err, i) => err ? (<div key={i} className="error">{err}</div>) : null)
                }
              </div>
          )}
          
            <button
              className="btn primary"
              onClick={() => {
                if (settingsErrors.timeSeconds || settingsErrors.wordsPerRound || settingsErrors.packSelected) {
                  setErrorsVisible(true);
                  return;
                }

                applySettings();
                start();
              }}
              type="button"
            >
              Start
            </button>
          </>
        ) : (
          <div className="hint">Ждём, пока хост нажмёт Start…</div>
        )}
      </div>
    </div>
  );
}
