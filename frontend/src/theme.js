import { createTheme } from "@mui/material/styles";

export const panelSx = {
  bgcolor: "rgba(15, 23, 42, .76)",
  border: "1px solid rgba(51, 65, 85, .72)",
  borderRadius: 1.5,
  boxShadow: "0 16px 40px rgba(0,0,0,.12)",
  backgroundImage: "none",
};

export default createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#22d3ee", contrastText: "#020617" },
    secondary: { main: "#a78bfa" },
    success: { main: "#34d399" },
    warning: { main: "#fbbf24" },
    error: { main: "#fb7185" },
    background: { default: "#020617", paper: "#0f172a" },
    text: { primary: "#f1f5f9", secondary: "#64748b" },
    divider: "#1e293b",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontWeightMedium: 500,
    fontWeightBold: 600,
    button: { fontWeight: 500, textTransform: "none" },
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 6, minHeight: 42, fontWeight: 500 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 6, background: "#020617" } } },
    MuiCard: { defaultProps: { elevation: 0 } },
    MuiTypography: { styleOverrides: { root: { fontWeight: 400 } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 500 }, body: { fontWeight: 400 } } },
    MuiChip: { styleOverrides: { label: { fontWeight: 500 } } },
  },
});
