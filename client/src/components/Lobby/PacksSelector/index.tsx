import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { RoomState } from "../../../store/gameSlice";
import type { WsClient } from "../../../ws/wsClient";
import { PackCreator } from "./PackCreator";
import { PackCard } from "./PackCard";
import { DifficultyScale } from "./DifficultyScale";
import "./styles.css";

export function PacksSelector({
  room,
  wsClient,
  isHost,
}: {
  room: RoomState;
  wsClient: WsClient;
  isHost: boolean;
}) {
    const packs = useSelector((s: RootState) => s.game.packs);
    console.log("packs", packs);
    const [selected, setSelected] = useState<string[]>(room.selectedPackIds ?? []);
    const [addNewPackFormVisible, setAddNewPackFormVisible] = useState(false);

    useEffect(() => {
        wsClient.send({ type: "PACKS_LIST_REQUEST" });
    }, [wsClient]);

    useEffect(() => setSelected(room.selectedPackIds ?? []), [room.selectedPackIds]);

    return (
        <div className="packs">
            {packs.map((p) => {
                const checked = selected.includes(p.id);
                return (
                    <PackCard
                        key={p.id}
                        name={p.name}
                        wordsCount={p.wordsCount}
                        difficulty={p.difficulty}
                        selected={checked}
                        onClick={() => {
                            const newSelected = !checked ? [...selected, p.id] : selected.filter((id) => id !== p.id) || [];
                            wsClient.send({ type: "ROOM_PACKS_UPDATE", payload: { roomId: room.roomId, packIds: newSelected } });
                        }}
                    />
                );
            })}

            {addNewPackFormVisible && (<PackCreator room={room} wsClient={wsClient} closeForm={() => setAddNewPackFormVisible(false)} />)}
        
            {isHost ? (
                <>
                    {!addNewPackFormVisible && (
                        <button className="btn" onClick={() => setAddNewPackFormVisible(true)} type="button">
                            + Create new pack
                        </button>
                    )}
                </>
            ) : (
                <div className="hint">Только хост выбирает паки.</div>
            )}
        </div>
    );
}
