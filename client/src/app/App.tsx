import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { createWsClient, WsClient } from "../ws/wsClient";
import { Game } from "../components/Game";
import { Join } from "../components/Join";
import { Header } from "../components/Header";

export function App() {
  const room = useSelector((s: RootState) => s.game.room);
  const [wsClient, setWsClient] = useState<WsClient | null>(null);

  useEffect(() => {
    const c = createWsClient("ws://192.168.24.87:1234");
    setWsClient(c);
    return () => c.close();
  }, []);

  if (!wsClient) return <div style={{ padding: 16 }}>Connecting...</div>;

  return <div>
    <Header wsClient={wsClient} />
    {room ? <Game wsClient={wsClient} /> : <Join wsClient={wsClient} />};
  </div>
}
