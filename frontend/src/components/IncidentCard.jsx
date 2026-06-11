import { Box, Card, Typography } from "@mui/material";
import StatusBadge from "./StatusBadge";
import { dateTime, label } from "../utils/formatters";
import { panelSx } from "../theme";
export default function IncidentCard({ incident }) {
  const item = (name, value) => <Typography variant="caption" color="text.secondary">{name}: <Box component="b" sx={{ color:"text.primary", textTransform:name === "Severity" ? "capitalize" : "none" }}>{value}</Box></Typography>;
  return <Card sx={{ ...panelSx, p:2.5, borderLeft:`4px solid ${incident.status === "active" ? "#fb7185" : "#34d399"}` }}><Box sx={{ display:"flex", justifyContent:"space-between", gap:2 }}><Box><Typography variant="caption" color="primary.main" fontWeight={500} sx={{ textTransform:"uppercase", letterSpacing:1 }}>{incident.serviceName}</Typography><Typography fontWeight={600}>{label(incident.type)}</Typography></Box><StatusBadge status={incident.status}/></Box><Typography variant="body2" color="text.secondary" sx={{ mt:1.5 }}>{incident.summary}</Typography><Box sx={{ mt:2, display:"grid", gridTemplateColumns:{xs:"repeat(2,1fr)",md:"repeat(4,1fr)"}, gap:1.5 }}>{item("Severity",incident.severity)}{item("Duration",`${incident.duration}s`)}{item("Started",dateTime(incident.startedAt))}{item("Resolved",dateTime(incident.resolvedAt))}</Box></Card>;
}
