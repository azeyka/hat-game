import { Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import { DifficultyScale } from "../DifficultyScale";

type PackCardProps = {
  name: string;
  wordsCount: number;
  difficulty: number;
  selected: boolean;
  onClick: () => void;
};

export function PackCard({
  name,
  wordsCount,
  difficulty,
  selected,
  onClick,
}: PackCardProps) {
  return (
    <Card
      sx={{
        borderColor: selected ? "primary.main" : "divider",
        boxShadow: selected ? 3 : 0,
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Stack
            spacing={1.5}
            direction="row"
            sx={{
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Слов: {wordsCount}
            </Typography>

            <DifficultyScale value={difficulty} readOnly />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}