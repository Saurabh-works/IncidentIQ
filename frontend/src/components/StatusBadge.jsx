import { Chip } from "@mui/material";
export default function StatusBadge({ status }) {
  const color = status === "healthy" || status === "resolved" ? "success" : status === "degraded" || status === "active" ? "warning" : "error";
  return <Chip size="small" color={color} variant="outlined" label={status} sx={{ textTransform:"capitalize", fontWeight:500, bgcolor: color === "success" ? "rgba(52,211,153,.08)" : color === "warning" ? "rgba(251,191,36,.08)" : "rgba(251,113,133,.08)" }}/>;
}
