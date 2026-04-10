import {useState} from "react";
import type { RoomState } from "../../../../store/gameSlice";
import type { WsClient } from "../../../../ws/wsClient";
import "../styles.css";

export function PackCreator({
  room,
  wsClient,
  closeForm,
}: {
    room: RoomState;
    wsClient: WsClient;
    closeForm: () => void,
}) {
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
        closeForm();
    };

  return (
    <div className="create-pack">
        <div className="label">Create pack</div>

        <label className="field">
            <span>Name</span>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} />
        </label>

        <label className="field">
            <span>Difficulty (1-5)</span>
            <input
                type="number"
                min={1}
                max={5}
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(Number(e.target.value))}
            />
        </label>

        <label className="field">
            <span>Words (one per line)</span>
            <textarea
                rows={6}
                value={newWords}
                onChange={(e) => setNewWords(e.target.value)}
            />
        </label>

        <button className="btn primary" onClick={createPack} type="button">
            Create & select
        </button>
        <button className="btn" onClick={closeForm} type="button">
            Cancel
        </button>
  </div>
  );
}
