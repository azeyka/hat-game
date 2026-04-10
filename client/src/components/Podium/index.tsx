import React, { useMemo } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import type { RoomState } from "../../store/gameSlice";
import type { WsClient } from "../../ws/wsClient";
import PodiumTop from "./PodiumTop";
import PodiumTable from "./PodiumTable";

type PodiumProps = {
  room: RoomState;
  wsClient: WsClient;
  playerId: string | null;
};

export function Podium({ room, wsClient, playerId }: PodiumProps) {
  const me = useMemo(
    () => room.players.find((p) => p.id === playerId),
    [room.players, playerId]
  );

  const reset = () => {
    wsClient.send({
      type: "RESET_GAME",
      payload: { roomId: room.roomId },
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box textAlign="center">
          <Typography variant="h3" fontWeight={800} mb={1}>
            Итоги игры
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Комната: {room.roomId}
          </Typography>
        </Box>

        {/* <PodiumTop players={room.podium ?? []} playerId={playerId} /> */}

        {/* <PodiumTable players={room.podium ?? []} playerId={playerId} /> */}

        <Box textAlign="center">
          {me?.isHost ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<ReplayRoundedIcon />}
              onClick={reset}
              sx={{ minWidth: 240 }}
            >
              Начать новую игру
            </Button>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Ждём, пока хост начнёт новую игру…
            </Typography>
          )}
        </Box>
      </Stack>
    </Container>
  );
}