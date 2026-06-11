import { Activity, Gauge, Radio } from "lucide-react";
import { Box, Card, Typography } from "@mui/material";
import StatusBadge from "./StatusBadge";
import { errorRate, number, time } from "../utils/formatters";
import { panelSx } from "../theme";

export default function ServiceCard({ service }) {
  return <Card sx={{ ...panelSx, p:2.5, transition:".2s", "&:hover":{ transform:"translateY(-2px)", borderColor:"#475569" } }}>
    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:2.5 }}>
      <Box><Typography fontWeight={500} sx={{ display:"flex", gap:1, alignItems:"center" }}><Radio size={16} color="#22d3ee"/>{service.name}</Typography><Typography variant="caption" color="text.secondary">Updated {time(service.lastUpdated)}</Typography></Box><StatusBadge status={service.status}/>
    </Box>
    <Box sx={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:1.5 }}>
      <Metric icon={Gauge} label={service.mode === "external" ? "Real latency" : "Latency"} value={`${Math.round(service.avgLatency)}ms`}/>
      <Metric icon={Activity} label="P95" value={`${Math.round(service.p95Latency)}ms`}/>
      <Metric label="Error rate" value={`${errorRate(service)}%`}/><Metric label="Requests" value={number(service.requestCount)}/>
    </Box>
    {service.mode === "external" && <Box sx={{ mt:1.5, p:1.25, borderRadius:1, border:"1px solid rgba(167,139,250,.2)", bgcolor:"rgba(167,139,250,.05)", display:"flex", justifyContent:"space-between", gap:1 }}><Typography variant="caption" color="secondary.main">External HTTP service</Typography><Typography variant="caption" color="secondary.main" noWrap>{service.baseUrl}</Typography></Box>}
  </Card>;
}
function Metric({ icon: Icon, label, value }) { return <Box sx={{ bgcolor:"#020617", borderRadius:1, p:1.5 }}><Typography variant="caption" color="text.secondary" sx={{ display:"flex", alignItems:"center", gap:.5, textTransform:"uppercase" }}>{Icon && <Icon size={12}/>} {label}</Typography><Typography variant="body2" fontWeight={600}>{value}</Typography></Box>; }
