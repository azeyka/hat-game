import React from "react";
import { Stack, Typography } from "@mui/material";

type PodiumStatRowProps = {
  label: string;
  value: number;
};

export function PodiumStatRow({ label, value }: PodiumStatRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
  );
}