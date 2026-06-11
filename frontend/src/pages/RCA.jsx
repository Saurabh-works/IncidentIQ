import { useCallback, useEffect, useState } from "react";
import { Bot, CheckCircle2, Lightbulb, ScanSearch, ShieldCheck } from "lucide-react";
import { Alert, Box, Button, Card, Chip, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import api from "../api/axios";
import { useSocket } from "../hooks/useSocket";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import { dateTime } from "../utils/formatters";
import { panelSx } from "../theme";

export default function RCA() {
  const [report, setReport] = useState(null);
  const [provider, setProvider] = useState("rule-based");
  const [geminiStatus, setGeminiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadStatus = useCallback(() => api.get("/rca/quota").then(({ data }) => setGeminiStatus(data)), []);

  useEffect(() => {
    api.get("/rca/latest").then(({ data }) => setReport(data));
    loadStatus();
  }, [loadStatus]);
  useSocket("rca:generated", useCallback(setReport, []));

  const generate = async () => {
    setLoading(true);
    try {
      setReport((await api.post("/rca/generate", { provider })).data);
      await loadStatus();
    } finally {
      setLoading(false);
    }
  };

  return <Box sx={{ display: "grid", gap: 3 }}>
    <Card sx={{ ...panelSx, p: 2 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: 1, bgcolor: "rgba(167,139,250,.12)", color: "secondary.main", display: "grid", placeItems: "center", border: "1px solid rgba(167,139,250,.18)" }}><Bot size={19} /></Box>
          <Typography fontWeight={600}>Root Cause Analyst</Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, gap: 1.25 }}>
          <ToggleButtonGroup exclusive size="small" value={provider} onChange={(_, value) => value && setProvider(value)}>
            <ToggleButton value="rule-based">Rule-Based</ToggleButton>
            <ToggleButton
              value="gemini"
              disabled={!geminiStatus?.configured}
              sx={{
                color: geminiStatus?.available ? "success.main" : "error.main",
                borderColor: geminiStatus?.available ? "rgba(52,211,153,.35) !important" : "rgba(251,113,133,.35) !important",
                bgcolor: geminiStatus?.available ? "rgba(52,211,153,.05)" : "rgba(251,113,133,.05)",
                "&.Mui-selected": {
                  color: geminiStatus?.available ? "success.main" : "error.main",
                  bgcolor: geminiStatus?.available ? "rgba(52,211,153,.14)" : "rgba(251,113,133,.14)",
                },
                "&.Mui-disabled": {
                  color: "error.main",
                  borderColor: "rgba(251,113,133,.35) !important",
                  bgcolor: "rgba(251,113,133,.05)",
                },
              }}
            >
              Gemini AI
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" onClick={generate} disabled={loading} startIcon={<ScanSearch size={17} />}>{loading ? "Analyzing..." : "Generate RCA"}</Button>
        </Box>
      </Box>
    </Card>

    {loading ? <Card sx={panelSx}><Loading /></Card> : !report ? <Card sx={panelSx}><EmptyState message="Generate a report to analyze current system telemetry." /></Card> : <>
      {report.fallbackReason && <Alert severity="warning">Gemini was unavailable, so rule-based fallback generated this report: {report.fallbackReason}</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xl: "repeat(2,1fr)" }, gap: 3 }}>
        <Card sx={{ ...panelSx, p: 3, gridColumn: { xl: "1/-1" } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="caption" color="text.secondary">Generated {dateTime(report.createdAt)}</Typography>
            <Chip size="small" label={report.generatedBy === "gemini" ? `Gemini AI · ${report.model}` : "Rule-Based"} color={report.generatedBy === "gemini" ? "secondary" : "primary"} variant="outlined" />
          </Box>
          <Typography variant="h6" color="error.main" fontWeight={600} mt={1}>Root Cause</Typography>
          <Typography mt={1.5}>{report.rootCause}</Typography>
          <Typography color="warning.main" fontWeight={600} mt={3}>Impact</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>{report.impact}</Typography>
        </Card>
        <List icon={CheckCircle2} title="Evidence" items={report.evidence} color="#22d3ee" />
        <List icon={Lightbulb} title="Suggested Fixes" items={report.suggestedFixes} color="#fbbf24" />
        <List icon={ShieldCheck} title="Prevention" items={report.preventionSteps} color="#34d399" />
        <Card sx={{ ...panelSx, p: 3 }}><Typography fontWeight={600}>Affected Services</Typography><Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>{report.affectedServices?.length ? report.affectedServices.map((item) => <Chip key={item} label={item} color="error" variant="outlined" />) : <Typography variant="body2" color="text.secondary">No services currently affected</Typography>}</Box></Card>
      </Box>
    </>}
  </Box>;
}

function List({ icon: Icon, title, items = [], color }) {
  return <Card sx={{ ...panelSx, p: 3 }}><Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ p: 1, borderRadius: 1, color, bgcolor: `${color}15` }}><Icon size={18} /></Box><Typography fontWeight={600}>{title}</Typography></Box><Box component="ol" sx={{ pl: 2.5, mt: 2.5, color: "text.secondary" }}>{items.map((item) => <Typography component="li" variant="body2" key={item} sx={{ mb: 1.5 }}>{item}</Typography>)}</Box></Card>;
}
