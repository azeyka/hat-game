import { Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import "./styles.css";

type DifficultyScaleProps = {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  onChange?: (value: number) => void;
};

export function DifficultyScale({
  value,
  min = 1,
  max = 5,
  label = "Сложность",
  onChange,
}: DifficultyScaleProps) {
  const levels = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="pack-difficulty">
      {/* <div className="pack-difficulty__header">
        <span>{label}</span>
      </div> */}

      <Stack direction="row" spacing={0.1} role="radiogroup" aria-label={label} sx={{ alignItems: "flex-end" }}>
        {levels.map((level) => {
          const isActive = level <= value;

          return (
            <button
                key={level}
                type="button"
                role="radio"
                aria-checked={value === level}
                className={`pack-difficulty__step ${isActive ? "is-active" : ""}`}
                style={{
                    height: `${getHeightByLevel(level, max)}px`,
                    minHeight: `${getHeightByLevel(level, max)}px`,
                    ...(isActive
                    ? {
                        backgroundColor: "var(--accent)",
                        filter: `brightness(${getBrightness(level, max)})`,
                    }
                    : {}),
                }}
                onClick={(e) => {
                    onChange?.(level)
                }}
                disabled={!onChange}
                title={`Сложность ${level}`}
            />
          );
        })}
      </Stack>
    </div>
  );
}

function getBrightness(level: number, max: number) {
    const min = 1.15; // светлее
    const maxB = 0.6; // темнее
    const ratio = max <= 1 ? 0 : (level - 1) / (max - 1);
  
    return (min - (min - maxB) * ratio).toFixed(2);
  }

function getHeightByLevel(level: number, max: number) {
  const minHeight = 5;
  const maxHeight = 20;
  const ratio = max <= 1 ? 0 : (level - 1) / (max - 1);

  return Math.round(minHeight + (maxHeight - minHeight) * ratio);
}