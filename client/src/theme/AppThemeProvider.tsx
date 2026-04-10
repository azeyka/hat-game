import React, { createContext, useContext, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createAppTheme } from "./muiTheme";

type ThemeContextValue = {
  refreshTheme: () => void;
};

const AppThemeContext = createContext<ThemeContextValue>({
  refreshTheme: () => {},
});

export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeVersion, setThemeVersion] = useState(0);

  const theme = useMemo(() => createAppTheme(), [themeVersion]);

  return (
    <AppThemeContext.Provider
      value={{
        refreshTheme: () => setThemeVersion((v) => v + 1),
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}