import { store } from "../store/store";
import { roomStateReceived, packsReceived } from "../store/gameSlice";

export type WsClient = {
  ws: WebSocket;
  send: (msg: any) => void;
  close: () => void;
};

export function createWsClient(url: string): WsClient {
  const ws = new WebSocket(url);

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
  
    if (msg.type === "ROOM_STATE") {
      store.dispatch(roomStateReceived(msg.payload));
    }
  
    if (msg.type === "ERROR") {
      console.error("Server error:", msg.payload?.message);
      alert(msg.payload?.message || "Server error");
    }

    if (msg.type === "PACKS_LIST") {
        store.dispatch(packsReceived(msg.payload.packs));
    }
      
  };
  

  ws.onerror = (e) => {
    console.error("WS error", e);
  };
  
  ws.onclose = (e) => {
    console.warn("WS closed", e.code, e.reason);
  };
  
  ws.onopen = () => {
    console.log("WS connected");
  };

  return {
    ws,
    send: (msg) =>
      ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(msg)),
    close: () => ws.close()
  };
}
