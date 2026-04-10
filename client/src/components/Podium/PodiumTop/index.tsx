import React from "react";
import { Paper, Stack } from "@mui/material";
import type { Player } from "../../store/gameSlice";
import PodiumCard from "./PodiumCard";

type PodiumTopProps = {
  players: Player[];
  playerId: string | null;
};

const podiumHeights = [220, 260, 200];

export function PodiumTop({ players, playerId }: PodiumTopProps) {
  const topThree = [players[1], players[0], players[2]].filter(
    Boolean
  ) as Player[];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "flex-end" }}
        justifyContent="center"
        spacing={2}
      >
        {topThree.map((player) => {
          const rank = players.findIndex((p) => p.id === player.id) + 1;
          const visualIndex = rank === 1 ? 0 : rank === 2 ? 1 : 2;

          return (
            <PodiumCard
              key={player.id}
              player={player}
              rank={rank}
              height={podiumHeights[visualIndex] ?? 200}
              isMe={player.id === playerId}
              highlighted={rank === 1}
            />
          );
        })}
      </Stack>
    </Paper>
  );
}