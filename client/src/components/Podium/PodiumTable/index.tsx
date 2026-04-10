import React from "react";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Player } from "../../store/gameSlice";

type PodiumTableProps = {
  players: Player[];
  playerId: string | null;
};

export function PodiumTable({ players, playerId }: PodiumTableProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Box px={2} py={1.5}>
        <Typography variant="h6" fontWeight={800}>
          Полная таблица
        </Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Игрок</TableCell>
            <TableCell align="right">Очки</TableCell>
            <TableCell align="right">Отгадано</TableCell>
            <TableCell align="right">Объяснено</TableCell>
            <TableCell align="right">Пропущено</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {players.map((player, index) => {
            const isMe = player.id === playerId;

            return (
              <TableRow
                key={player.id}
                hover
                selected={isMe}
                sx={{
                  "& .MuiTableCell-root": {
                    fontWeight: isMe ? 700 : 400,
                  },
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      #{index + 1}
                    </Typography>
                    <Typography>{player.name}</Typography>
                    {player.isHost && <Chip label="Хост" size="small" />}
                    {isMe && <Chip label="Вы" size="small" color="primary" />}
                  </Stack>
                </TableCell>
                <TableCell align="right">{player.score}</TableCell>
                <TableCell align="right">{player.guessedCount}</TableCell>
                <TableCell align="right">{player.explainedCount}</TableCell>
                <TableCell align="right">{player.skippedCount}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}