import { createTheme } from "@mui/material/styles";

function getStoredAccent() {
  return localStorage.getItem("hat_accent") || "#3b82f6";
}

export function createAppTheme() {
  const accent = getStoredAccent();

  return createTheme({
    palette: {
      mode: "light",
      primary: {
        main: accent,
      },
      secondary: {
        main: accent,
      },
      background: {
        default: "#f6f7fb",
        paper: "#ffffff",
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: "contained",
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            border: "1px solid rgba(0,0,0,0.08)",
          },
        },
      },
    },
  });
}