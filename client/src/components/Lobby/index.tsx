import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { RoomState } from "../../store/gameSlice";
import type { WsClient } from "../../ws/wsClient";
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
    const packs = useSelector((s: RootState) => s.game.packs);
  const me = useMemo(
    () => room.players.find((p) => p.id === playerId),
    [room.players, playerId]
  );

  const [timeSeconds, setTimeSeconds] = useState(room.settings.timeSeconds);
  const [wordsPerRound, setWordsPerRound] = useState(room.settings.wordsPerRound);
  const [deductOnSkip, setDeductOnSkip] = useState(room.settings.deductOnSkip);

  const [selected, setSelected] = useState<string[]>(room.selectedPackIds ?? []);

  const [newName, setNewName] = useState("");
    const [newDifficulty, setNewDifficulty] = useState(1);
    const [newWords, setNewWords] = useState("");

    const createPack = () => {
    const words = newWords
        .split("\n")
        .map((w) => w.trim())
        .filter(Boolean);

    wsClient.send({
        type: "CREATE_PACK",
        payload: { roomId: room.roomId, name: newName, difficulty: newDifficulty, words }
    });

    setNewName("");
    setNewDifficulty(1);
    setNewWords("");
    };



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

  const applyPacks = () => {
    wsClient.send({ type: "ROOM_PACKS_UPDATE", payload: { roomId: room.roomId, packIds: selected } });
  };

  useEffect(() => {
    wsClient.send({ type: "PACKS_LIST_REQUEST" });
  }, [wsClient]);

  useEffect(() => setSelected(room.selectedPackIds ?? []), [room.selectedPackIds]);

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

        <div className="label">Players</div>
        <ul className="players">
          {room.players.map((p) => (
            <li key={p.id}>
              <span>{p.name}</span>
              <span className="meta">
                {p.disconnected ? "offline" : ""} {p.isHost ? "host" : ""}
              </span>
            </li>
          ))}
        </ul>

        {/* SETTINGS */}
        <div className="settings">
          <div className="label">Settings</div>

          <div className="packs">
    {packs.map((p) => {
      const checked = selected.includes(p.id);
      return (
        <label key={p.id} className="pack">
          <input
            type="checkbox"
            checked={checked}
            disabled={!me?.isHost}
            onChange={(e) => {
              setSelected((prev) =>
                e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
              );
            }}
          />
          <span className="pack-name">{p.name}</span>
          <span className="pack-diff">сложн. {p.difficulty}</span>
        </label>
      );
    })}
  </div>

  {me?.isHost ? (
    <button className="btn" onClick={applyPacks} type="button">
      Apply packs
    </button>
  ) : (
    <div className="hint">Только хост выбирает паки.</div>
  )}

  <div className="create-pack">
    <div className="label">Create pack</div>

    <label className="field">
      <span>Name</span>
      <input value={newName} disabled={!me?.isHost} onChange={(e) => setNewName(e.target.value)} />
    </label>

    <label className="field">
      <span>Difficulty (1-5)</span>
      <input
        type="number"
        min={1}
        max={5}
        value={newDifficulty}
        disabled={!me?.isHost}
        onChange={(e) => setNewDifficulty(Number(e.target.value))}
      />
    </label>

    <label className="field">
      <span>Words (one per line)</span>
      <textarea
        rows={6}
        value={newWords}
        disabled={!me?.isHost}
        onChange={(e) => setNewWords(e.target.value)}
      />
    </label>

    {me?.isHost && (
      <button className="btn primary" onClick={createPack} type="button">
        Create & select
      </button>
    )}
  </div>

          <div className="settings-grid">
            <label className="field">
              <span>Time (sec)</span>
              <input
                type="number"
                min={10}
                max={600}
                value={timeSeconds}
                disabled={!me?.isHost}
                onChange={(e) => setTimeSeconds(Number(e.target.value))}
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
                onChange={(e) => setWordsPerRound(Number(e.target.value))}
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

          {me?.isHost ? (
            <button className="btn" onClick={applySettings} type="button">
              Apply settings
            </button>
          ) : (
            <div className="hint">Только хост может менять настройки.</div>
          )}
        </div>

        {/* START */}
        {me?.isHost ? (
          <button className="btn primary" onClick={start} type="button">
            Start
          </button>
        ) : (
          <div className="hint">Ждём, пока хост нажмёт Start…</div>
        )}
      </div>
    </div>
  );
}
