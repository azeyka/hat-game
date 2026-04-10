import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import PodiumStatRow from "./PodiumStatRow";
import type { Player } from "../../store/gameSlice";

type PodiumCardProps = {
  player: Player;
  rank: number;
  height: number;
  isMe: boolean;
  highlighted?: boolean;
};

export function PodiumCard({
  player,
  rank,
  height,
  isMe,
  highlighted = false,
}: PodiumCardProps) {
  return (
    <Card
      sx={{
        flex: 1,
        minWidth: 0,
        borderRadius: 4,
        border: "1px solid",
        borderColor: isMe ? "primary.main" : "divider",
        boxShadow: isMe ? 4 : 0,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip
            label={`${rank} место`}
            color={highlighted ? "primary" : "default"}
            size="small"
          />
          {isMe && <Chip label="Вы" color="primary" size="small" />}
        </Stack>

        <Stack spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: highlighted ? "primary.main" : "grey.400",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {player.name.slice(0, 1).toUpperCase()}
          </Avatar>

          <Typography variant="h6" fontWeight={800} textAlign="center">
            {player.name}
          </Typography>

          <Typography
            variant="h3"
            fontWeight={900}
            color="primary.main"
            lineHeight={1}
          >
            {player.score}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            очков
          </Typography>
        </Stack>

        <Stack spacing={0.5}>
          <PodiumStatRow label="Отгадано" value={player.guessedCount} />
          <PodiumStatRow label="Объяснено" value={player.explainedCount} />
          <PodiumStatRow label="Пропущено" value={player.skippedCount} />
        </Stack>
      </CardContent>
    </Card>
  );
}